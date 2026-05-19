// src/lib/storage.ts
// MMKV singleton — the only valid local storage interface
// High-resilience implementation for Expo Go vs Dev Build compatibility

import { MMKV } from 'react-native-mmkv';

/**
 * MMKV Fallback Interface
 * Used only when native modules are unavailable (e.g., standard Expo Go)
 */
const createFallbackStorage = () => {
  const data = new Map<string, string>();
  return {
    set: (key: string, value: string | number | boolean | Uint8Array) => data.set(key, String(value)),
    getString: (key: string) => data.get(key),
    getNumber: (key: string) => Number(data.get(key) || 0),
    getBoolean: (key: string) => data.get(key) === 'true',
    delete: (key: string) => data.delete(key),
    clearAll: () => data.clear(),
    contains: (key: string) => data.has(key),
    getAllKeys: () => Array.from(data.keys()),
  };
};

/**
 * storage — The main storage instance.
 * Automatically switches to in-memory fallback if MMKV native module is missing.
 */
// @ts-ignore - MMKV might be undefined in standard Expo Go environments
export const storage = typeof MMKV !== 'undefined'
  ? new MMKV({
      id: 'frix-app-storage',
      encryptionKey: process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY 
    })
  : (() => {
      console.warn('🚨 MMKV native module not found. Falling back to in-memory storage. Persistence will be lost on reload.');
      return createFallbackStorage();
    })();

/**
 * STORAGE_KEYS — the only valid MMKV keys.
 * Per cursorrules.md § State Management Rules.
 */
export const STORAGE_KEYS = {
  RECENTLY_VIEWED: 'recentlyViewed',
  RECENT_SEARCHES: 'recentSearches',
  ONBOARDING_SEEN: 'hasSeenOnboarding',
  USER_THEME: 'userTheme',
  GUEST_UUID: 'guest_uuid',         // NEVER regenerate once set
  LAST_KNOWN_LOCATION: 'last_known_location',
  LOCATION_PERMISSION_ASKED: 'location_permission_asked',
  NEAR_ME_RADIUS: 'near_me_radius',
  // --- Phase 2: ServisAI orchestrator keys ---
  BOOKINGS: 'servisai_bookings',
  RECENT_REQUESTS: 'servisai_recent_requests',
  ONBOARDING_COMPLETE: 'servisai_onboarding_complete',
  USER_LOCATION: 'servisai_user_location',
  // --- T-11: Demo safety net ---
  MOCK_MODE_ENABLED: 'servisai_mock_mode_enabled',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
