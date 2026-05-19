# INTEGRATION PLAN — Frontend ↔ Backend
## AI Service Orchestrator | Google Antigravity #AISeekho2026
### Status: UI Complete + Backend Complete → Connect & Make Functional

---

## CRITICAL FACTS BEFORE YOU START

### Backend Reality Check
Your friend's backend uses **OpenAI Agents SDK** but you will swap to **Gemini API key** using OpenAI-compatible SDK. This means:
- The `/orchestrate` endpoint shape does NOT change
- The `api-contract.md` response structure stays identical  
- Only the backend's `.env` changes (`OPENAI_API_KEY` → Gemini key with `base_url` override)
- Frontend touches ZERO backend files

### What "Integration" Means Here
The UI is built. The backend is built. They don't talk to each other yet because:
1. The API types on the frontend may not exactly match what the backend actually returns
2. The `orchestrate()` function may be calling wrong URL or wrong field names  
3. The AgentThinkingScreen may not be wired to the real API call
4. The mock response fields may be wrong format (score as 93 instead of 0.93, etc.)
5. CORS is not configured on the backend
6. Network reachability from phone to laptop is not tested

### Rule: One Ticket at a Time
Run the acceptance criteria on your device after each ticket. Do not stack tickets. If criteria fail, fix before moving on. Stacking failures compounds debugging time.

---

## BACKEND SETUP (Do This First — Not a Ticket, Pre-requisite)

Before any integration ticket, your friend must do this on the backend machine:

```bash
# 1. In backend/.env, replace OpenAI key with Gemini:
OPENAI_API_KEY=<your_gemini_api_key>
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

# 2. In backend/app/runtime.py or wherever models are configured, 
#    change model name to Gemini:
MODEL_NAME=gemini-2.0-flash   # or gemini-1.5-pro

# 3. Start backend with host exposed to network:
uvicorn app.api:app --reload --host 0.0.0.0 --port 8000

# 4. Find your machine's local IP:
# Windows: ipconfig | grep IPv4
# Mac/Linux: ifconfig | grep "inet "

# 5. Test from a browser on phone (same WiFi):
# Open: http://<YOUR_IP>:8000/docs
# If you see FastAPI swagger UI → backend reachable ✓
```

**Your friend's job done. Everything below is your (frontend) job.**

---

## TICKET INDEX

| # | Ticket | Touches | Est. Time | Risk |
|---|---|---|---|---|
| T-01 | Backend response audit + type sync | api.ts, mockResponse.ts | 45 min | HIGH |
| T-02 | Environment config + CORS fix instruction | .env.local, orchestrator.ts | 30 min | HIGH |
| T-03 | Wire AgentThinkingScreen to real API | AgentThinkingScreen.tsx | 45 min | HIGH |
| T-04 | Fix mock response to exactly mirror backend | mockResponse.ts | 30 min | MEDIUM |
| T-05 | Validate ResultsScreen renders real data | ResultsScreen.tsx | 45 min | MEDIUM |
| T-06 | Validate BookingConfirmScreen with real booking data | BookingConfirmScreen.tsx | 30 min | MEDIUM |
| T-07 | Wire DisputeScreen confirmation ID from real booking | DisputeScreen.tsx | 20 min | LOW |
| T-08 | Wire BookingDetail status timeline | BookingDetailScreen.tsx | 30 min | LOW |
| T-09 | Gemini model swap verification (backend) | backend/.env only | 20 min | MEDIUM |
| T-10 | End-to-end smoke test — all 3 languages | All screens | 45 min | LOW |
| T-11 | Demo safety net — mock fallback verification | orchestrator.ts | 20 min | LOW |
| T-12 | Network resilience — offline + slow API | AgentThinkingScreen.tsx | 30 min | LOW |

**Total: ~6.5 hours**

---

## T-01 — Backend Response Audit + Type Sync

**Why this is first:** If the TypeScript types don't match what the backend actually returns, every subsequent ticket is guesswork. Fix the contract before wiring anything.

**What to do:**

### Step 1: Get the actual backend response
With the backend running, run this curl from your laptop terminal:
```bash
curl -s -X POST http://localhost:8000/orchestrate \
  -H 'content-type: application/json' \
  -d '{
    "user_prompt": "I need an AC technician in G-13 tomorrow morning",
    "user_location": {"sector": "G-13", "city": "Islamabad", "lat": 33.65, "lng": 72.99}
  }' | python3 -m json.tool
```

Copy the full JSON output. Save it as `backend/sample_response.json` for reference.

### Step 2: Compare against `src/types/api.ts` field by field

Check these specific known mismatch risks:

```
RISK 1 — score field:
  Backend returns: score as 0-1 float (e.g. 0.93) per the plan
  Frontend renders: as percentage "93%"
  → Score should come in as 0.93, frontend multiplies by 100 for display
  → If backend actually returns 93 (integer), update mock + display logic

RISK 2 — confirmation_id vs confirmationId:
  Backend (Python/FastAPI): uses snake_case → confirmation_id
  Frontend TypeScript: should also use confirmation_id
  → If frontend has confirmationId (camelCase), this is a bug. Fix api.ts.

RISK 3 — trace.steps format:
  Backend returns: [{"agent": "IntentParser", "summary": "..."}]
  Frontend expects: same shape
  → Verify steps is an array, not nested object

RISK 4 — top_providers vs topProviders:
  FastAPI with Pydantic v2 by default may return camelCase via alias
  Check if backend has model_config = ConfigDict(populate_by_name=True)
  → If backend returns camelCase, add a response transformer in orchestrator.ts

RISK 5 — language_detected values:
  Backend returns: "roman_urdu" | "urdu" | "english" 
  Frontend expects: same
  → Verify exact string values match

RISK 6 — followup.reminder_at:
  Backend may return UTC ISO string
  Frontend displays it as local time
  → Add timezone display logic in BookingReceiptCard
```

### Step 3: Update `src/types/api.ts` to match actual backend output

If any field names differ from what's in the current `api.ts`, update them. The backend is truth. The frontend adapts.

If backend returns snake_case throughout (which FastAPI does by default), ensure `api.ts` uses snake_case for all interface fields:
```typescript
// CORRECT — matches FastAPI/Python defaults:
interface BookingResult {
  provider: string;
  slot: string;
  confirmation_id: string;  // snake_case
  message: string;
}

// WRONG — this will silently be undefined:
interface BookingResult {
  provider: string;
  slot: string;
  confirmationId: string;  // camelCase — won't match backend
  message: string;
}
```

### Step 4: If backend returns camelCase (Pydantic alias configured)

Add this transformer at the end of `orchestrator.ts` `orchestrate()` function — only if backend returns camelCase:
```typescript
// Only add this if backend confirmed returning camelCase:
function normalizeResponse(raw: any): OrchestrateResponse {
  return {
    ...raw,
    top_providers: raw.topProviders ?? raw.top_providers,
    // add other mappings as needed
  };
}
```

### Acceptance Criteria:
- [ ] `curl` to backend returns valid JSON with all expected top-level keys: `intent`, `top_providers`, `recommended`, `booking`, `followup`, `trace`
- [ ] `src/types/api.ts` field names exactly match the curl output (case-sensitive)
- [ ] `booking.confirmation_id` (or whatever the exact key is) matches between api.ts and curl output
- [ ] `top_providers[0].score` is a float between 0 and 1 (not 0–100)
- [ ] `trace.steps` is an array with at least 1 entry containing `agent` and `summary` keys
- [ ] No TypeScript errors in `api.ts` after your edits (run `npx tsc --noEmit`)

---

## T-02 — Environment Config + CORS

**Why second:** If the phone can't reach the backend, nothing works. Eliminate this before wiring UI.

### Frontend: `.env.local`

```bash
# .env.local in your Expo project root
EXPO_PUBLIC_API_URL=http://192.168.X.X:8000   # ← YOUR ACTUAL LAN IP
EXPO_PUBLIC_USE_MOCK=false
```

**Finding your LAN IP:**
- Windows: open Command Prompt → `ipconfig` → look for "IPv4 Address" under your WiFi adapter
- Mac: `ifconfig en0 | grep inet`
- The IP starts with 192.168. or 10.0. — NOT 127.0.0.1

**Both phone and laptop must be on the same WiFi network.**

### Backend: CORS fix (tell your friend)

Your friend needs to add CORS middleware to `backend/app/api.py`. Without this, the phone will get CORS errors:

```python
# In backend/app/api.py — add this BEFORE the route definitions:
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # OK for hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend: Verify `orchestrator.ts` reads env correctly

Open `src/api/orchestrator.ts` and confirm:
```typescript
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
```

If it's hardcoded to `localhost` anywhere, change it to use the env var.

### Test: Reachability check from phone

Add this temporary test button to `RequestScreen.tsx` (remove after this ticket):
```typescript
// Temporary — delete after T-02 passes
<TouchableOpacity onPress={async () => {
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/docs`);
    Alert.alert('Connected!', `Status: ${res.status}`);
  } catch (e) {
    Alert.alert('FAILED', String(e));
  }
}}>
  <Text>Test Backend Connection</Text>
</TouchableOpacity>
```

### Acceptance Criteria:
- [ ] Phone shows "Connected!" alert with status 200 when tapping the test button
- [ ] `EXPO_PUBLIC_API_URL` is set to LAN IP (not localhost) in `.env.local`
- [ ] Backend has CORS middleware (your friend confirms, or you get no CORS error in Metro logs)
- [ ] Remove the test button before T-03
- [ ] `EXPO_PUBLIC_USE_MOCK` is set to `false` for all integration tickets (except T-11)

---

## T-03 — Wire AgentThinkingScreen to Real API

**Why third:** This is the most critical integration point. The animation + API dual-condition logic must work perfectly.

**What to verify/fix in `src/screens/AgentThinkingScreen.tsx`:**

### Check 1: API call fires on mount
```typescript
// This MUST be in a useEffect with empty deps []:
useEffect(() => {
  const req: OrchestrateRequest = {
    user_prompt: route.params.userPrompt,
    user_location: route.params.userLocation,
    current_time: route.params.currentTime,
  };
  
  orchestrate(req)
    .then((response) => {
      apiResponseRef.current = response;
      checkAndNavigate();
    })
    .catch((error) => {
      setApiError(error.message ?? 'Something went wrong');
    });

  const animTimer = setTimeout(() => {
    animationDoneRef.current = true;
    checkAndNavigate();
  }, 4400);

  return () => clearTimeout(animTimer);
}, []); // ← empty array — fires once on mount only
```

### Check 2: Dual-condition navigation
```typescript
// checkAndNavigate must check BOTH conditions:
const checkAndNavigate = () => {
  if (apiResponseRef.current && animationDoneRef.current) {
    navigation.replace('Results', { response: apiResponseRef.current });
  }
};
```

**Use refs (useRef), NOT useState for these flags.** Using useState causes re-render races. Using refs is safe because checkAndNavigate reads the current value synchronously.

### Check 3: navigation.replace not navigate
```typescript
// MUST be replace — not navigate:
navigation.replace('Results', { response: apiResponseRef.current });
// replace() removes AgentThinking from stack so back button goes to Request, not AgentThinking
```

### Check 4: Trace summaries populate step cards
After the API responds, the 5 step cards must update their summary text from `response.trace.steps`:
```typescript
// After apiResponseRef.current is set, update step summaries:
const steps = response.trace.steps; // array of {agent, summary}
// Map to your step state:
setStepSummaries([
  steps.find(s => s.agent === 'IntentParser')?.summary ?? 'Parsing your request...',
  steps.find(s => s.agent === 'ProviderFinder')?.summary ?? 'Finding providers...',
  steps.find(s => s.agent === 'Ranker')?.summary ?? 'Ranking matches...',
  steps.find(s => s.agent === 'Booking')?.summary ?? 'Preparing booking...',
  steps.find(s => s.agent === 'FollowUp')?.summary ?? 'Scheduling follow-up...',
]);
```

### Check 5: Error state shows retry
```typescript
// If orchestrate() throws, show error — NOT a crash:
if (apiError) {
  return (
    <View style={styles.errorCard}>
      <Text style={styles.errorTitle}>⚠ Connection Failed</Text>
      <Text style={styles.errorMessage}>{apiError}</Text>
      <TouchableOpacity onPress={() => {
        setApiError(null);
        // re-fire the API call
      }}>
        <Text>Retry</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {
        // Enable mock for this session
        setUseMockOverride(true);
      }}>
        <Text>Use demo data instead</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Acceptance Criteria:
- [ ] Submitting a prompt from RequestScreen navigates to AgentThinkingScreen
- [ ] All 5 agent steps animate in sequence (600ms, 1400ms, 2400ms, 3200ms, 3800ms)
- [ ] After ~5 seconds, screen automatically navigates to ResultsScreen (no button press needed)
- [ ] ResultsScreen receives a real `response` object (not null/undefined)
- [ ] If you kill the backend mid-request, an error card appears with a Retry button (no crash)
- [ ] Metro bundler logs show the API call being made (check for fetch logs)
- [ ] `navigation.replace` is used (verified by: pressing back on ResultsScreen goes to RequestScreen, not AgentThinkingScreen)

---

## T-04 — Fix Mock Response to Match Real Backend

**Why:** Your mock must be byte-for-byte compatible with the real response. If mock passes but real fails, you have a type mismatch. Run this in parallel with or right after T-01.

**In `src/api/mockResponse.ts`**, verify and fix every field:

```typescript
export function getMockResponse(req: OrchestrateRequest): Promise<OrchestrateResponse> {
  // Simulate realistic delay so AgentThinking animation plays fully:
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        intent: {
          service_type: 'AC Technician',
          location: 'G-13',
          time_window: 'tomorrow morning',
          language_detected: 'roman_urdu',   // ← must be exact string backend uses
        },
        top_providers: [
          {
            name: 'Ali AC Services',
            category: 'ac_technician',       // ← snake_case, matches backend
            location: 'G-13',
            distance_km: 2.1,                // ← float, NOT integer
            rating: 4.7,
            availability: 'tomorrow 10:00 AM',
            score: 0.93,                     // ← 0-1 float, NOT 93
            reasoning: 'Closest available provider with high rating and AC specialization',
          },
          {
            name: 'CoolBreeze Technicians',
            category: 'ac_technician',
            location: 'F-11',
            distance_km: 4.3,
            rating: 4.5,
            availability: 'tomorrow 11:00 AM',
            score: 0.78,
            reasoning: 'Slightly farther but strong review recency and low cancellation rate',
          },
          {
            name: 'QuickFix AC',
            category: 'ac_technician',
            location: 'G-9',
            distance_km: 6.1,
            rating: 4.2,
            availability: 'tomorrow 2:00 PM',
            score: 0.61,
            reasoning: 'Available but lower rating and afternoon slot only',
          },
        ],
        recommended: {
          name: 'Ali AC Services',
          category: 'ac_technician',
          location: 'G-13',
          distance_km: 2.1,
          rating: 4.7,
          availability: 'tomorrow 10:00 AM',
          score: 0.93,
          reasoning: 'Closest available provider with high rating and AC specialization',
        },
        booking: {
          provider: 'Ali AC Services',
          slot: '2026-05-20T10:00:00+05:00',
          confirmation_id: 'BK-20260520-0001',  // ← snake_case
          message: 'Slot booked: 10:00 AM. Confirmation sent.',
        },
        followup: {
          reminder_at: '2026-05-20T09:00:00+05:00',  // ← snake_case
          channel: 'sms_simulated',
          message: 'Reminder scheduled 1 hour before appointment',
        },
        trace: {
          workflow_id: 'wf_mock_001',
          steps: [
            { agent: 'IntentParser', summary: 'Detected: AC Technician | Location: G-13 | Time: tomorrow morning | Language: Roman Urdu | Confidence: high' },
            { agent: 'ProviderFinder', summary: 'Found 8 AC technician providers across G-13, F-10, F-11, G-9 sectors' },
            { agent: 'Ranker', summary: 'Scored 8 providers. Top: Ali AC Services (0.93). Weights: distance 40%, rating 30%, availability 30%' },
            { agent: 'Booking', summary: 'Reserved 10:00 AM slot. Confirmation ID: BK-20260520-0001' },
            { agent: 'FollowUp', summary: 'Reminder scheduled via sms_simulated for 09:00 AM on 2026-05-20' },
          ],
        },
      });
    }, 4000); // 4 second delay — lets all 5 animation steps play
  });
}
```

**Critical:** `getMockResponse` must return `Promise<OrchestrateResponse>`, not the plain object. The real `orchestrate()` is async, so mock must match that signature. Otherwise AgentThinkingScreen's `.then()` will break when switching between real and mock.

### Acceptance Criteria:
- [ ] Set `EXPO_PUBLIC_USE_MOCK=true`, restart Expo, run full flow — all screens render without undefined errors
- [ ] ResultsScreen shows 3 providers with score bars (scores as 0.93, 0.78, 0.61 — not 93, 78, 61)
- [ ] BookingConfirmScreen shows confirmation_id "BK-20260520-0001"
- [ ] AgentThinkingScreen waits ~4 seconds before navigating (mock delay working)
- [ ] Switch back to `EXPO_PUBLIC_USE_MOCK=false` after this ticket passes

---

## T-05 — Validate ResultsScreen Renders Real Data

**What to check:**

### Check 1: `top_providers` renders all 3 cards
```typescript
// In ResultsScreen.tsx — ensure you're mapping top_providers, not just recommended:
{response.top_providers.map((provider, index) => (
  <ProviderCard
    key={provider.name}
    provider={provider}
    rank={index + 1}
    onBook={() => navigation.navigate('BookingConfirm', { provider, response })}
    onDetail={() => navigation.navigate('ProviderDetail', { provider })}
    showReasoning={true}
  />
))}
```

### Check 2: Intent card shows real parsed data
```typescript
// intent card must show response.intent fields:
<Text>{response.intent.service_type}</Text>       // "AC Technician"
<Text>{response.intent.location}</Text>           // "G-13"
<Text>{response.intent.time_window}</Text>        // "tomorrow morning"
<Text>{response.intent.language_detected}</Text>  // "roman_urdu"
```

### Check 3: Language badge maps to readable label
```typescript
const languageLabel = {
  'roman_urdu': 'Roman Urdu',
  'urdu': 'اردو',
  'english': 'English',
}[response.intent.language_detected] ?? response.intent.language_detected;
```

### Check 4: ScoreBar receives 0-1 float
```typescript
// ProviderCard passes score to ScoreBar:
<ScoreBar score={provider.score} />   // 0.93 → shows "93%" with green fill
// Inside ScoreBar:
const percentage = Math.round(score * 100); // 0.93 → 93
```

### Check 5: "Book Now" on recommended provider passes full response
```typescript
// The recommended hero card must pass the full response to BookingConfirm:
onPress={() => navigation.navigate('BookingConfirm', {
  provider: response.recommended,
  response: response,   // ← pass entire response for followup data
})}
```

### Check 6: TraceAccordion receives steps
```typescript
<TraceAccordion steps={response.trace.steps} />
// steps = [{agent: 'IntentParser', summary: '...'}, ...]
```

### Acceptance Criteria:
- [ ] With real API (mock off): exactly 3 provider cards render
- [ ] Each card shows: name, score bar, reasoning text, distance, rating
- [ ] Score bars are proportional — provider[0] bar wider than provider[2]
- [ ] Intent card shows service type + location + language detected from real response
- [ ] "Why this ranking?" accordion is tappable and shows factor weights + all 5 trace steps
- [ ] Tapping "Book Now" on recommended navigates to BookingConfirmScreen without crash

---

## T-06 — Validate BookingConfirmScreen with Real Booking Data

**What to check:**

### Check 1: Receives real booking data from route params
```typescript
const { provider, response } = route.params;
const booking = response.booking;
const followup = response.followup;
```

### Check 2: ExecutionLogView steps include real data
```typescript
// Build the steps array using real booking fields:
const bookingSteps = [
  'Connecting to booking system...',
  `Slot reserved: ${formatSlot(booking.slot)}`,          // format ISO → "May 20, 10:00 AM"
  `Booking ID: ${booking.confirmation_id}`,              // "BK-20260520-0001"
  `Provider notified: ${booking.provider}`,
  'Calendar entry created',
  'Confirmation receipt generated',
  `Reminder scheduled: ${formatSlot(followup.reminder_at)}`,
];
```

### Check 3: Date formatting helper
Add this to `src/utils/formatDate.ts` (or wherever your utils are):
```typescript
export function formatSlot(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-PK', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Karachi',
    });
  } catch {
    return isoString; // fallback: show raw string
  }
}
```

### Check 4: BookingReceiptCard shows all 4 key fields
```typescript
// Must visibly display:
// 1. booking.confirmation_id — in monospace font, prominent
// 2. provider.name
// 3. formatSlot(booking.slot) — human-readable date+time
// 4. formatSlot(followup.reminder_at) — "Reminder: May 20, 9:00 AM"
```

### Check 5: Booking saved to store after confirmation
```typescript
// After ExecutionLogView completes, save to Zustand store:
const { addBooking } = useOrchestratorStore();
// Call this when ExecutionLogView onComplete fires:
addBooking({
  ...booking,
  providerName: provider.name,
  status: 'CONFIRMED',
  createdAt: new Date().toISOString(),
});
```

### Acceptance Criteria:
- [ ] Execution log animates 7 steps, each appearing ~400ms apart (time it)
- [ ] Step 2 shows the real slot time from `booking.slot` (not hardcoded)
- [ ] Step 3 shows the real confirmation_id from `booking.confirmation_id`
- [ ] Receipt card shows confirmation_id in a visually distinct (monospace/bold) style
- [ ] Receipt shows reminder time from `followup.reminder_at` formatted as human-readable
- [ ] After receipt appears, the booking is saved — navigate to My Bookings tab and verify it appears

---

## T-07 — Wire DisputeScreen with Real Confirmation ID

**What to check:**

When navigating to DisputeScreen from BookingDetailScreen, the `confirmationId` param must come from the real booking.

### In `BookingDetailScreen.tsx`:
```typescript
// "Report Issue" button navigation:
navigation.navigate('Dispute', {
  confirmationId: booking.confirmation_id,  // ← real ID from stored booking
  providerName: booking.provider,           // ← from BookingResult.provider field
});
```

### In `DisputeScreen.tsx`:
```typescript
const { confirmationId, providerName } = route.params;

// Header must show the real ID:
<Text>Booking: {confirmationId}</Text>

// Resolution card must include real provider name:
<Text>
  We have issued a partial refund of PKR 500 and flagged {providerName} for review.
</Text>
```

### Acceptance Criteria:
- [ ] DisputeScreen header shows the actual confirmation ID (e.g. "BK-20260520-0001"), not placeholder text
- [ ] Resolution card names the actual provider (e.g. "Ali AC Services"), not hardcoded string
- [ ] All 5 issue type chips are selectable
- [ ] Submit button is disabled until an issue type is selected
- [ ] Resolution card appears after ~2 second simulated review delay

---

## T-08 — Wire BookingDetailScreen Status Timeline

**What to check:**

The BookingDetailScreen shows the full booking status timeline. It reads from the Zustand store.

### In `BookingDetailScreen.tsx`:
```typescript
const { confirmationId } = route.params;
const { bookings } = useOrchestratorStore();

// Find the booking:
const booking = bookings.find(b => b.confirmation_id === confirmationId);

if (!booking) {
  return <EmptyState message="Booking not found" />;
}
```

### Status timeline must use the booking's real data:
```typescript
// Timeline items:
const timelineItems = [
  { label: 'Booking Confirmed', time: formatSlot(booking.createdAt), done: true },
  { label: 'Reminder Scheduled', time: formatSlot(booking.followup_reminder_at), done: true },
  { label: 'Provider En Route', time: '1 hour before slot', done: booking.status === 'EN_ROUTE' },
  { label: 'Service In Progress', time: formatSlot(booking.slot), done: booking.status === 'IN_PROGRESS' },
  { label: 'Service Completed', time: 'Pending', done: booking.status === 'COMPLETED' },
];
```

### The Zustand store's stored booking shape must include these fields:
```typescript
// In orchestratorStore.ts, the stored booking shape:
interface StoredBooking {
  confirmation_id: string;
  provider: string;           // provider name
  slot: string;               // ISO datetime
  message: string;
  followup_reminder_at: string;  // from followup.reminder_at
  status: 'CONFIRMED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;          // when booking was made
  providerDetails: Provider;  // full provider object for display
}
```

### Acceptance Criteria:
- [ ] After completing BookingConfirmScreen, booking appears in My Bookings list
- [ ] Tapping the booking opens BookingDetailScreen with real confirmation ID in header
- [ ] Timeline shows at least 3 items with the first 2 marked as done (Confirmed + Reminder Scheduled)
- [ ] Provider name in header matches the real provider from booking
- [ ] "Report Issue" button navigates to DisputeScreen with correct params
- [ ] If confirmationId doesn't exist in store, shows EmptyState (no crash)

---

## T-09 — Gemini Model Swap Verification

**This is a backend ticket — do it with your friend.**

The backend was built with OpenAI. You need Gemini. Here's exactly what changes:

### In `backend/.env`:
```bash
# Remove or comment out:
# OPENAI_API_KEY=sk-...

# Add:
OPENAI_API_KEY=<your_gemini_api_key>
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
MODEL_NAME=gemini-2.0-flash
```

### In `backend/app/runtime.py` (or wherever agents are configured):
Find where `model=` is set for each agent and make it read from env:
```python
import os
MODEL_NAME = os.getenv('MODEL_NAME', 'gemini-2.0-flash')

# Then every agent definition:
orchestrator = Agent(
    name="Orchestrator",
    model=MODEL_NAME,   # ← reads from env
    ...
)
```

### Known Gemini + OpenAI SDK compatibility note:
Gemini via the OpenAI-compatible endpoint supports the same function calling API. However:
- `gpt-4.1-mini` used for specialists → replace with `gemini-2.0-flash`
- `gpt-4.1` used for orchestrator/intent parser → replace with `gemini-1.5-pro` or `gemini-2.0-flash`
- Tool calling works identically via the OpenAI SDK compatibility layer

### Verify by running the curl test again after swap:
```bash
curl -s -X POST http://localhost:8000/orchestrate \
  -H 'content-type: application/json' \
  -d '{
    "user_prompt": "Mujhe kal subah G-13 mein AC technician chahiye",
    "user_location": {"sector":"G-13","city":"Islamabad","lat":33.65,"lng":72.99}
  }' | python3 -m json.tool
```

### Acceptance Criteria:
- [ ] Backend starts without import errors after env change
- [ ] `curl` to `/orchestrate` returns valid JSON (same shape as before)
- [ ] Roman Urdu prompt returns `language_detected: roman_urdu`
- [ ] `trace.steps` has 5 entries (all 5 agents ran)
- [ ] Response time under 30 seconds (Gemini 2.0 Flash should be 5-10s)
- [ ] No "API key invalid" or "model not found" errors in backend logs

---

## T-10 — End-to-End Smoke Test — All 3 Languages

**This is a test ticket, no code changes. Run it on a real Android device.**

### Test 1: English
```
Input: "I need a plumber in F-10 this afternoon"
Location: auto or hardcoded G-13
```
Expected:
- AgentThinkingScreen animates all 5 steps
- Results show 3 providers, service_type = "Plumber"
- intent.language_detected chip shows "English"
- Book top provider → execution log → receipt
- Receipt shows plumber provider name

### Test 2: Roman Urdu
```
Input: "Mujhe kal subah G-13 mein AC technician chahiye"
```
Expected:
- language chip on RequestScreen updates to "Roman" while typing "mujhe"
- After submit: intent.language_detected = "roman_urdu" in intent card
- Results show AC technician providers

### Test 3: Urdu (Arabic script)
```
Input: مجھے کل صبح جی-13 میں اے سی ٹیکنیشن چاہیے
```
Expected:
- Urdu text renders correctly in TextInput (no garbage characters)
- language chip shows "اردو"
- intent.language_detected = "urdu"
- Results render correctly

### Test 4: Dispute flow
From any completed booking:
1. My Bookings → tap booking → Report Issue
2. Select "Price Dispute"
3. Submit → wait 2s → resolution card appears
4. Resolution mentions real provider name

### Test 5: Mock fallback
```bash
EXPO_PUBLIC_USE_MOCK=true npx expo start
```
- Full flow works with no backend running
- All 3 test prompts above work in mock mode

### Acceptance Criteria:
- [ ] All 3 language inputs complete the full flow without crash
- [ ] Language chip correctly identifies all 3 language types
- [ ] Dispute flow shows real provider name in resolution card
- [ ] Mock mode (`USE_MOCK=true`) completes full flow with no backend
- [ ] Back navigation: Results → Request (not AgentThinking → Request → crash)
- [ ] App handles killing and restarting mid-flow gracefully (no stale state crash)

---

## T-11 — Demo Safety Net: Mock Fallback Verification

**Purpose:** On demo day, if the backend is unreachable, you must be able to flip ONE env var and demo the full flow. Verify this works cleanly.

### In `orchestrator.ts` — add a runtime override (for demo day emergency):
```typescript
// In-memory override — can be set from a hidden tap gesture on RequestScreen:
let _mockOverride = false;
export const setMockOverride = (val: boolean) => { _mockOverride = val; };

export async function orchestrate(req: OrchestrateRequest): Promise<OrchestrateResponse> {
  const useMock = _mockOverride || process.env.EXPO_PUBLIC_USE_MOCK === 'true';
  if (useMock) return getMockResponse(req);
  // ... real fetch
}
```

### Add a secret "panic button" to RequestScreen:
```typescript
// Hidden tap on the header title (5 rapid taps) → enable mock mode:
const [tapCount, setTapCount] = useState(0);
const handleHeaderTap = () => {
  const next = tapCount + 1;
  setTapCount(next);
  if (next >= 5) {
    setMockOverride(true);
    Alert.alert('Demo Mode', 'Now using mock data. Backend not needed.');
    setTapCount(0);
  }
};

// In JSX:
<TouchableOpacity onPress={handleHeaderTap}>
  <Text style={styles.headerTitle}>What do you need?</Text>
</TouchableOpacity>
```

This means on demo day, if backend fails, you tap the title 5 times and continue the demo seamlessly.

### Acceptance Criteria:
- [ ] With `EXPO_PUBLIC_USE_MOCK=false` and backend DOWN: error card shows with retry button (no crash)
- [ ] With `EXPO_PUBLIC_USE_MOCK=true` and backend DOWN: full flow completes
- [ ] 5-tap panic button on header enables mock mode and shows alert
- [ ] After enabling mock via panic button, full flow works without restart
- [ ] AgentThinkingScreen in mock mode still waits ~4 seconds (simulated delay)

---

## T-12 — Network Resilience: Offline + Slow API

**Purpose:** Prevent crashes that happen when phone goes offline mid-request or API is slow.

### In `AgentThinkingScreen.tsx`:

**Timeout handling:** If API takes more than 20 seconds, show error:
```typescript
useEffect(() => {
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => {
    controller.abort();
    setApiError('Request timed out. Please try again.');
  }, 20000); // 20 second timeout

  orchestrate(req, controller.signal)
    .then(...)
    .catch(...)
    .finally(() => clearTimeout(timeoutId));

  return () => {
    clearTimeout(timeoutId);
    controller.abort();
  };
}, []);
```

Update `orchestrator.ts` to accept optional signal:
```typescript
export async function orchestrate(
  req: OrchestrateRequest,
  signal?: AbortSignal
): Promise<OrchestrateResponse> {
  // ...
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal, // pass abort signal
  });
  // ...
}
```

**Offline detection:** Use existing `useNetInfo` or `OfflineBanner` component:
```typescript
// In AgentThinkingScreen, before firing API:
const netInfo = useNetInfo();
if (!netInfo.isConnected) {
  setApiError('No internet connection. Enable mock mode or check WiFi.');
  return;
}
```

### Acceptance Criteria:
- [ ] With phone's WiFi off: error card appears within 2 seconds of navigating to AgentThinking (no infinite spinner)
- [ ] With WiFi back on: Retry button re-fires the request successfully
- [ ] If API hangs > 20 seconds: timeout error card appears
- [ ] OfflineBanner (existing component) shows when phone goes offline on any screen
- [ ] Navigating back from error state returns to RequestScreen cleanly

---

## FINAL DEMO DAY PREP CHECKLIST

Run this the night before submission:

### Backend
- [ ] Backend running on `0.0.0.0:8000` (not localhost only)
- [ ] CORS middleware confirmed in `backend/app/api.py`
- [ ] Gemini API key is set and working (T-09 passed)
- [ ] Test curl for all 3 prompts returns valid JSON
- [ ] `logs/` directory exists and a `.jsonl` trace file is generated per request
- [ ] Backend machine and your phone on the same WiFi

### Frontend
- [ ] `EXPO_PUBLIC_API_URL` = LAN IP (not localhost)
- [ ] `EXPO_PUBLIC_USE_MOCK=false` for real demo
- [ ] All 12 tickets passed
- [ ] 5-tap panic button verified working
- [ ] App tested on real Android device (not simulator)
- [ ] App tested after kill+reopen (no state corruption)

### Demo video must show:
- [ ] Roman Urdu input → AgentThinking → Results (score bars + reasoning)
- [ ] "Why this ranking?" accordion open showing factor weights
- [ ] BookingConfirm execution log animating
- [ ] Receipt with real confirmation ID
- [ ] DisputeScreen with resolution card naming real provider
- [ ] At least 2 seconds of the AgentThinkingScreen (don't skip it!)
- [ ] Terminal showing backend logs simultaneously (optional but impressive)