# Developer Walkthrough — Frix Codebase

This document provides a detailed technical walkthrough of how the Frix application is structured and how its features work, aimed at developers who need to understand, extend, or debug the system.

---

## Table of Contents

- [Repository Structure](#repository-structure)
- [Backend Architecture Deep Dive](#backend-architecture-deep-dive)
  - [Entry Point & Configuration](#entry-point--configuration)
  - [Pydantic Schemas — The Data Backbone](#pydantic-schemas--the-data-backbone)
  - [The 5-Agent Pipeline](#the-5-agent-pipeline)
  - [Function Tools](#function-tools)
  - [Mock Provider Database](#mock-provider-database)
  - [Runtime — The Workflow Engine](#runtime--the-workflow-engine)
  - [API Layer](#api-layer)
- [Frontend Architecture Deep Dive](#frontend-architecture-deep-dive)
  - [App Entry & Provider Stack](#app-entry--provider-stack)
  - [Navigation Structure](#navigation-structure)
  - [Screen-by-Screen Breakdown](#screen-by-screen-breakdown)
  - [API Client & Mock Mode](#api-client--mock-mode)
  - [State Management](#state-management)
- [End-to-End Request Lifecycle](#end-to-end-request-lifecycle)
- [Key Design Decisions](#key-design-decisions)

---

## Repository Structure

```
Frix/
├── backend/                    # Python backend — FastAPI + AI agents
│   ├── pyproject.toml          # Dependencies & project metadata
│   ├── main.py                 # CLI entrypoint (currently commented out)
│   ├── test_api.py             # Direct OpenAI API connectivity test
│   ├── test_orchestrator.py    # End-to-end orchestrator endpoint test
│   ├── test_groq.py            # Alternative LLM provider test
│   ├── test_multiple_keys.py   # Multi-key validation test
│   ├── test_raw_gemini.py      # Direct Gemini API test
│   ├── test_workflow_direct.py # Direct workflow invocation test
│   ├── uv.lock                 # Locked dependency versions
│   └── app/                    # Application package
│       ├── __init__.py
│       ├── api.py              # FastAPI app, endpoints, CORS
│       ├── config.py           # Environment loading, model name constants
│       ├── schemas.py          # All Pydantic models (request/response/inter-agent)
│       ├── tools.py            # @function_tool definitions (3 tools)
│       ├── mock_data.py        # 35 mock providers across 20 Karachi areas
│       ├── runtime.py          # Workflow engine — chains 5 agents
│       └── main_agents/        # Agent definitions
│           ├── __init__.py
│           ├── orchestrator.py # Re-exports all agents (documents architecture choice)
│           ├── intent.py       # IntentParser agent
│           ├── discovery.py    # ProviderFinder agent
│           ├── ranker.py       # Ranker agent
│           ├── booking.py      # Booking agent
│           └── followup.py     # FollowUp agent
│
├── karvaan/                    # React Native frontend
│   ├── App.tsx                 # Root component with provider stack
│   ├── package.json            # Dependencies (frix v1.0.0)
│   ├── app.json                # Expo configuration
│   ├── tsconfig.json           # TypeScript paths & aliases
│   ├── babel.config.js         # Babel + module-resolver + NativeWind
│   ├── index.js                # registerRootComponent entry
│   └── src/
│       ├── api/                # Backend API client
│       │   ├── orchestrator.ts # POST /orchestrate with mock toggle
│       │   └── mockResponse.ts # Hardcoded mock response
│       ├── components/         # Reusable UI components (19 files)
│       ├── screens/            # App screens (11 files)
│       ├── navigation/         # React Navigation setup
│       ├── store/              # Zustand state stores
│       ├── types/              # TypeScript type definitions
│       ├── hooks/              # Custom React hooks
│       ├── constants/          # App constants
│       ├── data/               # Static data
│       ├── lib/                # Utility libraries (Sentry, MMKV)
│       ├── services/           # Analytics & logging
│       └── utils/              # Helper functions
│
├── README.md                   # Project overview
├── instructions.md             # Setup & run guide
├── Agent-Backend-Plan.md       # Original backend architecture plan
├── FRONTEND_PLAN.md            # Frontend design plan
├── implementation_plan.md      # Detailed implementation plan
├── api-contract.md             # API contract specification
├── app-flow.md                 # Application flow documentation
├── integration.md              # Backend-frontend integration guide
└── WINNING_STRATEGY.md         # Hackathon strategy document
```

---

## Backend Architecture Deep Dive

### Entry Point & Configuration

**`app/config.py`** is the first module loaded. It:

1. Calls `load_dotenv()` at import time — this means any module that imports from `config.py` automatically picks up `.env` variables.
2. Exports two constants:
   - `MODEL_NAME` — defaults to `gpt-4.1`. Used by the IntentParser and Ranker (agents that need stronger reasoning).
   - `SMALL_MODEL_NAME` — defaults to `gpt-4.1-mini`. Used by ProviderFinder, Booking, and FollowUp (agents with simpler tasks, optimized for cost).

**`main.py`** contains a commented-out uvicorn entrypoint. The actual server is started via `uvicorn app.api:app` or `fastapi dev` (configured in `pyproject.toml` under `[tool.fastapi]`).

### Pydantic Schemas — The Data Backbone

**`app/schemas.py`** defines every data shape that flows through the system. This is critical because the OpenAI Agents SDK uses Pydantic models as `output_type` parameters — the LLM is forced to return structured data matching the schema.

**Request models:**
- `UserLocation` — area, city, lat, lng. Defaults city to "Karachi".
- `OrchestrateRequest` — user_prompt (required), user_location (optional), current_time (optional, defaults to now).

**Inter-agent models:**
- `ServiceIntent` — Output of IntentParser. Fields: service_type (snake_case), location, time_window, language_detected (enum), notes.
- `Provider` — Raw provider record. 16 fields including GPS, rating, availability, pricing, specializations, phone.
- `RankedProvider` — Extends Provider with `score` (0.0–1.0) and `reasoning` (one-line explanation).
- `RankedProviders` — Wrapper containing `top_providers` list and `recommended_id`.
- `BookingResult` — provider_id, provider_name, slot, confirmation_id, message.
- `ReminderResult` — booking_id, reminder_at, channel, message.

**Response models:**
- `TraceStep` — agent name + summary string.
- `TraceResponse` — workflow_id + list of TraceSteps.
- `OrchestratorResponse` — The top-level envelope: intent, top_providers, recommended, booking, followup, trace, error.

### The 5-Agent Pipeline

Each agent lives in `app/main_agents/` and is a single `Agent(...)` instance from the `openai-agents` SDK.

#### Agent 1: IntentParser (`intent.py`)

- **Model:** `MODEL_NAME` (stronger model for multilingual understanding)
- **Output type:** `ServiceIntent`
- **Tools:** None
- **Key instruction details:**
  - Handles English, Urdu, Roman Urdu, and mixed-language input.
  - Normalizes service types to snake_case (e.g., "AC theek karwana hai" → `ac_technician`).
  - Lists 10 common categories in its instructions: ac_technician, plumber, electrician, house_cleaner, carpenter, painter, mechanic, mason, driver, tailor.
  - Falls back to "unknown" if fields can't be determined.
  - Detects language as one of: english, urdu, roman_urdu, mixed, unknown.

#### Agent 2: ProviderFinder (`discovery.py`)

- **Model:** `SMALL_MODEL_NAME` (simple task, cost-efficient)
- **Output type:** `ProviderCandidates` (custom wrapper: `providers: list[Provider]`)
- **Tools:** `find_providers`
- **Key instruction details:**
  - Calls `find_providers` with the exact service_type and location from the intent.
  - Returns ALL results from the tool — no filtering or re-ordering (that's the Ranker's job).
  - If the tool returns an empty list, returns empty providers (no fabrication).
  - Passes through user GPS coordinates if available.

#### Agent 3: Ranker (`ranker.py`)

- **Model:** `MODEL_NAME` (needs stronger reasoning for scoring)
- **Output type:** `RankedProviders`
- **Tools:** None — pure reasoning agent
- **Key instruction details:**
  - Scoring weights are explicitly documented: distance 40%, rating 30%, availability 30%.
  - Distance scoring: ≤2km ≈ 1.0, ≥10km ≈ 0.0, linear interpolation.
  - Rating scoring: 5.0 → 1.0, 3.0 → 0.0, linear.
  - Availability scoring: full credit if matches time_window, partial if same day, low if much later.
  - Returns top 3 sorted by score descending + a `recommended_id`.

#### Agent 4: Booking (`booking.py`)

- **Model:** `SMALL_MODEL_NAME`
- **Output type:** `BookingResult`
- **Tools:** `simulate_booking`
- **Key instruction details:**
  - Chooses an ISO-8601 slot matching the provider's availability AND the user's time_window.
  - Calls `simulate_booking(provider_id, provider_name, slot_iso)` exactly once.
  - For vague time_windows like "as soon as possible", picks the next reasonable slot.

#### Agent 5: FollowUp (`followup.py`)

- **Model:** `SMALL_MODEL_NAME`
- **Output type:** `ReminderResult`
- **Tools:** `schedule_reminder`
- **Key instruction details:**
  - Calls `schedule_reminder(confirmation_id, slot_iso, channel)` with `channel='sms_simulated'`.
  - One reminder per booking. No extras.

#### Architecture Note: `orchestrator.py`

The file `orchestrator.py` does **not** define a root `Agent` with handoffs. Instead, it's a documentation module that:
1. Explains why a **deterministic chain** was chosen over free handoffs.
2. Re-exports all 5 agent instances for convenient importing.

The actual orchestration happens in `runtime.py` via sequential `Runner.run()` calls.

### Function Tools

**`app/tools.py`** defines three `@function_tool`-decorated functions:

#### `find_providers(service_type, location, user_lat?, user_lng?)`

1. Normalizes `service_type` to lowercase snake_case with underscores.
2. Filters `MOCK_PROVIDERS` by exact category match.
3. Determines user coordinates: prefers explicit lat/lng, falls back to `KARACHI_COORDS` lookup (case-insensitive), defaults to 5.0 km distance.
4. Computes Haversine great-circle distance between user and each provider.
5. Sorts by distance ascending.
6. Returns all matching providers (not capped).

There's also a `find_providers_raw()` companion function for direct Python calls (without the `@function_tool` decorator).

#### `simulate_booking(provider_id, provider_name, slot_iso)`

1. Increments a module-level `itertools.count` counter.
2. Generates a confirmation ID: `BK-YYYYMMDD-NNNN` (e.g., `BK-20260521-0001`).
3. Returns a dict with provider_id, provider_name, slot, confirmation_id, and a human-readable message.
4. Counter resets on server restart (acceptable for demo).

#### `schedule_reminder(confirmation_id, slot_iso, channel)`

1. Parses the slot ISO timestamp (with fallback for non-ISO strings).
2. Computes reminder time = slot - 1 hour.
3. Returns booking_id, reminder_at, channel, and a message.

### Mock Provider Database

**`app/mock_data.py`** contains:

- `KARACHI_COORDS` — A dict mapping 20 Karachi area names to `(lat, lng)` tuples. Used for distance computation when user GPS isn't provided.
- `MOCK_PROVIDERS` — A list of 35 provider dicts across 7 categories, each with 15+ fields.

Each provider has realistic data: Pakistani names, Karachi GPS coordinates, on-time scores, cancellation rates, review counts, specialization lists, PKR pricing, and phone numbers.

### Runtime — The Workflow Engine

**`app/runtime.py`** is the core of the system. Key components:

#### Console Helpers
ANSI color codes and formatting functions (`_banner`, `_section`, `_kv`, `_ok`, `_done`) produce rich terminal output during execution. This serves double duty: developer debugging AND demo-video evidence.

#### Prompt Builders
Five functions build the input prompt for each agent:
- `_intent_prompt(req)` — Bundles user_prompt + location + time into a JSON context block.
- `_discovery_prompt(intent, user_lat, user_lng)` — Passes the parsed intent + GPS coordinates.
- `_ranker_prompt(intent, candidates_json)` — Serializes candidates as JSON.
- `_booking_prompt(recommended, intent, current_time)` — Passes the top provider + time context.
- `_followup_prompt(booking)` — Passes the booking confirmation.

#### `configure_gemini()`
Configures the OpenAI Agents SDK to use an OpenAI-compatible endpoint (e.g., Gemini). It:
1. Disables global tracing (suppresses 401 errors from invalid OpenAI tracing keys).
2. Creates an `AsyncOpenAI` client with the configured base URL.
3. Sets it as the default client for the SDK.
4. Forces `chat_completions` API mode.

#### `run_workflow(req) → OrchestratorResponse`
The main async function that runs the full pipeline:

1. **Input validation** — Blocks URLs/web addresses before any LLM call.
2. **Gemini configuration** — Calls `configure_gemini()`.
3. **Trace context** — Wraps everything in `trace(workflow_name="ServiceOrchestrator")`.
4. **Step 1: IntentParser** — Runs `Runner.run(intent_agent, ...)`, gets `ServiceIntent`.
5. **Step 2: ProviderFinder** — Runs `Runner.run(discovery_agent, ...)`, gets `ProviderCandidates`.
6. **Early exit** — If no providers found, returns a degraded response with error message.
7. **Step 3: Ranker** — Serializes candidates to JSON, runs `Runner.run(ranker_agent, ...)`, gets `RankedProviders`.
8. **Early exit** — If no recommended provider, returns degraded response.
9. **Step 4: Booking** — Runs `Runner.run(booking_agent, ...)`, gets `BookingResult`.
10. **Step 5: FollowUp** — Runs `Runner.run(followup_agent, ...)`, gets `ReminderResult`.
11. **Assembly** — Builds and returns `OrchestratorResponse` with all fields + trace.

Each step records timing, logs results to console, and appends a `TraceStep`.

### API Layer

**`app/api.py`** is a minimal FastAPI application:

- **CORS middleware** — `allow_origins=["*"]` for development.
- **`GET /health`** — Returns `{"status": "ok"}`.
- **`POST /orchestrate`** — Accepts `OrchestrateRequest`, calls `run_workflow()`, returns `OrchestratorResponse`. Catches all exceptions and returns HTTP 500 with a descriptive error.
- **Logging** — Uses Python's `logging` module under the `"ai_orchestrator"` namespace.

---

## Frontend Architecture Deep Dive

### App Entry & Provider Stack

**`App.tsx`** wraps the app in a layered provider stack (outside-in):

1. `GestureHandlerRootView` — Required for gesture-based interactions.
2. `SafeAreaProvider` — Handles notched device layouts.
3. `ErrorBoundary` — Catches React rendering errors (with Sentry integration).
4. `PersistQueryClientProvider` — TanStack Query with MMKV-backed offline persistence.
5. `NavigationContainer` — React Navigation with deep linking.
6. `RootNavigator` — App routing.

Custom fonts (Noto Serif for headlines, Manrope for body/UI) are loaded via `useFonts` hook. The app returns null during font loading to prevent FOUT.

### Navigation Structure

**`RootNavigator.tsx`** — Root stack navigator containing:
- Tab-based screens (via `MainTabNavigator`)
- Modal/full-screen screens pushed on top

**`MainTabNavigator.tsx`** — Bottom tab navigator with custom tab bar (`CustomTabBar`).

**`linkingConfig.ts`** — Deep linking URL scheme configuration.

### Screen-by-Screen Breakdown

| Screen | File | Purpose |
|---|---|---|
| **RequestScreen** | `RequestScreen.tsx` (21KB) | Main input screen. Category chips for quick selection, natural-language text input, location picker with map modal, submit button. |
| **AgentThinkingScreen** | `AgentThinkingScreen.tsx` (17KB) | Animated visualization showing each agent's name and status as the pipeline processes. Includes a "Use Demo" panic button for mock fallback. 4,400ms animation timeline. |
| **ResultsScreen** | `ResultsScreen.tsx` (9KB) | Displays top-3 ranked providers as cards with scores, reasoning, and a trace accordion. |
| **ProviderDetailScreen** | `ProviderDetailScreen.tsx` (18KB) | Full provider profile: specializations, pricing, reviews, distance, map preview. |
| **ProvidersMapScreen** | `ProvidersMapScreen.tsx` (19KB) / `.web.tsx` (22KB) | Interactive map showing provider locations. Platform-specific: native uses `react-native-maps`, web uses a different implementation. |
| **BookingConfirmScreen** | `BookingConfirmScreen.tsx` (15KB) | Booking receipt with confirmation ID, slot, provider details. |
| **BookingDetailScreen** | `BookingDetailScreen.tsx` (23KB) | Post-booking tracking: provider contact info, status updates, dispute option. |
| **BookingsListScreen** | `BookingsListScreen.tsx` (6KB) | History of all bookings. |
| **FollowUpDashboardScreen** | `FollowUpDashboardScreen.tsx` (6KB) | Reminder management and follow-up tracking. |
| **DisputeScreen** | `DisputeScreen.tsx` (12KB) | Issue reporting flow for problematic bookings. |

### API Client & Mock Mode

**`src/api/orchestrator.ts`** is the single entry-point for all backend communication:

- **Real mode** (`EXPO_PUBLIC_USE_MOCK=false`): POSTs to `{BASE_URL}/orchestrate` with a 60-second `AbortController` timeout. Handles HTTP errors, timeouts, and network failures separately.
- **Mock mode** (`EXPO_PUBLIC_USE_MOCK=true` OR runtime override): Waits 4,000ms (synchronized with the AgentThinkingScreen animation), then returns a hardcoded response from `mockResponse.ts`.
- **Session override**: `setUseMockOverride(true)` can be called at runtime (e.g., from the "Use Demo" panic button on AgentThinkingScreen) to switch to mock mode without restarting the app.

**`src/api/mockResponse.ts`** contains a complete hardcoded `OrchestrateResponse` for demo purposes.

### State Management

**Zustand stores (`src/store/`):**

| Store | Purpose |
|---|---|
| `orchestratorStore.ts` | Manages the current orchestration state: request, response, loading, error. Includes `enableMockMode()` method. |
| `useAuthStore.ts` | Google Sign-In authentication state with session management. |
| `themeStore.ts` | Dark/light theme preferences. |

**TanStack React Query** handles server state with MMKV-backed persistence. The `QueryClient` is configured with:
- 3 retries on failure.
- 5-minute stale time.
- 30-minute garbage collection time.
- Structural sharing enabled for performance.

### Key Components

| Component | Purpose |
|---|---|
| `AgentStepCard` | Single agent step visualization (name, status, timing) |
| `CategoryChip` | Service category quick-select button |
| `ProviderCard` | Provider summary card with score bar |
| `ScoreBar` | Visual score indicator (0.0–1.0) |
| `TraceAccordion` | Collapsible view of agent reasoning trace |
| `PrimaryButton` | Styled action button with variants |
| `SkeletonCard` | Loading placeholder |
| `LocationMapPickerModal` | Full-screen map for location selection |
| `LocationPickerSheet` | Bottom sheet for area selection |
| `OfflineBanner` | Network status indicator |
| `SoftAuthGateModal` | Authentication prompt modal |
| `SessionExpiredModal` | Session expiry notification |
| `EmptyState` | No-data placeholder |
| `ErrorBoundary` | React error boundary with Sentry |
| `CustomTabBar` | Custom bottom navigation bar |
| `ExecutionLogView` | Raw execution log display |
| `LocationDeniedState` | Location permission denied UI |
| `MapOfflineFallback` | Offline map placeholder |

---

## End-to-End Request Lifecycle

Here's exactly what happens when a user submits a request:

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. USER types "Mujhe plumber chahiye Clifton mein"                 │
│     on RequestScreen and taps "Find Service"                        │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. orchestratorStore dispatches orchestrate() from api/            │
│     orchestrator.ts with OrchestrateRequest payload                 │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. Navigation pushes AgentThinkingScreen — animated pipeline       │
│     visualization starts (4,400ms animation timeline)               │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. HTTP POST hits FastAPI /orchestrate endpoint                    │
│     → Pydantic validates OrchestrateRequest                         │
│     → Calls runtime.run_workflow(req)                               │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. run_workflow() chains 5 agents sequentially:                    │
│                                                                     │
│     5a. IntentParser → ServiceIntent                                │
│         {service_type: "plumber", location: "Clifton",              │
│          time_window: "as soon as possible",                        │
│          language_detected: "roman_urdu"}                           │
│                                                                     │
│     5b. ProviderFinder → calls find_providers() tool                │
│         → Filters MOCK_PROVIDERS by category="plumber"              │
│         → Computes Haversine distance from user to each             │
│         → Returns 6 candidates sorted by distance                   │
│                                                                     │
│     5c. Ranker → scores with 40% distance + 30% rating + 30% avail │
│         → Returns top 3 with scores and reasoning                   │
│         → Sets recommended_id to highest scorer                     │
│                                                                     │
│     5d. Booking → calls simulate_booking() tool                     │
│         → Generates BK-20260521-0001                                │
│         → Returns BookingResult                                     │
│                                                                     │
│     5e. FollowUp → calls schedule_reminder() tool                   │
│         → Schedules reminder 1 hour before slot                     │
│         → Returns ReminderResult                                    │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  6. OrchestratorResponse assembled with all fields + trace          │
│     → HTTP 200 JSON returned to frontend                            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│  7. Frontend receives response                                      │
│     → orchestratorStore updates state                               │
│     → Navigation pushes ResultsScreen                               │
│     → User sees ranked providers, can tap to view details,          │
│       see booking confirmation, and check follow-up dashboard       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

### Why a Deterministic Chain Instead of Free Handoffs?

The original plan specified an Orchestrator agent with `handoffs` to specialists. The final implementation uses a **deterministic chain** (`Runner.run()` per step) instead. The `orchestrator.py` module documents why:

1. **Typed data flow** — Each agent's `output_type` is a Pydantic model. Sequential `Runner.run()` calls let us pass `intent_res.final_output` (a typed `ServiceIntent`) directly to the next prompt builder. Free handoffs would require re-parsing free-form text.
2. **Same trace evidence** — The `trace()` context manager groups all 5 runs under one workflow span. The OpenAI tracing dashboard shows the same multi-agent tree structure.
3. **Reliability** — For a fixed pipeline (intent → discovery → rank → book → remind), a deterministic chain is far more predictable than letting the LLM decide handoff order.

### Why Karachi Instead of Islamabad?

The original plan targeted Islamabad sectors (G-13, F-10, etc.). The implementation pivoted to **Karachi** with 20 neighborhoods (DHA, Clifton, Gulshan, PECHS, etc.) and 7 service categories to better represent Pakistan's largest city and informal economy.

### Why Gemini Compatibility?

The `configure_gemini()` function allows the system to use Google's Gemini models via the OpenAI-compatible API endpoint. This aligns with the hackathon's Antigravity requirement while keeping the OpenAI Agents SDK as the runtime. The model names and base URL are fully configurable via environment variables.

### Why Mock Data Instead of Real APIs?

All tools are **pure functions** with no external I/O. This makes the demo:
- **Deterministic** — Same input → same output (modulo LLM variation).
- **Offline-runnable** — No Maps API key, no database, no third-party dependencies.
- **Free to test** — No API quota consumed beyond LLM calls.
- **Fast** — No network latency from external services.

### Why Two Model Tiers?

- `MODEL_NAME` (gpt-4.1) is used for **IntentParser** (multilingual understanding) and **Ranker** (complex scoring logic) — tasks that benefit from stronger reasoning.
- `SMALL_MODEL_NAME` (gpt-4.1-mini) is used for **ProviderFinder**, **Booking**, and **FollowUp** — tasks that are essentially "call this tool with these arguments" and don't need heavy reasoning. This keeps costs predictable.

### Why the 4,000ms Mock Delay?

The `AgentThinkingScreen` has a 4,400ms animation timeline showing each agent activating in sequence. The mock mode's 4,000ms delay ensures the mock response arrives **just before** the animation completes, creating a seamless transition to the results screen. Without this delay, the mock response would arrive instantly and the animation would be cut short.
