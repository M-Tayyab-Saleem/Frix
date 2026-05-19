// src/components/EmptyState.tsx
/**
 * EmptyState — Empty state placeholder for lists with no data.
 *
 * Displays an optional illustration, title, subtitle, and optional retry button
 * when a list or screen has no data to show. Used across all data-fetching screens
 * (ExploreScreen, CategoryListScreen, SearchScreen, etc.).
 *
 * Features:
 * - Correct typography: NotoSerif for title, Manrope for subtitle
 * - Both dark and light themes render correctly via useThemeStore
 * - Optional retry button for offline/error states
 * - Centered layout with proper spacing per Obsidian Curator design system
 *
 * @example
 * ```tsx
 * // Basic empty state
 * <EmptyState
 *   title="No venues here yet"
 *   subtitle="Check back soon"
 * />
 *
 * // With retry button (for error/offline states)
 * <EmptyState
 *   title="You're offline"
 *   subtitle="Showing cached results"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeStore } from "@/store/themeStore";

/**
 * Props for the EmptyState component.
 */
export interface EmptyStateProps {
  /** Primary headline text (required) */
  title: string;
  /** Supporting descriptive text (optional) */
  subtitle?: string;
  /** Optional callback to show retry button (e.g., refetch data) */
  onRetry?: () => void;
  /** Optional custom retry button label (default: "Try Again") */
  retryLabel?: string;
}

/**
 * EmptyState component.
 * Renders a centered empty state with title, optional subtitle, and optional retry button.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  onRetry,
  retryLabel = "Try Again",
}): React.JSX.Element => {
  const { theme } = useThemeStore();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Illustration placeholder */}
      <View
        style={[
          styles.illustrationContainer,
          { backgroundColor: theme.colors.surfaceLow },
        ]}
      >
        <Text style={[styles.illustrationIcon]}>📭</Text>
      </View>

      {/* Title — NotoSerif headline */}
      <Text
        style={[
          theme.typography.headlineLarge,
          {
            color: theme.colors.onSurface,
            textAlign: "center",
            marginTop: theme.spacing.lg,
            marginBottom: theme.spacing.sm,
          },
        ]}
      >
        {title}
      </Text>

      {/* Subtitle — Manrope body text */}
      {subtitle && (
        <Text
          style={[
            theme.typography.bodyMedium,
            {
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
              marginBottom: onRetry ? theme.spacing.xl : 0,
            },
          ]}
        >
          {subtitle}
        </Text>
      )}

      {/* Optional retry button */}
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.8}
          style={[
            styles.retryButton,
            {
              backgroundColor: theme.colors.primary,
              marginTop: theme.spacing.md,
            },
          ]}
        >
          <Text
            style={[
              theme.typography.titleLarge,
              {
                color: theme.colors.onPrimary,
              },
            ]}
          >
            {retryLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
  },
  illustrationIcon: {
    fontSize: 64,
    lineHeight: 74,
    textAlign: "center",
  },
  retryButton: {
    height: 52,
    paddingHorizontal: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8, // theme.borderRadius.md equivalent
    minWidth: 160,
  },
});

export default EmptyState;
