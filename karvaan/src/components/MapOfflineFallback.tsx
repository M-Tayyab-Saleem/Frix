// src/components/MapOfflineFallback.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";

interface MapOfflineFallbackProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Static map fallback for offline/error states where Mapbox cannot render safely.
 */
export function MapOfflineFallback({
  title = "Map not available offline",
  subtitle = "Reconnect to load the interactive map.",
  fullScreen = false,
  height,
  style,
}: MapOfflineFallbackProps): React.JSX.Element {
  const { theme } = useThemeStore();

  return (
    <View
      style={[
        s.root,
        {
          backgroundColor: theme.colors.surfaceLow,
          borderColor: theme.colors.outlineVariant,
          height: fullScreen ? undefined : (height ?? 220),
          flex: fullScreen ? 1 : undefined,
        },
        style,
      ]}
    >
      <View
        style={[s.routeLine, { backgroundColor: theme.colors.surfaceHighest }]}
      />
      <View
        style={[
          s.routeLineAlt,
          { backgroundColor: theme.colors.surfaceHighest },
        ]}
      />
      <View style={[s.pin, { backgroundColor: theme.colors.primary }]}>
        <Ionicons name="location" size={16} color={theme.colors.onPrimary} />
      </View>
      <Text style={[s.title, { color: theme.colors.onSurface }]}>{title}</Text>
      <Text style={[s.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    paddingHorizontal: 16,
  },
  routeLine: {
    position: "absolute",
    width: "130%",
    height: 2,
    transform: [{ rotate: "-14deg" }],
    opacity: 0.35,
  },
  routeLineAlt: {
    position: "absolute",
    width: "120%",
    height: 2,
    transform: [{ rotate: "19deg" }],
    opacity: 0.25,
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontFamily: "Manrope-SemiBold",
    fontSize: 14,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Manrope-Regular",
    fontSize: 12,
    textAlign: "center",
  },
});
