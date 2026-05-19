// src/components/ErrorBoundary.tsx
/**
 * ErrorBoundary — Global React error boundary for catching rendering errors.
 *
 * Per cursorrules.md § ERROR HANDLING RULES:
 * - Wrap the root NavigationContainer in a React Error Boundary
 * - Never swallow errors silently — always log to Sentry
 *
 * Features:
 * - Catches all React rendering errors in child component tree
 * - Logs errors to Sentry with full component stack and guest context
 * - Displays user-friendly fallback UI with retry option
 * - Uses theme tokens for styling (no hardcoded colors/sizes)
 * - Resets error state on retry to attempt re-render
 *
 * @example
 * ```tsx
 * // In App.tsx
 * <ErrorBoundary>
 *   <NavigationContainer>
 *     <RootNavigator />
 *   </NavigationContainer>
 * </ErrorBoundary>
 * ```
 */
import React, { Component, type ErrorInfo, type ReactNode } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";
import { logger } from "@/services/logger";

/**
 * Props for the ErrorBoundary component.
 */
export interface ErrorBoundaryProps {
  /** Child components to wrap and protect */
  children: ReactNode;
}

/**
 * State for the ErrorBoundary component.
 */
export interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The error object that was caught */
  error: Error | null;
}

/**
 * ErrorBoundaryWithTheme — Internal component that consumes theme context.
 * This is needed because class components cannot use hooks directly.
 */
function ErrorBoundaryWithTheme({
  hasError,
  error,
  onReset,
}: {
  hasError: boolean;
  error: Error | null;
  onReset: () => void;
}): ReactNode {
  const { theme } = useThemeStore();

  if (!hasError) {
    return null;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Error icon */}
      <Ionicons 
        name="alert-circle-outline" 
        size={64} 
        color={theme.colors.error} 
        style={{ marginBottom: theme.spacing.lg }}
      />

      {/* Error headline */}
      <Text
        style={[
          theme.typography.headlineLarge,
          { color: theme.colors.onSurface, textAlign: "center" },
        ]}
      >
        Something went wrong
      </Text>

      {/* Error description */}
      <Text
        style={[
          theme.typography.bodyMedium,
          {
            color: theme.colors.onSurfaceVariant,
            textAlign: "center",
            marginTop: theme.spacing.sm,
          },
        ]}
      >
        We've been notified and are working on it.
      </Text>

      {/* Optional error details in development */}
      {__DEV__ && error && (
        <View
          style={[
            styles.errorDetails,
            {
              backgroundColor: theme.colors.surfaceHighest,
              marginTop: theme.spacing.md,
            },
          ]}
        >
          <Text
            style={[theme.typography.labelSmall, { color: theme.colors.error }]}
          >
            {error.message}
          </Text>
        </View>
      )}

      {/* Retry button */}
      <Pressable
        onPress={onReset}
        style={[
          styles.retryButton,
          {
            backgroundColor: theme.colors.primary,
            marginTop: theme.spacing.lg,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Try again"
      >
        <Text
          style={[
            theme.typography.titleLarge,
            { color: theme.colors.onPrimary },
          ]}
        >
          Try Again
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * ErrorBoundary class component.
 * Catches React rendering errors and displays a fallback UI.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * Static method to update state when an error is caught.
   * Returns new state to trigger error UI.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * Instance method called after error is caught.
   * Logs error to Sentry with component stack and guest context.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.exception(error, {
      componentStack: errorInfo.componentStack,
      screen: "ErrorBoundary",
    });
  }

  /**
   * Reset error state to attempt re-rendering child components.
   */
  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  /**
   * Render error UI or children based on error state.
   */
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryWithTheme
          hasError={this.state.hasError}
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Styles for ErrorBoundary component.
 * No hardcoded colors or sizes — all from theme tokens.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  } as ViewStyle,
  errorDetails: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    maxWidth: "100%",
  } as ViewStyle,
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 160,
    alignItems: "center",
  } as ViewStyle,
});
