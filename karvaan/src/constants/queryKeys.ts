// src/constants/queryKeys.ts
// TanStack Query key factory — all keys use `as const` for type safety

export const QUERY_KEYS = {
  VENUES: 'venues',
  VENUE_DETAILS: (id: string) => ['venue', id] as const,
  TRUST_SIGNALS: (venueId: string) => ['venue', venueId, 'trust_signals'] as const,
  CONTEXT_TAGS: (venueId: string) => ['venue', venueId, 'context_tags'] as const,
  VENUES_BY_CITY: (city: string) => ['venues', 'city', city] as const,
  CATEGORIES: 'categories',
  USER_PROFILE: 'userProfile',
  SAVED_VENUES: (userId: string) => ['saved_venues', userId] as const,
  NEARBY_VENUES: (lat: number, lng: number, radiusKm: number) =>
    ['venues', 'nearby', lat, lng, radiusKm] as const,
  SEARCH_VENUES: (query: string) => ['venues', 'search', query] as const,
  HOME_VENUES: (interests?: string[]) => ['venues', 'home', interests] as const,
} as const;
