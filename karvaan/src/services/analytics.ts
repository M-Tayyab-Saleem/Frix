// src/services/analytics.ts
// PostHog wrapper with mandatory is_guest and guest_uuid on every event

import PostHog from 'posthog-react-native';
import type { Venue } from '@/types';

// Lazy import to avoid circular dependency
const getAuthStore = () => require('@/store/useAuthStore').useAuthStore;

/**
 * Initialize PostHog for Frix.
 * Uses self-hosted instance at analytics.frix.pk by default.
 */
export const posthog = new PostHog(
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '',
  {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://analytics.frix.pk',
    enableSessionReplay: true,
    sessionReplayConfig: {
      maskAllTextInputs: true,
      maskAllImages: false,
    },
  }
);

/**
 * Gets the current guest metadata to include on EVERY event.
 */
const getGuestProps = () => {
  const { isGuest, guestUuid } = getAuthStore().getState();
  return {
    is_guest: isGuest,
    guest_uuid: isGuest ? guestUuid : null,
  };
};

/**
 * Guest merge on signup — associates anonymous guest session with new user.
 */
export const mergeGuestSession = (guestUuid: string, userId: string) => {
  posthog.alias(`${guestUuid}_${userId}`);
  posthog.identify(userId);
};

/**
 * Analytics wrapper object for consistent event tracking.
 * CRITICAL: Every event includes is_guest and guest_uuid automatically.
 */
export const Analytics = {
  track: (event: string, properties: Record<string, unknown> = {}): void => {
    posthog.capture(event, { ...getGuestProps(), ...properties });
  },

  guestSessionStarted: (entryPoint: 'cold_launch' | 'deep_link' | 'onboarding'): void => {
    Analytics.track('guest_session_started', {
      device_platform: 'mobile',
      entry_point: entryPoint,
    });
  },

  softGateTriggered: (
    triggerAction: 'get_tickets' | 'save_venue' | 'report_issue',
    venueId: string
  ): void => {
    Analytics.track('soft_gate_triggered', {
      trigger_action: triggerAction,
      venue_id: venueId,
    });
  },

  softGateDismissed: (
    triggerAction: 'get_tickets' | 'save_venue' | 'report_issue',
    dismissMethod: 'maybe_later' | 'backdrop_tap'
  ): void => {
    Analytics.track('soft_gate_dismissed', {
      trigger_action: triggerAction,
      dismiss_method: dismissMethod,
    });
  },

  guestConverted: (authMethod: 'google' | 'phone_otp'): void => {
    const { guestUuid } = getAuthStore().getState();
    Analytics.track('guest_converted', {
      auth_method: authMethod,
      guest_uuid: guestUuid,
    });
  },

  onboardingCompleted: (authMethod: 'google' | 'phone_otp', interests: string[]): void => {
    Analytics.track('onboarding_completed', {
      auth_method: authMethod,
      selected_interests: interests,
      device_platform: 'mobile',
    });
  },

  venueViewed: (
    venue: Venue,
    sourceTab:
      | 'Home'
      | 'Explore'
      | 'Map'
      | 'Search'
      | 'deep_link'
      | 'Dine'
      | 'Arena'
      | 'RelatedPlaces'
      | 'SavedVenues'
      | 'Tonight'
      | 'HomeExplore'
      | 'sports'
      | 'indoor'
      | 'cinema',
    index: number
  ): void => {
    Analytics.track('venue_viewed', {
      venue_id: venue.id,
      venue_name: venue.name,
      category: venue.category_id,
      neighbourhood: venue.neighbourhood,
      city: venue.city,
      source_tab: sourceTab,
      source_index: index,
      has_tonight_badge: (venue.venue_updates ?? []).some(
        (u) => new Date(u.expires_at) > new Date()
      ),
    });
  },

  purchaseIntentClicked: (venue: Venue, sessionDurationSec: number): void => {
    Analytics.track('purchase_intent_clicked', {
      venue_id: venue.id,
      venue_name: venue.name,
      price_displayed: venue.base_price,
      currency: venue.currency,
      session_duration_sec: sessionDurationSec,
    });
  },

  venueSharedWhatsapp: (venue: Venue, sourceTab: string): void => {
    Analytics.track('venue_shared_whatsapp', {
      venue_id: venue.id,
      venue_name: venue.name,
      source_tab: sourceTab,
    });
  },

  venueSaved: (venueId: string, action: 'saved' | 'unsaved'): void => {
    Analytics.track('venue_saved', { venue_id: venueId, action });
  },

  searchPerformed: (query: string, resultsCount: number, timeMs: number): void => {
    Analytics.track('search_performed', {
      query,
      results_count: resultsCount,
      time_to_first_result_ms: timeMs,
    });
  },

  venueReported: (venueId: string, issueType: string, hasDetails: boolean): void => {
    Analytics.track('venue_reported', {
      venue_id: venueId,
      issue_type: issueType,
      has_details: hasDetails,
    });
  },

  profileUpdated: (
    userId: string,
    hasName: boolean,
    interestsCount: number
  ): void => {
    Analytics.track('profile_updated', {
      user_id: userId,
      has_name: hasName,
      interests_count: interestsCount,
    });
  },
};
