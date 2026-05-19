// src/components/SoftAuthGateModal.tsx
/**
 * SoftAuthGateModal — Dismissible bottom sheet for guest gated actions.
 *
 * Per PRD v4 §7.4 / FLOW 4:
 * - Fires when a guest taps Save, Get Tickets, or Report Issue
 * - Copy: "Your next Karachi adventure awaits."
 * - CTA: [Continue with Google] [Use Phone Number] [Maybe later]
 * - Always dismissible — never hard-blocks browsing
 *
 * Acceptance criteria (TICKET 013):
 * - Slides up from bottom with spring animation
 * - Glassmorphic background in both dark and light themes
 * - "Continue with Google" navigates to AuthScreen
 * - "Use Phone Number" navigates to AuthScreen
 * - "Maybe later" closes modal — user stays on same screen
 * - Backdrop tap also closes modal
 * - Fires soft_gate_triggered on show, soft_gate_dismissed on dismiss
 * - Does NOT fire when user is authenticated (visible prop guard)
 */

import React, { useEffect, useCallback, useRef, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from "react-native";
import { useThemeStore } from "@/store/themeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Analytics } from "@/lib/analytics";

const SNAP_HEIGHT = Dimensions.get("window").height * 0.4;

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────
export type TriggerAction = "get_tickets" | "save_venue" | "report_issue";

export interface SoftAuthGateModalProps {
  /** What gated action triggered the modal */
  triggerAction: TriggerAction;
  /** Venue ID associated with the action (for analytics) */
  venueId?: string;
  /** Whether the modal is visible. Must NEVER be true for authenticated users. */
  visible: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback to navigate to AuthScreen (e.g., navigation.navigate('AuthScreen')) */
  onNavigateToAuth?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────────────────────
const createStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: "flex-end",
    },
    sheet: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: "hidden",
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 24,
      // Ghost border — top + left only
      borderTopWidth: 0.5,
      borderLeftWidth: 0.5,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.onSurfaceVariant,
      alignSelf: "center",
      marginBottom: 20,
      opacity: 0.5,
    },
    headline: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 12,
      paddingHorizontal: 8,
    },
    body: {
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
      marginBottom: 28,
      paddingHorizontal: 8,
    },
    googleButton: {
      width: "100%",
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 12,
    },
    googleButtonText: {
      fontSize: 15,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    phoneButton: {
      width: "100%",
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      borderWidth: 1,
      marginBottom: 16,
    },
    phoneButtonText: {
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    maybeLater: {
      fontSize: 14,
      textAlign: "center",
      textDecorationLine: "underline",
    },
  });

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function SoftAuthGateModal({
  triggerAction,
  venueId,
  visible,
  onClose,
  onNavigateToAuth,
}: SoftAuthGateModalProps) {
  const { theme, isDarkMode } = useThemeStore();
  const { isGuest, guestUuid } = useAuthStore();

  // Guard: never render for authenticated users (visible should never be true for them)
  if (!visible || !isGuest) {
    return null;
  }

  const slideAnim = useRef(new Animated.Value(SNAP_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Spring animation on open
  const animateIn = useCallback(() => {
    slideAnim.setValue(SNAP_HEIGHT);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 140,
        mass: 1,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  // Slide out animation on close
  const animateOut = useCallback(
    (callback: () => void) => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SNAP_HEIGHT,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(callback);
    },
    [slideAnim, opacityAnim],
  );

  // Trigger animations and analytics when visible changes
  useEffect(() => {
    if (visible) {
      animateIn();
      Analytics.softGateTriggered(triggerAction, venueId ?? "unknown");
    }
  }, [visible, triggerAction, venueId, animateIn]);

  // Dismiss with animation — backdrop tap
  const dismiss = useCallback(() => {
    animateOut(() => {
      Analytics.softGateDismissed(triggerAction, "backdrop_tap");
      onClose();
    });
  }, [animateOut, triggerAction, onClose]);

  // Handle "Maybe later" dismiss
  const handleMaybeLater = useCallback(() => {
    animateOut(() => {
      Analytics.softGateDismissed(triggerAction, "maybe_later");
      onClose();
    });
  }, [animateOut, triggerAction, onClose]);

  // Navigate to AuthScreen — Continue with Google
  const handleGoogle = useCallback(() => {
    // Close modal first, then navigate
    animateOut(() => {
      onClose();
      onNavigateToAuth?.();
    });
  }, [animateOut, onClose, onNavigateToAuth]);

  // Navigate to AuthScreen — Use Phone Number
  const handlePhone = useCallback(() => {
    animateOut(() => {
      onClose();
      onNavigateToAuth?.();
    });
  }, [animateOut, onClose, onNavigateToAuth]);

  const s = useMemo(() => createStyles(theme, isDarkMode), [theme, isDarkMode]);

  // Glassmorphic background colours
  const sheetBg = isDarkMode ? "rgba(53,53,52,0.95)" : "rgba(255,255,255,0.95)";

  const ghostBorderColor = theme.colors.outlineVariant;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={dismiss}
    >
      <View style={s.backdrop}>
        {/* Backdrop overlay with fade — tap to dismiss */}
        <TouchableWithoutFeedback onPress={dismiss}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { opacity: opacityAnim, backgroundColor: "rgba(0,0,0,0.5)" },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Sheet content — slides up from bottom */}
        <Animated.View
          style={[
            s.sheet,
            {
              transform: [{ translateY: slideAnim }],
              backgroundColor: sheetBg,
              borderTopColor: ghostBorderColor,
              borderLeftColor: ghostBorderColor,
            },
          ]}
        >
          {/* Handle bar */}
          <View style={s.handle} />

          {/* Headline */}
          <Text style={[s.headline, { color: theme.colors.onSurface }]}>
            Your next Karachi adventure awaits.
          </Text>

          {/* Body */}
          <Text style={[s.body, { color: theme.colors.onSurfaceVariant }]}>
            Create a free account to save venues and book tickets. It takes 20
            seconds.
          </Text>

          {/* Continue with Google — full-width gold CTA */}
          <TouchableOpacity
            style={[s.googleButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleGoogle}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            <Text
              style={[s.googleButtonText, { color: theme.colors.onPrimary }]}
            >
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Use Phone Number — outline CTA */}
          <TouchableOpacity
            style={[
              s.phoneButton,
              {
                borderColor: ghostBorderColor,
                backgroundColor: "transparent",
              },
            ]}
            onPress={handlePhone}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Use Phone Number"
          >
            <Text
              style={[s.phoneButtonText, { color: theme.colors.onSurface }]}
            >
              Use Phone Number
            </Text>
          </TouchableOpacity>

          {/* Maybe later — dismiss */}
          <TouchableOpacity
            onPress={handleMaybeLater}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Dismiss and continue browsing"
          >
            <Text
              style={[s.maybeLater, { color: theme.colors.onSurfaceVariant }]}
            >
              Maybe later
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
