// src/lib/analytics.ts
/**
 * PostHog analytics wrapper for Frix.
 * 
 * This file re-exports from src/services/analytics.ts for backwards compatibility.
 * All new code should import from '@/services/analytics' directly.
 * 
 * All events automatically include is_guest and guest_uuid context.
 * Never call PostHog directly — always use this module or the Analytics object.
 */

// Re-export everything from the canonical analytics service
export { posthog, mergeGuestSession, Analytics } from '@/services/analytics';
