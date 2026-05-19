// src/components/CategoryChip.tsx
/**
 * CategoryChip — Filter pill for category selection.
 *
 * Used on ExploreScreen filter row and InterestSelectScreen.
 * Supports selected/unselected states with smooth press animations.
 *
 * Features:
 * - Selected state: primary background, white text
 * - Unselected state: surface background, variant text
 * - Press feedback: scale(0.95) via react-native-reanimated
 * - Both dark and light themes render correctly
 * - No hardcoded colors or sizes
 *
 * @example
 * ```tsx
 * // Unselected chip
 * <CategoryChip
 *   label="Historical"
 *   isSelected={false}
 *   onPress={() => setSelectedCategory('historical')}
 * />
 *
 * // Selected chip
 * <CategoryChip
 *   label="Dine"
 *   isSelected={true}
 *   onPress={() => setSelectedCategory(null)}
 * />
 * ```
 */
import React, { useCallback } from "react";
import { Text, StyleSheet, Pressable, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useThemeStore } from "@/store/themeStore";

/**
 * Props for the CategoryChip component.
 */
export interface CategoryChipProps {
  /** Label text displayed on the chip */
  label: string;
  /** Whether the chip is currently selected */
  isSelected: boolean;
  /** Callback when chip is pressed */
  onPress: () => void;
  /** Optional accessibility label for screen readers */
  accessibilityLabel?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * CategoryChip component.
 * Renders a filter pill with selected/unselected states and press animation.
 */
const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  isSelected,
  onPress,
  accessibilityLabel,
}): React.JSX.Element => {
  const { theme } = useThemeStore();

  // Shared value for press animation scale
  const scale = useSharedValue(1);

  // Animated style for press feedback
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withTiming(0.95, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: 150,
      easing: Easing.inOut(Easing.ease),
    });
  }, [scale]);

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: isSelected
            ? theme.colors.primary
            : theme.colors.surfaceHighest,
          borderColor: theme.colors.outlineVariant,
        },
        animatedStyle,
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${label} category filter`}
      accessibilityState={{ selected: isSelected }}
    >
      <Text
        style={[
          theme.typography.labelLarge,
          {
            color: isSelected
              ? theme.colors.onPrimary
              : theme.colors.onSurfaceVariant,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

/**
 * Styles for CategoryChip.
 * No hardcoded colors or sizes — all from theme.
 */
const styles = StyleSheet.create({
  container: {
    height: 36,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20, // Full rounded pill shape
    borderWidth: 1,
    marginRight: 8, // Spacing between chips in horizontal scroll
  } as ViewStyle,
});

export default CategoryChip;
