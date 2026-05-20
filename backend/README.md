# Frix AI Service Orchestrator — Informal Economy Backend
## Google Antigravity #AISeekho2026 Hackathon | Challenge 2

Multi-agent backend for **Frix**, the ultimate AI Service Orchestrator for the informal economy. The service accepts a natural-language service request in English, Urdu (Arabic script), or Roman Urdu, resolves sectors, and utilizes a deterministic multi-agent chain to identify matching providers, score and rank them, simulate a secure slot booking, and schedule automated reminders.

---

## 🏗️ Architecture

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

Each specialist is a separate `Agent` with its own `output_type` (a Pydantic model). The runner threads structured data through the chain. The whole sequence runs inside a single `trace("ServiceOrchestrator", ...)` block so the tracing dashboard shows one workflow with one span per agent — providing clear **multi-agent reasoning evidence** for the hackathon rubric.

**Why a deterministic chain instead of free LLM-driven handoffs?** A fixed pipeline (`IntentParser` → `ProviderFinder` → `Ranker` → `Booking` → `FollowUp`) is highly reliable and produces clean, traceable multi-agent logs. Passing typed Pydantic objects between steps removes any parsing fragility.

---

## 📁 Project Layout

```
backend/
├── pyproject.toml          # Deps: openai-agents, fastapi[standard], pydantic, python-dotenv
├── main.py                 # Uvicorn entrypoint → app.api:app
├── .env.example            # OPENAI_API_KEY, OPENAI_BASE_URL (Gemini Compatibility)
├── README.md
└── app/
    ├── api.py              # FastAPI app + POST /orchestrate
    ├── schemas.py          # Pydantic models (request, response, inter-agent)
    ├── runtime.py          # Workflow chain, wrapped in one SDK trace
    ├── tools.py            # @function_tool definitions (mock providers, booking, reminder)
    ├── mock_data.py        # Mock Karachi provider dataset & centroids
    ├── config.py           # Model names + .env loading
    └── main_agents/
        ├── orchestrator.py # Specialist agents coordinator
        ├── intent.py       # IntentParser (multilingual)
        ├── discovery.py    # ProviderFinder
        ├── ranker.py       # Ranker (weight: distance 40%, rating 30%, availability 30%)
        ├── booking.py      # Booking
        └── followup.py     # FollowUp
```

---

## ⚡ Setup

```bash
# 1. Copy env template and add your API key
cp .env.example .env
# Edit .env and set OPENAI_API_KEY and OPENAI_BASE_URL for Gemini

# 2. Install dependencies (uses uv)
uv sync

# 3. Run the server
uv run python main.py
# or:
uv run uvicorn app.api:app --reload
```

The server starts on `http://127.0.0.1:8000`. Interactive OpenAPI documentation is available at `/docs`.

---

## 🔌 API Contract

### `POST /orchestrate`

**Request:**

```json
{
  "user_prompt": "Mujhe kal subah Clifton Block 5 mein AC technician chahiye",
  "user_location": { "area": "Clifton Block 5", "city": "Karachi", "lat": 24.8090, "lng": 67.0307 },
  "current_time": "2026-05-20T10:00:00+05:00"
}
```

The `user_prompt` may be English, Urdu, Roman Urdu, or mixed. `user_location` and `current_time` are optional — the server falls back to the current timestamp and treats the location as `unknown` if neither the prompt nor the context supplies one.

**Response (200):**

```json
{
  "intent": {
    "service_type": "ac_technician",
    "location": "Clifton Block 5",
    "time_window": "tomorrow morning",
    "language_detected": "roman_urdu",
    "notes": null
  },
  "top_providers": [
    {
      "id": "p_001",
      "name": "Karachi Air Solutions",
      "category": "ac_technician",
      "location": "Clifton Block 5",
      "distance_km": 1.2,
      "rating": 4.8,
      "availability": "tomorrow morning",
      "price_range": "PKR 1500–3000",
      "score": 0.94,
      "reasoning": "Same-sector match with high rating and morning slot available."
    }
  ],
  "recommended": {
    "id": "p_001",
    "name": "Karachi Air Solutions",
    "category": "ac_technician",
    "location": "Clifton Block 5",
    "distance_km": 1.2,
    "rating": 4.8,
    "availability": "tomorrow morning",
    "score": 0.94,
    "reasoning": "Same-sector match with high rating and morning slot available."
  },
  "booking": {
    "provider_id": "p_001",
    "provider_name": "Karachi Air Solutions",
    "slot": "2026-05-21T10:00:00",
    "confirmation_id": "BK-48d2f190",
    "message": "Slot booked with Karachi Air Solutions at 2026-05-21T10:00:00. Confirmation BK-48d2f190."
  },
  "followup": {
    "booking_id": "BK-48d2f190",
    "reminder_at": "2026-05-21T09:00:00",
    "channel": "sms_simulated",
    "message": "Reminder scheduled 1 hour before appointment via sms_simulated."
  },
  "trace": {
    "workflow_id": "wf_16a4b182e",
    "steps": [
      { "agent": "IntentParser", "summary": "service_type=ac_technician, location=Clifton Block 5, ..." },
      { "agent": "ProviderFinder", "summary": "found 4 candidate provider(s) ..." },
      { "agent": "Ranker", "summary": "top 3 ranked; recommended=Karachi Air Solutions" },
      { "agent": "Booking", "summary": "booked Karachi Air Solutions at 2026-05-21T10:00:00 ..." },
      { "agent": "FollowUp", "summary": "reminder at 2026-05-21T09:00:00 via sms_simulated" }
    ]
  },
  "error": null
}
```

---

## 🚀 Interactive Test Prompts

You can test the agentic pipeline using standard terminal cURL commands:

```bash
# English Request
curl -X POST http://127.0.0.1:8000/orchestrate \
  -H 'content-type: application/json' \
  -d '{
    "user_prompt": "I need a plumber in DHA Phase 6 tomorrow afternoon",
    "user_location": {"area": "DHA Phase 6", "city": "Karachi"}
  }'

# Roman Urdu Request
curl -X POST http://127.0.0.1:8000/orchestrate \
  -H 'content-type: application/json' \
  -d '{
    "user_prompt": "Gulshan-e-Iqbal Block 13 mein aaj sham electrician chahiye urgently",
    "user_location": {"area": "Gulshan-e-Iqbal Block 13", "city": "Karachi"}
  }'
```

---

## ⚖️ Scope & Assumptions

* **Mock data only**: Provider database covers 20 specific Karachi neighborhoods (DHA, Clifton, PECHS, Gulshan, Saddar, North Nazimabad, etc.) for trade categories (AC technician, plumber, electrician, cleaner, carpenter).
* **Deterministic Calculations**: Coordinates represent local sector centroids. Proximity distance calculations are performed on the fly using standard spherical distance metrics.
* **No External Write Dependencies**: Bookings and reminders are stored securely on the client-side using native MMKV storage. The backend logs traces to `logs/` and outputs trace structures in responses so the frontend can render them dynamically.
