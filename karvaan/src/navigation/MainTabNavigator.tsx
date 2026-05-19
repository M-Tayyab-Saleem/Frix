// src/navigation/MainTabNavigator.tsx
/**
 * MainTabNavigator — AI Service Orchestrator tabs.
 *
 * 4 tabs: Request / MyBookings / Providers / Profile
 * Uses shared CustomTabBar component (glassmorphic pill).
 * Route names updated; icons wired in CustomTabBar via getIconForRoute.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RequestScreen } from '@/screens/RequestScreen';
import { BookingsListScreen } from '@/screens/BookingsListScreen';
import { ProvidersMapScreen } from '@/screens/ProvidersMapScreen';
import { FollowUpDashboardScreen } from '@/screens/FollowUpDashboardScreen';
import { CustomTabBar } from '@/components/CustomTabBar';
import type { MainTabParamList } from '@/navigation/types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * MainTabNavigator for the AI Service Orchestrator.
 * 4 tabs: Request, MyBookings, Providers, Profile.
 */
export function MainTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      id="MainTabs"
      tabBar={(props) => <CustomTabBar {...props} />}
      initialRouteName="Request"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#0D1117' },
      }}
    >
      <Tab.Screen name="Request" component={RequestScreen} />
      <Tab.Screen name="MyBookings" component={BookingsListScreen} />
      <Tab.Screen name="Providers" component={ProvidersMapScreen} />
      <Tab.Screen name="FollowUps" component={FollowUpDashboardScreen} />
    </Tab.Navigator>
  );
}
