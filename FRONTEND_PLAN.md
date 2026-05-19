# AI Service Orchestrator — Frontend Revamp Plan
## Hackathon: Google Antigravity #AISeekho2026 | Challenge 2

> **One rule above all others:** This is an agentic AI demo. Every screen must make the AI's reasoning *visible*. If a user can complete an action without seeing the AI think, plan, and decide — you've built a booking app, not an agentic system. Judges will fail you for that.

---

## 1. Strategic Context

### What You're Revamping

Your existing Karvaan codebase is an Expo / React Native app built for venue discovery. The navigation, auth, component patterns, and Supabase integration are all reusable. What changes is the **domain** (informal services, not venues) and the **core value prop** (AI orchestration, not editorial curation).

### What the Backend Gives You

The FastAPI backend (`POST /orchestrate`) returns a single structured response:
- `intent` — parsed service type, location, time, language detected
- `top_providers` — ranked list with score and reasoning per provider
- `recommended` — the winning provider
- `booking` — confirmation ID, slot, message
- `followup` — reminder schedule
- `trace` — step-by-step agent reasoning (IntentParser → ProviderFinder → Ranker → Booking → FollowUp)

**The `trace` field is your UI superpower.** Every screen that shows AI output must animate through the trace steps. This is what wins 45% of your score (Antigravity + Agentic Reasoning criteria).

### Scoring Priorities for Frontend

| Criterion | Weight | Frontend's Role |
|---|---|---|
| Antigravity Integration | 20% | Show trace logs, agent names, reasoning steps visually |
| Matching & Decision Quality | 25% | Render provider ranking with score bars + reasoning text |
| Multilingual Robustness | 15% | Accept Urdu / Roman Urdu / English input gracefully |
| Scheduling, Pricing, Workflow | 15% | Full booking flow with confirmation receipt |
| Dispute Handling & Reliability | 15% | Cancellation, dispute, fallback screens |
| Innovation & UX | 10% | Polished, fast, demo-worthy |

---

## 2. App Architecture

### Navigation Structure

```
RootNavigator
├── OnboardingScreen          (first launch only)
├── AuthScreen + OtpVerifyScreen
└── MainTabNavigator (4 tabs)
    ├── Tab: Request           ← PRIMARY TAB (home)
    ├── Tab: My Bookings
    ├── Tab: Providers
    └── Tab: Active Operations
```

### Screen Inventory

| Screen | Route Name | Priority |
|---|---|---|
| RequestScreen | `Request` | P0 — core loop |
| AgentThinkingScreen | `AgentThinking` | P0 — agentic demo centerpiece |
| ResultsScreen | `Results` | P0 |
| ProviderDetailScreen | `ProviderDetail` | P0 |
| BookingConfirmScreen | `BookingConfirm` | P0 |
| BookingsListScreen | `MyBookings` | P1 |
| BookingDetailScreen | `BookingDetail` | P1 |
| DisputeScreen | `Dispute` | P1 |
| ProvidersMapScreen | `ProvidersMap` | P1 |
| FollowUpDashboardScreen | `FollowUps` | P2 |
| OnboardingScreen | `Onboarding` | P0 (first launch) |

---

## 3. Screen-by-Screen Specifications

### SCREEN 1: RequestScreen (Tab: Request)

**Purpose:** Entry point. User types or speaks their service request.

**Layout (top to bottom):**
1. Header: "What do you need?" (large, bold)
2. Language chip row: `EN` | `اردو` | `Roman` — auto-detected, tappable to force
3. **Input Area** — large multiline TextInput, placeholder rotates:
   - "AC bilkul kaam nahi kar raha..."
   - "Need a plumber in F-10 ASAP"
   - "Kal subah electrician chahiye G-13 mein"
4. Voice input button (mic icon, launches native speech-to-text)
5. Location pill: auto-detected sector ("G-13 · Islamabad") with edit pencil
6. "Find Service" CTA button — full width, primary color
7. Below button: Recent requests list (last 3, stored locally)

**Behaviour:**
- On submit → navigate to `AgentThinking` with `{ userPrompt, userLocation, currentTime }`
- Validate: prompt must be > 5 chars; location must be set
- Language detection happens client-side (simple heuristic: detect Arabic script → Urdu, else check for common Roman Urdu words, else English). Display the detected language chip immediately as user types.

**Reuse from Karvaan:** TextInput styling, location hook (`useUserLocation`), auth guard wrapper.

---

### SCREEN 2: AgentThinkingScreen ← THE MOST IMPORTANT SCREEN

**Purpose:** While the backend processes the request, show the AI's reasoning unfolding in real time. This screen alone can win or lose the "Agentic Reasoning" criterion (20% of score).

**This screen must be animated and dramatic. It is a demo screen.**

**Layout:**
1. Top: "AI is working on your request..." subtitle
2. User's prompt shown in a speech-bubble card
3. **Agent Trace Timeline** — vertical stepper, animates in step by step:
   ```
   ● IntentParser          ← animates in first, ~800ms after load
     "Detected: AC Repair | Location: G-13 | Time: Tomorrow 10AM | Roman Urdu"
   
   ● ProviderFinder        ← animates in ~1.5s
     "Searching 47 providers in G-13 and nearby sectors..."
   
   ● Ranker               ← animates in ~2.5s
     "Scoring by distance, rating, availability, specialization..."
   
   ● Booking              ← animates in ~3.5s
     "Reserving slot with top provider..."
   
   ● FollowUp             ← animates in ~4s
     "Scheduling reminder 1 hour before appointment"
   ```
4. Animated pulsing dots between steps (loading indicator)
5. Each step card fades in with a 200ms ease-in
6. When API response arrives AND all 5 steps have animated → auto-navigate to Results (no button needed — seamless)

**Implementation note:** 
- Fire the real API call immediately on mount
- The step animation is purely cosmetic / paced to the trace data
- If API responds faster than animation completes → wait for animation
- If API fails → show error card with retry button in the timeline

**Reuse from Karvaan:** Nothing directly — build fresh. This is new UX.

---

### SCREEN 3: ResultsScreen

**Purpose:** Show ranked providers and recommended pick with full reasoning.

**Layout:**
1. **Intent Summary Card** (top, collapsible):
   - Service: AC Repair
   - Location: G-13
   - Time: Tomorrow 10:00 AM
   - Language: Roman Urdu (auto-detected)
   - Confidence badge: HIGH / MEDIUM / LOW
   
2. **"AI Recommends" Hero Card** (the `recommended` provider):
   - Provider name + avatar initial
   - Category badge
   - Distance, rating stars, availability chip
   - Score bar: 93% match
   - Reasoning text (verbatim from API): "Closest available provider with high AC repair specialization and 4.7 rating"
   - "Book Now" button → BookingConfirmScreen
   - "See on Map" link

3. Section header: "Other Options (Top 3)"

4. **Provider Cards** (for each of `top_providers`):
   - Rank number badge
   - Name, category, distance, rating
   - Score bar (proportional)
   - 1-line reasoning
   - "Choose" button

5. **"Why this ranking?" expandable accordion**:
   - Shows the Ranker agent's full reasoning
   - Factors table: Distance (40%), Rating (30%), Availability (30%)
   - This is key for the "Matching & Decision Quality" criterion

6. Bottom: "Request different service" ghost button → back to RequestScreen

**Reuse from Karvaan:** Card component patterns, rating display, VenueCard layout as base.

---

### SCREEN 4: ProviderDetailScreen

**Purpose:** Full profile of a single provider before booking.

**Layout:**
1. Provider avatar (initial-based), name, category badge
2. Stats row: Rating | Jobs Done | On-Time % | Response Time
3. Specializations chips: e.g. "AC Repair", "AC Installation", "Split AC"
4. Reviews section (mock 2-3 reviews from mock data)
5. Pricing section:
   - Base visit fee
   - Per-hour rate
   - Urgency multiplier (if applicable)
   - Total estimate range: "PKR 1,200 – 1,800"
6. Availability calendar (simplified: next 3 days, morning/afternoon/evening slots)
7. "Book This Provider" sticky bottom button

---

### SCREEN 5: BookingConfirmScreen

**Purpose:** Simulate booking execution. This is the "Action Simulation" criterion (15% of score).

**Layout:**
1. Section: "Confirming your booking..."
2. **Execution Log** — animates line by line (like a terminal):
   ```
   ✓ Slot reserved: 2026-05-19 10:00 AM
   ✓ Booking ID generated: BK-20260519-0001
   ✓ Provider notified
   ✓ Calendar updated
   ✓ SMS confirmation queued
   ✓ Reminder scheduled for 09:00 AM
   ```
3. **Booking Receipt Card**:
   - Booking ID (prominent, monospace font)
   - Provider name + contact (simulated)
   - Service type
   - Date + time
   - Address: G-13, Islamabad
   - Estimated cost range
4. Action row: "Share Receipt" | "Add to Calendar" (simulated) | "Cancel Booking"
5. "Done" → navigates to BookingDetail

**Reuse from Karvaan:** Nothing directly. Build the execution log animation as a new component `ExecutionLogView`.

---

### SCREEN 6: BookingDetailScreen (in My Bookings tab)

**Purpose:** Active booking tracker. Simulates the service-quality loop.

**Layout:**
1. Status banner: CONFIRMED → EN ROUTE → IN PROGRESS → COMPLETED
2. Provider card (compact)
3. Timeline: Confirmed / Reminder Sent / Provider En Route / Service Completed / Feedback Requested
4. "Report Issue" button → DisputeScreen
5. "Rate Service" button (shows after status = COMPLETED)
6. Feedback form (1-5 stars, optional text)

---

### SCREEN 7: DisputeScreen

**Purpose:** Dispute/escalation simulation. Required for "Dispute Handling" criterion (15% of score).

**Layout:**
1. Issue type selector (chips): No-show | Late Arrival | Quality Issue | Price Dispute | Other
2. Description text area
3. Evidence note: "You can attach photos (simulated)"
4. Submit → shows resolution flow:
   - "Agent reviewing your case..."
   - Resolution card: "We have issued a refund of PKR 500 and flagged the provider."
5. Escalation option: "Talk to human support" (simulated)

---

### SCREEN 8: ProvidersMapScreen

**Purpose:** Map view of nearby providers filtered by service category.

**Layout:**
1. Map (use react-native-maps or Mapbox if already installed)
2. Filter chip row: All | AC Technician | Plumber | Electrician | etc.
3. Provider pins on map (clustered if many)
4. Bottom sheet: scrollable provider cards matching map view
5. Tap pin → provider card expands

---

### SCREEN 9: FollowUpDashboardScreen (Tab: Active Operations)

**Purpose:** A global dashboard showing automated reminders, status updates, and service completions across all bookings to highlight the AI's agentic workflow.

**Layout:**
1. Header: "Active Operations"
2. Agentic Timeline: Scrollable list of system-wide operations (reminders, pings to providers, completion checks).
3. **Animations:** Use fluid, non-blocking Reanimated 3 transitions (e.g., list items sliding in, status dots pulsing) for the timeline.

---

## 4. Core Shared Components (Build These First)

### `AgentStepCard`
```
Props: { stepName, summary, status: 'pending' | 'active' | 'done', delay }
```
Used in AgentThinkingScreen. Animated entrance, pulsing dot when active.

### `ProviderCard`
```
Props: { provider, rank?, onBook, onDetail, showReasoning? }
```
Score bar, reasoning text, all provider metadata.

### `ScoreBar`
```
Props: { score: number (0–1), label? }
```
Horizontal bar, animated fill on mount, color: green > 0.8, amber > 0.6, red else.

### `ExecutionLogView`
```
Props: { steps: string[], onComplete? }
```
Animates each step appearing line by line, 400ms apart, with ✓ prefix.

### `LanguageChip`
```
Props: { detected: 'en' | 'ur' | 'roman_ur', onOverride }
```

### `BookingReceiptCard`
```
Props: { booking: BookingResult }
```
Shareable card design. Clean, minimal, PKR styling.

### `TraceAccordion`
```
Props: { trace: TraceStep[] }
```
Expandable section showing full agent trace. Used on Results screen "Why this ranking?" section.

---

## 5. API Integration Layer

Create `src/api/orchestrator.ts`:

```typescript
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface OrchestrateRequest {
  user_prompt: string;
  user_location: { sector: string; city: string; lat: number; lng: number };
  current_time?: string; // ISO8601
}

export interface OrchestrateResponse {
  intent: Intent;
  top_providers: Provider[];
  recommended: Provider;
  booking: BookingResult;
  followup: FollowUpResult;
  trace: TraceResponse;
}

export async function orchestrate(req: OrchestrateRequest): Promise<OrchestrateResponse> {
  const res = await fetch(`${BASE_URL}/orchestrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
```

All types should mirror the backend schemas exactly (see `app/schemas.py` in the backend plan).

---

## 6. State Management

Use **Zustand** (lightweight, already common in RN projects). One store:

```typescript
// src/store/orchestratorStore.ts
interface OrchestratorStore {
  request: OrchestrateRequest | null;
  response: OrchestrateResponse | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  bookings: BookingResult[];          // persisted locally (MMKV)
  
  submitRequest: (req: OrchestrateRequest) => Promise<void>;
  selectProvider: (provider: Provider) => void;
  addBooking: (booking: BookingResult) => void;
  clearCurrent: () => void;
}
```

---

## 7. Local Persistence

Use **MMKV** (fast, RN-native key-value store):
- `bookings` — array of BookingResult, persisted between sessions
- `recentRequests` — last 3 user prompts
- `userLocation` — last known location (sector, lat, lng)
- `onboardingComplete` — boolean

---

## 8. Milestone Plan (Hackathon Timeline)

Given the May 20 deadline, prioritize ruthlessly:

### Phase A — Core Loop (Days 1–2): Must Ship
1. Strip Karvaan navigation down to the 4-tab structure
2. Build RequestScreen
3. Build AgentThinkingScreen (animation engine + API call)
4. Build ResultsScreen
5. Build BookingConfirmScreen
6. Wire `orchestrate()` API call end-to-end
7. Test with all 3 language inputs (EN, Urdu, Roman Urdu)

### Phase B — Depth (Day 3): Should Ship
8. ProviderDetailScreen
9. BookingDetailScreen (My Bookings tab)
10. DisputeScreen
11. ProvidersMapScreen (basic, no clustering)

### Phase C — Polish (Day 4): Nice to Have
12. Voice input
13. Onboarding screen
14. Trace accordion on Results
15. Share receipt functionality

### Skip Entirely
- Real auth (use the existing bypass or a simple name-entry screen)
- Real payments
- Push notifications (simulate in UI only)

---

## 9. Demo Video Checklist (3–5 min)

The demo video is evaluated. Plan it now:

1. **[0:00–0:30]** Show the problem: informal economy, WhatsApp chaos
2. **[0:30–1:00]** Type a Roman Urdu prompt → AgentThinking screen animates
3. **[1:00–1:45]** Results screen — show score bars, reasoning, ranking rationale
4. **[1:45–2:15]** Book the top provider → execution log animates → receipt appears
5. **[2:15–2:45]** Show the booking in My Bookings tab → status timeline
6. **[2:45–3:15]** Trigger a dispute → resolution simulation
7. **[3:15–3:45]** Show trace logs (from logs/*.jsonl or the backend response)
8. **[3:45–4:00]** Architecture slide (optional)

Record on a real device (not simulator) for best impressions.
