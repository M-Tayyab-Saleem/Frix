// src/components/CustomTabBar.tsx
import React, { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "@/store/themeStore";

const { width: W } = Dimensions.get("window");

/**
 * CustomTabBar — Shared glassmorphic pill tab bar component.
 * Used by both GuestTabNavigator and MainNavigator.
 *
 * Features:
 * - Floating glassmorphic pill shape with backdrop blur via LinearGradient
 * - Animated dot indicator with spring physics (damping: 14, stiffness: 120)
 * - Ghost border (top-left only) using theme.colors.outlineVariant
 * - Supports any number of tabs via dynamic tabWidth calculation
 * - Dark and light theme variants via useThemeStore
 *
 * Per PRD v4 §7.6: Both GuestTabNavigator and MainTabNavigator must use this identical component.
 */
export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { theme, isDarkMode } = useThemeStore();
  const tabCount = state.routes.length;
  const tabWidth = (W - 48) / tabCount;
  const indicatorPosition = useSharedValue(0);

  React.useEffect(() => {
    indicatorPosition.value = withSpring(
      state.index * tabWidth + tabWidth / 2 - 2,
      { damping: 14, stiffness: 120 },
    );
  }, [state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  const s = useMemo(() => createStyles(theme, isDarkMode), [theme, isDarkMode]);

  return (
    <View style={s.tabBarContainer}>
      {/* Glassmorphic background with theme-specific gradient */}
      <LinearGradient
        colors={["rgba(28,35,51,0.85)", "rgba(13,17,23,0.95)"]}
        style={s.tabBarBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={s.tabBarContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = getIconForRoute(route.name, isFocused);

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={s.tabItem}
              activeOpacity={0.8}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={
                  isFocused
                    ? '#1A73E8'
                    : '#9AA0A6'
                }
              />
            </TouchableOpacity>
          );
        })}
        {/* Animated Dot Indicator */}
        <Animated.View style={[s.indicatorWrap, indicatorStyle]}>
          <View style={s.indicatorDot} />
        </Animated.View>
      </View>
    </View>
  );
}

/**
 * Maps route names to Ionicons icon names.
 * Returns filled icon for focused state, outline for unfocused.
 * v5: 4 main tabs — Home, Explore, Dine, Arena
 */
function getIconForRoute(
  routeName: string,
  isFocused: boolean,
): keyof typeof Ionicons.glyphMap {
  // AI Service Orchestrator tab routes
  if (routeName === "Request") {
    return isFocused ? "search" : "search-outline";
  }
  if (routeName === "MyBookings" || routeName === "Bookings") {
    return isFocused ? "calendar" : "calendar-outline";
  }
  if (routeName === "Providers") {
    return isFocused ? "map" : "map-outline";
  }
  if (routeName === "FollowUps") {
    return isFocused ? "analytics" : "analytics-outline";
  }

  // Legacy v5 Main tab routes (kept for reference)
  if (routeName === "HomeScreen" || routeName === "Home") {
    return isFocused ? "home" : "home-outline";
  }
  if (routeName === "ExploreScreen") {
    return isFocused ? "compass" : "compass-outline";
  }
  if (routeName === "DineScreen" || routeName === "Dine") {
    return isFocused ? "restaurant" : "restaurant-outline";
  }
  if (routeName === "ArenaScreen" || routeName === "Arena") {
    return isFocused ? "flash" : "flash-outline";
  }

  // Legacy / shared routes
  if (routeName === "MapScreen") {
    return isFocused ? "map" : "map-outline";
  }
  if (routeName === "SearchScreen") {
    return isFocused ? "search" : "search-outline";
  }
  if (routeName === "ProfileScreen") {
    return isFocused ? "person" : "person-outline";
  }
  if (routeName === "GuestHomeScreen") {
    return isFocused ? "lock-closed" : "lock-closed-outline";
  }

  // Fallback
  return isFocused ? "ellipse" : "ellipse-outline";
}

const createStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    tabBarContainer: {
      position: "absolute",
      bottom: 24,
      left: 24,
      right: 24,
      height: 64,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: '#2D3748',
      overflow: "hidden",
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
    tabBarBackground: {
      ...StyleSheet.absoluteFillObject,
    },
    tabBarContent: {
      flex: 1,
      flexDirection: "row",
    },
    tabItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    indicatorWrap: {
      position: "absolute",
      bottom: 12,
      left: 0,
      width: 4,
      height: 4,
    },
    indicatorDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#1A73E8',
      shadowColor: '#1A73E8',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 4,
    },
  });
