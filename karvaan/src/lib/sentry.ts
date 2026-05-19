// src/lib/sentry.ts
import * as Sentry from '@sentry/react-native';

/**
 * Initialize Sentry for error tracking and performance monitoring.
 * Must be called before any rendering occurs (typically in App.tsx).
 */
export const initSentry = (): void => {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.NODE_ENV !== 'production', // If __DEV__ is true, logs to console
    tracesSampleRate: 0.2, // Sample 20% of transactions for performance monitoring
    enableAutoSessionTracking: true,
    enableNativeCrashHandling: true,
    enableNativeNagger: true,
    attachStacktrace: true,
    maxBreadcrumbs: 50,
  });

  // Send a test event to verify Sentry is working
  if (__DEV__) {
    Sentry.captureMessage('Sentry initialized — Frix app started', {
      level: 'info',
      tags: { app: 'frix' },
    });
  }
};
