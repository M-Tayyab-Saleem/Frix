# ANTIGRAVITY COMPREHENSIVE TESTING PROMPT
## AI Service Orchestrator — Full System Quality Audit
### Google Antigravity #AISeekho2026 | Challenge 2
### Run this ONLY after all 15 phases are implemented + Karachi migration + Integration tickets done

---

## YOUR ROLE

You are a **silent, methodical QA auditor**. You do not encourage. You do not explain what things are. You find problems and report them with surgical precision. Every check produces exactly one verdict. You do not guess — you read the actual file content and make a binary judgment.

**Before writing a single word of output, read every file listed in STEP 1. If a file does not exist, that is itself a finding — mark it ➖ NOT FOUND and continue.**

---

## STEP 1 — READ ALL FILES FIRST (in this exact order)

### Package & Config
1. `package.json` — installed packages, version numbers
2. `app.json` — app name, scheme, Expo SDK version
3. `.env.local` — environment variables

### Types & API Layer
4. `src/types/api.ts`
5. `src/api/orchestrator.ts`
6. `src/api/mockResponse.ts`

### State & Storage
7. `src/store/orchestratorStore.ts`
8. `src/lib/storage.ts`

### Constants
9. `src/constants/colors.ts` (or wherever Colors is defined)
10. `src/constants/karachiAreas.ts`
11. `src/utils/languageDetect.ts`
12. `src/utils/findNearestArea.ts`

### Navigation
13. `src/navigation/RootNavigator.tsx`
14. `src/navigation/MainTabNavigator.tsx`
15. `src/navigation/types.ts` (or `src/types/navigation.ts`)

### Screens (read every one)
16. `src/screens/RequestScreen.tsx`
17. `src/screens/AgentThinkingScreen.tsx`
18. `src/screens/ResultsScreen.tsx`
19. `src/screens/BookingConfirmScreen.tsx`
20. `src/screens/BookingsListScreen.tsx`
21. `src/screens/BookingDetailScreen.tsx`
22. `src/screens/DisputeScreen.tsx`
23. `src/screens/ProviderDetailScreen.tsx`
24. `src/screens/ProvidersMapScreen.tsx`

### Components (read every one)
25. `src/components/AgentStepCard.tsx`
26. `src/components/ProviderCard.tsx`
27. `src/components/ScoreBar.tsx`
28. `src/components/ExecutionLogView.tsx`
29. `src/components/BookingReceiptCard.tsx`
30. `src/components/TraceAccordion.tsx`
31. `src/components/LanguageChip.tsx`

### Backend (read every one)
32. `backend/app/mock_data.py`
33. `backend/app/tools.py`
34. `backend/app/schemas.py`
35. `backend/app/api.py`
36. `backend/app/runtime.py`
37. `backend/app/agents/orchestrator.py`
38. `backend/app/agents/intent.py`
39. `backend/app/agents/discovery.py`
40. `backend/app/agents/ranker.py`
41. `backend/app/agents/booking.py`
42. `backend/app/agents/followup.py`

### Archive check
43. `src/_archive/` — scan directory listing only

---

## VERDICT SYSTEM

Every check gets exactly one of:
- ✅ **PASS** — implementation matches spec exactly
- ❌ **FAIL** — deviation from spec (include: file path, line number if findable, what is wrong, what spec requires)
- ⚠️ **WARN** — works but has demo-day risk (include: what could go wrong)
- ➖ **NOT FOUND** — file or field does not exist (this is always a FAIL for required items)

---

## SECTION 1 — DEPENDENCY SAFETY

```
CHECK 1.1 — No new packages added beyond what was already installed
Read: package.json
Verify: Compare against known installed list from implementation plan:
  zustand ^5.0.0, react-native-mmkv ^3.1.0, react-native-reanimated ~3.16.1,
  expo-location ~18.0.10, react-native-maps ^1.18.0, expo-linear-gradient ~14.0.2,
  @react-native-community/netinfo 11.4.1, @react-navigation/native-stack ^7.0.0,
  @react-navigation/bottom-tabs ^7.0.0, @tanstack/react-query ^5.62.0
FAIL if any package not in original list was added with native code.
WARN if any pure-JS package was added (acceptable but flag it).

CHECK 1.2 — No package versions changed
Read: package.json
FAIL if any existing package version number was changed (up or down).

CHECK 1.3 — Expo SDK version unchanged
Read: app.json
FAIL if expo SDK version differs from "~52.0.0" (or whatever the original was).
```

---

## SECTION 2 — KARACHI MIGRATION

```
CHECK 2.1 — No Islamabad references anywhere in active code
Search these strings across ALL .ts, .tsx, .py files
(exclude node_modules, .git, src/_archive):
  "Islamabad", "G-13", "F-10", "F-11", "G-9", "I-8",
  "33.65", "33.67", "33.70", "33.71", "72.99", "73.01", "73.02", "73.06"
FAIL for every match found outside _archive directory.

CHECK 2.2 — backend/app/mock_data.py has 40 providers
Read: backend/app/mock_data.py
Count provider entries in MOCK_PROVIDERS list.
FAIL if count < 40.
FAIL if any provider has coordinates outside Karachi bounding box:
  lat must be between 24.75 and 25.10
  lng must be between 66.85 and 67.25

CHECK 2.3 — All 7 service categories present in mock data
Read: backend/app/mock_data.py
Verify these categories exist: ac_technician, plumber, electrician,
  carpenter, painter, tutor, beautician
FAIL if any category is missing.
FAIL if any category has fewer than 4 providers.

CHECK 2.4 — Provider names look real (not generic)
Read: backend/app/mock_data.py (first 10 providers)
FAIL if any name contains: "Provider", "Mock", "Test", "Sample", "Dummy",
  "Provider A", "Provider 1", or any similar placeholder pattern.

CHECK 2.5 — Frontend mock uses Karachi data
Read: src/api/mockResponse.ts
FAIL if intent.location contains "G-13", "F-10", or any Islamabad sector.
FAIL if any provider in top_providers has a location that is an Islamabad sector.
FAIL if booking.slot or followup.reminder_at timezone is not +05:00.

CHECK 2.6 — karachiAreas.ts constant file exists and is complete
Read: src/constants/karachiAreas.ts
FAIL if file does not exist.
Verify it contains at least 15 area objects, each with: area (string), lat (number), lng (number).
FAIL if any area has coordinates outside Karachi bounding box.

CHECK 2.7 — Fallback location is Karachi
Read: src/api/orchestrator.ts
Verify default fallback UserLocation object contains city: 'Karachi' and
  lat/lng within Karachi bounding box (lat 24.75-25.10, lng 66.85-67.25).
FAIL if fallback still shows Islamabad coordinates or city: 'Islamabad'.

CHECK 2.8 — UserLocation type uses 'area' not 'sector'
Read: src/types/api.ts
FAIL if UserLocation interface has a field named 'sector'.
FAIL if UserLocation interface does not have a field named 'area'.
```

---

## SECTION 3 — TYPE DEFINITIONS

```
CHECK 3.1 — OrchestrateRequest fields
Read: src/types/api.ts
Verify:
  user_prompt: string           ✓/✗
  user_location: UserLocation   ✓/✗
  current_time?: string         ✓/✗ (optional)
FAIL if any field missing or misnamed.
FAIL if any field typed as 'any'.

CHECK 3.2 — Intent fields
Read: src/types/api.ts
Verify:
  service_type: string                                    ✓/✗
  location: string                                        ✓/✗
  time_window: string                                     ✓/✗
  language_detected: 'english' | 'urdu' | 'roman_urdu'   ✓/✗
FAIL if language_detected is typed as string (must be union literal).

CHECK 3.3 — Provider fields
Read: src/types/api.ts
Verify all 8 fields: name, category, location, distance_km, rating,
  availability, score, reasoning
FAIL if distance_km is typed as string (must be number).
FAIL if score is typed as string (must be number).
FAIL if rating is typed as string (must be number).
FAIL if reasoning field is missing.

CHECK 3.4 — BookingResult fields
Read: src/types/api.ts
Verify: provider (string), slot (string), confirmation_id (string), message (string)
FAIL if field is named confirmationId instead of confirmation_id (must be snake_case).

CHECK 3.5 — FollowUpResult fields
Read: src/types/api.ts
Verify: reminder_at (string), channel (string), message (string)
FAIL if field is named reminderAt instead of reminder_at.

CHECK 3.6 — OrchestrateResponse top-level fields
Read: src/types/api.ts
Verify: intent, top_providers, recommended, booking, followup, trace
FAIL if topProviders is used instead of top_providers.
FAIL if any field is missing.

CHECK 3.7 — No 'any' types anywhere in api.ts
Read: src/types/api.ts
FAIL if the word ': any' appears anywhere in the file.

CHECK 3.8 — Navigation param types
Read: src/navigation/types.ts (or src/types/navigation.ts)
Verify RootStackParamList has:
  MainTabs: undefined
  AgentThinking: { userPrompt: string; userLocation: UserLocation; currentTime: string }
  Results: { response: OrchestrateResponse }
  ProviderDetail: { provider: Provider }
  BookingConfirm: { provider: Provider; response: OrchestrateResponse }
  BookingDetail: { confirmationId: string }
  Dispute: { confirmationId: string; providerName: string }
FAIL if BookingDetail uses bookingId instead of confirmationId.
FAIL if any param uses 'any' type.
```

---

## SECTION 4 — API CLIENT

```
CHECK 4.1 — BASE_URL reads from env var
Read: src/api/orchestrator.ts
FAIL if BASE_URL is hardcoded to any IP address or URL directly.
FAIL if process.env.EXPO_PUBLIC_API_URL is not referenced.
Verify fallback: 'http://localhost:8000' (acceptable default).

CHECK 4.2 — Mock toggle reads env var
Read: src/api/orchestrator.ts
Verify: process.env.EXPO_PUBLIC_USE_MOCK === 'true' pattern used.
FAIL if USE_MOCK is hardcoded to true or false.

CHECK 4.3 — orchestrate() returns Promise<OrchestrateResponse>
Read: src/api/orchestrator.ts
FAIL if return type annotation is missing.
FAIL if return type is Promise<any>.

CHECK 4.4 — Real fetch uses POST with correct headers
Read: src/api/orchestrator.ts
Verify: method: 'POST', Content-Type: 'application/json', JSON.stringify(req) for body.
FAIL if any of these 3 are missing.

CHECK 4.5 — Non-200 response throws Error with status
Read: src/api/orchestrator.ts
FAIL if non-OK response is silently ignored.
FAIL if error object does not include the HTTP status code.

CHECK 4.6 — getMockResponse returns Promise (not plain object)
Read: src/api/orchestrator.ts and src/api/mockResponse.ts
Verify: getMockResponse wraps response in Promise (or orchestrate awaits it correctly).
FAIL if mock path returns a plain object where a Promise is expected.

CHECK 4.7 — Mock simulates network delay
Read: src/api/mockResponse.ts or src/api/orchestrator.ts
Verify: a setTimeout or equivalent delay of at least 1000ms exists in mock path.
WARN if delay is less than 3000ms (AgentThinking animation needs time to play).
FAIL if mock returns instantly with zero delay (animation won't play at all).
```

---

## SECTION 5 — NAVIGATION STRUCTURE

```
CHECK 5.1 — App boots to MainTabs directly (no auth gate)
Read: src/navigation/RootNavigator.tsx
FAIL if any Supabase import exists in RootNavigator.
FAIL if useAuthStore, useSession, or any auth hook is imported.
FAIL if there is any conditional: if session → MainTabs else → AuthNavigator.
The root must always render MainTabNavigator (or a Stack with MainTabs as first screen).

CHECK 5.2 — All 4 tabs registered
Read: src/navigation/MainTabNavigator.tsx
Verify these tab names exist: Request, MyBookings, Providers, FollowUps
FAIL if any of the old tab names remain: Home, Explore, Dine, Arena.
FAIL if tab count is not exactly 4.

CHECK 5.3 — All stack screens registered in RootNavigator
Read: src/navigation/RootNavigator.tsx
Verify these screen names are registered: MainTabs, AgentThinking, Results,
  ProviderDetail, BookingConfirm, BookingDetail, Dispute
FAIL if any is missing.

CHECK 5.4 — AgentThinking and BookingConfirm have headerShown: false
Read: src/navigation/RootNavigator.tsx
FAIL if AgentThinking screen has headerShown: true or missing options.
FAIL if BookingConfirm screen has headerShown: true or missing options.

CHECK 5.5 — AgentThinking screen has gestureEnabled: false
Read: src/navigation/RootNavigator.tsx
FAIL if gestureEnabled is not explicitly set to false for AgentThinking.
(Without this, user can swipe back mid-animation and cause a broken state.)

CHECK 5.6 — Legacy navigators archived
Read: src/_archive/ directory listing
WARN if MainNavigator.tsx (5-tab legacy) is NOT in _archive.
WARN if ShareLinkNavigator.tsx is NOT in _archive.
WARN if AuthNavigator.tsx is NOT in _archive.
```

---

## SECTION 6 — AGENTTHINKINGSCREEN (20% of hackathon score)

```
CHECK 6.1 — API call fires in useEffect with empty dependency array
Read: src/screens/AgentThinkingScreen.tsx
Find the orchestrate() call. Verify it is inside useEffect(..., []).
FAIL if orchestrate() is called outside useEffect.
FAIL if the dependency array is missing (useEffect without []).
FAIL if the dependency array is non-empty.

CHECK 6.2 — Exact animation timing values
Read: src/screens/AgentThinkingScreen.tsx
Find AGENT_STEPS or equivalent step delay configuration.
Verify these exact millisecond values:
  IntentParser:   600ms  ✓/✗
  ProviderFinder: 1400ms ✓/✗
  Ranker:         2400ms ✓/✗
  Booking:        3200ms ✓/✗
  FollowUp:       3800ms ✓/✗
  animationDone:  4400ms ✓/✗
FAIL if any timing deviates by more than 200ms.

CHECK 6.3 — Dual-condition navigation (CRITICAL)
Read: src/screens/AgentThinkingScreen.tsx
Find where navigation.replace('Results', ...) is called.
Verify it is only called when BOTH conditions are true:
  - API response has been received
  - Animation timer (4400ms) has completed
FAIL if navigation fires on API response alone.
FAIL if navigation fires on timer alone.
FAIL if navigation uses navigate() instead of replace().
The pattern must be: useEffect triggered by both [apiResponse, animationDone].

CHECK 6.4 — Trace summaries populate step cards
Read: src/screens/AgentThinkingScreen.tsx
Verify: after API responds, trace.steps[n].summary is passed to each AgentStepCard.
FAIL if AgentStepCard always shows hardcoded fallback text even when API responded.
The fallback text must only show BEFORE API responds.

CHECK 6.5 — Error state with retry
Read: src/screens/AgentThinkingScreen.tsx
Verify: a catch/error state exists that renders an error UI.
FAIL if the orchestrate() call has no .catch() or try/catch.
FAIL if error causes a crash (no error boundary or error state rendering).
Verify: retry button re-fires orchestrate().
Verify: "Use demo data" button calls getMockResponse() and sets apiResponse.

CHECK 6.6 — Dark background #0D1117
Read: src/screens/AgentThinkingScreen.tsx
FAIL if root container background is not #0D1117.
FAIL if LinearGradient is not used (expo-linear-gradient is installed).

CHECK 6.7 — User prompt displayed in speech bubble
Read: src/screens/AgentThinkingScreen.tsx
Verify: route.params.userPrompt is rendered visibly on screen.
FAIL if userPrompt is not shown.

CHECK 6.8 — Hardcoded agent names (not from API)
Read: src/screens/AgentThinkingScreen.tsx
Verify: the 5 step names (IntentParser, ProviderFinder, Ranker, Booking, FollowUp)
  are hardcoded strings, not dynamically set from API response.
FAIL if step names come from trace.steps[n].agent.
(Names are hardcoded; only summaries come from API.)
```

---

## SECTION 7 — REQUESTSCREEN

```
CHECK 7.1 — Language detection fires on every keystroke
Read: src/screens/RequestScreen.tsx
Verify: detectLanguage() is called inside onChangeText handler.
FAIL if language detection only fires on submit.

CHECK 7.2 — Language chip UI state updates in real time
Read: src/screens/RequestScreen.tsx
Verify: detectedLang state is set by detectLanguage() result.
Verify: 3 chips rendered (EN, اردو, Roman), the matching one gets active styling.
FAIL if chip state is not bound to detectedLang.

CHECK 7.3 — Submit button disabled when prompt < 5 chars
Read: src/screens/RequestScreen.tsx
FAIL if disabled prop is not set on the submit button.
FAIL if disabled condition does not check prompt.length >= 5.

CHECK 7.4 — navigation.navigate (NOT replace) used for AgentThinking
Read: src/screens/RequestScreen.tsx
FAIL if navigation.replace('AgentThinking', ...) is used here.
(Replace should only be used FROM AgentThinking TO Results, not here.)

CHECK 7.5 — currentTime passed as ISO string
Read: src/screens/RequestScreen.tsx
Verify: new Date().toISOString() is used for currentTime param.
FAIL if currentTime is omitted from navigation params.

CHECK 7.6 — Location uses Karachi default
Read: src/screens/RequestScreen.tsx
Verify default/fallback UserLocation has city: 'Karachi'.
FAIL if default location has city: 'Islamabad' or sector: 'G-13'.

CHECK 7.7 — useUserLocation hook is used
Read: src/screens/RequestScreen.tsx
Verify: useUserLocation is imported and called.
FAIL if location is fully hardcoded with no hook usage.

CHECK 7.8 — Recent requests shown as chips
Read: src/screens/RequestScreen.tsx
Verify: useOrchestratorStore().recentRequests is accessed.
Verify: chips are rendered (FlatList or map).
FAIL if recent requests are not rendered at all.
```

---

## SECTION 8 — RESULTSSCREEN (25% of hackathon score)

```
CHECK 8.1 — Renders top_providers, not just recommended
Read: src/screens/ResultsScreen.tsx
Verify: response.top_providers.map(...) exists.
FAIL if only response.recommended is rendered as a single card.

CHECK 8.2 — reasoning text displayed per provider
Read: src/screens/ResultsScreen.tsx
Verify: provider.reasoning is passed to ProviderCard (showReasoning=true or equivalent).
FAIL if reasoning field is not displayed anywhere.

CHECK 8.3 — Intent summary card shows all 4 fields
Read: src/screens/ResultsScreen.tsx
Verify: response.intent.service_type, .location, .time_window, .language_detected
  are all rendered.
FAIL if any of these 4 is missing.

CHECK 8.4 — Language detected badge maps to readable label
Read: src/screens/ResultsScreen.tsx
Verify: 'roman_urdu' displays as "Roman Urdu" (not raw string "roman_urdu").
Verify: 'urdu' displays as "اردو" or "Urdu".
FAIL if raw snake_case string is shown to user.

CHECK 8.5 — Confidence badge on intent card
Read: src/screens/ResultsScreen.tsx
Verify: HIGH/MEDIUM/LOW confidence is derived from recommended.score
  (>=0.8=HIGH, >=0.6=MEDIUM, else=LOW).
FAIL if confidence badge is missing or hardcoded.

CHECK 8.6 — TraceAccordion rendered
Read: src/screens/ResultsScreen.tsx
Verify: TraceAccordion component is imported and rendered with trace data.
FAIL if TraceAccordion is absent.

CHECK 8.7 — Book Now navigates with full response
Read: src/screens/ResultsScreen.tsx
Verify: 'BookingConfirm' navigation call includes BOTH provider AND response.
FAIL if response is omitted from BookingConfirm params.
(BookingConfirmScreen needs response.followup for reminder time.)

CHECK 8.8 — "New Request" button exists
Read: src/screens/ResultsScreen.tsx
Verify: a button to go back to Request tab exists with store.clearCurrent().
FAIL if there is no way to start a new request from ResultsScreen.
```

---

## SECTION 9 — SCOREBAR + PROVIDERCARD

```
CHECK 9.1 — ScoreBar input is 0-1 float
Read: src/components/ScoreBar.tsx
Verify: props interface has score: number (0–1 range expected).
FAIL if internal logic multiplies score as if it is already a percentage.
(provider.score = 0.93 → display "93%" → multiply by 100 internally.)

CHECK 9.2 — ScoreBar color thresholds
Read: src/components/ScoreBar.tsx
Verify:
  score >= 0.8 → #0F9D58 (green)  ✓/✗
  score >= 0.6 → #F9AB00 (amber)  ✓/✗
  score <  0.6 → #D93025 (red)    ✓/✗
FAIL if thresholds differ.
FAIL if colors are hardcoded hex not matching Colors constants.

CHECK 9.3 — ScoreBar animates from 0 to score on mount
Read: src/components/ScoreBar.tsx
Verify: useSharedValue(0) initialized, withTiming to score used.
FAIL if bar is statically rendered at full width.

CHECK 9.4 — ProviderCard shows isRecommended styling
Read: src/components/ProviderCard.tsx
Verify: isRecommended prop causes gold border (#F9AB00) and "AI RECOMMENDS" badge.
FAIL if isRecommended prop has no visual effect.

CHECK 9.5 — ProviderCard avatar shows first letter
Read: src/components/ProviderCard.tsx
Verify: Avatar renders provider.name[0].toUpperCase() in a colored circle.
FAIL if avatar is a generic icon or image with no letter.

CHECK 9.6 — Both buttons wired to props
Read: src/components/ProviderCard.tsx
Verify: onBook prop is called by "Book Now" press.
Verify: onDetail prop is called by "Details" press.
FAIL if either button has no handler.
```

---

## SECTION 10 — BOOKINGCONFIRMSCREEN (15% of hackathon score)

```
CHECK 10.1 — ExecutionLogView is used (not static text)
Read: src/screens/BookingConfirmScreen.tsx
FAIL if booking steps are rendered as static Text elements.
FAIL if ExecutionLogView component is not imported.

CHECK 10.2 — Step content includes real data from response
Read: src/screens/BookingConfirmScreen.tsx
Verify the steps array built from real data includes:
  - response.booking.slot formatted as human-readable time ✓/✗
  - response.booking.confirmation_id ✓/✗
  - response.booking.provider (provider name) ✓/✗
  - response.followup.reminder_at formatted ✓/✗
FAIL if any of these 4 key pieces of data are hardcoded.

CHECK 10.3 — Booking persisted to store on mount
Read: src/screens/BookingConfirmScreen.tsx
Verify: addBooking() is called from a useEffect on mount.
FAIL if addBooking() is called only after animation completes
  (booking should be persisted immediately, animation is cosmetic).

CHECK 10.4 — Receipt card springs in after log completes
Read: src/screens/BookingConfirmScreen.tsx
Verify: BookingReceiptCard is hidden initially (opacity 0 or not rendered).
Verify: it appears after ExecutionLogView.onComplete fires.
Verify: spring animation (withSpring) used for entrance.
FAIL if receipt is visible immediately when screen mounts.

CHECK 10.5 — "Done" navigates to BookingDetail
Read: src/screens/BookingConfirmScreen.tsx
Verify: Done button navigates to 'BookingDetail' with confirmationId.
FAIL if Done navigates to MainTabs directly (skips BookingDetail).
```

---

## SECTION 11 — DISPUTESCREEN (15% of hackathon score)

```
CHECK 11.1 — 5 issue type chips present
Read: src/screens/DisputeScreen.tsx
Verify all 5 exist: No-show, Late Arrival, Quality Issue, Price Dispute, Other.
FAIL if fewer than 5 chips exist.

CHECK 11.2 — Submit disabled without selection
Read: src/screens/DisputeScreen.tsx
Verify: "Submit Report" button disabled prop is tied to selectedIssue being null.
FAIL if button is always enabled.

CHECK 11.3 — Resolution card shows real provider name
Read: src/screens/DisputeScreen.tsx
Verify: route.params.providerName is used in resolution card text.
FAIL if provider name is hardcoded (e.g. "the provider").

CHECK 11.4 — Confirmation ID in header
Read: src/screens/DisputeScreen.tsx
Verify: route.params.confirmationId is displayed in header/subheader.
FAIL if confirmation ID is not shown.

CHECK 11.5 — Resolution shows after 2s delay
Read: src/screens/DisputeScreen.tsx
Verify: setTimeout of ~2000ms between submit and resolution card appearing.
FAIL if resolution appears instantly on submit.

CHECK 11.6 — Escalate button shows Alert
Read: src/screens/DisputeScreen.tsx
Verify: "Escalate to Human Support" button calls Alert.alert().
FAIL if button has no handler.
```

---

## SECTION 12 — LOCATION + MAP PICKER

```
CHECK 12.1 — useUserLocation hook used in RequestScreen
Read: src/screens/RequestScreen.tsx
Verify: import of useUserLocation from features/map/hooks/useUserLocation.
FAIL if location is entirely hardcoded with no hook.

CHECK 12.2 — findNearestArea utility exists
Read: src/utils/findNearestArea.ts
FAIL if file does not exist.
Verify: haversineKm function exported from this file.
Verify: findNearestArea function exported from this file.
Verify: function accepts (lat: number, lng: number) and returns { area, lat, lng }.

CHECK 12.3 — Map picker modal uses React Native Modal (not navigation)
Read: src/screens/RequestScreen.tsx
Verify: <Modal visible={...} animationType="slide"> is used.
FAIL if a navigation.navigate('MapPicker') or similar screen push is used.

CHECK 12.4 — Map modal opens centered on Karachi
Read: src/screens/RequestScreen.tsx
Verify initialRegion in MapView:
  latitude: ~24.86 (Karachi range: 24.75–25.10)  ✓/✗
  longitude: ~67.01 (Karachi range: 66.85–67.25) ✓/✗
FAIL if initialRegion still has Islamabad coordinates (lat ~33.x, lng ~73.x).

CHECK 12.5 — Crosshair pattern used (not draggable marker)
Read: src/screens/RequestScreen.tsx
Verify: a centered overlay (crosshair/pin) is absolutely positioned in the modal.
Verify: onRegionChangeComplete on MapView updates pendingLocation.
FAIL if a draggable Marker is used instead.

CHECK 12.6 — Confirm saves exact GPS coords (not area center)
Read: src/screens/RequestScreen.tsx
Verify: on confirm, userLocation.lat and .lng are set from pendingLocation
  (the raw region coordinates), not from the nearest area's coordinates.
FAIL if lat/lng is snapped to area center on confirm.
```

---

## SECTION 13 — VOICE INPUT

```
CHECK 13.1 — Mic button does something visible on press
Read: src/screens/RequestScreen.tsx
Find the mic/voice button's onPress handler.
FAIL if onPress is empty, undefined, or console.log only.
FAIL if the button crashes on press.

CHECK 13.2 — Recording state shows visual feedback
Read: src/screens/RequestScreen.tsx
Verify: a visual change occurs while recording (color change, pulsing animation,
  or red indicator).
FAIL if mic button looks identical in idle and recording states.

CHECK 13.3 — Approach is documented in comment
Read: src/screens/RequestScreen.tsx
Verify: a comment at or near the voice implementation states which approach
  was used (A: voice library, B: WebView, or C: keyboard fallback / expo-av).
WARN if no approach comment exists.

CHECK 13.4 — No new packages installed for voice
Read: package.json
Verify: no new voice/speech package appears that was not in the original list.
FAIL if @react-native-voice/voice, expo-speech-recognition, or similar
  was added to package.json.
```

---

## SECTION 14 — BACKEND CHECKS

```
CHECK 14.1 — haversine_km function exists in tools.py
Read: backend/app/tools.py
FAIL if haversine_km function does not exist.
Verify formula uses: R=6371, math.radians, math.sin, math.cos, math.atan2.
FAIL if it uses a flat-earth approximation (abs difference of lat/lng).

CHECK 14.2 — haversine_km returns plausible values
Read: backend/app/tools.py
Manually evaluate the formula for:
  DHA Phase 6 (24.7920, 67.0645) to Gulshan Block 13 (24.9197, 67.1134)
Expected: between 14.0 and 15.5 km
FAIL if formula would return a value outside that range.

CHECK 14.3 — find_providers accepts user_lat and user_lng
Read: backend/app/tools.py
Verify: function signature includes user_lat: float, user_lng: float parameters.
FAIL if find_providers only accepts service_type and location (no coords).

CHECK 14.4 — find_providers uses haversine for distance (not fake lookup)
Read: backend/app/tools.py
FAIL if distance_km is set from a hardcoded dict or proximity bucket.
Verify: haversine_km(user_lat, user_lng, provider['lat'], provider['lng'])
  is called for each provider.

CHECK 14.5 — IntentParser output includes user coordinates
Read: backend/app/agents/intent.py
Find the ServiceIntent or equivalent output Pydantic model.
Verify: user_lat: float and user_lng: float fields exist.
FAIL if these fields are absent (coordinates can't reach ProviderFinder).

CHECK 14.6 — CORS middleware in api.py
Read: backend/app/api.py
Verify: CORSMiddleware is imported and added via app.add_middleware().
Verify: allow_origins includes "*" or the frontend URL.
FAIL if CORS middleware is absent (phone will fail to reach backend).

CHECK 14.7 — Gemini model configured (not GPT)
Read: backend/.env or backend/app/runtime.py (wherever model name is set)
Verify: model name contains "gemini" (not "gpt-4" or "gpt-4o").
Verify: OPENAI_BASE_URL is set to Google's endpoint:
  https://generativelanguage.googleapis.com/v1beta/openai/
FAIL if OpenAI GPT model names are still hardcoded.
WARN if model name is not gemini-2.0-flash (other Gemini models are fine but flag it).

CHECK 14.8 — Mock data providers have lat/lng fields
Read: backend/app/mock_data.py
Take 3 random providers. Verify each has:
  'lat': float  ✓/✗
  'lng': float  ✓/✗
FAIL if providers have no lat/lng (haversine can't work without them).

CHECK 14.9 — Backend response shape matches api-contract.md
Read: backend/app/schemas.py
Verify OrchestratorResponse (or equivalent) has these top-level fields:
  intent, top_providers, recommended, booking, followup, trace
FAIL if field names use camelCase (topProviders, confirmationId, reminderId).
FastAPI with Pydantic returns snake_case by default — verify no alias config
  breaks this.

CHECK 14.10 — All 5 agents registered in orchestrator
Read: backend/app/agents/orchestrator.py
Verify handoffs or sub-agent references exist for:
  IntentParser, ProviderFinder, Ranker, Booking, FollowUp
FAIL if any agent is missing from the orchestration chain.
```

---

## SECTION 15 — COLORS & STYLING COMPLIANCE

```
CHECK 15.1 — Colors constants file exists
Read: src/constants/colors.ts (or src/constants/Colors.ts)
FAIL if file does not exist.
Verify these specific values:
  primary:         '#1A73E8'  ✓/✗
  agentBlue:       '#4285F4'  ✓/✗
  success:         '#34A853'  ✓/✗
  warning:         '#FBBC04'  ✓/✗
  error:           '#EA4335'  ✓/✗
  scoreGreen:      '#0F9D58'  ✓/✗
  scoreAmber:      '#F9AB00'  ✓/✗
  scoreRed:        '#D93025'  ✓/✗
FAIL for each value that differs.

CHECK 15.2 — No hardcoded hex in screen/component files
Read: every .tsx file in src/screens/ and src/components/
FAIL if any hex color string appears directly in StyleSheet.create()
  or inline style that is NOT '#0D1117' (the one allowed background exception)
  or '#1C2333' (the card background, consistently used).
WARN if '#0D1117' appears more than twice in a single file (should use Colors constant).

CHECK 15.3 — No inline style objects with more than 2 properties
Read: all .tsx files in src/screens/ and src/components/
WARN if style={{ ... }} inline objects contain more than 2 properties.
FAIL if inline styles contain colors (colors must come from Colors constants).

CHECK 15.4 — StyleSheet.create() used in every component
Read: every .tsx file in src/screens/ and src/components/
FAIL if a file has JSX but no StyleSheet.create() call.
```

---

## SECTION 16 — STORE & PERSISTENCE

```
CHECK 16.1 — Zustand store uses correct zustand v5 syntax
Read: src/store/orchestratorStore.ts
Verify: import { create } from 'zustand' (not createStore).
FAIL if import is from 'zustand/vanilla' or uses deprecated API.

CHECK 16.2 — MMKV storage keys use servisai_ prefix
Read: src/lib/storage.ts
Verify: STORAGE_KEYS object includes:
  BOOKINGS: 'servisai_bookings'
  RECENT_REQUESTS: 'servisai_recent_requests'
  USER_LOCATION: 'servisai_user_location'
FAIL if keys still use 'karvaan_' prefix (will conflict with old app data).

CHECK 16.3 — addBooking persists to MMKV
Read: src/store/orchestratorStore.ts
Verify: addBooking action calls storage.set(STORAGE_KEYS.BOOKINGS, JSON.stringify(next)).
FAIL if addBooking only updates Zustand state without writing to MMKV.

CHECK 16.4 — bookings loaded from MMKV on store init
Read: src/store/orchestratorStore.ts
Verify: storage.getString(STORAGE_KEYS.BOOKINGS) called during store initialization.
FAIL if bookings start as empty array [] with no MMKV read.
```

---

## SECTION 17 — HACKATHON SCORING CHECKLIST

This section maps directly to judge criteria. Each item scores points.

```
ANTIGRAVITY INTEGRATION — 20%
  SA-01: AgentThinkingScreen animates all 5 named agents in sequence  ✓/✗
  SA-02: Real trace.steps summaries shown on step cards after API responds  ✓/✗
  SA-03: TraceAccordion on ResultsScreen shows all 5 trace steps  ✓/✗
  SA-04: Factor weights table (40/30/30) visible in accordion  ✓/✗

MATCHING & DECISION QUALITY — 25%
  MD-01: ScoreBar animates for all 3 provider cards  ✓/✗
  MD-02: provider.reasoning displayed verbatim per card  ✓/✗
  MD-03: Confidence badge (HIGH/MEDIUM/LOW) on intent card  ✓/✗
  MD-04: Recommended provider visually distinct (gold border + badge)  ✓/✗
  MD-05: Backend Ranker uses real Haversine distance in scoring  ✓/✗

MULTILINGUAL ROBUSTNESS — 15%
  ML-01: Typing "mujhe" triggers Roman Urdu chip in real time  ✓/✗
  ML-02: Arabic script input triggers Urdu chip  ✓/✗
  ML-03: language_detected shown in intent card on ResultsScreen  ✓/✗
  ML-04: Urdu text renders without garbled characters in TextInput  ✓/✗

SCHEDULING, PRICING, WORKFLOW — 15%
  SP-01: ExecutionLogView animates 7 steps at 400ms intervals  ✓/✗
  SP-02: Real confirmation_id shown in receipt card  ✓/✗
  SP-03: Real slot time formatted from ISO8601 in receipt  ✓/✗
  SP-04: Reminder time from followup.reminder_at shown in receipt  ✓/✗
  SP-05: Booking persists to MMKV (visible in My Bookings after app restart)  ✓/✗

DISPUTE HANDLING — 15%
  DH-01: DisputeScreen has 5 issue chips  ✓/✗
  DH-02: Resolution card names real provider from route param  ✓/✗
  DH-03: 2-second reviewing delay before resolution  ✓/✗
  DH-04: "Escalate to Human Support" button works  ✓/✗
  DH-05: DisputeScreen reachable from BookingDetail  ✓/✗

INNOVATION & UX — 10%
  IU-01: AgentThinkingScreen is dark (#0D1117) command-center aesthetic  ✓/✗
  IU-02: App boots to Request tab with zero login friction  ✓/✗
  IU-03: Real GPS location shown on RequestScreen location pill  ✓/✗
  IU-04: Map picker modal works and shows Karachi  ✓/✗
  IU-05: Voice button does something visible (not broken/empty)  ✓/✗
```

---

## STEP 4 — GENERATE THE AUDIT REPORT

Output the report in this exact format. No freeform text. No narrative paragraphs. Just the structured report.

```
═══════════════════════════════════════════════════
AUDIT REPORT — AI SERVICE ORCHESTRATOR
Date: [today]
Files Read: [count]
═══════════════════════════════════════════════════

SUMMARY
  ✅ PASS:          [N]
  ❌ FAIL:          [N]
  ⚠️  WARN:          [N]
  ➖ NOT FOUND:     [N]

═══════════════════════════════════════════════════
CRITICAL FAILURES — Fix before demo
(Any FAIL here means lost points on demo day)
═══════════════════════════════════════════════════

[For each ❌ FAIL:]
  CHECK [ID] — [Check name]
  File:     [exact file path]
  Line:     [line number if findable, else "—"]
  Problem:  [one sentence: what the code does]
  Fix:      [one sentence: what spec requires]

═══════════════════════════════════════════════════
WARNINGS — Fix before submission
═══════════════════════════════════════════════════

[For each ⚠️ WARN:]
  CHECK [ID] — [Check name]
  File:     [exact file path]
  Risk:     [one sentence: what can go wrong on demo day]
  Fix:      [one sentence: recommended action]

═══════════════════════════════════════════════════
NOT FOUND
═══════════════════════════════════════════════════

[For each ➖ NOT FOUND:]
  File/Item: [what was missing]
  Required:  [yes/no — is this blocking?]

═══════════════════════════════════════════════════
HACKATHON SCORE ESTIMATE
═══════════════════════════════════════════════════

  Antigravity Integration  (20%): [X]/20
  Matching & Decision      (25%): [X]/25
  Multilingual Robustness  (15%): [X]/15
  Scheduling & Workflow    (15%): [X]/15
  Dispute Handling         (15%): [X]/15
  Innovation & UX          (10%): [X]/10
  ─────────────────────────────────────
  TOTAL ESTIMATE:                [X]/100

  Score is based on SA/MD/ML/SP/DH/IU checks above.
  Each sub-check is worth (criterion weight / number of checks in that group).

═══════════════════════════════════════════════════
NEXT ACTION
═══════════════════════════════════════════════════

  [Exactly one of:]
  → "[N] critical failures found. Fix them in this order: [list check IDs by severity].
     Re-run this audit after fixes. Do not record demo video yet."
  
  → "Zero critical failures. [N] warnings remain.
     Recommend fixing warnings then recording demo video."
  
  → "Zero failures and zero warnings. System is demo-ready.
     Proceed to demo video recording."
```

---

## ABSOLUTE RULE

If there are **any ❌ FAIL** results, do not proceed to demo video recording. List the failures, fix them one by one (smallest change first), then re-run this entire audit prompt from the top.
