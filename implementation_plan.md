# AI Service Orchestrator — Frontend Implementation Plan
## Google Antigravity #AISeekho2026 | Challenge 2
### Solo Developer | Deadline: May 20, 2026

---

## PRE-FLIGHT AUDIT

### package.json Findings (karvaan/package.json)
| Package | Version | Decision Impact |
|---|---|---|
| `zustand` | `^5.0.0` | ✅ INSTALLED — use it |
| `react-native-mmkv` | `^3.1.0` | ✅ INSTALLED — use it |
| `react-native-reanimated` | `~3.16.1` | ✅ INSTALLED — use for all animations |
| `expo-location` | `~18.0.10` | ✅ INSTALLED — use `useUserLocation` hook |
| `@expo/vector-icons` | NOT in package.json | ⚠️ NOT FOUND — use `@react-native-vector-icons` or emoji fallbacks |
| `@react-navigation/native-stack` | `^7.0.0` | ✅ INSTALLED |
| `@react-navigation/bottom-tabs` | `^7.0.0` | ✅ INSTALLED |
| `react-native-maps` | `^1.18.0` | ✅ INSTALLED |
| `expo-linear-gradient` | `~14.0.2` | ✅ INSTALLED — use for AgentThinkingScreen |
| `@react-native-community/netinfo` | `11.4.1` | ✅ INSTALLED — `useNetwork` hook exists |
| `nativewind` | `~4.1.23` | ⚠️ INSTALLED but do NOT use — StyleSheet.create only |
| `@tanstack/react-query` | `^5.62.0` | ✅ Available but not needed for new screens |

**⚠️ ICON FLAG:** Ensure `@expo/vector-icons` is installed and used across the entire app (specifically `Ionicons` or `Lucide` style icons) for Bottom Tabs, Agent Step checkmarks, and UI buttons. Do NOT use emoji-based icons.

### Existing Screens (in src/features/)
- `features/auth/`: SplashScreen, OnboardingScreen, AuthScreen, OtpVerifyScreen, OnboardingQuizScreen, GuestHomeScreen
- `features/explore/`: VenueDetailScreen, ExploreScreen, CategoryListScreen, DineScreen, ArenaScreen, PlaceDetailScreen, SavedVenuesScreen
- `features/home/`: HomeScreen
- `features/map/`: MapScreen, MapDetailScreen, NearMeScreen (+ `hooks/useUserLocation.ts` ✅)
- `features/profile/`: FollowUpDashboardScreen (formerly ProfileScreen), EditProfileScreen
- `features/search/`: SearchScreen

**No `src/screens/` directory exists** — screens are feature-organized. New screens will go in `src/screens/` as specified by cursorrules.md (new structure, no touching old features).

### Existing Components (src/components/)
Reusable: `PrimaryButton`, `EmptyState`, `ErrorBoundary`, `OfflineBanner`, `SkeletonCard`, `CustomTabBar`
Archive candidates: `VenueCard*`, `KarvaanVerdictCard`, `ContextStack`, `FreshnessIndicator`, `KarvaanLogo`

### Current Navigation Structure
- `RootNavigator.tsx`: Supabase auth-gated, 4 states (loading/authenticated/shareLink/unauthenticated)
- `MainTabNavigator.tsx`: 4 tabs — HomeScreen, ExploreScreen, DineScreen, ArenaScreen
- Auth bypass: `AUTH_TEST_BYPASS_FLAG` noted in PROGRESS.md but **not found in RootNavigator.tsx** — the bypass is implemented by always showing `MainTabNavigator` when session exists. For hackathon: we will completely replace RootNavigator logic to skip auth.

### Known Bugs from PROGRESS.md
- Mixed legacy auth screens still exist (LoginScreen, SignUpScreen, OTPScreen) — archive these
- `MainNavigator.tsx` (5-tab legacy) diverges from current 4-tab — archive it
- TypeScript is not fully strict-clean across repo — ignore pre-existing errors, only fix new files
- `PlaceDetailScreen` is a legacy duplicate of `VenueDetailScreen` — archive it
- **No Supabase errors** expected since we're replacing RootNavigator and not touching Supabase queries

### Contradictions Found
1. `karvaan-migration.md` says `npx expo install zustand react-native-mmkv` — **both already installed**, no install needed ✅
2. `cursorrules.md` mentions `@expo/vector-icons` — **not in package.json**. Plan: explicitly use standard vector icons (`Ionicons` or `Lucide`) instead of text-based emojis.
3. `app.json` scheme is `karvaan` — update to `servisai` in Phase 1 only if time permits (not critical for scoring).

---

## TECHNOLOGY DECISIONS

1. **State Management:** `zustand ^5.0.0` ✅ already installed → use `create()` from zustand
2. **Local Persistence:** `react-native-mmkv ^3.1.0` ✅ already installed → reuse existing `storage` singleton from `src/lib/storage.ts`. Add new STORAGE_KEYS for bookings/requests.
3. **Animations:** `react-native-reanimated ~3.16.1` ✅ installed → use `useSharedValue`, `useAnimatedStyle`, `withTiming`, `withSpring`, `withRepeat` for all animations
4. **Location:** `useUserLocation` hook exists at `src/features/map/hooks/useUserLocation.ts` ✅ → reuse it. It returns `{ coords, neighbourhood, permissionStatus, isLoading, requestPermission }`. Map coords to `UserLocation` type using a sector lookup table. Fallback: `{ sector: 'G-13', city: 'Islamabad', lat: 33.65, lng: 72.99 }`
5. **Icons:** Explicitly use `@expo/vector-icons` (`Ionicons` or `Lucide`) across the entire app. Install if necessary. Do not use emoji characters as icon fallbacks. Ensure implementation instructions reflect importing and using standard vector icons instead of text-based emojis.

---

## GLOBAL UI FIXES (Pre-requisites)
1. **Bottom Navigation Overlap**: Implement `useBottomTabBarHeight` from `@react-navigation/bottom-tabs` or use `SafeAreaView` with proper bottom padding across all scrollable lists and screens to ensure no content renders behind the tab bar.
2. **Map Screen Specific**: On `ProvidersMapScreen`, adjust `@gorhom/bottom-sheet`'s `bottomInset` property to account for the tab bar height.
3. **Component Overflow**: Fix `ScoreBar` and `ProviderCard` components. Apply `overflow: 'hidden'` where necessary, and ensure width calculations (`width: '100%'`) respect parent padding to prevent clipping/overflowing.

---

## PHASE SUMMARY TABLE

| Phase | Name | Est. Time | Block | Touches |
|---|---|---|---|---|
| 1 | Navigation Shell Rewrite | 1.5h | Foundation | RootNavigator, MainTabNavigator, navigation/types.ts |
| 2 | Types + API Client + Mock | 1h | Foundation | src/types/api.ts, src/api/orchestrator.ts, src/api/mockResponse.ts |
| 3 | Zustand Store + Storage Keys | 0.5h | Foundation | src/store/orchestratorStore.ts, src/lib/storage.ts |
| 4 | RequestScreen | 2h | Core Loop | src/screens/RequestScreen.tsx, src/utils/languageDetect.ts |
| 5 | AgentThinkingScreen — Animation Only | 2h | Core Loop | src/screens/AgentThinkingScreen.tsx, src/components/AgentStepCard.tsx |
| 6 | AgentThinkingScreen — Wire Real API | 1h | Core Loop | src/screens/AgentThinkingScreen.tsx (modify) |
| 7 | ScoreBar + ProviderCard Components | 1.5h | Core Loop | src/components/ScoreBar.tsx, src/components/ProviderCard.tsx |
| 8 | ResultsScreen | 2h | Core Loop | src/screens/ResultsScreen.tsx, src/components/TraceAccordion.tsx |
| 9 | ExecutionLogView Component | 1h | Booking | src/components/ExecutionLogView.tsx, src/components/BookingReceiptCard.tsx |
| 10 | BookingConfirmScreen | 1.5h | Booking | src/screens/BookingConfirmScreen.tsx |
| 11 | BookingsListScreen | 1h | Scoring | src/screens/BookingsListScreen.tsx |
| 12 | BookingDetailScreen | 1h | Scoring | src/screens/BookingDetailScreen.tsx |
| 13 | DisputeScreen | 1h | Scoring | src/screens/DisputeScreen.tsx |
| 14 | ProviderDetailScreen | 1h | Polish | src/screens/ProviderDetailScreen.tsx |
| 15 | ProvidersMapScreen | 1.5h | Polish | src/screens/ProvidersMapScreen.tsx |

**Total estimated: ~18 hours** (achievable across 2 focused days before May 20)

---

## PHASE 1 — Navigation Shell Rewrite

**Estimated time:** 1.5 hours
**Goal:** App boots directly to the 4-tab MainTabNavigator with new tab names, zero Supabase auth dependency, zero crashes.
**Dependency:** None — this is first.

### Files to MODIFY:
- `src/navigation/RootNavigator.tsx` — Strip Supabase auth entirely. Replace with direct render of MainTabNavigator + stack screens for AgentThinking/Results/etc.
- `src/navigation/MainTabNavigator.tsx` — Replace 4 old tabs (Home/Explore/Dine/Arena) with new 4 tabs (Request/MyBookings/Providers/FollowUps)
- `src/types/navigation.ts` — Replace all old param types with new RootStackParamList + MainTabParamList

### Files to CREATE:
- `src/screens/_placeholders/BookingsListScreen.tsx` — minimal placeholder (Text: "My Bookings") so tab navigator doesn't crash
- `src/screens/_placeholders/ProvidersMapScreen.tsx` — minimal placeholder
- `src/screens/_placeholders/FollowUpDashboardScreen.tsx` — minimal placeholder

### Files to ARCHIVE (move to src/_archive/):
- `src/navigation/MainNavigator.tsx` → `src/_archive/MainNavigator.tsx` (5-tab legacy)
- `src/navigation/ShareLinkNavigator.tsx` → `src/_archive/ShareLinkNavigator.tsx`
- `src/navigation/AuthNavigator.tsx` → `src/_archive/AuthNavigator.tsx`

### Implementation Notes:

**New `src/types/navigation.ts`** — replace entire file:
```typescript
import type { OrchestrateResponse, Provider, UserLocation } from '../types/api';

export type RootStackParamList = {
  MainTabs: undefined;
  AgentThinking: { userPrompt: string; userLocation: UserLocation; currentTime: string };
  Results: { response: OrchestrateResponse };
  ProviderDetail: { provider: Provider };
  BookingConfirm: { provider: Provider; response: OrchestrateResponse };
  BookingDetail: { confirmationId: string };
  Dispute: { confirmationId: string; providerName: string };
};

export type MainTabParamList = {
  Request: undefined;
  MyBookings: undefined;
  Providers: undefined;
  FollowUps: undefined;
};
```

**New `RootNavigator.tsx`** logic (simplified, no Supabase):
```typescript
// Remove ALL imports of: supabase, useAuthStore, ShareLinkNavigator, AuthNavigator
// Remove ALL: session checks, isShareLinkGuest, requiresOnboardingQuiz logic
// Replace renderNavigator() with: always return <MainTabNavigator>
// Keep stack screens for: AgentThinking, Results, ProviderDetail, BookingConfirm, BookingDetail, Dispute
// Use animation: 'slide_from_right' for all stack screens
// AgentThinking and BookingConfirm: headerShown: false
```

**New `MainTabNavigator.tsx`**:
- Tab 1: `Request` → placeholder `RequestScreen` (will be replaced in Phase 4)
- Tab 2: `MyBookings` → placeholder BookingsListScreen
- Tab 3: `Providers` → placeholder ProvidersMapScreen  
- Tab 4: `FollowUps` → placeholder FollowUpDashboardScreen
- Keep `CustomTabBar` component — it's reusable as-is
- `initialRouteName="Request"`

**Placeholder screen pattern** (copy for all 3):
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export function BookingsListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Bookings</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  text: { color: '#FFFFFF', fontSize: 18 },
});
```

### Acceptance Criteria:
- [ ] `npx expo start` runs without crash
- [ ] App launches and immediately shows 4-tab navigator (no login screen)
- [ ] All 4 tabs are tappable and show their placeholder content
- [ ] Tab labels read: "Request", "Bookings", "Providers", "Active Ops"
- [ ] No TypeScript errors in the 3 modified navigation files (ignore pre-existing errors elsewhere)
- [ ] Back-navigating from a hypothetical stack screen returns to tabs (verify by checking stack config)

### DO NOT do in this phase:
- Build any real screen content — placeholders only
- Touch any file in `src/features/` — leave the old screens intact
- Change `app.json` name or scheme

---

## PHASE 2 — Types + API Client + Mock Fallback

**Estimated time:** 1 hour
**Goal:** `orchestrate()` function is callable and returns a valid mock response when `EXPO_PUBLIC_USE_MOCK=true`. All TypeScript types mirror the API contract exactly.
**Dependency:** Phase 1 complete (app must be booting).

### Files to CREATE:
- `src/types/api.ts` — all backend TypeScript interfaces
- `src/api/orchestrator.ts` — `orchestrate()` function with mock toggle
- `src/api/mockResponse.ts` — complete hardcoded `OrchestrateResponse`

### Implementation Notes:

**`src/types/api.ts`** — copy exactly from cursorrules.md API RULES section:
```typescript
export interface UserLocation { sector: string; city: string; lat: number; lng: number; }
export interface OrchestrateRequest { user_prompt: string; user_location: UserLocation; current_time?: string; }
export interface Intent { service_type: string; location: string; time_window: string; language_detected: 'english' | 'urdu' | 'roman_urdu'; }
export interface Provider { name: string; category: string; location: string; distance_km: number; rating: number; availability: string; score: number; reasoning: string; }
export interface BookingResult { provider: string; slot: string; confirmation_id: string; message: string; }
export interface FollowUpResult { reminder_at: string; channel: string; message: string; }
export interface TraceStep { agent: string; summary: string; }
export interface TraceResponse { workflow_id: string; steps: TraceStep[]; }
export interface OrchestrateResponse { intent: Intent; top_providers: Provider[]; recommended: Provider; booking: BookingResult; followup: FollowUpResult; trace: TraceResponse; }
```

**`src/api/mockResponse.ts`** — hardcode the exact example from api-contract.md:
- `intent`: service_type "AC Technician", location "G-13", time_window "tomorrow morning", language_detected "roman_urdu"
- `top_providers`: 3 providers (Ali AC Services 0.93, Karachi Cool Systems 0.78, QuickFix AC 0.61)
- `recommended`: Ali AC Services
- `booking`: confirmation_id "BK-20260519-0001", slot "2026-05-19T10:00:00+05:00"
- `followup`: reminder_at "2026-05-19T09:00:00+05:00", channel "sms_simulated"
- `trace`: 5 steps with agent names IntentParser/ProviderFinder/Ranker/Booking/FollowUp with full summaries from api-contract.md
- Export: `export function getMockResponse(req: OrchestrateRequest): OrchestrateResponse`

**`src/api/orchestrator.ts`**:
```typescript
import { getMockResponse } from './mockResponse';
import type { OrchestrateRequest, OrchestrateResponse } from '../types/api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export async function orchestrate(req: OrchestrateRequest): Promise<OrchestrateResponse> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 1200)); // simulate latency
    return getMockResponse(req);
  }
  const res = await fetch(`${BASE_URL}/orchestrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(new Error(`API error ${res.status}`), { apiError: err });
  }
  return res.json();
}
```

Also create `.env.local` in karvaan root (if not exists):
```
EXPO_PUBLIC_API_URL=http://192.168.1.x:8000
EXPO_PUBLIC_USE_MOCK=true
```

### Acceptance Criteria:
- [ ] `src/types/api.ts` compiles with zero errors
- [ ] `src/api/orchestrator.ts` compiles with zero errors
- [ ] `getMockResponse()` returns an object matching `OrchestrateResponse` type exactly (verify with TypeScript)
- [ ] `EXPO_PUBLIC_USE_MOCK=true` causes `orchestrate()` to return mock without network call

### DO NOT do in this phase:
- Call `orchestrate()` from any screen yet
- Add error handling beyond what's in the orchestrator (that's Phase 6)

---

## PHASE 3 — Zustand Store + Storage Keys

**Estimated time:** 30 minutes
**Goal:** Global orchestrator store is available. Bookings can be written and read from MMKV.
**Dependency:** Phase 2 complete (types must exist).

### Files to CREATE:
- `src/store/orchestratorStore.ts` — Zustand store for orchestration state + bookings

### Files to MODIFY:
- `src/lib/storage.ts` — add new STORAGE_KEYS for the new domain

### Implementation Notes:

**Add to `src/lib/storage.ts`** STORAGE_KEYS object:
```typescript
BOOKINGS: 'servisai_bookings',
RECENT_REQUESTS: 'servisai_recent_requests',
ONBOARDING_COMPLETE: 'servisai_onboarding_complete',
USER_LOCATION: 'servisai_user_location',
```

**`src/store/orchestratorStore.ts`**:
```typescript
import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import type { OrchestrateRequest, OrchestrateResponse, BookingResult, Provider } from '../types/api';

interface OrchestratorState {
  request: OrchestrateRequest | null;
  response: OrchestrateResponse | null;
  selectedProvider: Provider | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  bookings: BookingResult[];
  recentRequests: string[];
  
  setRequest: (req: OrchestrateRequest) => void;
  setResponse: (res: OrchestrateResponse) => void;
  setSelectedProvider: (p: Provider) => void;
  setStatus: (s: OrchestratorState['status']) => void;
  setError: (e: string | null) => void;
  addBooking: (b: BookingResult) => void;
  addRecentRequest: (prompt: string) => void;
  clearCurrent: () => void;
}

export const useOrchestratorStore = create<OrchestratorState>((set, get) => {
  // Load persisted bookings from MMKV
  const savedBookings = storage.getString(STORAGE_KEYS.BOOKINGS);
  const bookings: BookingResult[] = savedBookings ? JSON.parse(savedBookings) : [];
  const savedRecent = storage.getString(STORAGE_KEYS.RECENT_REQUESTS);
  const recentRequests: string[] = savedRecent ? JSON.parse(savedRecent) : [];

  return {
    request: null, response: null, selectedProvider: null,
    status: 'idle', error: null, bookings, recentRequests,

    setRequest: (req) => set({ request: req }),
    setResponse: (res) => set({ response: res, status: 'success' }),
    setSelectedProvider: (p) => set({ selectedProvider: p }),
    setStatus: (s) => set({ status: s }),
    setError: (e) => set({ error: e, status: 'error' }),
    addBooking: (b) => {
      const next = [b, ...get().bookings];
      storage.set(STORAGE_KEYS.BOOKINGS, JSON.stringify(next));
      set({ bookings: next });
    },
    addRecentRequest: (prompt) => {
      const next = [prompt, ...get().recentRequests.filter(r => r !== prompt)].slice(0, 3);
      storage.set(STORAGE_KEYS.RECENT_REQUESTS, JSON.stringify(next));
      set({ recentRequests: next });
    },
    clearCurrent: () => set({ request: null, response: null, selectedProvider: null, status: 'idle', error: null }),
  };
});
```

### Acceptance Criteria:
- [ ] `useOrchestratorStore` importable from any screen without error
- [ ] Calling `addBooking()` persists to MMKV (verify: kill app, reopen, check `bookings` array is populated)
- [ ] `recentRequests` loads from MMKV on store init
- [ ] TypeScript: zero errors in orchestratorStore.ts

### DO NOT do in this phase:
- Call `orchestrate()` from the store — keep the API call in the screen (AgentThinkingScreen)
- Add middleware or devtools

---

## PHASE 4 — RequestScreen

**Estimated time:** 2 hours
**Goal:** User can type a service request, see language auto-detected, see location displayed, and tap "Find Service" to navigate to AgentThinkingScreen.
**Dependency:** Phases 1–3 complete.

### Files to CREATE:
- `src/screens/RequestScreen.tsx` — main input screen
- `src/utils/languageDetect.ts` — heuristic language detector

### Implementation Notes:

**`src/utils/languageDetect.ts`** — copy exact implementation from cursorrules.md:
```typescript
export function detectLanguage(text: string): 'urdu' | 'roman_urdu' | 'english' {
  if (/[\u0600-\u06FF]/.test(text)) return 'urdu';
  const romanUrduWords = ['mujhe', 'chahiye', 'karo', 'hai', 'mein', 'aur', 'nahi',
                           'kal', 'subah', 'zaroor', 'bilkul', 'kaam', 'bhai', 'raha', 'karna'];
  if (romanUrduWords.some(w => text.toLowerCase().includes(w))) return 'roman_urdu';
  return 'english';
}
```

**`src/screens/RequestScreen.tsx`** layout:
- Background: `#0D1117` (dark, consistent with AgentThinkingScreen)
- Header: "What do you need?" — `fontSize: 28, fontWeight: '700', color: '#E8EAED'`
- Language chip row: 3 chips — `EN` / `اردو` / `Roman`. Detected one gets `backgroundColor: '#1A73E8'`, others `backgroundColor: '#1C2333'`. Update on every `onChangeText` using `detectLanguage()`. `detectedLang` state initialized to `'english'`.
- TextInput: `multiline`, `numberOfLines: 4`, `maxLength: 300`, `placeholder` rotates every 3s between 3 example prompts using `useEffect` + `setInterval`. Placeholder color `#5F6368`. Background `#1C2333`, border `#2D3748`, `borderRadius: 12`, `padding: 16`, text color `#E8EAED`, `fontSize: 16`.
- Location pill: Shows `"📍 G-13 · Islamabad"`. Use `useUserLocation()` hook from `@/features/map/hooks/useUserLocation`. Map `coords` to sector string via lookup table (see api-contract.md coordinates). If `coords` is null, default to G-13. Store resolved `UserLocation` in component state.
- "Find Service" button: full width, `backgroundColor: '#1A73E8'`, `height: 52`, `borderRadius: 12`. Disabled (opacity 0.5) when prompt < 5 chars. Press animation: `scale.value = withTiming(0.97)` on press-in, back on press-out.
- Recent requests: `FlatList` of last 3 from `useOrchestratorStore().recentRequests`. Each is a pressable chip that fills the TextInput on tap. Horizontal scroll.
- On submit:
  1. Validate prompt.length >= 5 (show inline error text otherwise)
  2. Call `addRecentRequest(prompt)`
  3. `navigation.navigate('AgentThinking', { userPrompt: prompt, userLocation, currentTime: new Date().toISOString() })`

**Coords → Sector lookup** (inline function):
```typescript
const SECTOR_COORDS: { sector: string; lat: number; lng: number }[] = [
  { sector: 'G-13', lat: 33.650, lng: 72.990 },
  { sector: 'F-10', lat: 33.706, lng: 73.022 },
  { sector: 'F-11', lat: 33.716, lng: 73.010 },
  { sector: 'G-9',  lat: 33.682, lng: 73.030 },
  { sector: 'I-8',  lat: 33.671, lng: 73.064 },
];
function nearestSector(lat: number, lng: number): string {
  let best = SECTOR_COORDS[0];
  let bestDist = Infinity;
  for (const s of SECTOR_COORDS) {
    const d = Math.abs(s.lat - lat) + Math.abs(s.lng - lng);
    if (d < bestDist) { bestDist = d; best = s; }
  }
  return best.sector;
}
```

### Acceptance Criteria:
- [ ] Typing "AC bilkul kaam nahi" immediately highlights "Roman" chip
- [ ] Typing Arabic Urdu text highlights "اردو" chip
- [ ] "Find Service" button is disabled until prompt >= 5 chars
- [ ] Location pill shows a sector name (G-13 default or real GPS sector)
- [ ] Tapping "Find Service" navigates to `AgentThinking` (placeholder screen OK for now)
- [ ] Recent requests appear as chips and fill the TextInput on tap

### DO NOT do in this phase:
- Build voice input (mic button — add as a disabled/placeholder icon only)
- Connect to any real API



---

## PHASE 5 - AgentThinkingScreen (Animation Engine Only)

**Estimated time:** 2 hours
**Goal:** Dark command-center UI with 5 agent steps animating in on precise timers. Hardcoded fallback text, no real API.
**Dependency:** Phase 4 complete.

### Files to CREATE:
- `src/screens/AgentThinkingScreen.tsx`
- `src/components/AgentStepCard.tsx`

### AgentStepCard.tsx Implementation:
Props: stepName, summary, status (pending/active/done), delayMs, index

- opacity SharedValue: 0 to 1 via withTiming(1, duration 200ms) triggered after delayMs setTimeout
- translateY SharedValue: 16 to 0 simultaneously
- Dot colors: pending=#2D3748, active=#1A73E8 with withRepeat(withTiming(1.3, 600ms), -1, true) scale pulse, done=#34A853
- Step name: fontSize 14, fontWeight 600, color #4285F4, monospace font
- Summary text: fontSize 13, color #9AA0A6 while active, #E8EAED when done
- Card: backgroundColor #1C2333, borderRadius 10, padding 12, marginBottom 8
- Active card: borderLeftWidth 2, borderLeftColor #1A73E8

### AgentThinkingScreen.tsx Implementation:

Step constants (hardcode these exactly):
```typescript
const AGENT_STEPS = [
  { name: 'IntentParser',   delayMs: 600,  fallback: 'Parsing your service request...' },
  { name: 'ProviderFinder', delayMs: 1400, fallback: 'Searching providers in your area...' },
  { name: 'Ranker',         delayMs: 2400, fallback: 'Scoring by distance, rating, availability...' },
  { name: 'Booking',        delayMs: 3200, fallback: 'Reserving slot with top provider...' },
  { name: 'FollowUp',       delayMs: 3800, fallback: 'Scheduling reminder before appointment...' },
];
```

- Background: backgroundColor #0D1117 + LinearGradient from expo-linear-gradient
- Header: "AI is working on your request..." color #4285F4, fontSize 14, letterSpacing 2, uppercase
- User prompt speech-bubble: backgroundColor #1C2333, borderRadius 12, padding 12
- visibleCount state: each step setTimeout increments it
- status logic: index < visibleCount ? 'done' : index === visibleCount ? 'active' : 'pending'
- animationDone: setTimeout(() => setAnimationDone(true), 4400)
- Add gestureEnabled: false to this screen options in RootNavigator

### Acceptance Criteria:
- [ ] Background is #0D1117 dark command-center
- [ ] Step 1 appears at ~600ms, all 5 in correct sequence
- [ ] Active step has pulsing blue dot
- [ ] Done steps show green dot
- [ ] User prompt visible in card at top
- [ ] No crash navigating from RequestScreen

### DO NOT do in this phase:
- Fire any API call
- Navigate to Results
- Show real trace summaries

---

## PHASE 6 - AgentThinkingScreen Wire Real API

**Estimated time:** 1 hour
**Goal:** API fires on mount. When BOTH animation done AND API responded, auto-navigate to Results via replace().
**Dependency:** Phase 5 + Phase 2.

### Files to MODIFY:
- `src/screens/AgentThinkingScreen.tsx`

### Implementation Notes:

```typescript
const [apiResponse, setApiResponse] = useState<OrchestrateResponse | null>(null);
const [animationDone, setAnimationDone] = useState(false);
const [apiError, setApiError] = useState<string | null>(null);

useEffect(() => {
  setRequest({ user_prompt: userPrompt, user_location: userLocation, current_time: currentTime });
  orchestrate({ user_prompt: userPrompt, user_location: userLocation, current_time: currentTime })
    .then(res => { setApiResponse(res); setResponse(res); })
    .catch(err => setApiError(err.message ?? 'Request failed'));
  const timer = setTimeout(() => setAnimationDone(true), 4400);
  return () => clearTimeout(timer);
}, []);

useEffect(() => {
  if (apiResponse && animationDone) {
    navigation.replace('Results', { response: apiResponse });
  }
}, [apiResponse, animationDone]);
```

Pass `apiResponse?.trace.steps[index]?.summary ?? fallback` to each AgentStepCard as summary prop.

Error handling: if apiError set, replace step 1 card with error card (backgroundColor #2D1B1B, border #EA4335).
Buttons: "Retry" (re-fires orchestrate) and "Use demo data" (calls getMockResponse, sets apiResponse).

### Acceptance Criteria:
- [ ] USE_MOCK=true: auto-navigates to Results after ~5.6s
- [ ] useOrchestratorStore().response populated after navigation
- [ ] Network off + USE_MOCK=false: error card appears at step 1
- [ ] "Use demo data" button triggers Results with mock data
- [ ] No double-navigation

### DO NOT do in this phase:
- Modify animation timing
- Build ResultsScreen

---

## PHASE 7 - ScoreBar + ProviderCard Components

**Estimated time:** 1.5 hours
**Goal:** Both components built in isolation, visually correct, TypeScript clean.
**Dependency:** Phase 2 (types must exist).

### Files to CREATE:
- `src/components/ScoreBar.tsx`
- `src/components/ProviderCard.tsx`

### ScoreBar.tsx Implementation:
Props: score (0.0-1.0), label (optional), animated (optional)

- width SharedValue: 0 to score*100 as percentage via withTiming(score, duration 800, Easing.out(Easing.cubic))
- Color: score>=0.8 = #0F9D58 green, score>=0.6 = #F9AB00 amber, else #D93025 red
- Track: height 8, borderRadius 4, backgroundColor #2D3748
- Label: Math.round(score*100)+'%', fontSize 12, color #9AA0A6, right-aligned

### ProviderCard.tsx Implementation:
Props: provider, rank (optional), onBook, onDetail (optional), showReasoning (optional), isRecommended (optional)

- Card: backgroundColor #1C2333, borderRadius 12, padding 16, marginBottom 12
- isRecommended: borderColor #F9AB00, borderWidth 1.5, amber chip badge "AI RECOMMENDS"
- rank badge: 44px circle, backgroundColor #2D3748, number color #9AA0A6
- Avatar: 44px circle, backgroundColor #1A73E8, first letter of name white fontSize 18 bold
- Name: fontSize 17, fontWeight 700, color #E8EAED
- Category badge: backgroundColor #1A3A5C, borderRadius 12, color #4285F4, fontSize 11
- Stats: distance_km km + star rating + availability, fontSize 13, color #9AA0A6
- ScoreBar with score=provider.score, marginVertical 8
- Reasoning (when showReasoning): fontSize 13, color #9AA0A6, fontStyle italic, marginBottom 8
- Button row: "Book Now" (backgroundColor #1A73E8) and "Details" (ghost border #2D3748), flexDirection row, gap 8

### Acceptance Criteria:
- [ ] ScoreBar score=0.93 shows green bar animating to 93%
- [ ] ScoreBar score=0.61 shows red bar
- [ ] isRecommended card has gold border + AI RECOMMENDS badge
- [ ] Avatar shows first letter in blue circle
- [ ] Both buttons respond to tap
- [ ] Zero TypeScript errors in both files

### DO NOT do in this phase:
- Wire to any screen
- Map pin integration

---

## PHASE 8 - ResultsScreen + TraceAccordion

**Estimated time:** 2 hours
**Goal:** ResultsScreen fully functional - intent card, recommended provider, 3 ranked cards, accordion.
**Dependency:** Phase 6 + Phase 7.

### Files to CREATE:
- `src/screens/ResultsScreen.tsx`
- `src/components/TraceAccordion.tsx`

### ResultsScreen.tsx Implementation:
Receives route.params.response: OrchestrateResponse. ScrollView, backgroundColor #0D1117.

1. Intent Summary Card (collapsible, default expanded):
   backgroundColor #1C2333, borderRadius 12, padding 16, marginBottom 12
   Header "Request Understood" + chevron toggle
   Fields: Service, Location, Time, Language (badge: roman_urdu=blue, urdu=green, english=gray)
   Confidence from recommended.score: >=0.8=HIGH(green), >=0.6=MEDIUM(amber), else=LOW(red)

2. Recommended Hero: section label above ProviderCard with isRecommended=true, showReasoning=true
   onBook: navigation.navigate('BookingConfirm', {provider: response.recommended, response})

3. "Other Options" header: fontSize 16, fontWeight 600, color #9AA0A6

4. Provider list: map top_providers to ProviderCard rank=index+1, showReasoning=true
   onBook: store.setSelectedProvider(p); navigation.navigate('BookingConfirm', {provider: p, response})
   onDetail: navigation.navigate('ProviderDetail', {provider: p})

5. TraceAccordion after provider list

6. Bottom "New Request" ghost button: navigation.navigate('MainTabs') + store.clearCurrent()

### TraceAccordion.tsx Implementation:
Props: trace: TraceResponse

- Toggle button: "Why this ranking?" with expand/collapse arrow
- Animated height: 0 to contentHeight via withTiming(contentHeight, duration 300), measured via onLayout
- Content: factors table (Distance 40%, Rating 30%, Availability 30%) + each trace.steps mini card
- backgroundColor #111827, border #2D3748, borderRadius 12, padding 16

### Acceptance Criteria:
- [ ] Recommended provider at top with gold border
- [ ] 3 ranked cards with badges 1, 2, 3
- [ ] ScoreBar animates on mount for all cards
- [ ] "Why this ranking?" expands with animation
- [ ] Factor weights 40/30/30 visible in table
- [ ] "Book Now" navigates to BookingConfirmScreen

### DO NOT do in this phase:
- Build BookingConfirmScreen content
- "See on Map" functionality

---

## PHASE 9 - ExecutionLogView + BookingReceiptCard

**Estimated time:** 1 hour
**Goal:** Both booking display components built and animating correctly in isolation.
**Dependency:** Phase 2 (types).

### Files to CREATE:
- `src/components/ExecutionLogView.tsx`
- `src/components/BookingReceiptCard.tsx`

### ExecutionLogView.tsx Implementation:
Props: steps (string array), onComplete (optional callback)

- State: visibleCount 0 to steps.length; each step revealed via setTimeout at index * 400ms
- Each step: Animated.View opacity 0 to 1, fontSize 13, fontFamily monospace, color #34A853
- Prefix with checkmark when revealed
- onComplete called after last step
- Pulsing cursor shown after last revealed step while more pending

Booking steps to hardcode in Phase 10:
1. "Connecting to booking system..."
2. "Slot reserved: {formatted slot}"
3. "Booking ID generated: {confirmation_id}"
4. "Provider notified via SMS"
5. "Calendar entry created"
6. "Confirmation receipt generated"
7. "Reminder scheduled for {reminder_time}"

### BookingReceiptCard.tsx Implementation:
Props: booking (BookingResult), followup (FollowUpResult), provider (Provider)

- Card: backgroundColor #1C2333, borderRadius 16, padding 20
- "Booking Confirmed" header: color #34A853, fontSize 16, fontWeight 700, centered
- Confirmation ID: fontSize 22, fontFamily monospace, fontWeight 700, color #E8EAED, centered - most prominent element
- Divider line
- Info rows: Provider, Service type, Date+Time, Location, Est. cost range
  Each row: label (color #9AA0A6) + value (color #E8EAED), justifyContent space-between
- Reminder row: color #4285F4
- Bottom action chips: "Share" and "Done" with onDone callback

### Acceptance Criteria:
- [ ] ExecutionLogView reveals 7 steps at 400ms intervals with checkmark prefix
- [ ] onComplete fires after last step
- [ ] BookingReceiptCard shows confirmation ID prominently in monospace
- [ ] Slot time formatted from ISO8601 to human readable
- [ ] "Done" button fires onDone callback

### DO NOT do in this phase:
- Wire to BookingConfirmScreen

---

## PHASE 10 - BookingConfirmScreen

**Estimated time:** 1.5 hours
**Goal:** Execution log animates, receipt card springs in, booking saved to store.
**Dependency:** Phase 9 + Phase 3.

### Files to CREATE:
- `src/screens/BookingConfirmScreen.tsx`

### Implementation Notes:

Receives: provider (Provider), response (OrchestrateResponse). Layout: ScrollView, backgroundColor #0D1117, headerShown false.

1. Header: "Confirming your booking..." fontSize 18, color #4285F4, uppercase, letterSpacing 1.5
2. ExecutionLogView with 7 steps interpolated with real booking data from response
3. BookingReceiptCard - hidden until ExecutionLogView.onComplete fires; enters via withSpring (translateY 50 to 0, opacity 0 to 1)

On mount: addBooking(response.booking) - persist immediately, do not wait for animation.

Receipt "Done" tap: navigation.navigate('BookingDetail', {confirmationId: response.booking.confirmation_id})

Action row after animation completes:
- "Cancel Booking" ghost button (red border) -> Alert confirm -> navigate to MainTabs
- "Share Receipt" -> Alert "Receipt link copied!" (simulated)

### Acceptance Criteria:
- [ ] Execution log animates all 7 steps at 400ms intervals
- [ ] Receipt card springs in after log completes
- [ ] Confirmation ID matches OrchestrateResponse
- [ ] Booking persisted - verify in My Bookings tab
- [ ] "Done" navigates to BookingDetail

### DO NOT do in this phase:
- Real sharing
- Payment integration

---

## PHASE 11 - BookingsListScreen

**Estimated time:** 1 hour
**Goal:** My Bookings tab shows all persisted bookings with empty state.
**Dependency:** Phase 10.

### Files to CREATE:
- `src/screens/BookingsListScreen.tsx` (replaces Phase 1 placeholder)

### Files to MODIFY:
- `src/navigation/MainTabNavigator.tsx` - point MyBookings tab to real screen

### Implementation Notes:

FlatList of useOrchestratorStore().bookings. Background #0D1117.

Each booking card: backgroundColor #1C2333, borderRadius 12, padding 16, marginBottom 8
- Top: confirmation_id (monospace, color #4285F4) + CONFIRMED status badge
- Middle: provider name + formatted slot time
- Bottom: chevron navigate to BookingDetail

Empty state: use existing EmptyState component, message "No bookings yet. Make your first request!"

On tap: navigation.navigate('BookingDetail', {confirmationId: booking.confirmation_id})

### Acceptance Criteria:
- [ ] My Bookings tab shows booking from Phase 10
- [ ] Tapping booking navigates to BookingDetail
- [ ] Empty state when bookings array is empty
- [ ] Confirmation ID in monospace blue

### DO NOT do in this phase:
- Group by status
- Pull-to-refresh

---

## PHASE 12 - BookingDetailScreen

**Estimated time:** 1 hour
**Goal:** Status timeline, provider info, Report Issue button wired to DisputeScreen.
**Dependency:** Phase 11.

### Files to CREATE:
- `src/screens/BookingDetailScreen.tsx`

### Implementation Notes:

Receives confirmationId. Find from store: bookings.find(b => b.confirmation_id === confirmationId).

Layout: ScrollView, background #0D1117.

1. Status banner horizontal stepper: CONFIRMED -> EN ROUTE -> IN PROGRESS -> COMPLETED
   Local state initialized to 'CONFIRMED'. Active=blue filled, past=green filled, future=gray outline.

2. Provider compact card: backgroundColor #1C2333, borderRadius 12, padding 16
   Name from booking.provider, simulated contact "0300-1234567", slot formatted.

3. Timeline: 5 events (Confirmed / Reminder Sent / Provider En Route / In Progress / Completed)
   Each: colored dot + simulated timestamp + description. Past=green, future=gray.

4. Action row:
   "Report Issue" outlined red button: navigation.navigate('Dispute', {confirmationId, providerName: booking.provider})
   "Rate Service" button (when COMPLETED): star picker Alert

Auto-advance for demo: useEffect sets EN_ROUTE after 30s, IN_PROGRESS after 60s.

### Acceptance Criteria:
- [ ] Status banner shows CONFIRMED active on first open
- [ ] Provider name displayed from booking.provider
- [ ] "Report Issue" navigates to DisputeScreen
- [ ] Timeline shows 5 events with correct visual state
- [ ] Slot time formatted from ISO8601

### DO NOT do in this phase:
- Real backend status updates
- Real rating submission

---

## PHASE 13 - DisputeScreen

**Estimated time:** 1 hour
**Goal:** Issue picker + submit + AI resolution simulation. Scores 15% of hackathon criteria.
**Dependency:** Phase 12.

### Files to CREATE:
- `src/screens/DisputeScreen.tsx`

### Implementation Notes:

Receives: confirmationId, providerName. Layout: ScrollView, background #0D1117.

Step 1 - Issue Selection:
- Header "Report an Issue" fontSize 22, fontWeight 700, color #EA4335
- Subheader "Booking: {confirmationId}" monospace blue
- Issue chips single-select: No-show / Late Arrival / Quality Issue / Price Dispute / Other
  Selected: backgroundColor #EA4335, white text. Unselected: backgroundColor #1C2333, gray text.
- Description TextInput: multiline 4 rows, placeholder "Describe what happened..."
- "Photo evidence can be attached (simulated)" gray italic note
- "Submit Report" button: backgroundColor #EA4335, disabled until issue type selected

Step 2 - Resolution (shown after submit, replaces Step 1 with opacity animation):
- "Agent reviewing your case..." with pulsing dots (withRepeat, 1.5s interval)
- After 2s delay: resolution card appears:
  backgroundColor #1A2F1A, border #34A853, borderRadius 12, padding 16
  "Case Resolved" header green
  "We have issued a partial refund of PKR 500 and flagged {providerName} for review. Their ranking score has been adjusted."
  Provider flagged chip
- "Escalate to Human Support" ghost button -> Alert "A support agent will contact you within 24 hours"

### Acceptance Criteria:
- [ ] Issue chips work as single-select
- [ ] Submit disabled without issue type selection
- [ ] After submit: reviewing state for ~2s
- [ ] Resolution card with provider name and PKR 500 text
- [ ] Escalate button shows Alert
- [ ] Confirmation ID in header

### DO NOT do in this phase:
- Real backend dispute submission
- Photo upload

---

## PHASE 14 - ProviderDetailScreen

**Estimated time:** 1 hour
**Goal:** Full provider profile with stats, pricing, mock reviews, availability grid.
**Dependency:** Phase 8 (navigation from Details button).

### Files to CREATE:
- `src/screens/ProviderDetailScreen.tsx`

### Implementation Notes:

Receives route.params.provider: Provider. Layout: ScrollView, background #0D1117.

1. Hero: 80px avatar circle, name fontSize 24 bold, category badge, star rating text
2. Stats row 4 items: Rating / Jobs Done (mock 142) / On-Time % (mock 96%) / Response (mock under 30 min)
   Value bold on top, label gray below.
3. Specializations chips: derive from category (ac_technician -> AC Repair, AC Installation, Split AC)
4. Pricing card: backgroundColor #1C2333, borderRadius 12, padding 16
   Base fee PKR 500 / Per-hour PKR 300/hr / Urgency 1.5x same-day
   Estimate range "PKR 1,200 - 1,800" in green bold
5. Reviews: 2 hardcoded mock reviews (name, star rating, text)
6. Availability grid: 3 days x 3 slots (Morning/Afternoon/Evening)
   Tappable chips: selected=blue, unavailable=dimmed

Sticky bottom: "Book This Provider" -> navigation.navigate('BookingConfirm', {provider, response: useOrchestratorStore().response})

### Acceptance Criteria:
- [ ] Provider name and 4 stats visible
- [ ] PKR pricing with estimate range in green
- [ ] 2 mock reviews displayed
- [ ] 3x3 availability grid (9 chips) tappable
- [ ] "Book This Provider" navigates to BookingConfirmScreen

### DO NOT do in this phase:
- Real availability from backend
- Review submission

---

## PHASE 15 - ProvidersMapScreen

**Estimated time:** 1.5 hours
**Goal:** Map with mock provider pins, category filters, bottom sheet cards.
**Dependency:** Phase 1 (tab wired), Phase 7 (ProviderCard built).

### Files to CREATE:
- `src/screens/ProvidersMapScreen.tsx` (replaces Phase 1 placeholder)

### Files to MODIFY:
- `src/navigation/MainTabNavigator.tsx` - point Providers tab to real screen

### Implementation Notes:

Use react-native-maps (already installed). Hardcode 6-8 mock providers across Islamabad sectors using coordinates from api-contract.md.

Layout:
1. MapView full screen: region latitude 33.68, longitude 73.01, deltas 0.15
2. Category filter chips (absolute positioned top overlay): All / AC Tech / Plumber / Electrician / Carpenter
3. Provider Markers at each lat/lng with Callout showing name and rating
4. Bottom sheet via @gorhom/bottom-sheet (already installed): snapPoints 25% and 50%
   Compact ProviderCard list; tap -> navigation.navigate('ProviderDetail', {provider})
5. My Location button: calls useUserLocation().requestPermission()
6. Dark map style via customMapStyle array (standard Google dark style)

### Acceptance Criteria:
- [ ] Map opens centered on Islamabad
- [ ] At least 5 provider pins visible
- [ ] Category filter chips reduce visible pins
- [ ] Tapping pin shows callout with provider name
- [ ] Bottom sheet drags to 50% snap point
- [ ] ProviderCard in bottom sheet navigates to ProviderDetail

### DO NOT do in this phase:
- Pin clustering
- Real-time provider locations

---

## DEMO DAY CHECKLIST

### Antigravity Integration (20% of score)
- [ ] Phase 5+6: AgentThinkingScreen animates 5 agent steps with real trace summaries from API
- [ ] Phase 8: TraceAccordion on ResultsScreen shows Why-this-ranking with factor weights
- [ ] Phase 8: All 5 trace steps visible in accordion (IntentParser through FollowUp)

### Matching and Decision Quality (25% of score)
- [ ] Phase 7+8: ScoreBar animates for all providers
- [ ] Phase 8: reasoning text shown verbatim from API on each ProviderCard
- [ ] Phase 8: Factor weights table (Distance 40%, Rating 30%, Availability 30%)
- [ ] Phase 8: Confidence badge HIGH/MEDIUM/LOW on intent card

### Multilingual Robustness (15% of score)
- [ ] Phase 4: Language chip auto-detects Roman Urdu in real time while typing
- [ ] Phase 4: Arabic Urdu script correctly triggers Urdu chip
- [ ] Phase 2: Mock response uses language_detected roman_urdu for demo prompt
- [ ] Phase 4: Urdu text renders correctly in TextInput

### Scheduling, Pricing, Workflow (15% of score)
- [ ] Phase 9+10: Execution log animates 7 steps at 400ms intervals
- [ ] Phase 10: Receipt shows confirmation_id, slot, provider, reminder_at
- [ ] Phase 14: ProviderDetailScreen shows PKR pricing with estimate range
- [ ] Phase 10: Booking persisted to MMKV (survives app restart)

### Dispute Handling and Reliability (15% of score)
- [ ] Phase 13: DisputeScreen with 5 issue type chips
- [ ] Phase 13: Resolution animation shows 2s reviewing then resolution card
- [ ] Phase 13: Provider flagging text in resolution card
- [ ] Phase 2: Mock fallback works as demo safety net (USE_MOCK=true)

### Innovation and UX (10% of score)
- [ ] Phase 5: AgentThinkingScreen dark command-center aesthetic
- [ ] Phase 1: App boots under 2s to Request tab, no login friction
- [ ] All phases: consistent #0D1117 dark background across all new screens
- [ ] Phase 7: ScoreBar green/amber/red communicates AI confidence at a glance

### Final Demo Readiness
- [ ] Full flow tested on real Android device (not simulator)
- [ ] EXPO_PUBLIC_API_URL set to LAN IP (run ipconfig to find local network IP)
- [ ] Tested with USE_MOCK=false against real FastAPI server
- [ ] USE_MOCK=true backup ready if backend fails during demo
- [ ] 3 demo prompts prepared: (1) English (2) Roman Urdu AC prompt (3) Arabic Urdu script prompt
- [ ] Screen recording of complete flow: RequestScreen through DisputeScreen

---

*Plan generated: May 18, 2026 | Karvaan Expo SDK 52 codebase | 15 phases | ~18 hours total*
