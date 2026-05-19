// src/lib/queryStorage.ts
/**
 * queryStorage — MMKV adapter for TanStack Query persistence.
 *
 * Creates an AsyncStorage-compatible adapter using MMKV.
 * This allows TanStack Query to cache query results locally for offline access.
 *
 * Features:
 * - Wraps MMKV in the interface expected by @tanstack/query-async-storage-persister
 * - All cached data is stored as JSON strings under 'tanstack_query_' prefixed keys
 * - Enables offline-first behavior for all TanStack Query hooks
 *
 * @example
 * ```typescript
 * import { queryStorage } from '@/lib/queryStorage';
 * import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
 *
 * const persister = createSyncStoragePersister({ storage: queryStorage });
 * ```
 */
import { storage } from './storage';

/**
 * MMKV storage adapter implementing the synchronous interface for TanStack Query.
 */
export const queryStorage = {
  /**
   * Get a value from storage synchronously.
   * @param key - The storage key
   * @returns The value or null
   */
  getItem: (key: string): string | null => {
    try {
      const value = storage.getString(key);
      return value ?? null;
    } catch (error) {
      console.error('queryStorage.getItem error:', error);
      return null;
    }
  },

  /**
   * Set a value in storage synchronously.
   * @param key - The storage key
   * @param value - The value to store
   */
  setItem: (key: string, value: string): void => {
    try {
      storage.set(key, value);
    } catch (error) {
      console.error('queryStorage.setItem error:', error);
    }
  },

  /**
   * Remove a value from storage synchronously.
   * @param key - The storage key
   */
  removeItem: (key: string): void => {
    try {
      storage.delete(key);
    } catch (error) {
      console.error('queryStorage.removeItem error:', error);
    }
  },
};
