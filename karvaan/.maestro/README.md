# Frix E2E Tests — Maestro

This directory contains end-to-end tests for the Frix app using [Maestro](https://maestro.mobile.dev/).

## Structure

```
.maestro/
├── config.yaml                    # Maestro configuration
└── flows/                         # Test flow files
    ├── 01-guest-cold-launch.yaml  # Guest cold launch tests (4 tests)
    ├── 02-guest-browsing.yaml     # Guest browsing tests (7 tests)
    ├── 03-guest-soft-gate.yaml    # Soft gate tests (6 tests)
    └── 04-guest-deep-link.yaml    # Deep link tests (3 tests)
```

## Test Coverage

### 01-guest-cold-launch.yaml
Tests the guest cold launch flow:
- ✅ SplashScreen → OnboardingScreen (3 slides visible)
- ✅ Skip onboarding → GuestTabNavigator (Explore tab active)
- ✅ Returning guest → GuestTabNavigator directly (no onboarding)
- ✅ UUID persistence across app restarts

### 02-guest-browsing.yaml
Tests guest browsing capabilities:
- ✅ Explore tab → venue list loads without sign-in
- ✅ Map tab → map renders with pins, no sign-in
- ✅ Search tab → search works, results appear
- ✅ Home tab → GuestHomeScreen renders (NOT blank)
- ✅ Venue detail → all content visible (images, notes, hours, map)
- ✅ Share button → WhatsApp sheet appears (no gate)
- ✅ Scroll venue detail → no forced sign-in

### 03-guest-soft-gate.yaml
Tests the soft gate modal:
- ✅ Get Tickets → SoftAuthGateModal appears
- ✅ "Maybe later" → modal closes, user stays on screen
- ✅ Bookmark icon → SoftAuthGateModal appears
- ✅ Bookmark dismiss → icon stays outline (not filled)
- ✅ Backdrop tap → modal closes
- ✅ Trigger 3 times → modal appears each time (no rate limiting)

### 04-guest-deep-link.yaml
Tests deep link resolution:
- ✅ Android: `frix://venue/:id` → VenueDetailScreen (NOT AuthScreen)
- ✅ iOS: Notes app deep link → same result
- ✅ Cold start: close app → open deep link → VenueDetailScreen
- ✅ Explore link: `frix://explore` → ExploreScreen

## Quick Start

### 1. Install Maestro
```bash
# macOS
curl -Ls "https://get.maestro.mobile.dev" | bash

# Windows
# Download from: https://github.com/mobile-dev-inc/maestro/releases
```

### 2. Run App on Emulator/Device
```bash
npm run android
# or
npm run ios
```

### 3. Run Tests
```bash
# Run all tests
npm run test:e2e

# Run specific suite
npm run test:e2e:cold-launch
npm run test:e2e:browsing
npm run test:e2e:soft-gate
npm run test:e2e:deep-link

# Run with debug output
npm run test:e2e:debug

# Generate JUnit report
npm run test:e2e:report
```

### Windows Users
Use the batch script:
```cmd
scripts\test-e2e.bat
```

## Required Component TestIDs

For tests to work, components must have these `testID` values:

| Component | testID | File |
|-----------|--------|------|
| SplashScreen Logo | `splash-screen-logo` | `SplashScreen.tsx` |
| Explore Screen | `explore-screen` | `ExploreScreen.tsx` |
| Venue List | `venue-list` | `ExploreScreen.tsx` |
| Venue Card | `venue-card` | `VenueCard.tsx` |
| Map Screen | `map-screen` | `MapScreen.tsx` |
| Map Pin | `map-pin` | `MapScreen.tsx` |
| Search Screen | `search-screen` | `SearchScreen.tsx` |
| Search Input | `search-input` | `SearchScreen.tsx` |
| Search Results | `search-results` | `SearchScreen.tsx` |
| Guest Home Screen | `guest-home-screen` | `GuestHomeScreen.tsx` |
| Tab: Home | `tab-home` | `GuestTabNavigator.tsx` |
| Tab: Map | `tab-map` | `GuestTabNavigator.tsx` |
| Tab: Search | `tab-search` | `GuestTabNavigator.tsx` |
| Venue Detail Screen | `venue-detail-screen` | `VenueDetailScreen.tsx` |
| Venue Hero Image | `venue-hero-image` | `VenueDetailScreen.tsx` |
| Venue Name | `venue-name` | `VenueDetailScreen.tsx` |
| Frix Notes | `frix-notes` | `VenueDetailScreen.tsx` |
| Operating Hours | `operating-hours` | `VenueDetailScreen.tsx` |
| Venue Map | `venue-map` | `VenueDetailScreen.tsx` |
| Share Button | `share-button` | `VenueDetailScreen.tsx` |
| Get Tickets Button | `get-tickets-button` | `VenueDetailScreen.tsx` |
| Bookmark Button | `bookmark-button` | `VenueDetailScreen.tsx` |
| Bookmark Button (outline) | `bookmark-button-outline` | `VenueDetailScreen.tsx` |
| Soft Auth Gate Modal | `soft-auth-gate-modal` | `SoftAuthGateModal.tsx` |
| WhatsApp Share Sheet | `whatsapp-share-sheet` | External (system) |
| Category Filter Chips | `category-filter-chips` | `ExploreScreen.tsx` |
| Auth Screen | `auth-screen` | `AuthScreen.tsx` |

## PostHog Verification

Maestro cannot verify PostHog events automatically. After running tests, manually check PostHog:

1. Open https://app.posthog.com
2. Go to Live View
3. Verify events fired (see `docs/TICKET-044-POSTHOG-VERIFICATION.md`)

### Required Events
- `guest_session_started` with `is_guest: true` and `guest_uuid`
- `soft_gate_triggered` × N triggers
- `soft_gate_dismissed` × N dismissals
- `venue_viewed` with `source_tab: 'deep_link'` for deep link tests

## Troubleshooting

### "Element not found" errors
- Ensure app is running on emulator/device before running tests
- Check component has correct `testID` prop
- Increase timeout in YAML if component loads slowly

### "App not installed" errors
- Verify `appId: com.frix.app` in YAML matches `app.json`
- Ensure app bundle ID is correct

### Deep link tests fail
- Verify `scheme: "frix"` in `app.json`
- For cold start tests, manually kill app before opening link

### Maestro can't find elements
- Check component has `testID` prop (not `accessibilityLabel`)
- Ensure component is visible on screen when assertion runs
- Add `waitForAnimationToEnd` before assertions if animations interfere

## Documentation

- [TICKET 044 E2E Tests](../../docs/TICKET-044-E2E-TESTS.md) — Full test documentation
- [TICKET 044 Test Checklist](../../docs/TICKET-044-TEST-CHECKLIST.md) — Manual testing checklist
- [TICKET 044 PostHog Verification](../../docs/TICKET-044-POSTHOG-VERIFICATION.md) — PostHog verification guide
- [Maestro Official Docs](https://maestro.mobile.dev/) — Maestro documentation
