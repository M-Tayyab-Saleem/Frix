"""Workflow runner: chains the specialist agents under one trace.

Public entry point: `run_workflow(req) -> OrchestratorResponse`.

The chain is:
    IntentParser -> ProviderFinder -> Ranker -> Booking -> FollowUp

Each step's structured output is fed as the next step's input (serialized to
JSON for the model). The whole chain runs inside a single `trace(...)` block
so the OpenAI tracing dashboard shows a single workflow with one child span
per agent.
"""

from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from uuid import uuid4

from agents import Runner, trace

from .main_agents.intent import intent_agent
from .main_agents.discovery import discovery_agent
from .main_agents.ranker import ranker_agent
from .main_agents.booking import booking_agent
from .main_agents.followup import followup_agent
from .schemas import (
    BookingResult,
    OrchestrateRequest,
    OrchestratorResponse,
    RankedProvider,
    RankedProviders,
    ReminderResult,
    ServiceIntent,
    TraceResponse,
    TraceStep,
)

# ─── Console helpers ────────────────────────────────────────────────────────────
RESET  = "\033[0m"
BOLD   = "\033[1m"
CYAN   = "\033[96m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
MAGENTA= "\033[95m"
BLUE   = "\033[94m"
RED    = "\033[91m"
DIM    = "\033[2m"

def _banner(title: str, color: str = CYAN) -> None:
    width = 68
    bar = "═" * width
    print(f"\n{color}{BOLD}╔{bar}╗")
    print(f"║  {title:<{width - 2}}║")
    print(f"╚{bar}╝{RESET}")

def _section(label: str, color: str = YELLOW) -> None:
    print(f"\n{color}{BOLD}▶  {label}{RESET}")

def _kv(key: str, value: str, color: str = DIM) -> None:
    print(f"   {BOLD}{key}:{RESET} {color}{value}{RESET}")

def _ok(msg: str) -> None:
    print(f"   {GREEN}✔  {msg}{RESET}")

def _done(label: str, elapsed: float) -> None:
    print(f"   {GREEN}✔  {label} completed in {elapsed:.2f}s{RESET}")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _intent_prompt(req: OrchestrateRequest) -> str:
    """Bundle user prompt + context into a single string for IntentParser."""
    ctx = {
        "user_prompt": req.user_prompt,
        "user_location": req.user_location.model_dump() if req.user_location else None,
        "current_time": req.current_time or _now_iso(),
    }
    return (
        "Extract the ServiceIntent from this request.\n\n"
        f"User context:\n{json.dumps(ctx, ensure_ascii=False, indent=2)}"
    )


def _discovery_prompt(
    intent: ServiceIntent, user_lat: float | None = None, user_lng: float | None = None
) -> str:
    prompt = (
        "Find providers for this intent. Call the find_providers tool with the "
        "exact service_type and location below, then return all results.\n\n"
        f"Intent:\n{intent.model_dump_json(indent=2)}"
    )
    if user_lat is not None and user_lng is not None:
        prompt += f"\n\nUser GPS coordinates: lat={user_lat}, lng={user_lng}"
    return prompt


def _ranker_prompt(intent: ServiceIntent, candidates_json: str) -> str:
    return (
        "Score and rank these candidates against the user's intent. "
        "Return the top 3 and a recommended_id.\n\n"
        f"Intent:\n{intent.model_dump_json(indent=2)}\n\n"
        f"Candidates:\n{candidates_json}"
    )


def _booking_prompt(
    recommended: RankedProvider, intent: ServiceIntent, current_time: str
) -> str:
    return (
        "Book the recommended provider. Choose a slot_iso matching the "
        "provider's availability and the user's time_window.\n\n"
        f"Recommended provider:\n{recommended.model_dump_json(indent=2)}\n\n"
        f"User time_window: {intent.time_window}\n"
        f"Current time: {current_time}"
    )


def _followup_prompt(booking: BookingResult) -> str:
    return (
        "Schedule a reminder for this booking using the schedule_reminder "
        "tool.\n\n"
        f"Booking:\n{booking.model_dump_json(indent=2)}"
    )


def configure_gemini() -> None:
    """Configures the default AsyncOpenAI client and API for the openai-agents SDK to use Gemini."""
    import os
    from openai import AsyncOpenAI
    import agents
    from agents import set_tracing_disabled
    
    # Disable global telemetry tracing to suppress non-fatal 401 errors from invalid OpenAI tracing keys
    set_tracing_disabled(True)
    
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL")
    if not api_key:
        return
        
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=base_url
    )
    agents.set_default_openai_client(client, use_for_tracing=False)
    agents.set_default_openai_api("chat_completions")


async def run_workflow(req: OrchestrateRequest) -> OrchestratorResponse:
    """Run the full intent → discovery → rank → book → remind chain."""
    import logging
    logger = logging.getLogger("ai_orchestrator")

    workflow_id = f"wf_{uuid4().hex[:12]}"
    current_time = req.current_time or _now_iso()
    steps: list[TraceStep] = []

    start_time = time.time()
    
    _banner("FRIX AUTOMATIC SERVICE ORCHESTRATOR", CYAN)
    print(f"{BOLD}► STARTING AUTONOMOUS PIPELINE FOR PROMPT:{RESET}")
    print(f"  {YELLOW}\"{req.user_prompt}\"{RESET}")
    if req.user_location:
        print(f"  {DIM}GPS Coordinates: ({req.user_location.lat}, {req.user_location.lng}) @ Area {req.user_location.area}{RESET}")
    print(f"  {DIM}Timestamp: {current_time}{RESET}\n")

    # Proactive URL/web address/localhost validation at the entry gate
    prompt_lower = req.user_prompt.lower().strip()
    is_url = any(x in prompt_lower for x in ["http://", "https://", "localhost", "127.0.0.1", "192.168.", "www.", ".com", ".net", ".org"])
    if is_url:
        _banner("INVALID SERVICE REQUEST DETECTED", RED)
        print(f"   {RED}Reason: Input appears to be a URL, local IP, or web address instead of a valid service request.{RESET}")
        print(f"   {DIM}Blocked input: \"{req.user_prompt}\"{RESET}\n")
        
        intent = ServiceIntent(
            service_type="unknown",
            location="unknown",
            time_window="none",
            language_detected="unknown",
            notes="Rejected as URL/web address"
        )
        return OrchestratorResponse(
            intent=intent,
            top_providers=[],
            recommended=RankedProvider(
                id="",
                name="",
                category="unknown",
                location="",
                distance_km=0.0,
                rating=0.0,
                availability="",
                score=0.0,
                reasoning="Request rejected because input contains a URL or web address."
            ),
            booking=BookingResult(
                provider_id="",
                provider_name="",
                slot="",
                confirmation_id="",
                message="No booking made."
            ),
            followup=ReminderResult(
                booking_id="",
                reminder_at="",
                channel="none",
                message="No reminder scheduled."
            ),
            trace=TraceResponse(
                workflow_id=workflow_id,
                steps=[
                    TraceStep(agent="ValidationEngine", summary="Rejected input as invalid URL or web address.")
                ]
            ),
            error="Input contains a URL or web address. Please describe the service you need (e.g., 'Need a plumber in G-13')."
        )

    # Apply OpenAI compatible client configuration for Gemini
    configure_gemini()

    try:
        with trace(workflow_name="ServiceOrchestrator", group_id=workflow_id):
            # 1. IntentParser ----------------------------------------------------
            _section("1. INTENT PARSER AGENT (IntentParser)", MAGENTA)
            print(f"   {DIM}Analyzing request language, required trade category, and area...{RESET}")
            t_start = time.time()
            intent_res = await Runner.run(intent_agent, _intent_prompt(req))
            intent: ServiceIntent = intent_res.final_output
            _done("IntentParser", time.time() - t_start)
            
            _kv("Detected Trade", intent.service_type.upper(), CYAN)
            _kv("Target Area", intent.location, CYAN)
            _kv("Target Schedule", intent.time_window, CYAN)
            _kv("Detected Language", intent.language_detected.upper(), CYAN)
            
            steps.append(
                TraceStep(
                    agent="IntentParser",
                    summary=(
                        f"service_type={intent.service_type}, "
                        f"location={intent.location}, "
                        f"time_window={intent.time_window}, "
                        f"language={intent.language_detected}"
                    ),
                )
            )

            # 2. ProviderFinder --------------------------------------------------
            _section("2. DISCOVERY AGENT (ProviderFinder)", BLUE)
            print(f"   {DIM}Querying directory database for trade type '{intent.service_type}' near area '{intent.location}'...{RESET}")
            t_start = time.time()
            user_lat = req.user_location.lat if req.user_location else None
            user_lng = req.user_location.lng if req.user_location else None
            disc_res = await Runner.run(
                discovery_agent, _discovery_prompt(intent, user_lat, user_lng)
            )
            candidates = disc_res.final_output  # ProviderCandidates
            _done("ProviderFinder", time.time() - t_start)
            
            print(f"   {BOLD}Discovered Candidates:{RESET}")
            for idx, p in enumerate(candidates.providers, 1):
                print(f"     {idx}. {BOLD}{p.name}{RESET} (Area: {p.location}, Rating: {p.rating}⭐, Availability: {p.availability})")

            steps.append(
                TraceStep(
                    agent="ProviderFinder",
                    summary=f"found {len(candidates.providers)} candidate provider(s) "
                    f"for {intent.service_type} near {intent.location}",
                )
            )

            if not candidates.providers:
                _section("DEGRADED RUN - NO CANDIDATES FOUND", RED)
                return OrchestratorResponse(
                    intent=intent,
                    top_providers=[],
                    recommended=RankedProvider(
                        id="",
                        name="",
                        category=intent.service_type,
                        location=intent.location,
                        distance_km=0.0,
                        rating=0.0,
                        availability="",
                        score=0.0,
                        reasoning="No providers available for this category/area.",
                    ),
                    booking=BookingResult(
                        provider_id="",
                        provider_name="",
                        slot="",
                        confirmation_id="",
                        message="No booking — no providers matched.",
                    ),
                    followup=ReminderResult(
                        booking_id="",
                        reminder_at="",
                        channel="none",
                        message="No reminder scheduled — no booking was made.",
                    ),
                    trace=TraceResponse(workflow_id=workflow_id, steps=steps),
                    error=(
                        f"No providers found for service_type='{intent.service_type}' "
                        f"in location='{intent.location}'."
                    ),
                )

            # 3. Ranker ----------------------------------------------------------
            _section("3. RANKER AGENT (Ranker)", YELLOW)
            print(f"   {DIM}Evaluating candidate providers with multi-factor weighting (Distance, Quality, Schedule match)...{RESET}")
            t_start = time.time()
            candidates_json = json.dumps(
                [p.model_dump() for p in candidates.providers], indent=2
            )
            rank_res = await Runner.run(
                ranker_agent, _ranker_prompt(intent, candidates_json)
            )
            ranked: RankedProviders = rank_res.final_output
            recommended = next(
                (p for p in ranked.top_providers if p.id == ranked.recommended_id),
                ranked.top_providers[0] if ranked.top_providers else None,
            )
            _done("Ranker", time.time() - t_start)
            
            print(f"   {BOLD}Weighted Leaderboard:{RESET}")
            for idx, p in enumerate(ranked.top_providers, 1):
                star = "★" if p.id == ranked.recommended_id else " "
                print(f"     {star} {idx}. {BOLD}{p.name:<25}{RESET} Score: {GREEN}{p.score:.2f}{RESET} | Reason: {DIM}{p.reasoning}{RESET}")

            steps.append(
                TraceStep(
                    agent="Ranker",
                    summary=(
                        f"top {len(ranked.top_providers)} ranked; "
                        f"recommended={recommended.name if recommended else 'none'}"
                    ),
                )
            )

            if recommended is None:
                _section("DEGRADED RUN - NO RECOMMENDED PROVIDER", RED)
                return OrchestratorResponse(
                    intent=intent,
                    top_providers=[],
                    recommended=RankedProvider(
                        id="",
                        name="",
                        category=intent.service_type,
                        location=intent.location,
                        distance_km=0.0,
                        rating=0.0,
                        availability="",
                        score=0.0,
                        reasoning="Ranker returned no providers.",
                    ),
                    booking=BookingResult(
                        provider_id="",
                        provider_name="",
                        slot="",
                        confirmation_id="",
                        message="No booking — ranker returned no providers.",
                    ),
                    followup=ReminderResult(
                        booking_id="",
                        reminder_at="",
                        channel="none",
                        message="No reminder scheduled.",
                    ),
                    trace=TraceResponse(workflow_id=workflow_id, steps=steps),
                    error="Ranker produced no ranked providers.",
                )

            # 4. Booking ---------------------------------------------------------
            _section("4. TRANSACTIONAL BOOKING AGENT (Booking)", GREEN)
            print(f"   {DIM}Securing appointment with {recommended.name} matching preferences...{RESET}")
            t_start = time.time()
            book_res = await Runner.run(
                booking_agent, _booking_prompt(recommended, intent, current_time)
            )
            booking: BookingResult = book_res.final_output
            _done("Booking", time.time() - t_start)
            
            _kv("Provider ID", booking.provider_id, GREEN)
            _kv("Provider Name", booking.provider_name, GREEN)
            _kv("Confirmed Slot", booking.slot, GREEN)
            _kv("Confirmation ID", booking.confirmation_id, GREEN)
            _kv("Status Message", booking.message, GREEN)

            steps.append(
                TraceStep(
                    agent="Booking",
                    summary=(
                        f"booked {booking.provider_name} at {booking.slot} "
                        f"(conf={booking.confirmation_id})"
                    ),
                )
            )

            # 5. FollowUp --------------------------------------------------------
            _section("5. ENGAGEMENT & RETENTION AGENT (FollowUp)", CYAN)
            print(f"   {DIM}Scheduling reminders and follow-up notifications...{RESET}")
            t_start = time.time()
            fu_res = await Runner.run(followup_agent, _followup_prompt(booking))
            followup: ReminderResult = fu_res.final_output
            _done("FollowUp", time.time() - t_start)
            
            _kv("Reminder Booking ID", followup.booking_id, CYAN)
            _kv("Notification Time", followup.reminder_at, CYAN)
            _kv("Preferred Channel", followup.channel, CYAN)
            _kv("Status Message", followup.message, CYAN)

            steps.append(
                TraceStep(
                    agent="FollowUp",
                    summary=f"reminder at {followup.reminder_at} via {followup.channel}",
                )
            )

        total_duration = time.time() - start_time
        _banner("AUTONOMOUS FLOW SUCCESSFULLY COMPLETED", GREEN)
        print(f"   {BOLD}Workflow ID:{RESET} {workflow_id}")
        print(f"   {BOLD}Total Time: {RESET} {total_duration:.2f}s")
        print(f"   {BOLD}Decisions:  {RESET} Autonomous agent consensus achieved safely.\n")

        return OrchestratorResponse(
            intent=intent,
            top_providers=ranked.top_providers,
            recommended=recommended,
            booking=booking,
            followup=followup,
            trace=TraceResponse(workflow_id=workflow_id, steps=steps),
        )

    except Exception as exc:
        logger.error(f"Multi-agent reasoning workflow failed: {exc}", exc_info=True)
        _banner("AUTONOMOUS PIPELINE ERROR", RED)
        print(f"   {RED}Error: {exc}{RESET}\n")
        raise exc

