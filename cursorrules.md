# cursorrules.md — AI Service Orchestrator Frontend
## LLM Coding Rules for Cursor / Claude Code

> Read this file before every ticket. These rules are non-negotiable.

---

## IDENTITY OF THIS PROJECT

This is a **hackathon submission** for the Google Antigravity #AISeekho2026 challenge. The goal is to win, not to build production software. Every decision must be optimized for:
1. Demo impressiveness (judges watch a 3–5 min video)
2. Agentic reasoning visibility (the AI must visibly think, plan, act)
3. End-to-end workflow completeness (judges need to see input → booking → follow-up)

**This is NOT:**
- A production app
- A venue discovery app (that's the old Karvaan; we are repurposing it)
- A simple booking form

---

## TECH STACK (DO NOT CHANGE)

- **Framework:** React Native + Expo (SDK 52)
- **Language:** TypeScript (strict mode)
- **Navigation:** React Navigation v6 (Stack + Bottom Tabs)
- **State:** Zustand
- **Local Storage:** MMKV
- **Styling:** StyleSheet.create (no Tailwind, no NativeWind)
- **Animations:** React Native Reanimated v3
- **API:** Fetch (no Axios) calling FastAPI backend at `EXPO_PUBLIC_API_URL`
- **Maps:** react-native-maps (already in project) or Mapbox if installed

---

## FILE STRUCTURE RULES

```
src/
├── api/
│   └── orchestrator.ts       ← ALL backend calls go here
├── components/
│   ├── AgentStepCard.tsx
│   ├── ProviderCard.tsx
│   ├── ScoreBar.tsx
│   ├── ExecutionLogView.tsx
│   ├── BookingReceiptCard.tsx
│   ├── TraceAccordion.tsx
│   └── LanguageChip.tsx
├── screens/
│   ├── RequestScreen.tsx
│   ├── AgentThinkingScreen.tsx
│   ├── ResultsScreen.tsx
│   ├── ProviderDetailScreen.tsx
│   ├── BookingConfirmScreen.tsx
│   ├── BookingDetailScreen.tsx
│   ├── DisputeScreen.tsx
│   └── ProvidersMapScreen.tsx
├── navigation/
│   ├── RootNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── types.ts
├── store/
│   └── orchestratorStore.ts
├── types/
│   └── api.ts                ← mirrors backend Pydantic schemas exactly
└── utils/
    └── languageDetect.ts
```

**One component per file. No barrel files.**

---

## COMPONENT RULES

### Every component MUST:
1. Have explicit TypeScript props interface at the top
2. Use `StyleSheet.create()` for styles (no inline style objects)
3. Handle loading, error, and empty states explicitly
4. Be self-contained — no prop drilling more than 2 levels

### Animation components MUST:
1. Use `useAnimatedStyle` + `withTiming` / `withSpring` from Reanimated
2. Run on the UI thread (`useSharedValue`)
3. Not block the main thread

### Example of correct component structure:
```typescript
interface AgentStepCardProps {
  stepName: string;
  summary: string;
  status: 'pending' | 'active' | 'done';
  delayMs: number;
}

export function AgentStepCard({ stepName, summary, status, delayMs }: AgentStepCardProps) {
  // hooks
  // animated values
  // handlers
  // return JSX
}

const styles = StyleSheet.create({
  // ...
});
```

---

## API RULES

### The only backend endpoint:
```
POST /orchestrate
Body: OrchestrateRequest
Response: OrchestrateResponse
```

### All types in `src/types/api.ts`. Keep them in sync with the backend plan:

```typescript
export interface OrchestrateRequest {
  user_prompt: string;
  user_location: UserLocation;
  current_time?: string;
}

export interface UserLocation {
  sector: string;
  city: string;
  lat: number;
  lng: number;
}

export interface Intent {
  service_type: string;
  location: string;
  time_window: string;
  language_detected: 'english' | 'urdu' | 'roman_urdu';
}

export interface Provider {
  name: string;
  category: string;
  location: string;
  distance_km: number;
  rating: number;
  availability: string;
  score: number;
  reasoning: string;
}

export interface BookingResult {
  provider: string;
  slot: string;
  confirmation_id: string;
  message: string;
}

export interface FollowUpResult {
  reminder_at: string;
  channel: string;
  message: string;
}

export interface TraceStep {
  agent: string;
  summary: string;
}

export interface TraceResponse {
  workflow_id: string;
  steps: TraceStep[];
}

export interface OrchestrateResponse {
  intent: Intent;
  top_providers: Provider[];
  recommended: Provider;
  booking: BookingResult;
  followup: FollowUpResult;
  trace: TraceResponse;
}
```

---

## NAVIGATION RULES

### Stack param types in `src/navigation/types.ts`:
```typescript
export type RootStackParamList = {
  MainTabs: undefined;
  AgentThinking: { userPrompt: string; userLocation: UserLocation; currentTime: string };
  Results: { response: OrchestrateResponse };
  ProviderDetail: { provider: Provider };
  BookingConfirm: { provider: Provider; response: OrchestrateResponse };
  BookingDetail: { bookingId: string };
  Dispute: { bookingId: string };
};

export type MainTabParamList = {
  Request: undefined;
  MyBookings: undefined;
  Providers: undefined;
  Profile: undefined;
};
```

### Navigation rules:
- Always use typed `useNavigation<NativeStackNavigationProp<RootStackParamList>>()` 
- Never use `navigation.navigate('SomeName')` without types
- Pass full objects through params (not IDs) for hackathon speed; persistence is secondary

---

## STYLING RULES

### Color palette (use these constants everywhere):
```typescript
export const Colors = {
  primary: '#1A73E8',        // Google blue — references Antigravity/Google theme
  primaryDark: '#1557B0',
  success: '#34A853',        // Green checkmarks, confirmed states
  warning: '#FBBC04',        // Amber for medium confidence
  error: '#EA4335',          // Red for disputes, errors
  surface: '#FFFFFF',
  surfaceElevated: '#F8F9FA',
  border: '#E8EAED',
  textPrimary: '#202124',
  textSecondary: '#5F6368',
  textHint: '#9AA0A6',
  agentBlue: '#4285F4',      // AI agent steps specifically
  scoreGreen: '#0F9D58',
  scoreAmber: '#F9AB00',
  scoreRed: '#D93025',
} as const;
```

### Typography:
```typescript
export const Typography = {
  h1: { fontSize: 28, fontWeight: '700', color: Colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '600', color: Colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400', color: Colors.textPrimary },
  bodySmall: { fontSize: 13, fontWeight: '400', color: Colors.textSecondary },
  caption: { fontSize: 11, fontWeight: '400', color: Colors.textHint },
  mono: { fontSize: 13, fontFamily: 'monospace', color: Colors.textPrimary },
} as const;
```

### Spacing (8pt grid):
```typescript
export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
} as const;
```

---

## THE AGENT THINKING SCREEN — IMPLEMENTATION RULES

This screen is the most important in the app. Follow these rules exactly:

1. **Fire API call on `useEffect` mount immediately** — do not wait for animation
2. **Store the Promise** — resolve it when animation is ready
3. **5 agent steps always show** — use hardcoded step labels, fill summary from `trace.steps` when available
4. **Animation timing:**
   - Step 1 (IntentParser): appear at 600ms
   - Step 2 (ProviderFinder): appear at 1400ms
   - Step 3 (Ranker): appear at 2400ms
   - Step 4 (Booking): appear at 3200ms
   - Step 5 (FollowUp): appear at 3800ms
   - Navigate to Results: at max(4400ms, api_response_received)
5. **Active step:** pulsing dot animation using `withRepeat(withTiming(1), -1, true)`
6. **On API error:** show error card at the step that failed (step 1 if total failure), retry button
7. **Background:** dark (#0D1117) with subtle grid pattern or gradient — make it feel like a command center

```typescript
// Pseudocode for timing logic
const [apiResponse, setApiResponse] = useState<OrchestrateResponse | null>(null);
const [animationDone, setAnimationDone] = useState(false);

useEffect(() => {
  // Fire API
  orchestrate(request).then(setApiResponse).catch(handleError);
  
  // Schedule navigation
  const timer = setTimeout(() => setAnimationDone(true), 4400);
  return () => clearTimeout(timer);
}, []);

useEffect(() => {
  if (apiResponse && animationDone) {
    navigation.replace('Results', { response: apiResponse });
  }
}, [apiResponse, animationDone]);
```

---

## EXECUTION LOG VIEW — IMPLEMENTATION RULES

The `ExecutionLogView` component on BookingConfirmScreen simulates backend action execution:

```typescript
const BOOKING_STEPS = [
  'Connecting to booking system...',
  `Slot reserved: ${slot}`,
  `Booking ID generated: ${confirmationId}`,
  'Provider notified via SMS',
  'Calendar entry created',
  'Confirmation receipt generated',
  `Reminder scheduled for ${reminderTime}`,
];
```

- Each step appears 400ms after the previous
- Prefix each with `✓ ` once it appears (not before)
- Use `FlatList` or a simple `map` with `Animated.View` entrance per item
- After last step: show the BookingReceiptCard with a spring entrance animation

---

## SCORE BAR COMPONENT

```typescript
// ScoreBar: animated fill from 0 to `score` on mount
// score: 0.0 to 1.0
// Color logic:
//   score >= 0.8 → Colors.scoreGreen
//   score >= 0.6 → Colors.scoreAmber
//   score < 0.6  → Colors.scoreRed
// Show percentage label on right: "93%"
// Height: 8px, border-radius: 4px, background: Colors.border
```

---

## MOCK DATA FALLBACK

If the backend is down during the demo, the app must not crash. Implement a mock fallback:

```typescript
// src/api/orchestrator.ts
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export async function orchestrate(req: OrchestrateRequest): Promise<OrchestrateResponse> {
  if (USE_MOCK) return getMockResponse(req);
  // ... real fetch
}
```

Create `src/api/mockResponse.ts` with a complete hardcoded `OrchestrateResponse` covering all fields. This is your safety net for the demo.

---

## LANGUAGE DETECTION (Client-Side)

```typescript
// src/utils/languageDetect.ts
export function detectLanguage(text: string): 'urdu' | 'roman_urdu' | 'english' {
  // Arabic script detection
  if (/[\u0600-\u06FF]/.test(text)) return 'urdu';
  
  // Roman Urdu keywords
  const romanUrduWords = ['mujhe', 'chahiye', 'karo', 'hai', 'mein', 'aur', 'nahi', 
                           'kal', 'subah', 'zaroor', 'bilkul', 'kaam', 'bhai'];
  const lower = text.toLowerCase();
  if (romanUrduWords.some(w => lower.includes(w))) return 'roman_urdu';
  
  return 'english';
}
```

---

## WHAT NOT TO BUILD

**Do not build:**
- Complex auth (use a simple name input or bypass; judges don't care)
- Real payment integration
- Push notifications (simulate visually)
- A complex onboarding quiz (1-screen name + city is enough)
- Backend admin panels
- Settings screens with many options
- Animations that look flashy but don't communicate AI reasoning

**Do build:**
- The agent thinking animation (highest ROI)
- The execution log on booking confirmation
- The "Why this ranking?" trace accordion
- The dispute resolution simulation
- A mock fallback for when backend is down

---

## BEFORE EVERY TICKET: CHECKLIST

- [ ] Read `FRONTEND_PLAN.md` — understand where this screen fits
- [ ] Read `api-contract.md` — understand the data shape
- [ ] Check if a component from the list already exists before building new
- [ ] TypeScript types come from `src/types/api.ts` — do not redefine inline
- [ ] Colors come from the constants — do not hardcode hex values
- [ ] Test with mock data (`EXPO_PUBLIC_USE_MOCK=true`) before hitting real backend
- [ ] Check the screen on Android emulator (judges likely use Android)
