// src/utils/dateFormatter.ts
// Date and time formatting utilities for Frix
import { isOpenNow as getOpenNowStatus } from './openNowUtils';

/**
 * Formats a date string to a human-readable format.
 * e.g., "2025-01-15T10:00:00Z" → "Jan 15, 2025"
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats operating hours JSON to a readable string for a given day.
 * e.g., { monday: "9:00 AM - 6:00 PM" } → "9:00 AM - 6:00 PM"
 */
export const formatOperatingHours = (
  hours: Record<string, string> | null,
  day?: string
): string => {
  if (!hours) return 'Hours not listed — contact venue';
  const targetDay = day || new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return hours[targetDay] ?? 'Hours not listed — contact venue';
};

/**
 * Checks if a venue is currently open based on operating hours.
 */
export const isOpenNow = (hours: Record<string, string> | null): boolean => {
  return getOpenNowStatus(hours) === 'open';
};

export function formatSlot(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-PK', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Karachi',
    });
  } catch {
    return isoString; // fallback: show raw string
  }
}
