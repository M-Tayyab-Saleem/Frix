// src/services/logger.ts
// Sentry wrapper for error logging — always includes guest context

import * as Sentry from '@sentry/react-native';

export const logger = {
  /**
   * Logs a non-fatal error message to Sentry with optional context.
   */
  error: (message: string, context?: Record<string, unknown>): void => {
    Sentry.captureMessage(message, {
      level: 'error',
      extra: {
        userId: null,
        isGuest: false,
        guestUuid: null,
        ...context,
      },
    });
  },

  /**
   * Logs a fatal exception to Sentry with full stack trace and optional context.
   */
  exception: (error: Error, context?: Record<string, unknown>): void => {
    Sentry.captureException(error, {
      extra: {
        userId: null,
        isGuest: false,
        guestUuid: null,
        ...context,
      },
    });
  },

  /**
   * Initializes Sentry with the DSN from environment variables.
   */
  init: (): void => {
    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      enableAutoSessionTracking: true,
    });
  },
};
