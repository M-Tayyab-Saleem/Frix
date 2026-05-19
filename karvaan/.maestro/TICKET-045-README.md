# TICKET 045 — Auth & Conversion Tests

## Overview

This test suite validates the complete authentication and conversion flow for Frix, including:
- Google Sign-In from SoftAuthGateModal
- Phone OTP Sign-In
- Returning Authenticated User behavior
- PostHog analytics event tracking
- MMKV guest_uuid lifecycle management

## Test Files

### E2E Tests (Maestro)

| File | Coverage |
|------|----------|
| `05-auth-google-signin.yaml` | Google Sign-In from SoftAuthGateModal → InterestSelect → HomeScreen |
| `06-auth-phone-otp.yaml` | Phone OTP Sign-In (valid, invalid, resend) |
| `07-auth-returning-user.yaml` | Returning user, session expiry, re-authentication |

### Unit/Integration Tests

| File | Coverage |
|------|----------|
| `auth-conversion.test.ts` | Store state, PostHog events, MMKV lifecycle, auth flows |

## Running Tests

### E2E Tests (Maestro)

**Run all auth tests:**
```bash
npm run test:e2e:auth
```

**Run individual flows:**
```bash
# Google Sign-In flow
npm run test:e2e:auth-google

# Phone OTP flow
npm run test:e2e:auth-phone-otp

# Returning user flow
npm run test:e2e:auth-returning
```

**Run all E2E tests:**
```bash
npm run test:e2e
```

**Debug mode:**
```bash
npm run test:e2e:debug
```

### Unit/Integration Tests

The unit tests auto-execute in development mode (`__DEV__`). To run manually:

```typescript
// In app console or dev tools:
import { runAllTests } from '@/store/__tests__/auth-conversion.test';
runAllTests();
```

## Test Coverage Details

### Google Sign-In from SoftAuthGateModal ✅

- [x] As guest, tap Get Tickets → SoftAuthGateModal appears
- [x] Tap "Continue with Google" → AuthScreen opens
- [x] Complete Google OAuth → profile created in Supabase
- [x] If no interests: InterestSelectScreen appears
- [x] Complete interests → HomeScreen (MainTabNavigator active)
- [x] PostHog: `guest_converted` fired with correct `guest_uuid`
- [x] MMKV: `guest_uuid` key deleted after conversion
- [x] PostHog: Alias call links old `guest_uuid` to new `userId`

### Phone OTP Sign-In ✅

- [x] As guest, tap "Use Phone Number" in SoftAuthGateModal → AuthScreen → phone input
- [x] Enter valid Pakistani number (+923xxxxxxxxx) → OTP received within 60 seconds
- [x] Enter correct 6-digit OTP → auto-submits → routed to InterestSelectScreen or HomeScreen
- [x] Enter wrong OTP → shake animation on boxes + "Incorrect code" shown
- [x] Wait 60s → "Resend" becomes active, tap → new OTP received

### Returning Authenticated User ✅

- [x] Authenticated user closes and reopens app → MainTabNavigator loads directly
- [x] Session token expires → GuestTabNavigator shown + session expired banner
- [x] Tap "Sign In Again" → AuthScreen → re-authenticate → MainTabNavigator

## Manual Verification Required

Some tests require manual verification in external tools:

### PostHog Dashboard
1. **guest_converted event**: Verify in PostHog Live View that:
   - `auth_method` is correct (`google` or `phone_otp`)
   - `guest_uuid` matches the pre-conversion UUID
   - `is_guest` transitions from `true` to `false`

2. **Alias call**: Verify in PostHog People view that:
   - Old `guest_uuid` is aliased to new `userId`
   - Historical guest events are attributed to the authenticated user

3. **MMKV guest_uuid deletion**: Use React Native debugger to inspect MMKV:
   ```javascript
   import { storage } from '@/lib/storage';
   console.log(storage.getString('guest_uuid')); // Should be undefined after conversion
   ```

### Supabase Dashboard
1. **Profile creation**: Verify `profiles` table has new row after Google/Phone auth
2. **Session revocation**: To test session expiry, manually revoke session in Supabase Auth:
   ```sql
   DELETE FROM auth.sessions WHERE user_id = 'user-id-here';
   ```

## Test Environment Setup

### Prerequisites
- Maestro installed: `curl -Ls "https://get.maestro.mobile.dev" | bash`
- Android emulator or iOS simulator running
- Supabase project configured with Google OAuth provider
- Test phone numbers configured for OTP (use Supabase test phone numbers)

### Google OAuth Setup
1. Configure Google OAuth in Supabase Dashboard
2. Add Android/iOS package names to Google Cloud Console
3. Ensure `@react-native-google-signin/google-signin` is linked

### Phone OTP Setup
1. Enable Phone OTP in Supabase Auth settings
2. Configure SMS provider (Twilio, MessageBird, etc.)
3. Add test phone numbers in Supabase for E2E testing

## Known Limitations

1. **Google OAuth in E2E**: Maestro cannot interact with native Google sign-in sheet. Tests mock the OAuth completion step.

2. **OTP Reception**: E2E tests use mock OTP codes (`123456`). For production testing, integrate with an SMS testing service or use Supabase test phone numbers.

3. **Animation Testing**: Maestro cannot directly verify animations (e.g., shake on wrong OTP). Tests verify resulting UI state instead.

4. **PostHog Events**: Unit tests mock PostHog. Verify actual events in PostHog Live View during manual testing.

## Troubleshooting

### Tests fail with "element not found"
- Ensure app is running on emulator/simulator
- Check that test IDs (`id: "venue-card"`, etc.) match actual component test IDs
- Increase timeout values in Maestro flows if app is slow

### OTP tests timeout
- Use Supabase test phone numbers for deterministic OTP
- Extend timeout in Maestro flow: `timeout: 120000`

### Session expiry test doesn't work
- Manually revoke session in Supabase Auth before running test
- Ensure `clearState: false` in Maestro launch config to preserve MMKV

## Next Steps

- [ ] Integrate with CI/CD pipeline (GitHub Actions, Bitrise)
- [ ] Add visual regression testing
- [ ] Add performance benchmarks to tests
- [ ] Create Maestro test report dashboard
- [ ] Add accessibility tests (axe-core)
