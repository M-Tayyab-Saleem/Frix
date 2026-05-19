// src/components/SkeletonCard.tsx
/**
 * SkeletonCard — Loading placeholder for VenueCard components.
 *
 * Displays a pulsing skeleton UI that mimics the exact dimensions and layout
 * of a VenueCard (220px total height, 140px hero image area, proper padding).
 * Uses react-native-reanimated for smooth, GPU-accelerated pulse animation.
 *
 * Features:
 * - Smooth opacity pulse animation (0.4 → 1.0 → 0.4, 800ms loop)
 * - Correct skeleton colors for both dark and light themes via useThemeStore
 * - Matches VenueCard dimensions exactly for seamless loading transitions
 * - No frame drops — uses Reanimated's worklet-based animation system (UI thread)
 *
 * @example
 * ```tsx
 * // In a screen showing a loading state:
 * <FlashList
 *   data={[1, 2, 3, 4]}
 *   renderItem={() => <SkeletonCard />}
 *   estimatedItemSize={220}
 * />
 * ```
 */
import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  type ViewStyle,
  type DimensionValue,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useThemeStore } from "@/store/themeStore";

/**
 * Internal component for individual skeleton lines with their own pulse animation.
 * This allows staggered pulsing for a more organic loading feel.
 */
const SkeletonLine: React.FC<{
  width: DimensionValue;
  height: number;
  marginBottom?: number;
}> = ({ width, height, marginBottom = 0 }) => {
  const { theme } = useThemeStore();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1.0, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseStyle: ViewStyle = {
    width,
    height,
    marginBottom,
    backgroundColor: theme.colors.skeleton,
    borderRadius: theme.borderRadius.sm,
  };

  return <Animated.View style={[baseStyle, animatedStyle]} />;
};

/**
 * SkeletonCard component.
 * Renders a static skeleton layout with animated opacity pulse.
 */
const SkeletonCard: React.FC = () => {
  const { theme } = useThemeStore();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.surfaceLow }]}
    >
      {/* Hero image placeholder area with its own pulse */}
      <SkeletonImage />

      {/* Card body */}
      <View style={styles.cardBody}>
        {/* Venue name line */}
        <SkeletonLine width="75%" height={18} marginBottom={8} />

        {/* Neighbourhood line */}
        <SkeletonLine width="50%" height={14} marginBottom={6} />

        {/* Price line */}
        <SkeletonLine width="35%" height={14} marginBottom={0} />
      </View>
    </View>
  );
};

/**
 * Skeleton image placeholder with independent pulse animation.
 */
const SkeletonImage: React.FC = () => {
  const { theme } = useThemeStore();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1.0, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const baseStyle: ViewStyle = {
    ...styles.heroImage,
    backgroundColor: theme.colors.skeleton,
  };

  return <Animated.View style={[baseStyle, animatedStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    height: 220, // Matches VenueCard total height
    marginBottom: 8, // Spacing between cards in a list
  },
  heroImage: {
    width: "100%",
    height: 140, // Matches VenueCard hero image height
  },
  cardBody: {
    paddingHorizontal: 16, // theme.spacing.md
    paddingTop: 12,
    paddingBottom: 8,
  },
  textLine: {
    height: 16,
    marginBottom: 8,
  },
  venueName: {
    width: "75%", // Approximate average venue name width
    height: 18,
    marginBottom: 8,
  },
  neighbourhood: {
    width: "50%",
    height: 14,
    marginBottom: 6,
  },
  price: {
    width: "35%",
    height: 14,
  },
});

export default SkeletonCard;
