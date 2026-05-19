# AI Service Orchestrator — Informal Economy

Multi-agent backend for the **AI Service Orchestrator for Informal Economy**
challenge. The service accepts a natural-language service request (Urdu /
Roman Urdu / English) and returns a parsed intent, top-3 ranked providers, a
simulated booking, and a scheduled follow-up reminder.

> **How Google Antigravity is used:** Antigravity is our **development IDE**
> for this project — we build, iterate, and trace the agentic workflow inside
> it. The runtime itself is the **OpenAI Agents SDK** (Python).

## Architecture

```
                 POST /orchestrate (FastAPI)
                            │
                            ▼
            ┌────────────────────────────────┐
            │   Orchestrator (deterministic  │
            │   chain inside one SDK trace)  │
            └────────────────────────────────┘
                            │
   ┌──────────┬─────────────┼─────────────┬──────────┐
   ▼          ▼             ▼             ▼          ▼
IntentParser  ProviderFinder  Ranker      Booking    FollowUp
(multilingual)(find_providers)(top-3 +    (simulate_ (schedule_
                              reasoning)  booking)   reminder)
```

Each specialist is a separate `Agent` with its own `output_type` (a Pydantic
model). The runner threads structured data through the chain. The whole
sequence runs inside a single `trace("ServiceOrchestrator", ...)` block so the
OpenAI tracing dashboard shows one workflow with one span per agent — that is
our **multi-agent reasoning evidence** for the rubric.

**Why a deterministic chain instead of free LLM-driven handoffs?** A fixed
pipeline (intent → discovery → rank → book → remind) is more reliable and
still produces a clean multi-agent trace. We also pass typed Pydantic objects
between steps, which removes free-text re-parsing.

## Project layout

```
Search/
├── pyproject.toml          # deps: openai-agents, fastapi[standard], pydantic, python-dotenv
├── main.py                 # uvicorn entrypoint → app.api:app
├── .env.example            # OPENAI_API_KEY, MODEL_NAME, SMALL_MODEL_NAME
├── README.md
└── app/
    ├── api.py              # FastAPI app + POST /orchestrate
    ├── schemas.py          # Pydantic models (request, response, inter-agent)
    ├── runtime.py          # Workflow chain, wrapped in one SDK trace
    ├── tools.py            # @function_tool definitions (mock providers, booking, reminder)
    ├── mock_data.py        # Mock Islamabad provider dataset
    ├── config.py           # Model names + .env loading
    └── agents/
        ├── orchestrator.py # Re-exports + design notes
        ├── intent.py       # IntentParser (multilingual)
        ├── discovery.py    # ProviderFinder
        ├── ranker.py       # Ranker
        ├── booking.py      # Booking
        └── followup.py     # FollowUp
```

## Setup

```bash
# 1. Copy env template and add your key
cp .env.example .env
# edit .env and set OPENAI_API_KEY

# 2. Install dependencies (uses uv)
uv sync

# 3. Run the server
uv run python main.py
# or:
uv run uvicorn app.api:app --reload
```

The server starts on `http://127.0.0.1:8000`. Interactive docs are at
`/docs`.

## API

### `POST /orchestrate`

**Request**

```json
{
  "user_prompt": "Mujhe kal subah G-13 mein AC technician chahiye",
  "user_location": { "sector": "G-13", "city": "Islamabad" },
  "current_time": "2026-05-18T22:00:00+05:00"
}
```

The `user_prompt` may be English, Urdu (Arabic script), Roman Urdu, or mixed.
`user_location` and `current_time` are optional — the server falls back to
`now()` and treats the location as `unknown` if neither the prompt nor the
context supplies one.

**Response (200)**

```json
{
  "intent": {
    "service_type": "ac_technician",
    "location": "G-13",
    "time_window": "tomorrow morning",
    "language_detected": "roman_urdu",
    "notes": null
  },
  "top_providers": [
    {
      "id": "p_001",
      "name": "Ali AC Services",
      "category": "ac_technician",
      "location": "G-13",
      "distance_km": 0.0,
      "rating": 4.7,
      "availability": "tomorrow 10:00 AM",
      "price_range": "PKR 1500–3000",
      "score": 0.93,
      "reasoning": "Same-sector match with the highest rating and aligned availability."
    }
  ],
  "recommended": { "...same shape as top_providers[0]..." },
  "booking": {
    "provider_id": "p_001",
    "provider_name": "Ali AC Services",
    "slot": "2026-05-19T10:00:00+05:00",
    "confirmation_id": "BK-20260519-0001",
    "message": "Slot booked with Ali AC Services at 2026-05-19T10:00:00+05:00. Confirmation BK-20260519-0001."
  },
  "followup": {
    "booking_id": "BK-20260519-0001",
    "reminder_at": "2026-05-19T09:00:00+05:00",
    "channel": "sms_simulated",
    "message": "Reminder scheduled 1 hour before appointment ..."
  },
  "trace": [
    { "agent": "IntentParser", "summary": "service_type=ac_technician, location=G-13, ..." },
    { "agent": "ProviderFinder", "summary": "found 4 candidate provider(s) ..." },
    { "agent": "Ranker", "summary": "top 3 ranked; recommended=Ali AC Services" },
    { "agent": "Booking", "summary": "booked Ali AC Services at ..." },
    { "agent": "FollowUp", "summary": "reminder at ... via sms_simulated" }
  ],
  "error": null
}
```

When discovery returns no matches, the response is still 200 — `top_providers`
is empty, `booking` and `followup` are stubs, and `error` explains why.

## Try it

```bash
curl -X POST http://127.0.0.1:8000/orchestrate \
  -H 'content-type: application/json' \
  -d '{
    "user_prompt": "Mujhe kal subah G-13 mein AC technician chahiye",
    "user_location": {"sector": "G-13", "city": "Islamabad"}
  }'
```

Try the same with different languages:

- English: `"I need a plumber in F-10 tomorrow afternoon"`
- Urdu: `"مجھے کل صبح جی ١٣ میں اے سی ٹیکنیشن چاہیے"`
- Roman Urdu: `"G-13 mein aaj sham electrician chahiye urgently"`

## Tracing

Every request runs inside a single OpenAI Agents SDK `trace(...)` block. Open
the [OpenAI Traces dashboard](https://platform.openai.com/traces) — you will
see a `ServiceOrchestrator` workflow with one child span per specialist agent
and tool call. The same step list is mirrored in the response under `trace`
so the frontend can render it without hitting the dashboard.

## Scope & assumptions

- **Mock data only.** Provider catalogue is hard-coded for Islamabad sectors
  G-13, G-9, F-10, F-11, I-8. Categories: AC technician, plumber, electrician,
  house cleaner, carpenter.
- **No persistence.** Bookings and reminders live for the duration of the
  response. The confirmation_id is generated per request.
- **No real Maps API.** Distance is computed via great-circle on hard-coded
  sector centroids.
- **No auth.** This is the AI layer; the mobile frontend handles user
  identity, UI, and any persistence.
- **Frontend deliverable.** The mobile MUST in the brief is built by the
  frontend team against this API contract.
