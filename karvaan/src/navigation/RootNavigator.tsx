// src/navigation/RootNavigator.tsx
/**
 * RootNavigator — AI Service Orchestrator shell (Phase 1 rewrite).
 *
 * Supabase auth entirely removed for hackathon.
 * App boots directly to MainTabNavigator (Request tab).
 *
 * Stack screens registered here:
 *   - AgentThinking  (headerShown: false, gestureEnabled: false)
 *   - Results        (headerShown: false, slide_from_right)
 *   - ProviderDetail (slide_from_right)
 *   - BookingConfirm (headerShown: false, slide_from_right)
 *   - BookingDetail  (slide_from_right)
 *   - Dispute        (slide_from_right)
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from '@/navigation/types';

import { AgentThinkingScreen } from '@/screens/AgentThinkingScreen';

import { ResultsScreen } from '@/screens/ResultsScreen';

import { ProviderDetailScreen } from '@/screens/ProviderDetailScreen';

import { BookingConfirmScreen } from '@/screens/BookingConfirmScreen';
import { BookingDetailScreen } from '@/screens/BookingDetailScreen';
import { DisputeScreen } from '@/screens/DisputeScreen';

// ── Placeholder screens for stack screens (replaced phase-by-phase) ──────────
import { View, Text, StyleSheet } from 'react-native';

const ph = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  text: { color: '#FFFFFF', fontSize: 18 },
});
// ─────────────────────────────────────────────────────────────────────────────

const RootStack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootNavigator — boots directly to 4-tab orchestrator shell.
 * No auth checks. No Supabase dependency.
 */
export function RootNavigator(): React.JSX.Element {
  return (
    <RootStack.Navigator
      id="RootStack"
      screenOptions={{ headerShown: false }}
      initialRouteName="MainTabs"
    >
      {/* Primary tabs — always shown on launch */}
      <RootStack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false, animation: 'fade' }}
      />

      {/* Agent Thinking — no gesture back (prevents early exit during animation) */}
      <RootStack.Screen
        name="AgentThinking"
        component={AgentThinkingScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: false,
        }}
      />

      {/* Results */}
      <RootStack.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Provider Detail */}
      <RootStack.Screen
        name="ProviderDetail"
        component={ProviderDetailScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Booking Confirm — no header */}
      <RootStack.Screen
        name="BookingConfirm"
        component={BookingConfirmScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Booking Detail */}
      <RootStack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Dispute */}
      <RootStack.Screen
        name="Dispute"
        component={DisputeScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </RootStack.Navigator>
  );
}
