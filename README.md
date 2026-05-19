# ServisAI — AI Service Orchestrator
## Google Antigravity #AISeekho2026 Hackathon | Challenge 2

> **Team:** [Your Team Name]
> **Challenge:** Challenge 2 — AI Service Orchestrator for Informal Economy

---

## Problem

Pakistan's informal service economy — AC technicians, plumbers, electricians, tutors — operates through WhatsApp messages, phone calls, and word-of-mouth referrals. This means:
- Users wait hours to find and confirm a provider
- Providers miss bookings due to no centralized system
- No transparency in pricing, availability, or reliability
- No recourse for disputes or poor service

## Solution

ServisAI is an agentic AI system that automates the complete service lifecycle — from a natural-language request in Urdu, Roman Urdu, or English, to provider matching, booking, confirmation, follow-up, and dispute resolution.

The key innovation: every decision is made by an AI agent and the reasoning is fully visible to the user.

---

## Architecture

```
User (Mobile App — React Native / Expo)
         │
         │  POST /orchestrate (natural language + location)
         ▼
┌─────────────────────────────────────────────────┐
│          FastAPI Backend (Python)                │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │     Orchestrator Agent                   │    │
│  │  (Google Antigravity — Gemini Pro)       │    │
│  └────────────────┬────────────────────────┘    │
│                   │ handoffs                     │
│    ┌──────────────┼──────────────┐              │
│    ▼              ▼              ▼              │
│  IntentParser  ProviderFinder  Ranker           │
│  Agent         Agent           Agent            │
│    │                            │              │
│    ▼                            ▼              │
│  Booking Agent          FollowUp Agent          │
│                                                  │
│  Mock Provider Dataset (Islamabad sectors)       │
│  JSONL Trace Logs                               │
└─────────────────────────────────────────────────┘
```

---

## How Google Antigravity Is Used

Google Antigravity serves as the **core orchestration platform** for all agent workflows:

1. **Orchestrator Agent** — Built on Antigravity's agent runtime. Plans the workflow: determines which specialist agent to invoke at each step and assembles the final response.

2. **Reasoning Traces** — Antigravity's built-in tracing captures every agent decision: intent confidence, provider selection rationale, scheduling logic, and booking confirmation. These traces are exported as JSONL and surfaced in the mobile UI.

3. **Tool Integration** — Antigravity manages function tool execution for provider lookup, booking simulation, and reminder scheduling.

4. **Multi-Agent Handoffs** — The orchestrator hands off to specialist agents (IntentParser → ProviderFinder → Ranker → Booking → FollowUp) via structured handoffs, producing a full decision tree that is visualized in the app.

---

## Agent Descriptions

| Agent | Responsibility |
|---|---|
| **Orchestrator** | Plans workflow, coordinates handoffs, assembles response |
| **IntentParser** | Parses multilingual input (Urdu / Roman Urdu / English), extracts service type, location, time, confidence score |
| **ProviderFinder** | Queries mock provider database by service type and location using `find_providers()` tool |
| **Ranker** | Scores providers on 6 factors: distance (40%), rating (30%), availability (30%), with reasoning per provider |
| **Booking** | Simulates slot reservation via `simulate_booking()`, generates confirmation ID |
| **FollowUp** | Schedules reminder via `schedule_reminder()`, returns reminder object |

---

## API Contract

### `POST /orchestrate`

**Request:**
```json
{
  "user_prompt": "Mujhe kal subah G-13 mein AC technician chahiye",
  "user_location": { "sector": "G-13", "city": "Islamabad", "lat": 33.65, "lng": 72.99 },
  "current_time": "2026-05-19T10:00:00+05:00"
}
```

**Response:** Intent + ranked providers + booking confirmation + follow-up + full agent trace.

See `api-contract.md` for complete schema.

---

## Mobile App Screens

| Screen | Purpose |
|---|---|
| RequestScreen | Natural language input (voice + text) in any language |
| AgentThinkingScreen | Live visualization of 5-agent workflow running |
| ResultsScreen | Ranked providers with score bars and reasoning |
| BookingConfirmScreen | Step-by-step execution log + booking receipt |
| BookingDetailScreen | Active booking status tracker |
| DisputeScreen | Issue reporting + AI-driven resolution simulation |
| ProvidersMapScreen | Map view of available providers by category |

---

## Provider Matching Factors

The Ranker agent scores each provider on:
- **Distance / travel time** (40%) — proximity to requested sector
- **Rating** (30%) — average customer rating
- **Availability** (30%) — slot match to requested time window

Additional factors in mock data (not yet weighted in scoring):
- Review recency
- Specialization match (e.g., split AC vs. window AC)
- Cancellation rate

---

## Multilingual Support

The system handles:
- **English:** "I need an AC technician in G-13 tomorrow morning"
- **Roman Urdu:** "Mujhe kal subah G-13 mein AC technician chahiye"
- **Urdu (Arabic script):** "مجھے کل صبح جی-13 میں اے سی ٹیکنیشن چاہیے"

Language is detected by the IntentParser agent and the mobile app (client-side heuristic for real-time feedback). Confidence score is returned and displayed.

---

## Simulated Actions

The following actions are simulated (clearly labeled as mock/simulated):

| Action | Simulation Method |
|---|---|
| Provider lookup | In-memory mock dataset (`mock_data.py`) |
| Booking confirmation | Deterministic confirmation ID generator |
| SMS notification | Returns `channel: "sms_simulated"` |
| Calendar entry | Visual UI only (no real calendar write) |
| Reminder scheduling | Returns scheduled time; no real scheduler |
| Dispute refund | Returns resolution object; no real payment |

No real personal data, payment data, or sensitive information is used anywhere.

---

## Running the Project

### Backend (FastAPI)
```bash
cd backend/
uv sync
cp .env.example .env   # Add your OpenAI API key
uvicorn app.api:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React Native / Expo)
```bash
cd frontend/
npm install
cp .env.example .env.local
# Set EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000
npx expo start
```

### Run with Mock Data (no backend needed)
```bash
EXPO_PUBLIC_USE_MOCK=true npx expo start
```

### Test Prompts
```bash
# English
curl -X POST localhost:8000/orchestrate \
  -H 'content-type: application/json' \
  -d '{"user_prompt":"I need an AC technician in G-13 tomorrow morning","user_location":{"sector":"G-13","city":"Islamabad","lat":33.65,"lng":72.99}}'

# Roman Urdu
curl -X POST localhost:8000/orchestrate \
  -H 'content-type: application/json' \
  -d '{"user_prompt":"Mujhe kal subah G-13 mein AC technician chahiye","user_location":{"sector":"G-13","city":"Islamabad","lat":33.65,"lng":72.99}}'

# Urdu
curl -X POST localhost:8000/orchestrate \
  -H 'content-type: application/json' \
  -d '{"user_prompt":"مجھے کل صبح جی-13 میں اے سی ٹیکنیشن چاہیے","user_location":{"sector":"G-13","city":"Islamabad","lat":33.65,"lng":72.99}}'
```

---

## Assumptions & Limitations

- Provider dataset covers Islamabad sectors only (G-13, F-10, F-11, G-9, I-8)
- All bookings are simulated — no real calendar, SMS, or payment integrations
- Provider database is static mock data; no real-time availability
- Authentication is minimal (name-based onboarding, no OAuth)
- Bookings persist in local device storage only (MMKV), not server-side
- Price estimates are illustrative ranges from mock data

---

## Agent Trace Logs

Traces are written to `backend/logs/trace-<workflow_id>.jsonl` on every request.

Example trace entry:
```json
{"agent": "IntentParser", "summary": "Detected: AC Technician | Location: G-13 | Time: tomorrow morning | Language: Roman Urdu | Confidence: high"}
{"agent": "ProviderFinder", "summary": "Found 8 providers in G-13 and adjacent sectors"}
{"agent": "Ranker", "summary": "Scored 8 providers. Top: Ali AC Services (0.93). Weights: distance 40%, rating 30%, availability 30%"}
{"agent": "Booking", "summary": "Reserved 10:00 AM slot. Confirmation: BK-20260519-0001"}
{"agent": "FollowUp", "summary": "Reminder scheduled via sms_simulated for 09:00 AM"}
```

---

## Privacy Note

No real personal data, names, phone numbers, or sensitive information is used. All provider data is fictional. All user prompts used in testing are synthetic examples created for demonstration purposes.
