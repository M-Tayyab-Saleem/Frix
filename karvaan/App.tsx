// App.tsx — Frix entry point with global providers
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { RootNavigator } from '@/navigation/RootNavigator';
import { linkingConfig } from '@/navigation/linkingConfig';
import { navigationRef } from '@/navigation/navigationRef';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { initSentry } from '@/lib/sentry';
import { queryStorage } from '@/lib/queryStorage';

// Initialize Sentry before any rendering
initSentry();

// Create a persister for TanStack Query using MMKV
const mmkvPersister = createSyncStoragePersister({
  storage: queryStorage,
});

// Configure TanStack Query Client with offline persistence
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      // Enable persistence for all queries by default
      structuralSharing: true,
    },
  },
});

/**
 * Root App component with all global providers.
 * 
 * Provider order (outside-in):
 * 1. GestureHandlerRootView — Required for gesture-based Components
 * 2. SafeAreaProvider — Required for proper layout in notched devices
 * 3. ErrorBoundary — Catches React rendering errors
 * 4. QueryClientProvider — TanStack Query for server state
 * 5. NavigationContainer — React Navigation with deep linking
 * 6. RootNavigator — App routing logic
 */
export default function App() {
  // Load custom fonts: Noto Serif (headlines) and Manrope (body/UI)
  // If fonts fail to load (e.g., missing .ttf files), the app still renders
  const [fontsLoaded, fontError] = useFonts({
    'NotoSerif-Bold': require('./assets/fonts/NotoSerif-Bold.ttf'),
    'NotoSerif-SemiBold': require('./assets/fonts/NotoSerif-SemiBold.ttf'),
    'NotoSerif-Regular': require('./assets/fonts/NotoSerif-Regular.ttf'),
    'Manrope-Regular': require('./assets/fonts/Manrope-Regular.ttf'),
    'Manrope-Medium': require('./assets/fonts/Manrope-Medium.ttf'),
    'Manrope-SemiBold': require('./assets/fonts/Manrope-SemiBold.ttf'),
  });

  // Log font loading errors
  if (fontError) {
    console.warn('⚠️ Fonts failed to load:', fontError.message);
    console.warn('💡 Run: powershell -File assets/fonts/download-fonts.ps1');
  }

  // Return null until fonts are loaded (prevents flash of unstyled text)
  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#131313' }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: mmkvPersister }}
          >
            <NavigationContainer ref={navigationRef} linking={linkingConfig}>
              <RootNavigator />
              <StatusBar style="light" />
            </NavigationContainer>
          </PersistQueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
