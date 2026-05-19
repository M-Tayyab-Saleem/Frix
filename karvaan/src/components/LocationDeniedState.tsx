// src/components/LocationDeniedState.tsx
import React from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/store/themeStore";

export interface LocationDeniedStateProps {
  onBrowseAll?: () => void;
}

/**
 * Inline denied state shown when user has previously denied location permission.
 */
export function LocationDeniedState({
  onBrowseAll,
}: LocationDeniedStateProps): React.JSX.Element {
  const { theme } = useThemeStore();

  const handleOpenSettings = (): void => {
    Linking.openSettings().catch((error: unknown) => {
      console.error("LocationDeniedState: Unable to open settings", error);
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.surfaceLow }]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.colors.surfaceHighest },
        ]}
      >
        <Ionicons
          name="location-outline"
          size={28}
          color={theme.colors.primary}
        />
      </View>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        Location access needed
      </Text>
      <Text style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>
        To see venues near you, allow location in your phone settings.
      </Text>

      <Pressable
        onPress={handleOpenSettings}
        style={[
          styles.primaryButton,
          { backgroundColor: theme.colors.primary },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open Settings"
      >
        <Text style={[styles.primaryText, { color: theme.colors.onPrimary }]}>
          Open Settings
        </Text>
      </Pressable>

      {!!onBrowseAll && (
        <Pressable
          onPress={onBrowseAll}
          style={styles.secondaryButton}
          accessibilityRole="button"
          accessibilityLabel="Browse all venues"
        >
          <Text
            style={[
              styles.secondaryText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Browse All Venues
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
  } as ViewStyle,
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  } as ViewStyle,
  title: {
    fontFamily: "NotoSerif-SemiBold",
    fontSize: 22,
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: "center",
  },
  body: {
    fontFamily: "Manrope-Regular",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  primaryButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
  } as ViewStyle,
  primaryText: {
    fontFamily: "Manrope-SemiBold",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 8,
  } as ViewStyle,
  secondaryText: {
    fontFamily: "Manrope-Medium",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
