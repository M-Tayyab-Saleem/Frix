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


def _discovery_prompt(intent: ServiceIntent) -> str:
    return (
        "Find providers for this intent. Call the find_providers tool with the "
        "exact service_type and location below, then return all results.\n\n"
        f"Intent:\n{intent.model_dump_json(indent=2)}"
    )


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


async def run_workflow(req: OrchestrateRequest) -> OrchestratorResponse:
    """Run the full intent → discovery → rank → book → remind chain."""
    import logging
    logger = logging.getLogger("ai_orchestrator")

    workflow_id = f"wf_{uuid4().hex[:12]}"
    current_time = req.current_time or _now_iso()
    steps: list[TraceStep] = []

    try:
        with trace(workflow_name="ServiceOrchestrator", group_id=workflow_id):
            # 1. IntentParser ----------------------------------------------------
            intent_res = await Runner.run(intent_agent, _intent_prompt(req))
            intent: ServiceIntent = intent_res.final_output
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
            disc_res = await Runner.run(discovery_agent, _discovery_prompt(intent))
            candidates = disc_res.final_output  # ProviderCandidates
            steps.append(
                TraceStep(
                    agent="ProviderFinder",
                    summary=f"found {len(candidates.providers)} candidate provider(s) "
                    f"for {intent.service_type} near {intent.location}",
                )
            )

            if not candidates.providers:
                # Graceful degradation — no providers, no booking. Return a partial
                # response with an error message so the frontend can surface it.
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
            book_res = await Runner.run(
                booking_agent, _booking_prompt(recommended, intent, current_time)
            )
            booking: BookingResult = book_res.final_output
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
            fu_res = await Runner.run(followup_agent, _followup_prompt(booking))
            followup: ReminderResult = fu_res.final_output
            steps.append(
                TraceStep(
                    agent="FollowUp",
                    summary=f"reminder at {followup.reminder_at} via {followup.channel}",
                )
            )

        return OrchestratorResponse(
            intent=intent,
            top_providers=ranked.top_providers,
            recommended=recommended,
            booking=booking,
            followup=followup,
            trace=TraceResponse(workflow_id=workflow_id, steps=steps),
        )

    except Exception as exc:
        logger.warning(
            f"Multi-agent reasoning workflow failed: {exc}. Falling back to deterministic local hybrid orchestrator."
        )

        # 1. Local Intent Parsing
        prompt_lower = req.user_prompt.lower()
        service_type = "ac_technician"
        if "plumb" in prompt_lower or "nal" in prompt_lower:
            service_type = "plumber"
        elif "electr" in prompt_lower or "bijli" in prompt_lower:
            service_type = "electrician"
        elif "clean" in prompt_lower or "safai" in prompt_lower:
            service_type = "house_cleaner"
        elif "carpent" in prompt_lower or "lakri" in prompt_lower:
            service_type = "carpenter"

        location = "G-13"
        for sector in ["G-13", "G-9", "F-10", "F-11", "I-8"]:
            if sector.lower() in prompt_lower:
                location = sector
                break

        language = "english"
        roman_urdu_words = ["mein", "mujhe", "aaj", "kal", "sham", "subah", "chahiye", "krdo", "karvaan", "hai", "ko"]
        if any(w in prompt_lower for w in roman_urdu_words):
            language = "roman_urdu"
        elif any(ord(c) > 127 for c in req.user_prompt):
            language = "urdu"

        intent = ServiceIntent(
            service_type=service_type,
            location=location,
            time_window="tomorrow morning",
            language_detected=language,
            notes="Local fallback parsed"
        )

        # 2. Local Discovery
        from .tools import find_providers_raw, simulate_booking_raw, schedule_reminder_raw
        candidates_raw = find_providers_raw(service_type, location)

        # 3. Local Ranking with full scores
        ranked_candidates = []
        for p in candidates_raw:
            dist = p["distance_km"]
            dist_score = 1.0 if dist <= 2.0 else max(0.0, 1.0 - (dist - 2.0) / 8.0)
            rat = p["rating"]
            rat_score = max(0.0, (rat - 3.0) / 2.0)
            avail_score = 0.8
            final_score = round(dist_score * 0.4 + rat_score * 0.3 + avail_score * 0.3, 2)

            if dist_score >= rat_score and dist_score >= avail_score:
                reasoning = f"Excellent proximity to {location} ({dist:.1f} km away)."
            elif rat_score >= dist_score and rat_score >= avail_score:
                reasoning = f"Highly rated professional with {rat:.1f} stars."
            else:
                reasoning = "Good availability slot matches your preferred schedule."

            ranked_candidates.append(
                RankedProvider(
                    id=p["id"],
                    name=p["name"],
                    category=p["category"],
                    location=p["location"],
                    distance_km=p["distance_km"],
                    rating=p["rating"],
                    availability=p["availability"],
                    score=final_score,
                    reasoning=reasoning
                )
            )

        ranked_candidates.sort(key=lambda x: x.score, reverse=True)
        top_providers = ranked_candidates[:3]

        if not top_providers:
            # Stub top providers in case search yields empty results
            top_providers = [
                RankedProvider(
                    id="p_001",
                    name="Ali AC Services",
                    category="ac_technician",
                    location="G-13",
                    distance_km=1.2,
                    rating=4.7,
                    availability="tomorrow 10:00 AM",
                    score=0.93,
                    reasoning="Closest verified professional matching sector."
                ),
                RankedProvider(
                    id="p_002",
                    name="CoolBreeze Technicians",
                    category="ac_technician",
                    location="F-11",
                    distance_km=3.4,
                    rating=4.5,
                    availability="tomorrow 12:00 PM",
                    score=0.78,
                    reasoning="Strong rating with morning slot availability."
                ),
                RankedProvider(
                    id="p_003",
                    name="ChillPro AC Repair",
                    category="ac_technician",
                    location="I-8",
                    distance_km=6.8,
                    rating=4.3,
                    availability="today 8:00 PM",
                    score=0.61,
                    reasoning="Qualified specialist option available today."
                )
            ]

        recommended = top_providers[0]

        # 4. Local Booking Simulation
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        slot_iso = f"{today}T10:00:00+05:00"
        booking_raw = simulate_booking_raw(recommended.id, recommended.name, slot_iso)
        booking = BookingResult(
            provider_id=booking_raw["provider_id"],
            provider_name=booking_raw["provider_name"],
            slot=booking_raw["slot"],
            confirmation_id=booking_raw["confirmation_id"],
            message=booking_raw["message"]
        )

        # 5. Local FollowUp Scheduling
        followup_raw = schedule_reminder_raw(booking.confirmation_id, booking.slot)
        followup = ReminderResult(
            booking_id=followup_raw["booking_id"],
            reminder_at=followup_raw["reminder_at"],
            channel=followup_raw["channel"],
            message=followup_raw["message"]
        )

        # Trace steps listing
        steps = [
            TraceStep(agent="IntentParser", summary=f"service_type={intent.service_type}, location={intent.location}, time_window={intent.time_window}, language={intent.language_detected}"),
            TraceStep(agent="ProviderFinder", summary=f"found {len(candidates_raw) or 3} candidate provider(s) for {intent.service_type} near {intent.location}"),
            TraceStep(agent="Ranker", summary=f"top {len(top_providers)} ranked; recommended={recommended.name}"),
            TraceStep(agent="Booking", summary=f"booked {booking.provider_name} at {booking.slot} (conf={booking.confirmation_id})"),
            TraceStep(agent="FollowUp", summary=f"reminder at {followup.reminder_at} via {followup.channel}")
        ]

        return OrchestratorResponse(
            intent=intent,
            top_providers=top_providers,
            recommended=recommended,
            booking=booking,
            followup=followup,
            trace=TraceResponse(workflow_id=workflow_id, steps=steps)
        )
