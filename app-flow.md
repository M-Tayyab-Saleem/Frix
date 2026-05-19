# app-flow.md — Screen Flow & Navigation Logic
## AI Service Orchestrator Frontend

---

## Primary User Flow (Happy Path)

```
[RequestScreen]
    │
    │ User enters prompt + location → taps "Find Service"
    ▼
[AgentThinkingScreen]
    │
    │ API call fires → 5 agent steps animate → response received
    ▼
[ResultsScreen]
    │
    ├── User taps "Book Now" on recommended provider
    │       ▼
    │   [BookingConfirmScreen]
    │       │ Execution log animates → receipt appears
    │       ▼
    │   [BookingDetailScreen] ← also reachable from My Bookings tab
    │       │
    │       └── User taps "Report Issue"
    │               ▼
    │           [DisputeScreen]
    │
    └── User taps a provider card → "Choose"
            ▼
        [ProviderDetailScreen]
            │ User taps "Book This Provider"
            ▼
        [BookingConfirmScreen] (same as above)
```

---

## Tab Navigation

```
Bottom Tab Bar (always visible after onboarding):

  [Request]  [My Bookings]  [Providers]  [Active Ops]
       │             │              │             │
  RequestScreen  BookingsListScreen  ProvidersMapScreen  FollowUpDashboardScreen
```

### Tab: Request
- Always starts fresh (no back stack)
- Previous results cleared on new request submission
- Recent requests shown as quick-select chips

### Tab: My Bookings
- List of all bookings from MMKV store
- Grouped: Active | Completed | Cancelled
- Tap → BookingDetailScreen
- Empty state: "No bookings yet. Make your first request!"

### Tab: Providers
- Map view of mock providers in Islamabad
- Filter by service category
- Tap provider pin → ProviderDetailScreen
- No booking from this tab (discovery only)

### Tab: Active Operations
- Global dashboard showing automated reminders, status updates, and service completions.
- Emphasizes AI agentic workflow with pulsing dots and sliding list animations (Reanimated 3).
- Uses `@expo/vector-icons` (Ionicons/Lucide) for step checkmarks and status indicators.

---

## Navigation Types (copy to `src/navigation/types.ts`)

```typescript
import { OrchestrateResponse, Provider, UserLocation } from '../types/api';

export type RootStackParamList = {
  // Auth / Onboarding
  Onboarding: undefined;
  
  // Main tabs wrapper
  MainTabs: undefined;
  
  // Stack screens (pushed on top of tabs)
  AgentThinking: {
    userPrompt: string;
    userLocation: UserLocation;
    currentTime: string;
  };
  Results: {
    response: OrchestrateResponse;
  };
  ProviderDetail: {
    provider: Provider;
  };
  BookingConfirm: {
    provider: Provider;
    response: OrchestrateResponse;
  };
  BookingDetail: {
    confirmationId: string;
  };
  Dispute: {
    confirmationId: string;
    providerName: string;
  };
};

export type MainTabParamList = {
  Request: undefined;
  MyBookings: undefined;
  Providers: undefined;
  FollowUps: undefined;
};
```

---

## State Transitions

### Orchestration State Machine

```
idle
  │ user submits request
  ▼
loading ──── API error ──→ error
  │                           │
  │ API success               │ user taps retry
  ▼                           │
success ◄───────────────────┘
  │
  │ user submits new request
  ▼
loading (cycle repeats)
```

### Booking Status State Machine

```
PENDING_CONFIRMATION
  │ (simulated after BookingConfirmScreen animation)
  ▼
CONFIRMED
  │ (simulated: auto-advances 30s after confirmation for demo)
  ▼
EN_ROUTE
  │ (simulated: 60s later)
  ▼
IN_PROGRESS
  │ (simulated: user taps "Mark Complete" or 120s later)
  ▼
COMPLETED
  │ (triggers feedback prompt)
  ▼
RATED
```

For demo purposes, the status can auto-advance on a timer if you're showing a live demo.

---

## Error States

### AgentThinkingScreen Error
- Show error card at the failed step
- "⚠ IntentParser failed: Could not parse service type"
- Retry button → re-fires API call
- "Use mock data instead" secondary button (sets `USE_MOCK=true` for this request)

### ResultsScreen — No Providers
```
[Empty state illustration]
"No providers found in G-13 for 'AC Technician' tomorrow morning."
"Try: Expanding to nearby sectors | Changing the time | Different service"
[Try Again button]
```

### Network Offline
- Detect with `@react-native-community/netinfo`
- Banner: "You're offline. Showing demo data."
- Auto-loads mock response

---

## Onboarding Flow (First Launch Only)

```
[OnboardingScreen]
  Step 1: "What's your name?" → text input
  Step 2: "Which city are you in?" → picker (Islamabad only for now)
  Step 3: Quick intro animation showing the 3 steps (Request → AI Matches → Booked)
  
  "Get Started" → saves to MMKV → navigates to MainTabs
```

Check `onboardingComplete` in MMKV on app launch:
- `false` → OnboardingScreen
- `true` → MainTabs (Request tab)

---

## Deep Links (Optional)

If implementing:
```
serviceapp://booking/:confirmationId  → BookingDetailScreen
serviceapp://providers/:category      → ProvidersMapScreen (filtered)
```

---

## Back Navigation Rules

| Screen | Back Goes To | Notes |
|---|---|---|
| AgentThinking | Prevented (use replace, not push) | Don't let users go back to re-submit |
| Results | RequestScreen | Clear response from store |
| BookingConfirm | Results | User might want to pick different provider |
| BookingDetail | MyBookings tab | |
| Dispute | BookingDetail | |
| ProviderDetail | Results | |
| ProvidersMapScreen | Providers tab | |

Use `navigation.replace()` for AgentThinking → Results to prevent back.
