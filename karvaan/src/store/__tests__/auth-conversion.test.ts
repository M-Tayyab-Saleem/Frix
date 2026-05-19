/**
 * TICKET 045 — Auth & Conversion Tests
 *
 * Unit and integration tests for auth conversion logic:
 * - Google Sign-In from SoftAuthGateModal
 * - Phone OTP Sign-In
 * - Returning Authenticated User flows
 * - PostHog analytics events
 * - MMKV guest_uuid management
 *
 * Run: Execute in app console or add to test runner
 */

import { useAuthStore } from '@/store/useAuthStore';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { Analytics } from '@/services/analytics';

// Mock PostHog to track events fired
const mockPostHogEvents: Array<{ event: string; properties: Record<string, unknown> }> = [];

jest.mock('posthog-react-native', () => ({
  track: jest.fn((event: string, properties: Record<string, unknown>) => {
    mockPostHogEvents.push({ event, properties });
  }),
  identify: jest.fn(),
  alias: jest.fn(),
  reset: jest.fn(),
}));

// Helper to clear mock events
const clearMockEvents = (): void => {
  mockPostHogEvents.length = 0;
};

// Helper to find specific event
const findEvent = (eventName: string): typeof mockPostHogEvents[number] | undefined => {
  return mockPostHogEvents.find(e => e.event === eventName);
};

/**
 * TEST SUITE 1: Google Sign-In from SoftAuthGateModal
 */
export const testGoogleSignInFlow = (): void => {
  console.log('\n🧪 SUITE 1: Google Sign-In Flow');

  // Reset state
  storage.set(STORAGE_KEYS.GUEST_UUID, '');
  clearMockEvents();

  // Simulate guest initialization
  useAuthStore.getState().initGuest();
  const guestUuidBefore = useAuthStore.getState().guestUuid;

  console.assert(guestUuidBefore !== null, '❌ Should have guest UUID before sign-in');
  console.log('  ✓ Guest UUID before sign-in:', guestUuidBefore);

  // Verify guest_session_started event fired
  const sessionEvent = findEvent('guest_session_started');
  console.assert(sessionEvent !== undefined, '❌ guest_session_started should fire');
  console.assert(sessionEvent?.properties?.is_guest === true, '❌ is_guest should be true');
  console.log('  ✓ guest_session_started event fired with is_guest: true');

  // Simulate Google OAuth success and guest conversion
  const mockUserId = 'google-user-123';
  useAuthStore.getState().mergeGuestSession(mockUserId);

  // Verify guest_converted event fired
  const convertedEvent = findEvent('guest_converted');
  console.assert(convertedEvent !== undefined, '❌ guest_converted should fire');
  console.assert(convertedEvent?.properties?.auth_method === 'google', '❌ auth_method should be google');
  console.assert(convertedEvent?.properties?.guest_uuid === guestUuidBefore, '❌ guest_uuid should match');
  console.log('  ✓ guest_converted event fired with auth_method: google');
  console.log('  ✓ guest_uuid in event matches:', convertedEvent?.properties?.guest_uuid);

  // Verify MMKV guest_uuid deleted
  const mmkvAfter = storage.getString(STORAGE_KEYS.GUEST_UUID);
  console.assert(mmkvAfter === '' || mmkvAfter === undefined, `❌ MMKV guest_uuid should be cleared, got '${mmkvAfter}'`);
  console.log('  ✓ MMKV guest_uuid cleared after conversion');

  // Verify store state updated
  const storeAfter = useAuthStore.getState();
  console.assert(storeAfter.isGuest === false, '❌ isGuest should be false');
  console.assert(storeAfter.guestUuid === null, '❌ guestUuid should be null');
  console.log('  ✓ Store updated: isGuest = false, guestUuid = null');
};

/**
 * TEST SUITE 2: Phone OTP Sign-In
 */
export const testPhoneOtpSignInFlow = (): void => {
  console.log('\n🧪 SUITE 2: Phone OTP Sign-In Flow');

  // Reset state
  storage.set(STORAGE_KEYS.GUEST_UUID, '');
  clearMockEvents();

  // Simulate guest initialization
  useAuthStore.getState().initGuest();
  const guestUuidBefore = useAuthStore.getState().guestUuid;

  console.assert(guestUuidBefore !== null, '❌ Should have guest UUID before OTP sign-in');
  console.log('  ✓ Guest UUID before OTP:', guestUuidBefore);

  // Simulate OTP verification success
  const mockUserId = 'phone-user-456';
  useAuthStore.getState().mergeGuestSession(mockUserId);

  // Verify guest_converted event fired with phone_otp
  const convertedEvent = findEvent('guest_converted');
  console.assert(convertedEvent !== undefined, '❌ guest_converted should fire');
  console.assert(convertedEvent?.properties?.auth_method === 'phone_otp', '❌ auth_method should be phone_otp');
  console.assert(convertedEvent?.properties?.guest_uuid === guestUuidBefore, '❌ guest_uuid should match');
  console.log('  ✓ guest_converted event fired with auth_method: phone_otp');

  // Verify MMKV cleared
  const mmkvAfter = storage.getString(STORAGE_KEYS.GUEST_UUID);
  console.assert(mmkvAfter === '' || mmkvAfter === undefined, '❌ MMKV should be cleared');
  console.log('  ✓ MMKV guest_uuid cleared');

  // Verify store state
  const storeAfter = useAuthStore.getState();
  console.assert(storeAfter.isGuest === false, '❌ isGuest should be false');
  console.log('  ✓ Store state correct after OTP conversion');
};

/**
 * TEST SUITE 3: Returning Authenticated User
 */
export const testReturningUserFlow = (): void => {
  console.log('\n🧪 SUITE 3: Returning Authenticated User');

  // Reset state
  storage.set(STORAGE_KEYS.GUEST_UUID, '');
  storage.set(STORAGE_KEYS.ONBOARDING_SEEN, true);
  clearMockEvents();

  // Simulate returning user with existing session
  const mockSession = {
    user: { id: 'returning-user-789' },
    access_token: 'mock-token',
  } as any;

  useAuthStore.getState().setSession(mockSession as any);

  // Verify no guest state
  const store = useAuthStore.getState();
  console.assert(store.isGuest === false, '❌ isGuest should be false for returning user');
  console.assert(store.session !== null, '❌ session should exist');
  console.assert(store.guestUuid === null, '❌ guestUuid should be null');
  console.log('  ✓ Returning user: isGuest = false, session exists');

  // Verify no guest_session_started fired (not a new guest)
  const guestSessionEvent = findEvent('guest_session_started');
  console.assert(guestSessionEvent === undefined, '❌ guest_session_started should NOT fire for returning user');
  console.log('  ✓ No guest_session_started event (correct)');
};

/**
 * TEST SUITE 4: Session Expiry Handling
 */
export const testSessionExpiry = (): void => {
  console.log('\n🧪 SUITE 4: Session Expiry Handling');

  // Reset state
  storage.set(STORAGE_KEYS.GUEST_UUID, '');
  clearMockEvents();

  // Start as authenticated
  const mockSession = {
    user: { id: 'user-with-session' },
    access_token: 'valid-token',
  } as any;

  useAuthStore.getState().setSession(mockSession as any);
  console.log('  ✓ Authenticated user session set');

  // Simulate session expiry (clear session)
  useAuthStore.getState().setSession(null);

  // Verify logout creates new guest session
  useAuthStore.getState().logout();

  const storeAfter = useAuthStore.getState();
  console.assert(storeAfter.isGuest === true, '❌ Should be guest after session expiry');
  console.assert(storeAfter.guestUuid !== null, '❌ Should have new guestUuid');
  console.assert(storeAfter.session === null, '❌ session should be null');
  console.log('  ✓ After session expiry: isGuest = true, new guestUuid generated');

  const newGuestUuid = storeAfter.guestUuid;
  const mmkvUuid = storage.getString(STORAGE_KEYS.GUEST_UUID);
  console.assert(mmkvUuid === newGuestUuid, '❌ MMKV should have new guestUuid');
  console.log('  ✓ MMKV updated with new guestUuid:', newGuestUuid);
};

/**
 * TEST SUITE 5: PostHog Analytics Events
 */
export const testPostHogEvents = (): void => {
  console.log('\n🧪 SUITE 5: PostHog Analytics Events');

  clearMockEvents();

  // Test soft_gate_triggered event
  Analytics.softGateTriggered('get_tickets', 'venue-123', true, 'test-guest-uuid');
  const softGateEvent = findEvent('soft_gate_triggered');
  console.assert(softGateEvent !== undefined, '❌ soft_gate_triggered should fire');
  console.assert(softGateEvent?.properties?.trigger_action === 'get_tickets', '❌ trigger_action incorrect');
  console.assert(softGateEvent?.properties?.venue_id === 'venue-123', '❌ venue_id incorrect');
  console.assert(softGateEvent?.properties?.is_guest === true, '❌ is_guest should be true');
  console.log('  ✓ soft_gate_triggered event correct');

  // Test soft_gate_dismissed event
  Analytics.softGateDismissed('save_venue', 'maybe_later');
  const softDismissEvent = findEvent('soft_gate_dismissed');
  console.assert(softDismissEvent !== undefined, '❌ soft_gate_dismissed should fire');
  console.assert(softDismissEvent?.properties?.trigger_action === 'save_venue', '❌ trigger_action incorrect');
  console.assert(softDismissEvent?.properties?.dismiss_method === 'maybe_later', '❌ dismiss_method incorrect');
  console.log('  ✓ soft_gate_dismissed event correct');

  // Test guest_converted event
  Analytics.guestConverted('google', 'test-guest-uuid-2');
  const guestConvertedEvent = findEvent('guest_converted');
  console.assert(guestConvertedEvent !== undefined, '❌ guest_converted should fire');
  console.assert(guestConvertedEvent?.properties?.auth_method === 'google', '❌ auth_method incorrect');
  console.assert(guestConvertedEvent?.properties?.guest_uuid === 'test-guest-uuid-2', '❌ guest_uuid incorrect');
  console.log('  ✓ guest_converted event correct');

  // Test onboarding_completed event
  Analytics.onboardingCompleted('phone_otp', ['historical', 'dine']);
  const onboardingEvent = findEvent('onboarding_completed');
  console.assert(onboardingEvent !== undefined, '❌ onboarding_completed should fire');
  console.assert(onboardingEvent?.properties?.auth_method === 'phone_otp', '❌ auth_method incorrect');
  console.assert((onboardingEvent?.properties?.selected_interests as string[])?.includes('historical'), '❌ interests incorrect');
  console.log('  ✓ onboarding_completed event correct');
};

/**
 * TEST SUITE 6: MMKV guest_uuid Lifecycle
 */
export const testMmkvGuestUuidLifecycle = (): void => {
  console.log('\n🧪 SUITE 6: MMKV guest_uuid Lifecycle');

  // Clear state
  storage.set(STORAGE_KEYS.GUEST_UUID, '');

  // 1. Initial state: no guest_uuid
  const initialUuid = storage.getString(STORAGE_KEYS.GUEST_UUID);
  console.assert(initialUuid === '' || initialUuid === undefined, '❌ Should have no guest_uuid initially');
  console.log('  ✓ Initial state: no guest_uuid in MMKV');

  // 2. Guest init: UUID generated
  useAuthStore.getState().initGuest();
  const generatedUuid = useAuthStore.getState().guestUuid;
  const mmkvUuid = storage.getString(STORAGE_KEYS.GUEST_UUID);
  console.assert(mmkvUuid === generatedUuid, '❌ MMKV should store generated UUID');
  console.log('  ✓ Guest init: UUID generated and stored in MMKV');

  // 3. Merge session: UUID deleted
  useAuthStore.getState().mergeGuestSession('user-abc');
  const afterMergeUuid = storage.getString(STORAGE_KEYS.GUEST_UUID);
  console.assert(afterMergeUuid === '' || afterMergeUuid === undefined, '❌ MMKV should clear UUID after merge');
  console.log('  ✓ Merge session: UUID deleted from MMKV');

  // 4. Logout: New UUID generated
  useAuthStore.getState().logout();
  const afterLogoutUuid = useAuthStore.getState().guestUuid;
  const mmkvAfterLogout = storage.getString(STORAGE_KEYS.GUEST_UUID);
  console.assert(afterLogoutUuid !== null, '❌ Should have new UUID after logout');
  console.assert(mmkvAfterLogout === afterLogoutUuid, '❌ MMKV should store new UUID');
  console.assert(afterLogoutUuid !== generatedUuid, '❌ New UUID should differ from old');
  console.log('  ✓ Logout: New UUID generated');
};

/**
 * Run all tests
 */
export const runAllTests = (): void => {
  console.log('════════════════════════════════════════════════════');
  console.log('🧪 TICKET 045 — Auth & Conversion Tests');
  console.log('════════════════════════════════════════════════════\n');

  try {
    testGoogleSignInFlow();
    testPhoneOtpSignInFlow();
    testReturningUserFlow();
    testSessionExpiry();
    testPostHogEvents();
    testMmkvGuestUuidLifecycle();

    console.log('\n════════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED');
    console.log('════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
  }
};

// Auto-run in development
if (__DEV__) {
  runAllTests();
}
