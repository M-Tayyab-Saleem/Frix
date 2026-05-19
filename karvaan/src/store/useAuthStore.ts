// src/store/useAuthStore.ts
/**
 * Auth state management for Frix's three-state authentication model.
 * 
 * States:
 * - Loading: Initial app launch, checking for existing session
 * - Guest: No Supabase session, browsing with guest_uuid for analytics
 * - Authenticated: Valid Supabase session, full access to features
 * 
 * Guest UUID is generated once on first cold launch and NEVER regenerated.
 * On authentication, guest session is merged via PostHog.alias().
 * 
 * @example
 * ```tsx
 * const { session, isGuest, guestUuid, isLoading } = useAuthStore();
 * 
 * if (isLoading) return <SplashScreen />;
 * if (isGuest) return <GuestTabNavigator />;
 * if (session) return <MainTabNavigator />;
 * ```
 */
import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { posthog, mergeGuestSession as posthogMerge } from '@/lib/analytics';
import { Analytics } from '@/services/analytics';

/**
 * AuthState interface for the v5 authentication model.
 *
 * v5 user states:
 * - Loading: Initial app launch, checking for existing session
 * - Authenticated: Valid Supabase session, full access to MainTabNavigator
 * - ShareLinkGuest: No session, arrived via frix://venue/:id deep link
 *   → Only VenueDetailScreen visible; other nav shows SoftAuthGateModal
 * - Unauthenticated: No session, no deep link → AuthStack (Onboarding → Auth)
 */
export interface AuthState {
  /** Current Supabase session (null if not authenticated) */
  session: Session | null;
  /** Whether the user is browsing as a guest (legacy — kept for analytics) */
  isGuest: boolean;
  /** Persistent guest UUID for analytics tracking (null if authenticated) */
  guestUuid: string | null;
  /** Whether auth state is still being determined */
  isLoading: boolean;
  /** Whether the user has completed onboarding (from MMKV) */
  hasSeenOnboarding: boolean;
  /** Tracks explicit user-initiated sign out to avoid session-expiry prompts */
  signOutIntent: boolean;
  /**
   * [v5] True when user arrived via a share link (frix://venue/:id) without a session.
   * When true, ShareLinkNavigator is rendered — only VenueDetailScreen is accessible.
   * Tapping anything else shows SoftAuthGateModal.
   */
  isShareLinkGuest: boolean;

  /**
   * Initialize the auth state, restoring session or guest UUID from storage.
   * Called once on app launch by RootNavigator.
   * @param session - Supabase session from getSession(), or null
   */
  initialize: (session: Session | null) => Promise<void>;

  /**
   * Initialize guest mode (idempotent - never regenerates existing guest_uuid).
   * Called when no authenticated session exists.
   */
  initGuest: () => Promise<void>;

  /**
   * Explicitly set the session (e.g., after login/sign-up).
   * @param session - New Supabase session, or null to logout
   */
  setSession: (session: Session | null) => void;

  /**
   * Merges guest session with a registered user and clears guest_uuid.
   * Called after successful authentication to preserve analytics continuity.
   * @param userId - New Supabase user ID
   */
  mergeGuestSession: (userId: string) => void;

  /**
   * Resets the store to guest state (e.g., after logout).
   * Generates a new guest UUID for the new anonymous session.
   */
  logout: () => void;

  /**
   * Mark onboarding as completed.
   * Sets MMKV 'hasSeenOnboarding' = true and updates store state.
   */
  completeOnboarding: () => void;

  /**
   * Marks an explicit sign-out flow before calling supabase.auth.signOut().
   */
  markSignOutIntent: () => void;
  /**
   * Reads and clears sign-out intent in a single call.
   */
  consumeSignOutIntent: () => boolean;
  /**
   * [v5] Mark this session as a share-link guest (arrived via frix://venue/:id).
   * @param venueId - The venue ID from the deep link, stored for navigation
   */
  setShareLinkGuest: (venueId: string) => void;
  /** [v5] The venue ID from the share link (if isShareLinkGuest is true) */
  shareLinkVenueId: string | null;
  /** [v5] True when authenticated user must complete onboarding quiz before main app */
  requiresOnboardingQuiz: boolean;
  /** Sets onboarding quiz requirement for current authenticated session */
  setRequiresOnboardingQuiz: (required: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isGuest: false,
  isShareLinkGuest: false,
  shareLinkVenueId: null,
  requiresOnboardingQuiz: false,
  guestUuid: null,
  isLoading: true,
  hasSeenOnboarding: storage.getBoolean(STORAGE_KEYS.ONBOARDING_SEEN) ?? false,
  signOutIntent: false,

  /**
   * Initialize auth state from Supabase session or guest mode.
   * This is the primary entry point called by RootNavigator on app launch.
   */
  initialize: async (initialSession: Session | null): Promise<void> => {
    set({ isLoading: true });

    if (initialSession) {
      // User has an existing authenticated session
      set({
        session: initialSession,
        isGuest: false,
        isShareLinkGuest: false,
        shareLinkVenueId: null,
        requiresOnboardingQuiz: false,
        guestUuid: null,
        isLoading: false,
        signOutIntent: false,
      });
      posthog.identify(initialSession.user.id);
      return;
    }

    // No session — initialize as guest
    await get().initGuest();
  },

  /**
   * Initialize guest mode. Idempotent — never regenerates an existing guest_uuid.
   * If guest_uuid already exists in MMKV, it is restored (not regenerated).
   */
  initGuest: async (): Promise<void> => {
    // Check for existing guest UUID in MMKV (idempotent — never regenerate if exists)
    let guestUuid = storage.getString(STORAGE_KEYS.GUEST_UUID);
    const isFirstLaunch = !guestUuid;

    if (!guestUuid) {
      // New guest session — generate UUID once
      guestUuid = uuidv4();
      storage.set(STORAGE_KEYS.GUEST_UUID, guestUuid);
    }

    set({
      session: null,
      isGuest: true,
        isShareLinkGuest: false,
        shareLinkVenueId: null,
        requiresOnboardingQuiz: false,
        guestUuid,
        isLoading: false,
        signOutIntent: false,
    });

    // Identify guest in PostHog for analytics tracking
    posthog.identify(guestUuid, { is_guest: true });

    // Fire guest_session_started analytics event on first launch
    if (isFirstLaunch) {
      Analytics.guestSessionStarted('cold_launch');
    }
  },

  /**
   * Set or update the Supabase session.
   * If session is null, transitions to guest mode via logout().
   */
  setSession: (session: Session | null): void => {
    if (session) {
      set({
        session,
        isGuest: false,
        isShareLinkGuest: false,
        shareLinkVenueId: null,
        requiresOnboardingQuiz: false,
        guestUuid: null,
        isLoading: false,
        signOutIntent: false,
      });
      posthog.identify(session.user.id);
    } else {
      get().logout();
    }
  },

  /**
   * Merge guest session with newly authenticated user.
   * This preserves analytics data continuity by aliasing guest_uuid to user_id.
   * After merging, guest_uuid is cleared from MMKV and will be regenerated on logout.
   */
  mergeGuestSession: (userId: string): void => {
    const { guestUuid } = get();
    
    if (guestUuid) {
      // 1. Tell PostHog to merge the anonymous guest data with the new user ID
      posthogMerge(guestUuid, userId);

      // 2. Clear guest UUID from MMKV — it should never be used again for this user
      storage.set(STORAGE_KEYS.GUEST_UUID, '');
    }

    set({
      isGuest: false,
      guestUuid: null,
      requiresOnboardingQuiz: false,
    });
  },

  /**
   * Logout and transition to guest mode.
   * Generates a NEW guest UUID for the anonymous session (different from previous one).
   */
  logout: (): void => {
    // Generate a new guest UUID for the post-logout anonymous session
    const newGuestUuid = uuidv4();
    storage.set(STORAGE_KEYS.GUEST_UUID, newGuestUuid);

    set({
      session: null,
      isGuest: true,
      isShareLinkGuest: false,
      shareLinkVenueId: null,
      requiresOnboardingQuiz: false,
      guestUuid: newGuestUuid,
      isLoading: false,
      signOutIntent: false,
    });

    // Reset PostHog identity and identify as new guest
    posthog.reset();
    posthog.identify(newGuestUuid, { is_guest: true });
  },

  /**
   * Mark onboarding as completed.
   * Sets MMKV 'hasSeenOnboarding' = true and updates store state.
   */
  completeOnboarding: (): void => {
    storage.set(STORAGE_KEYS.ONBOARDING_SEEN, true);
    set({ hasSeenOnboarding: true });
  },

  markSignOutIntent: (): void => {
    set({ signOutIntent: true });
  },
  consumeSignOutIntent: (): boolean => {
    const hadIntent = get().signOutIntent;
    if (hadIntent) {
      set({ signOutIntent: false });
    }
    return hadIntent;
  },

  /**
   * [v5] Activate share-link guest mode.
   * Called by RootNavigator when app opens via frix://venue/:id without a session.
   * This prevents the auth stack from showing; only the venue detail is accessible.
   */
  setShareLinkGuest: (venueId: string): void => {
    let guestUuid = storage.getString(STORAGE_KEYS.GUEST_UUID);
    if (!guestUuid) {
      guestUuid = uuidv4();
      storage.set(STORAGE_KEYS.GUEST_UUID, guestUuid);
    }
    set({
      session: null,
      isShareLinkGuest: true,
      shareLinkVenueId: venueId,
      requiresOnboardingQuiz: false,
      isGuest: true,
      guestUuid,
      isLoading: false,
      signOutIntent: false,
    });
    Analytics.guestSessionStarted('deep_link');
  },

  setRequiresOnboardingQuiz: (required: boolean): void => {
    set({ requiresOnboardingQuiz: required });
  },
}));
