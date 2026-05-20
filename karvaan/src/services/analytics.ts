// src/services/analytics.ts
// Mocked analytics service to completely decouple and remove PostHog dependency.
// Logs event tracking to console in development and does nothing in production.

export const posthog = {
  identify: (id: string, properties?: Record<string, any>) => {
    if (__DEV__) console.log(`[Analytics Mock] Identify: ${id}`, properties);
  },
  alias: (aliasId: string) => {
    if (__DEV__) console.log(`[Analytics Mock] Alias: ${aliasId}`);
  },
  capture: (event: string, properties?: Record<string, any>) => {
    if (__DEV__) console.log(`[Analytics Mock] Capture: ${event}`, properties);
  },
  reset: () => {
    if (__DEV__) console.log(`[Analytics Mock] Reset`);
  },
};

export const mergeGuestSession = (guestUuid: string, userId: string) => {
  if (__DEV__) console.log(`[Analytics Mock] Merging Guest: ${guestUuid} with User: ${userId}`);
};

export const Analytics = {
  track: (event: string, properties: Record<string, unknown> = {}): void => {
    if (__DEV__) console.log(`[Analytics Mock] Tracked Event "${event}":`, properties);
  },

  guestSessionStarted: (entryPoint: string): void => {
    Analytics.track('guest_session_started', { entry_point: entryPoint });
  },

  softGateTriggered: (triggerAction: string, venueId: string): void => {
    Analytics.track('soft_gate_triggered', { trigger_action: triggerAction, venue_id: venueId });
  },

  softGateDismissed: (triggerAction: string, dismissMethod: string): void => {
    Analytics.track('soft_gate_dismissed', { trigger_action: triggerAction, dismiss_method: dismissMethod });
  },

  guestConverted: (authMethod: string): void => {
    Analytics.track('guest_converted', { auth_method: authMethod });
  },

  onboardingCompleted: (authMethod: string, interests: string[]): void => {
    Analytics.track('onboarding_completed', { auth_method: authMethod, selected_interests: interests });
  },

  venueViewed: (venue: any, sourceTab: string, index: number): void => {
    Analytics.track('venue_viewed', { venue_id: venue?.id, source_tab: sourceTab, index });
  },

  purchaseIntentClicked: (venue: any, sessionDurationSec: number): void => {
    Analytics.track('purchase_intent_clicked', { venue_id: venue?.id, session_duration_sec: sessionDurationSec });
  },

  venueSharedWhatsapp: (venue: any, sourceTab: string): void => {
    Analytics.track('venue_shared_whatsapp', { venue_id: venue?.id, source_tab: sourceTab });
  },

  venueSaved: (venueId: string, action: string): void => {
    Analytics.track('venue_saved', { venue_id: venueId, action });
  },

  searchPerformed: (query: string, resultsCount: number, timeMs: number): void => {
    Analytics.track('search_performed', { query, results_count: resultsCount, time_ms: timeMs });
  },

  venueReported: (venueId: string, issueType: string, hasDetails: boolean): void => {
    Analytics.track('venue_reported', { venue_id: venueId, issue_type: issueType, has_details: hasDetails });
  },

  profileUpdated: (userId: string, hasName: boolean, interestsCount: number): void => {
    Analytics.track('profile_updated', { user_id: userId, has_name: hasName, interests_count: interestsCount });
  },
};
