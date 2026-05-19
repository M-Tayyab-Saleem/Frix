// src/utils/currencyFormatter.ts
// Currency formatting utilities for Frix (PKR)

/**
 * Formats a price in PKR with proper formatting.
 * e.g., 1500 → "PKR 1,500", 0 → "Free"
 */
export const formatPrice = (price: number, currency: string = 'PKR'): string => {
  if (price === 0) return 'Free';
  return `${currency} ${price.toLocaleString('en-PK')}`;
};

/**
 * Formats a number with commas for display.
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-PK');
};
