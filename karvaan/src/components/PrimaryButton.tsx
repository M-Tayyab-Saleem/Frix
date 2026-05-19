// src/components/PrimaryButton.tsx
/**
 * PrimaryButton — Main CTA button for Frix app.
 *
 * Used for primary actions like "Get Tickets", "Continue", "Get Started", "Try Again".
 * Supports three states: default, loading, and disabled.
 *
 * Features:
 * - Three variants: default, loading, disabled
 * - Loading state shows ActivityIndicator and hides label
 * - Disabled state at 40% opacity, non-pressable
 * - Press feedback: scale(0.98) via react-native-reanimated
 * - Correct theming for both dark and light modes via useThemeStore
 *
 * @example
 * ```tsx
 * // Default button
 * <PrimaryButton
 *   label="Get Tickets"
 *   onPress={() => handleGetTickets()}
 * />
 *
 * // Loading state
 * <PrimaryButton
 *   label="Signing in..."
 *   loading={true}
 *   onPress={() => handleSignIn()}
 * />
 *
 * // Disabled state
 * <PrimaryButton
 *   label="Continue"
 *   disabled={true}
 *   onPress={() => handleContinue()}
 * />
 * ```
 */
import React from "react";
import { Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useThemeStore } from "@/store/themeStore";

/**
 * Props for the PrimaryButton component.
 */
export interface PrimaryButtonProps {
  /** Button label text */
  label: string;
  /** onPress callback — disabled when loading or disabled prop is true */
  onPress: () => void;
  /** Show loading state with ActivityIndicator */
  loading?: boolean;
  /** Disable button interaction */
  disabled?: boolean;
  /** Optional accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * PrimaryButton component.
 * Renders a full-width CTA button with press animation and multiple states.
 */
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  accessibilityLabel,
  testID,
}): React.JSX.Element => {
  const { theme } = useThemeStore();

  // Shared value for press animation scale
  const scale = useSharedValue(1);

  // Animated style for press feedback
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Determine if button is in disabled state (explicit or loading)
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.98, {
          duration: 100,
          easing: Easing.out(Easing.ease),
        });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, {
          duration: 150,
          easing: Easing.inOut(Easing.ease),
        });
      }}
      disabled={isDisabled}
      style={styles.container}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.primary,
            opacity: isDisabled ? 0.4 : 1,
          },
          animatedStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.onPrimary} />
        ) : (
          <Text
            style={[
              theme.typography.titleLarge,
              {
                color: theme.colors.onPrimary,
              },
            ]}
          >
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  button: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8, // theme.borderRadius.md equivalent
  },
});

export default PrimaryButton;
