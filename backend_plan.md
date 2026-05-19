# Plan: AI Service Orchestrator — Agentic Backend

## Context

We are building the **AI orchestration layer** for the "AI Service Orchestrator for Informal Economy" hackathon challenge. The repo is currently an empty `uv` scaffold (`main.py`, `pyproject.toml`, Python 3.12).

**Scope of this layer:**
- One FastAPI service that exposes an agentic workflow.
- Input: a natural-language user prompt (Urdu / Roman Urdu / English) + user location/context.
- Output: structured response containing parsed intent, top-3 ranked providers (with location, rating, availability), reasoning, simulated booking confirmation, and a scheduled follow-up.

**Out of scope** (handled by the frontend / other teams):
- Mobile/web UI.
- Real provider database, Maps integration, user auth, persistence beyond the response.

**Frame for the Antigravity requirement:** We use Google Antigravity as the **development IDE** to build/iterate on this project. The agent runtime is OpenAI Agents SDK. This will be called out clearly in the README so evaluators understand the framing.

## Architecture

```
                                    FastAPI (POST /orchestrate)
                                            │
                                            ▼
                          ┌──────────────────────────────────┐
                          │   Orchestrator Agent (root)      │
                          │   - plans the workflow            │
                          │   - hands off to specialists      │
                          │   - assembles final response      │
                          └──────────────────────────────────┘
                                            │ handoffs
            ┌───────────────┬───────────────┼───────────────┬───────────────┐
            ▼               ▼               ▼               ▼               ▼
    IntentParser     ProviderFinder      Ranker         Booking         FollowUp
    Agent            Agent               Agent          Agent           Agent
    (multilingual    (uses mock          (scores by     (creates        (schedules
     extract:        provider tool)      distance,      booking         reminder,
     service,                            rating,        confirmation    status
     location,                           availability)  receipt)        update)
     time)
```

**Pattern choice:** **Orchestrator + specialists via `handoffs`** (per user selection). Each specialist is a separate `Agent` with focused instructions and its own tools. Handoffs give us natural multi-agent traces — strong evidence for the "multi-agent OR structured reasoning pipeline" evaluation criterion.

**Why handoffs over `as_tool`:** Handoffs transfer control and produce a richer trace tree (one span per agent run). The challenge explicitly rewards traceable multi-agent reasoning.

## Tech stack

- `openai-agents` (Python SDK) — agents, handoffs, function tools, built-in tracing
- `fastapi` + `uvicorn` — HTTP layer
- `pydantic` v2 — structured I/O models (already a transitive dep)
- `python-dotenv` — env loading for `OPENAI_API_KEY`
- Model: `gpt-4.1` (or `gpt-4o`) for the orchestrator + intent parser (multilingual); `gpt-4.1-mini` for the smaller specialists to control cost. Configurable via env.

## File layout

```
Search/
├── pyproject.toml          # add deps: openai-agents, fastapi, uvicorn, pydantic, python-dotenv
├── main.py                 # uvicorn entrypoint -> app.api:app
├── .env.example            # OPENAI_API_KEY, MODEL_NAME
├── README.md               # architecture + how Antigravity was used
└── app/
    ├── __init__.py
    ├── api.py              # FastAPI app, /orchestrate endpoint, request/response schemas
    ├── schemas.py          # Pydantic models: ServiceRequest, Provider, BookingResult, OrchestratorResponse
    ├── runtime.py          # Runner wiring: builds orchestrator + specialists, runs workflow
    ├── tools.py            # @function_tool definitions (mock provider lookup, fake booking, reminder scheduler)
    ├── mock_data.py        # MOCK_PROVIDERS list — Islamabad sectors (G-13, F-10, I-8, etc.)
    └── agents/
        ├── __init__.py
        ├── orchestrator.py # root Agent definition + handoff wiring
        ├── intent.py       # IntentParser agent — outputs structured ServiceIntent
        ├── discovery.py    # ProviderFinder agent — calls find_providers tool
        ├── ranker.py       # Ranker agent — scores + reasoning
        ├── booking.py      # Booking agent — simulate_booking tool
        └── followup.py     # FollowUp agent — schedule_reminder tool
```

## API contract

`POST /orchestrate`

Request:
```json
{
  "user_prompt": "Mujhe kal subah G-13 mein AC technician chahiye",
  "user_location": { "sector": "G-13", "city": "Islamabad", "lat": 33.65, "lng": 72.99 },
  "current_time": "2026-05-18T22:00:00+05:00"  // optional; server uses now() if omitted
}
```

Response (200):
```json
{
  "intent": {
    "service_type": "AC Technician",
    "location": "G-13",
    "time_window": "tomorrow morning",
    "language_detected": "roman_urdu"
  },
  "top_providers": [
    {
      "name": "Ali AC Services",
      "category": "ac_technician",
      "location": "G-13",
      "distance_km": 2.1,
      "rating": 4.7,
      "availability": "tomorrow 10:00 AM",
      "score": 0.93,
      "reasoning": "Closest available provider with high rating"
    },
    // 2 more
  ],
  "recommended": { /* same shape as a top_providers entry */ },
  "booking": {
    "provider": "Ali AC Services",
    "slot": "2026-05-19T10:00:00+05:00",
    "confirmation_id": "BK-20260519-0001",
    "message": "Slot booked: 10:00 AM. Confirmation sent."
  },
  "followup": {
    "reminder_at": "2026-05-19T09:00:00+05:00",
    "channel": "sms_simulated",
    "message": "Reminder scheduled 1 hour before appointment"
  },
  "trace": {
    "workflow_id": "wf_...",
    "steps": [ { "agent": "IntentParser", "summary": "..." }, ... ]
  }
}
```

The `trace` field is populated from the Agents SDK trace (we extract `agent_name` + a short summary per step) so the demo video can show the reasoning chain.

## Agent definitions (sketch)

**Orchestrator** — kicks off with the user prompt, hands off to IntentParser first, then ProviderFinder, then Ranker, then Booking, then FollowUp. Final agent's output gets assembled by the orchestrator into the response schema.

**IntentParser** — output type `ServiceIntent` (pydantic). Instructions explicitly note multilingual support: "User input may be in English, Urdu (Arabic script), or Roman Urdu. Extract service_type, location, and time_window. Normalize service_type to lowercase snake_case (e.g., 'ac_technician')."

**ProviderFinder** — single tool `find_providers(service_type: str, location: str) -> list[Provider]` reading `mock_data.py`. Returns 5–10 candidates.

**Ranker** — output type `RankedProviders` (top 3 with score + reasoning). No tools; pure reasoning over the candidate list it receives in its input. Scoring weights: distance 40%, rating 30%, availability match 30%.

**Booking** — tool `simulate_booking(provider_id, slot) -> BookingResult`. Generates a deterministic confirmation_id.

**FollowUp** — tool `schedule_reminder(booking_id, remind_at, channel) -> ReminderResult`.

## Tools (`app/tools.py`)

All `@function_tool` decorated. Pure functions, no external calls — keeps the demo deterministic and offline-runnable:

- `find_providers(service_type, location)` — filters `MOCK_PROVIDERS`, computes a fake distance based on sector proximity.
- `simulate_booking(provider_id, slot_iso)` — returns `{confirmation_id, slot, message}`. ID format `BK-YYYYMMDD-NNNN` using an in-process counter.
- `schedule_reminder(confirmation_id, remind_at_iso, channel)` — returns the scheduled reminder object.

## Tracing & logs

- Agents SDK tracing is on by default. We set `OPENAI_API_KEY` so traces show up in the OpenAI dashboard — useful for the demo.
- Also write a local JSONL trace per request to `./logs/trace-<workflow_id>.jsonl` using a custom `TracingProcessor`. This gives us offline trace evidence for the deliverable "Agent Trace / Logs".

## Verification

End-to-end checks (run after implementation):

1. `uv sync` installs deps cleanly.
2. `uvicorn app.api:app --reload` starts the server.
3. `curl -X POST localhost:8000/orchestrate -H 'content-type: application/json' -d @sample_request.json` — run for each of the three sample prompts (English, Urdu, Roman Urdu). Each must return a populated response with 3 providers, a booking, and a follow-up.
4. Inspect `logs/trace-*.jsonl` — must show distinct steps for IntentParser → ProviderFinder → Ranker → Booking → FollowUp.
5. Check OpenAI tracing dashboard — workflow trace should show the handoff tree.
6. Edge cases to test: prompt with no time specified, unknown service category, location outside the mock dataset. Each should degrade gracefully (orchestrator returns a clarifying `error` field rather than crashing).

## Deliverable mapping

| Hackathon deliverable | How this plan covers it |
|---|---|
| Working prototype (mobile MUST) | We deliver the AI API; frontend team builds the mobile UI on top. README documents the contract. |
| Demo video | Show 3 curl calls + trace logs + OpenAI dashboard trace tree. |
| Agent Trace / Logs | JSONL files in `./logs/` + OpenAI tracing UI. |
| README documentation | Architecture diagram, "How Antigravity is used" (as IDE), API contract, assumptions, limitations. |

## Out-of-scope / explicit assumptions

- No real Maps API, no real booking provider, no auth.
- Mock provider dataset is Islamabad-focused (sectors G-13, F-10, I-8, F-11, G-9). Frontend can extend the dataset via a JSON file later.
- Frontend is responsible for the mobile deliverable; this layer is a self-contained API.
- "Simulated" booking means a returned confirmation object — no persistence between requests.
