// src/screens/AgentThinkingScreen.tsx
// Displays a command-center-like AI thinking UI, executing the API call to the orchestrator
// in parallel with smooth sequential animations revealing the agent steps.

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrchestratorStore } from '@/store/orchestratorStore';
import { orchestrate, setUseMockOverride, getIsMockActive } from '@/api/orchestrator';
import { getMockResponse } from '@/api/mockResponse';
import { AgentStepCard } from '@/components/AgentStepCard';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { RootStackParamList } from '@/navigation/types';
import type { OrchestrateResponse } from '@/types/api';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type AgentThinkingRouteProp = RouteProp<RootStackParamList, 'AgentThinking'>;

const AGENT_STEPS = [
  { name: 'IntentParser',   delayMs: 600,  fallback: 'Parsing your service request...' },
  { name: 'ProviderFinder', delayMs: 1400, fallback: 'Searching providers in your area...' },
  { name: 'Ranker',         delayMs: 2400, fallback: 'Scoring by distance, rating, availability...' },
  { name: 'Booking',        delayMs: 3200, fallback: 'Reserving slot with top provider...' },
  { name: 'FollowUp',       delayMs: 3800, fallback: 'Scheduling reminder before appointment...' },
];

export function AgentThinkingScreen(): React.JSX.Element {
  const route = useRoute<AgentThinkingRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const networkState = useNetworkStatus();
  
  const { userPrompt, userLocation, currentTime } = route.params;
  const { setRequest, setResponse, mockModeEnabled } = useOrchestratorStore();

  // T-11: derive live mock status (env var OR panic-button session override)
  const isMockActive = mockModeEnabled || getIsMockActive();

  const [visibleCount, setVisibleCount] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const animationDoneRef = useRef(false);
  const apiResponseRef = useRef<OrchestrateResponse | null>(null);
  const [stepSummaries, setStepSummaries] = useState<string[]>(
    AGENT_STEPS.map(s => s.fallback)
  );
  const [apiError, setApiError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'offline' | 'timeout' | 'generic' | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const offlineCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set gestureEnabled to false to prevent navigation away during AI work
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
      headerShown: false,
    });
  }, [navigation]);

  // Check and navigate if both conditions are met
  const checkAndNavigate = () => {
    if (apiResponseRef.current && animationDoneRef.current) {
      navigation.replace('Results', { response: apiResponseRef.current });
    }
  };

  // Execute orchestrator API call
  const runOrchestrator = async () => {
    setApiError(null);
    setErrorType(null);

    try {
      const reqPayload = {
        user_prompt: userPrompt,
        user_location: userLocation,
        current_time: currentTime,
      };
      
      setRequest(reqPayload);

      // T-12: Check if offline BEFORE making the API call
      const isOffline = networkState.isConnected === false || networkState.isInternetReachable === false;
      if (isOffline) {
        throw Object.assign(new Error('Device is offline. Unable to reach the API.'), {
          isTimeout: false,
          isOffline: true,
        });
      }

      // T-12: Set a timeout to detect if API is hanging (slow network)
      // If no response within 2 seconds and we haven't gotten an error, show a generic "loading" message
      const offlineCheckTimer = setTimeout(() => {
        if (!apiResponseRef.current && !apiError) {
          console.log('[AgentThinking] No quick response received, continuing to wait...');
        }
      }, 2000);

      const res = await orchestrate(reqPayload);
      clearTimeout(offlineCheckTimer);
      apiResponseRef.current = res;
      setResponse(res);

      // Populate step card summaries from the live trace response
      if (res.trace?.steps) {
        const steps = res.trace.steps;
        setStepSummaries([
          steps.find(s => s.agent === 'IntentParser')?.summary ?? 'Parsing your request...',
          steps.find(s => s.agent === 'ProviderFinder')?.summary ?? 'Finding providers...',
          steps.find(s => s.agent === 'Ranker')?.summary ?? 'Ranking matches...',
          steps.find(s => s.agent === 'Booking')?.summary ?? 'Preparing booking...',
          steps.find(s => s.agent === 'FollowUp')?.summary ?? 'Scheduling follow-up...',
        ]);
      }

      checkAndNavigate();
    } catch (err: any) {
      // T-12: Differentiate between offline, timeout, and generic errors
      if (err.isOffline) {
        setErrorType('offline');
        setApiError('No internet connection. Please enable WiFi or cellular data.');
        console.error('[AgentThinking] Offline error:', err.message);
      } else if (err.isTimeout) {
        setErrorType('timeout');
        setApiError('Request timed out. The API is taking too long to respond. Please try again.');
        console.error('[AgentThinking] Timeout error:', err.message);
      } else {
        setErrorType('generic');
        setApiError(err.message ?? 'Orchestration request failed. Verify your server connection.');
        console.error('[AgentThinking] Generic error:', err.message);
      }
    }
  };

  useEffect(() => {
    runOrchestrator();

    // Trigger step visual sequence timers
    const timers = AGENT_STEPS.map((step, index) => {
      return setTimeout(() => {
        setVisibleCount(index + 1);
      }, step.delayMs);
    });

    // Final animation completion timer
    const doneTimer = setTimeout(() => {
      animationDoneRef.current = true;
      setAnimationDone(true);
      checkAndNavigate();
    }, 4400);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
      if (offlineCheckTimeoutRef.current) {
        clearTimeout(offlineCheckTimeoutRef.current);
      }
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    runOrchestrator().finally(() => {
      setIsRetrying(false);
    });
  };

  const handleUseDemo = () => {
    setUseMockOverride(true);
    const mockRes = getMockResponse({
      user_prompt: userPrompt,
      user_location: userLocation,
      current_time: currentTime,
    });
    apiResponseRef.current = mockRes;
    setResponse(mockRes);
    // Force transition since user clicked fallback option
    animationDoneRef.current = true;
    setAnimationDone(true);
    navigation.replace('Results', { response: mockRes });
  };

  const handleNavigateBack = () => {
    // T-12: Navigate back to RequestScreen cleanly
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  if (apiError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <LinearGradient
          colors={['#0F1524', '#0D1117']}
          style={styles.gradient}
        >
          <View style={styles.errorContainer}>
            <View style={[styles.errorCard, errorType === 'offline' && styles.errorCardOffline, errorType === 'timeout' && styles.errorCardTimeout]}>
              <View style={styles.errorHeader}>
                <Ionicons 
                  name={errorType === 'offline' ? 'cloud-offline' : errorType === 'timeout' ? 'timer-outline' : 'alert-circle'} 
                  size={20} 
                  color={errorType === 'offline' ? '#4285F4' : '#EA4335'} 
                  style={styles.errorHeaderIcon}
                />
                <Text style={styles.errorTitle}>
                  {errorType === 'offline' ? 'Offline' : errorType === 'timeout' ? 'Request Timed Out' : 'Connection Failed'}
                </Text>
              </View>
              <Text style={styles.errorMessage}>{apiError}</Text>
              
              <View style={styles.errorActions}>
                <TouchableOpacity
                  style={[styles.errorButton, styles.retryButton]}
                  onPress={handleRetry}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.errorButtonText}>Retry</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.errorButton, styles.backButton]}
                  onPress={handleNavigateBack}
                >
                  <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>

              {errorType !== 'offline' && (
                <TouchableOpacity
                  style={styles.fallbackButton}
                  onPress={handleUseDemo}
                >
                  <Text style={styles.fallbackButtonText}>Try with demo data</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#0F1524', '#0D1117']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* T-11: DEMO MODE banner — visible when mock safety net is armed */}
          {isMockActive && (
            <View style={styles.demoBanner}>
              <Ionicons name="shield-checkmark" size={13} color="#34A853" />
              <Text style={styles.demoBannerText}>DEMO MODE — Using mock data</Text>
            </View>
          )}

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerSubtitle}>AI ORCHESTRATOR IN PROGRESS</Text>
            <Text style={styles.headerTitle}>Thinking...</Text>
          </View>

          {/* User Prompt Speech Bubble */}
          <View style={styles.promptBubble}>
            <View style={styles.promptBubbleHeader}>
              <Text style={styles.promptBubbleTitle}>Your Request</Text>
              <Text style={styles.promptLanguage}>
                <Ionicons name="location" size={12} color="#9AA0A6" /> {userLocation.area} · {userLocation.city || 'Karachi'}
              </Text>
            </View>
            <Text style={styles.promptText}>"{userPrompt}"</Text>
          </View>

          {/* Trace Timeline Steps */}
          <View style={styles.timelineContainer}>
            <Text style={styles.timelineHeader}>Agent Trace Execution Log</Text>
            {AGENT_STEPS.map((step, index) => {
              const isVisible = index < visibleCount;
              if (!isVisible) return null;

              // Calculate status
              const isLastVisible = index === visibleCount - 1;
              const isAllDone = visibleCount === AGENT_STEPS.length && animationDone;
              
              let status: 'pending' | 'active' | 'done' = 'pending';
              if (isAllDone || index < visibleCount - 1) {
                status = 'done';
              } else if (isLastVisible) {
                status = 'active';
              }

              // Load trace summary from stepSummaries state
              const summaryText = stepSummaries[index];

              return (
                <AgentStepCard
                  key={step.name}
                  stepName={step.name}
                  summary={summaryText}
                  status={status}
                  index={index}
                />
              );
            })}
          </View>

          {/* Global Loading Spinner */}
          {!apiError && !apiResponseRef.current && (
            <View style={styles.globalLoading}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.globalLoadingText}>Contacting AI agents...</Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  gradient: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4285F4',
    letterSpacing: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  promptBubble: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  promptBubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
    paddingBottom: 8,
  },
  promptBubbleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9AA0A6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptLanguage: {
    fontSize: 12,
    color: '#4285F4',
    fontWeight: '600',
  },
  promptText: {
    fontSize: 15,
    color: '#E8EAED',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  errorCard: {
    backgroundColor: '#2D1B1B',
    borderColor: '#EA4335',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  errorCardOffline: {
    backgroundColor: 'rgba(66, 133, 244, 0.08)',
    borderColor: '#4285F4',
  },
  errorCardTimeout: {
    backgroundColor: 'rgba(251, 188, 4, 0.08)',
    borderColor: '#FBBC04',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorMessage: {
    fontSize: 14,
    color: '#FAD2E1',
    lineHeight: 20,
    marginBottom: 16,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorHeaderIcon: {
    marginRight: 8,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EA4335',
  },
  errorText: {
    fontSize: 14,
    color: '#FAD2E1',
    lineHeight: 20,
    marginBottom: 16,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  errorButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#EA4335',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EA4335',
  },
  demoButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#EA4335',
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  backButtonText: {
    color: '#EA4335',
    fontWeight: '700',
    fontSize: 14,
  },
  demoButtonText: {
    color: '#EA4335',
    fontWeight: '700',
    fontSize: 14,
  },
  fallbackButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(66, 133, 244, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackButtonText: {
    color: '#4285F4',
    fontWeight: '600',
    fontSize: 13,
  },
  timelineContainer: {
    marginTop: 8,
  },
  timelineHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9AA0A6',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  globalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 12,
  },
  globalLoadingText: {
    color: '#4285F4',
    fontSize: 13,
    fontWeight: '600',
  },
  // T-11: Demo mode banner
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(52, 168, 83, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34A853',
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 6,
    marginBottom: 16,
  },
  demoBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34A853',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
