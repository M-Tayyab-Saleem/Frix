# karvaan-migration.md — Adapting Karvaan to the Hackathon Project

> This document tells you exactly what to keep, what to delete, and what to build new.
> Run through this before writing a single line of new code.

---

## Mental Model

Karvaan is a **venue discovery** app. You are building a **service request orchestration** app.

| Karvaan | This Project |
|---|---|
| Venues (restaurants, parks, events) | Service providers (plumbers, AC techs, electricians) |
| Editorial curation (Trust Engine, Karvaan Verdict) | AI ranking (score + reasoning from backend) |
| Near Me map of venues | Near Me map of available providers |
| Booking tickets for events | Booking service appointments |
| VenueDetailScreen | ProviderDetailScreen |
| Search by category/vibe | Request by natural language |

The navigation shell, auth patterns, component primitives, and hooks are reusable. The domain is entirely new.

---

## What to KEEP (reuse as-is or with minor edits)

### Navigation Shell
- `RootNavigator.tsx` — keep the pattern, replace screen registrations
- `MainTabNavigator.tsx` — keep 4-tab structure, rename tabs
- `linkingConfig.ts` — update routes
- `src/types/navigation.ts` — replace with new param list from `app-flow.md`

### Auth
- Keep existing auth bypass (`AUTH_TEST_BYPASS_FLAG = true`) for now
- Do NOT spend time on auth; it has zero scoring value
- One option: replace login with a simple "Enter your name" onboarding screen

### Hooks (keep, rename or repurpose)
- `useUserLocation` → keep exactly, repurpose for setting provider search location
- `useNetInfo` (if present) → keep for offline detection

### Component Primitives (keep the patterns, rename)
- Button component → reuse styles
- Input component → reuse for RequestScreen text input
- LoadingSpinner → reuse on AgentThinkingScreen for individual step dots
- Toast/Snackbar → reuse for booking confirmation toast
- ErrorBoundary → keep

### Utils
- `src/utils/` — keep formatting helpers (dates, currency)
- Keep any existing `cn()` or style helpers

### Configuration
- `app.json` / `app.config.js` — keep, update app name to "ServisAI" or similar
- `babel.config.js` — keep
- `tsconfig.json` — keep
- `.env.example` — add `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_USE_MOCK`

---

## What to DELETE (or move to `_archive/`)

Don't delete — move to `src/_archive/` so you can reference old code quickly.

| File/Folder | Why |
|---|---|
| `src/screens/VenueDetailScreen.tsx` | Domain mismatch — replaced by ProviderDetailScreen |
| `src/screens/CategoryListScreen.tsx` | Replaced by ProvidersMapScreen |
| `src/screens/PlaceDetailScreen.tsx` | Legacy duplicate |
| `src/screens/DineScreen.tsx` | Not needed |
| `src/screens/ArenaScreen.tsx` | Not needed |
| `src/screens/ExploreScreen.tsx` | Replaced by RequestScreen |
| `src/navigation/MainNavigator.tsx` (5-tab legacy) | Use the 4-tab version |
| `src/screens/LoginScreen.tsx` | Legacy auth, not needed |
| `src/screens/SignUpScreen.tsx` | Legacy auth, not needed |
| `src/screens/DetailsScreen.tsx` | Legacy auth, not needed |
| `src/screens/OTPScreen.tsx` | Legacy auth, not needed (keep OtpVerifyScreen if needed) |
| Trust Engine components (FreshnessIndicator, ContextStack, KarvaanVerdictCard) | Domain-specific to venues |
| Supabase venue queries | Not needed (backend is FastAPI, not Supabase) |

---

## What to BUILD NEW

In priority order:

### P0 — Build These First (Core Loop)

1. **`src/types/api.ts`** — all backend types (copy from `api-contract.md`)
2. **`src/api/orchestrator.ts`** — the `orchestrate()` function + mock fallback
3. **`src/api/mockResponse.ts`** — complete hardcoded response for offline use
4. **`src/store/orchestratorStore.ts`** — Zustand store
5. **`src/utils/languageDetect.ts`** — simple heuristic language detector
6. **`src/components/AgentStepCard.tsx`** — animated agent step
7. **`src/screens/RequestScreen.tsx`** — input screen
8. **`src/screens/AgentThinkingScreen.tsx`** — THE KEY SCREEN
9. **`src/components/ProviderCard.tsx`** — provider card with score bar
10. **`src/components/ScoreBar.tsx`** — animated score bar
11. **`src/screens/ResultsScreen.tsx`** — ranked results
12. **`src/components/ExecutionLogView.tsx`** — animated booking log
13. **`src/screens/BookingConfirmScreen.tsx`** — booking simulation

### P1 — Build These Second

14. **`src/screens/BookingDetailScreen.tsx`** — booking tracker
15. **`src/screens/DisputeScreen.tsx`** — dispute resolution
16. **`src/screens/ProviderDetailScreen.tsx`** — provider profile
17. **`src/screens/BookingsListScreen.tsx`** — My Bookings tab

### P2 — Only If Time Allows

18. **`src/screens/ProvidersMapScreen.tsx`** — map view
19. **`src/screens/OnboardingScreen.tsx`** — name + city setup
20. **`src/components/TraceAccordion.tsx`** — expandable trace view

---

## Navigation Wiring (Do This After Building Screens)

Update `RootNavigator.tsx`:

```typescript
import { RequestScreen } from '../screens/RequestScreen';
import { AgentThinkingScreen } from '../screens/AgentThinkingScreen';
import { ResultsScreen } from '../screens/ResultsScreen';
import { ProviderDetailScreen } from '../screens/ProviderDetailScreen';
import { BookingConfirmScreen } from '../screens/BookingConfirmScreen';
import { BookingDetailScreen } from '../screens/BookingDetailScreen';
import { DisputeScreen } from '../screens/DisputeScreen';

// In Stack.Navigator:
<Stack.Screen name="MainTabs" component={MainTabNavigator} />
<Stack.Screen name="AgentThinking" component={AgentThinkingScreen} options={{ headerShown: false }} />
<Stack.Screen name="Results" component={ResultsScreen} />
<Stack.Screen name="ProviderDetail" component={ProviderDetailScreen} />
<Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} options={{ headerShown: false }} />
<Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
<Stack.Screen name="Dispute" component={DisputeScreen} />
```

Update `MainTabNavigator.tsx`:

```typescript
<Tab.Screen name="Request" component={RequestScreen} options={{ title: 'Request', tabBarIcon: ... }} />
<Tab.Screen name="MyBookings" component={BookingsListScreen} options={{ title: 'Bookings' }} />
<Tab.Screen name="Providers" component={ProvidersMapScreen} options={{ title: 'Providers' }} />
<Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
```

---

## Supabase → FastAPI Migration

Karvaan uses Supabase for everything. This project uses FastAPI as the sole backend.

**Remove or disable:**
- All `supabase.from('venues')` queries
- All Supabase auth calls (`supabase.auth.signIn`, etc.)
- Real-time subscriptions (not needed)

**Keep (might still be useful for bookings persistence):**
- Supabase client setup — but only use it if you decide to store bookings server-side
- For hackathon: store bookings in MMKV locally; no Supabase needed

**Add:**
- `src/api/orchestrator.ts` — single fetch call to FastAPI

---

## Package Additions Needed

```bash
npx expo install zustand
npx expo install react-native-mmkv
```

These are the only new packages required for the core flow.

---

## Estimated Migration Time

| Task | Time |
|---|---|
| Archive old screens, update navigation | 1–2 hours |
| Build api.ts types + orchestrator.ts | 30 min |
| Build Zustand store | 30 min |
| Build RequestScreen | 1–2 hours |
| Build AgentThinkingScreen | 3–4 hours (most complex) |
| Build ResultsScreen + ProviderCard + ScoreBar | 2–3 hours |
| Build BookingConfirmScreen + ExecutionLogView | 2 hours |
| Build DisputeScreen | 1 hour |
| Build BookingsListScreen + BookingDetailScreen | 1–2 hours |
| **Total P0 + P1** | **~12–16 hours** |

This is achievable in 2 focused days before the May 20 deadline.
