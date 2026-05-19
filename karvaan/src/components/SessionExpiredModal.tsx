// src/components/SessionExpiredModal.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  type ViewStyle,
} from "react-native";
import { useThemeStore } from "@/store/themeStore";

interface SessionExpiredModalProps {
  visible: boolean;
  onSignInAgain: () => void;
}

/**
 * SessionExpiredModal — Non-disruptive re-auth prompt when a session expires.
 */
export function SessionExpiredModal({
  visible,
  onSignInAgain,
}: SessionExpiredModalProps): React.JSX.Element | null {
  const { theme } = useThemeStore();

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]} />
      <View
        style={[styles.sheet, { backgroundColor: theme.colors.surfaceHighest }]}
      >
        <View
          style={[
            styles.handle,
            { backgroundColor: theme.colors.onSurfaceVariant },
          ]}
        />
        <Text
          style={[
            theme.typography.titleLarge,
            styles.title,
            { color: theme.colors.onSurface },
          ]}
        >
          Session Expired
        </Text>
        <Text
          style={[
            theme.typography.bodyMedium,
            styles.subtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Your session has expired — sign in to continue.
        </Text>

        <Pressable
          style={[styles.cta, { backgroundColor: theme.colors.primary }]}
          onPress={onSignInAgain}
          accessibilityRole="button"
          accessibilityLabel="Sign in again"
        >
          <Text
            style={[
              theme.typography.labelLarge,
              { color: theme.colors.onPrimary },
            ]}
          >
            Sign In Again
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  } as ViewStyle,
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
    marginBottom: 12,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 18,
  },
  cta: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
  },
});
