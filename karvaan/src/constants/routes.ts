// src/constants/routes.ts
// Screen name constants — prevents typo bugs in navigation
// v5 Update: New 4-tab structure (Home, Explore, Dine, Arena) + share-link guest navigator

export const ROUTES = {
  // Auth Stack
  SPLASH: 'Splash',
  ONBOARDING: 'OnboardingScreen',
  AUTH: 'AuthScreen',
  OTP_VERIFY: 'OtpVerify',
  ONBOARDING_QUIZ: 'OnboardingQuizScreen',
  INTEREST_SELECT: 'InterestSelect',

  // Main Tabs (v5 — 4 tabs)
  HOME: 'HomeScreen',
  EXPLORE: 'ExploreScreen',
  DINE: 'DineScreen',
  ARENA: 'ArenaScreen',
  PROFILE: 'ProfileScreen',

  // Supporting screens
  MAP: 'MapScreen',
  NEAR_ME: 'NearMeScreen',
  SEARCH: 'SearchScreen',

  // Share-Link Guest Navigator
  SHARE_LINK_FLOW: 'ShareLinkFlow',
  SHARE_LINK_VENUE: 'ShareLinkVenueDetail',

  // Nested / detail screens
  VENUE_DETAIL: 'VenueDetailScreen',
  MAP_DETAIL: 'MapDetailScreen',
  CATEGORY_LIST: 'CategoryListScreen',
  SAVED_VENUES: 'SavedVenues',
  TICKET_INTENT: 'TicketIntentModal',
  SOFT_AUTH_GATE: 'SoftAuthGateModal',
  EDIT_PROFILE: 'EditProfileScreen',
  REPORT_ISSUE: 'ReportIssueModal',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteName = (typeof ROUTES)[RouteKey];
