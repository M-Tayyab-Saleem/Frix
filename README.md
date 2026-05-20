# Frix — AI Service Orchestrator for the Informal Economy

> **Google Antigravity Hackathon · Challenge 2**
>
> An agentic AI system that automates the end-to-end lifecycle of informal-economy service requests — from multilingual user intent to booking and follow-up — powered by a 5-agent reasoning pipeline and a React Native mobile app.

---

## Table of Contents

- [Project Overview](#project-overview)
- [How Antigravity Is Used](#how-antigravity-is-used)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [API Contract](#api-contract)
- [Frontend — Karvaan Mobile App](#frontend--karvaan-mobile-app)
- [Mock Data Coverage](#mock-data-coverage)
- [Agent Trace & Logs](#agent-trace--logs)
- [Evaluation Criteria Mapping](#evaluation-criteria-mapping)
- [Assumptions & Limitations](#assumptions--limitations)
- [Team](#team)

---

## Project Overview

**Frix** tackles the inefficiencies of Pakistan's informal service economy — plumbers, electricians, AC technicians, tutors, beauticians, and more — where service discovery still happens through WhatsApp messages, phone calls, and word-of-mouth referrals.

The system accepts a **natural-language request** in English, Urdu (Arabic script), or Roman Urdu, and autonomously:

1. **Parses intent** — extracts service type, location, and time window.
2. **Discovers providers** — searches a mock provider database of Karachi-area tradespeople.
3. **Ranks candidates** — scores by distance (40%), rating (30%), and availability match (30%).
4. **Books the top provider** — generates a deterministic confirmation.
5. **Schedules a follow-up reminder** — 1 hour before the appointment via simulated SMS.

All five steps are executed by **separate AI agents** in a traceable pipeline, producing structured logs that demonstrate multi-agent reasoning.

---

## How Antigravity Is Used

**Google Antigravity serves as the core development IDE** for building, iterating, and debugging this entire project. The agentic backend was designed, coded, tested, and refined within the Antigravity environment, leveraging its AI-assisted development capabilities to:

- Architect the multi-agent pipeline and define agent instructions.
- Implement the FastAPI service, Pydantic schemas, and function tools.
- Debug and iterate on the React Native mobile frontend.
- Generate documentation and artifact files.

The agent runtime itself uses the **OpenAI Agents SDK** (`openai-agents`) for the actual LLM-powered reasoning, which runs via an OpenAI-compatible API (configurable to use Gemini models via `OPENAI_BASE_URL`).

---

## Architecture

```
                                   ┌─────────────────────┐
                                   │  Karvaan Mobile App  │
                                   │  (React Native/Expo) │
                                   └──────────┬──────────┘
                                              │ POST /orchestrate
                                              ▼
                                   ┌─────────────────────┐
                                   │   FastAPI Backend    │
                                   │   (app/api.py)       │
                                   └──────────┬──────────┘
                                              │
                                              ▼
                              ┌──────────────────────────────┐
                              │      runtime.py              │
                              │  Deterministic Agent Chain    │
                              │  (wrapped in SDK trace())    │
                              └──────────────┬───────────────┘
                                             │
              ┌──────────────┬───────────────┼───────────────┬──────────────┐
              ▼              ▼               ▼               ▼              ▼
       IntentParser    ProviderFinder     Ranker          Booking       FollowUp
       Agent           Agent             Agent           Agent         Agent
       ─────────       ──────────        ──────          ──────        ────────
       Multilingual    find_providers    Pure scoring    simulate_     schedule_
       extraction      tool (mock DB)   (no tools)      booking       reminder
       → ServiceIntent → Candidates     → Top 3        → Confirm ID  → Reminder
```

**Pattern:** Deterministic agent chain with `Runner.run()` per step, wrapped in a single `trace()` block. Each agent has its own `output_type` (Pydantic model), enabling typed data flow between stages without free-text parsing.

---

## Tech Stack

### Backend (`backend/`)

| Technology | Version | Purpose |
|---|---|---|
| **Python** | ≥ 3.12 | Runtime |
| **FastAPI** | ≥ 0.115 | HTTP API framework |
| **OpenAI Agents SDK** (`openai-agents`) | ≥ 0.2.9 | Multi-agent orchestration, tracing, `@function_tool` |
| **Pydantic** | ≥ 2.9 | Structured data models (`output_type` for agents) |
| **python-dotenv** | ≥ 1.0.1 | Environment variable loading |
| **uv** | — | Package manager & virtual environment |
| **Uvicorn** | (via FastAPI standard) | ASGI server |

### Frontend — Karvaan (`karvaan/`)

| Technology | Version | Purpose |
|---|---|---|
| **React Native** | 0.76.9 | Cross-platform mobile framework |
| **Expo** | ~52.0.0 | Managed workflow, build tooling |
| **TypeScript** | ≥ 5.3 | Type safety |
| **React Navigation** | 7.x | Stack + tab navigation |
| **TanStack React Query** | ≥ 5.62 | Server state, caching, offline persistence |
| **Zustand** | ≥ 5.0 | Client state management |
| **NativeWind / TailwindCSS** | 4.x / 3.4 | Utility-first styling |
| **React Native Reanimated** | ~3.16 | Animations |
| **React Native Maps** | ≥ 1.18 | Provider map view |
| **Expo Location** | ~18.0 | GPS coordinates |
| **MMKV** | ≥ 3.1 | High-performance local storage |
| **Sentry** | ~6.10 | Error monitoring |
| **@gorhom/bottom-sheet** | ≥ 5.1 | Bottom sheet UI |
| **@shopify/flash-list** | 1.7.3 | High-performance lists |

### LLM Models (configurable via env)

| Env Variable | Default | Used By |
|---|---|---|
| `MODEL_NAME` | `gpt-4.1` | IntentParser, Ranker (stronger reasoning) |
| `SMALL_MODEL_NAME` | `gpt-4.1-mini` | ProviderFinder, Booking, FollowUp (cost-efficient) |

---

## Core Features

### Backend
- **Multilingual Intent Parsing** — English, Urdu (Arabic script), Roman Urdu, and mixed-language input.
- **5-Agent Reasoning Pipeline** — IntentParser → ProviderFinder → Ranker → Booking → FollowUp.
- **Deterministic Function Tools** — `find_providers`, `simulate_booking`, `schedule_reminder` — all pure functions, no external I/O.
- **Haversine Distance Calculation** — Real GPS-based distance between user and providers.
- **Structured Output Types** — Every agent returns a Pydantic model, ensuring typed data flow.
- **OpenAI SDK Tracing** — Full trace tree visible in the OpenAI dashboard.
- **Graceful Degradation** — URL validation gate, empty-provider handling, partial-response returns.
- **Colorized Console Logging** — Rich terminal output showing each agent's execution and timing.
- **CORS Enabled** — Ready for frontend integration.
- **Health Check Endpoint** — `GET /health` for uptime monitoring.

### Frontend (Karvaan)
- **Request Screen** — Natural-language input with category chips and location picker.
- **Agent Thinking Screen** — Animated visualization of the multi-agent pipeline processing.
- **Results Screen** — Displays top-3 ranked providers with scores and reasoning.
- **Provider Detail Screen** — Full provider profile with specializations, pricing, and reviews.
- **Providers Map Screen** — Map view showing provider locations (native + web).
- **Booking Confirm Screen** — Booking confirmation with receipt details.
- **Booking Detail Screen** — Post-booking tracking and provider contact.
- **Follow-Up Dashboard** — Reminder and status tracking.
- **Dispute Screen** — Issue reporting flow.
- **Trace Accordion** — Collapsible view of agent reasoning steps.
- **Mock/Demo Mode** — Toggle between live API and mock responses.
- **Offline Support** — TanStack Query persistence with MMKV storage.
- **Error Boundary** — Graceful crash handling with Sentry integration.
- **Deep Linking** — URI-based navigation support.

---

## API Contract

### `POST /orchestrate`

**Request:**
```json
{
  "user_prompt": "Mujhe kal subah DHA Phase 6 mein AC technician chahiye",
  "user_location": {
    "area": "DHA Phase 6",
    "city": "Karachi",
    "lat": 24.7920,
    "lng": 67.0645
  },
  "current_time": "2026-05-20T22:00:00+05:00"
}
```

**Response (200):**
```json
{
  "intent": {
    "service_type": "ac_technician",
    "location": "DHA Phase 6",
    "time_window": "tomorrow morning",
    "language_detected": "roman_urdu",
    "notes": null
  },
  "top_providers": [
    {
      "id": "ac_001",
      "name": "Arctic Cool AC Services",
      "category": "ac_technician",
      "location": "DHA Phase 6, Karachi",
      "distance_km": 0.0,
      "rating": 4.8,
      "availability": "tomorrow 10:00 AM",
      "score": 0.95,
      "reasoning": "Closest provider with highest rating and matching availability."
    }
  ],
  "recommended": { "..." },
  "booking": {
    "provider_id": "ac_001",
    "provider_name": "Arctic Cool AC Services",
    "slot": "2026-05-21T10:00:00+05:00",
    "confirmation_id": "BK-20260521-0001",
    "message": "Slot booked with Arctic Cool AC Services at 2026-05-21T10:00:00+05:00."
  },
  "followup": {
    "booking_id": "BK-20260521-0001",
    "reminder_at": "2026-05-21T09:00:00+05:00",
    "channel": "sms_simulated",
    "message": "Reminder scheduled 1 hour before appointment."
  },
  "trace": {
    "workflow_id": "wf_a1b2c3d4e5f6",
    "steps": [
      { "agent": "IntentParser", "summary": "service_type=ac_technician, location=DHA Phase 6, ..." },
      { "agent": "ProviderFinder", "summary": "found 6 candidate provider(s) ..." },
      { "agent": "Ranker", "summary": "top 3 ranked; recommended=Arctic Cool AC Services" },
      { "agent": "Booking", "summary": "booked Arctic Cool AC Services at ..." },
      { "agent": "FollowUp", "summary": "reminder at ... via sms_simulated" }
    ]
  },
  "error": null
}
```

### `GET /health`

Returns `{"status": "ok"}`.

---

## Frontend — Karvaan Mobile App

The React Native mobile app (`karvaan/`) provides the user-facing interface:

| Screen | Purpose |
|---|---|
| `RequestScreen` | User types or speaks their service request |
| `AgentThinkingScreen` | Animated pipeline visualization while agents work |
| `ResultsScreen` | Top-3 providers with ranked scores |
| `ProviderDetailScreen` | Full provider profile |
| `ProvidersMapScreen` | Map view of providers (native + web variants) |
| `BookingConfirmScreen` | Booking confirmation receipt |
| `BookingDetailScreen` | Post-booking details and tracking |
| `FollowUpDashboardScreen` | Reminders and status |
| `BookingsListScreen` | All bookings history |
| `DisputeScreen` | Issue reporting |

**Navigation:** React Navigation with a bottom tab navigator (`MainTabNavigator`) and a root stack (`RootNavigator`). Deep linking is configured via `linkingConfig.ts`.

**State:** Zustand stores for orchestrator state, auth, and theme. TanStack Query for server state with MMKV-backed offline persistence.

---

## Mock Data Coverage

The mock provider dataset (`app/mock_data.py`) covers **35 providers** across **20 Karachi areas** and **7 service categories**:

| Category | Count | Areas Covered |
|---|---|---|
| AC Technician | 6 | DHA Phase 6, Clifton Block 5, Gulshan Block 13, PECHS Block 2, North Nazimabad Block H, Saddar |
| Plumber | 6 | PECHS Block 6, Clifton Block 8, Gulshan Block 7, Bahadurabad, Nazimabad No.3, Korangi |
| Electrician | 6 | DHA Phase 2, Tariq Road, Federal B Area Block 4, North Nazimabad Block J, Malir Cantonment, Saddar |
| Carpenter | 6 | Gulshan Block 13, DHA Phase 6, Bahadurabad, PECHS Block 2, Nazimabad No.3, Orangi Town |
| Painter | 6 | Clifton Block 5, DHA Phase 2, PECHS Block 6, Gulshan Block 7, North Nazimabad Block H, Surjani Town |
| Tutor | 5 | Clifton Block 8, Gulshan Block 13, PECHS Block 2, Tariq Road, North Nazimabad Block J |
| Beautician | 5 | DHA Phase 6, Clifton Block 5, Bahadurabad, Gulshan Block 7, Malir Cantonment |

Each provider includes: GPS coordinates, rating, availability, specializations, pricing (base fee + per hour in PKR), years of experience, on-time score, cancellation rate, review count, and phone number.

---

## Agent Trace & Logs

### OpenAI Dashboard Traces
With `OPENAI_API_KEY` set and tracing enabled, every `Runner.run()` call produces a trace span in the OpenAI dashboard. The `trace()` context manager groups all 5 agent runs under a single `ServiceOrchestrator` workflow.

### Console Trace
The runtime outputs a colorized, structured console log for every request showing:
- Agent name and execution time per step.
- Detected intent fields (trade, area, schedule, language).
- Discovered candidate list.
- Weighted leaderboard with scores and reasoning.
- Booking confirmation details.
- Follow-up reminder scheduling.
- Total workflow duration.

### Response Trace
Every API response includes a `trace` field with `workflow_id` and an array of `steps`, each containing the agent name and a summary of its output.

---

## Evaluation Criteria Mapping

| Criterion | Weight | How Frix Addresses It |
|---|---|---|
| **Use of Google Antigravity** | 25% | Antigravity used as the development IDE for building the entire project. |
| **Agentic Reasoning & Workflow** | 20% | 5-agent chain with typed handoffs, full trace tree, structured reasoning pipeline. |
| **Matching Quality & Decision Logic** | 20% | Haversine distance + rating + availability scoring with transparent weights (40/30/30). |
| **Action Simulation & Execution** | 15% | Deterministic booking confirmation IDs, simulated SMS reminders, clear state transitions. |
| **Technical Implementation** | 10% | Clean separation (agents/tools/runtime/api), Pydantic v2, graceful error handling, CORS, health check. |
| **Innovation & UX** | 10% | React Native mobile app with animated agent-thinking visualization, map view, offline support, trace accordion. |

---

## Assumptions & Limitations

- **Mock data only** — No real Maps API, no real booking provider, no persistence between requests.
- **Karachi-focused** — Mock provider dataset covers 20 Karachi areas. Extendable via `mock_data.py`.
- **Simulated booking** — Confirmation IDs are generated in-process and reset on server restart.
- **No auth** — The backend has no authentication; the frontend uses Google Sign-In independently.
- **LLM dependency** — Agent reasoning requires an OpenAI-compatible API key (OpenAI, Gemini, etc.).
- **No real SMS** — Reminders use `sms_simulated` channel; no actual messages are sent.
- **Frontend is the mobile deliverable** — The backend is a self-contained API; the Karvaan app is the user-facing product.

---

## Team

Built for the **Google Antigravity Hackathon** — Challenge 2: AI Service Orchestrator for Informal Economy.
