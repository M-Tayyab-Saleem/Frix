// src/screens/RequestScreen.tsx
// Core Request screen for Frix. Allows users to type prompts, auto-detects language,
// resolves location sectors, and initiates the agent thinking process.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useUserLocation } from '@/hooks/useUserLocation';
import { detectLanguage } from '@/utils/languageDetect';
import { useOrchestratorStore } from '@/store/orchestratorStore';
import { useThemeStore } from '@/store/themeStore';
import { getIsMockActive } from '@/api/orchestrator';
import { LocationPickerSheet } from '@/components/LocationPickerSheet';
import { OfflineBanner } from '@/components/OfflineBanner';
import type { RootStackParamList } from '@/navigation/types';
import type { UserLocation } from '@/types/api';
import { findKarachiLocation, getNearestKarachiLocation } from '@/data/karachiLocations';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EXAMPLE_PROMPTS = [
  'AC bilkul kaam nahi kar raha. Chilling nahi ho rahi.',
  'Need a certified plumber in Clifton to fix a leaking tap ASAP.',
  'Kal subah electrician chahiye DHA Phase 6 mein room light change karne ke liye.',
];

const PRIMARY_BLUE = '#1A73E8';

export function RequestScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const tabBarHeight = useBottomTabBarHeight();
  const { coords, isLoading: locationLoading, requestPermission, updateLocationManually } = useUserLocation();
  const { addRecentRequest, recentRequests, enableMockMode, mockModeEnabled } = useOrchestratorStore();
  const { theme, isDarkMode } = useThemeStore();

  // T-11: 5-tap panic button state
  const panicTapCount = useRef(0);
  const panicResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive current mock status (env flag OR session override)
  const isMockActive = mockModeEnabled || getIsMockActive();

  const [prompt, setPrompt] = useState('');
  const [selectedLang, setSelectedLang] = useState<'english' | 'urdu' | 'roman_urdu'>('english');
  const [isManualLang, setIsManualLang] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [resolvedLocation, setResolvedLocation] = useState<UserLocation>({
    area: 'DHA Phase 6',
    city: 'Karachi',
    lat: 24.7920,
    lng: 67.0645,
  });

  const [isListening, setIsListening] = useState(false);
  const sheetRef = useRef<BottomSheet>(null);

  // Animated scaling for button press
  const buttonScale = useRef(new Animated.Value(1)).current;
  const placeholderOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Generate dynamic styles matching theme
  const s = useMemo(() => createStyles(theme, isDarkMode), [theme, isDarkMode]);

  // Track placeholder rotating animation
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(placeholderOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(placeholderOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setPlaceholderIndex((prev) => (prev + 1) % EXAMPLE_PROMPTS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Mic Pulse animation loop
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  // Proactively request GPS permission and fetch real coordinates on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Update resolvedLocation based on GPS coordinates
  useEffect(() => {
    if (coords) {
      const best = getNearestKarachiLocation(coords.latitude, coords.longitude);
      setResolvedLocation({
        area: best.area,
        city: best.city,
        lat: coords.latitude,
        lng: coords.longitude,
      });
    }
  }, [coords]);

  // Handle prompt change to auto-detect language
  const handlePromptChange = (text: string) => {
    setPrompt(text);
    if (!isManualLang && text.trim().length > 0) {
      const detected = detectLanguage(text);
      setSelectedLang(detected);
    }
  };

  const handleSelectLang = (lang: 'english' | 'urdu' | 'roman_urdu') => {
    setSelectedLang(lang);
    setIsManualLang(true);
  };

  // Voice approach: C (keyboard fallback / simulated input via expo-av placeholder)
  // No new voice packages installed. Mic state toggles, provides visual feedback,
  // then auto-fills a sample prompt after 2 seconds to demonstrate the flow.
  const handleMicPress = () => {
    if (isListening) return;
    setIsListening(true);
    // Simulate 2 seconds of listening
    setTimeout(() => {
      setIsListening(false);
      const text = EXAMPLE_PROMPTS[1]; // Simulate recognizing the plumbing prompt
      setPrompt(text);
      setSelectedLang(detectLanguage(text));
    }, 2000);
  };

  // Location Picker
  const handleOpenLocationPicker = () => {
    sheetRef.current?.snapToIndex(0);
  };

  const handleSelectLocation = useCallback((area: string, lat: number, lng: number) => {
    const areaObj = findKarachiLocation(area);
    const city = areaObj?.city ?? 'Karachi';
    updateLocationManually({ latitude: lat, longitude: lng }, area);
    setResolvedLocation({ area, city, lat, lng });
    sheetRef.current?.close();
  }, [updateLocationManually]);

  // Button micro-animations
  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleFindService = () => {
    const trimmed = prompt.trim();
    if (trimmed.length < 5) return;

    // Proactive frontend validation to block URLs, local IPs, or web addresses
    const isUrl = /https?:\/\/|localhost|127\.0\.0\.1|192\.168\.|www\.[a-z0-9]+|\.[a-z]{2,}/i.test(trimmed);
    if (isUrl) {
      Alert.alert(
        '⚠️ Invalid Service Request',
        'Your request looks like a URL, web address, or local IP.\n\nPlease describe the actual service you need (e.g., "Need a plumber in DHA Phase 6" or "Electrician to fix a short circuit in Clifton").',
        [{ text: 'Got it', style: 'default' }]
      );
      return;
    }

    addRecentRequest(trimmed);
    
    navigation.navigate('AgentThinking', {
      userPrompt: trimmed,
      userLocation: resolvedLocation,
      currentTime: new Date().toISOString(),
    });
  };

  const fillPromptFromChip = (val: string) => {
    setPrompt(val);
    const detected = detectLanguage(val);
    setSelectedLang(detected);
    setIsManualLang(false);
  };

  const isButtonDisabled = prompt.trim().length < 5 || isListening;

  // T-11: Panic button handler — 5 quick taps on the title enables demo mode
  const handlePanicTap = () => {
    panicTapCount.current += 1;

    // Reset counter if user pauses for > 2 seconds between taps
    if (panicResetTimer.current) clearTimeout(panicResetTimer.current);
    panicResetTimer.current = setTimeout(() => {
      panicTapCount.current = 0;
    }, 2000);

    if (panicTapCount.current === 5) {
      panicTapCount.current = 0;
      enableMockMode();
      Alert.alert(
        '🛡️ Demo Safety Net Activated',
        'Mock mode is now enabled for this session.\n\nThe app will use hardcoded demo data — no backend required. Full flow will complete normally.',
        [{ text: 'Got it', style: 'default' }]
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={s.safeArea} edges={['top']}>
        <OfflineBanner />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.keyboardContainer}
        >
          <ScrollView contentContainerStyle={[s.container, { paddingBottom: tabBarHeight + 40 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Header Title — tap 5× to activate Demo Safety Net (T-11) */}
            <View style={s.header}>
              <TouchableOpacity onPress={handlePanicTap} activeOpacity={1}>
                <Text style={s.title}>What do you need?</Text>
              </TouchableOpacity>
              {isMockActive && (
                <View style={s.demoBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#34A853" />
                  <Text style={s.demoBadgeText}>DEMO MODE — No backend needed</Text>
                </View>
              )}
              <Text style={s.subtitle}>Our AI Agent will parse your request and orchestrate top local providers.</Text>
            </View>

            {/* Language Selection Row */}
            <View style={s.langContainer}>
              <Text style={s.sectionLabel}>DETECTED LANGUAGE</Text>
              <View style={s.langRow}>
                {(['english', 'urdu', 'roman_urdu'] as const).map((lang) => {
                  const isSelected = selectedLang === lang;
                  const label =
                    lang === 'english' ? 'English (EN)' : lang === 'urdu' ? 'اردو (Urdu)' : 'Roman Urdu';
                  return (
                    <TouchableOpacity
                      key={lang}
                      style={[s.langChip, isSelected && s.langChipActive]}
                      onPress={() => handleSelectLang(lang)}
                      activeOpacity={0.8}
                    >
                      <Text style={[s.langText, isSelected && s.langTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Input Area */}
            <View style={[s.inputCard, isListening && s.inputCardListening]}>
              <TextInput
                style={s.textInput}
                multiline
                numberOfLines={4}
                maxLength={300}
                value={prompt}
                onChangeText={handlePromptChange}
                placeholder={isListening ? "Listening..." : EXAMPLE_PROMPTS[placeholderIndex]}
                placeholderTextColor={theme.colors.onSurfaceVariant + '80'}
                editable={!isListening}
              />

              <View style={s.inputFooter}>
                <Text style={s.charCount}>{prompt.length}/300</Text>
                
                <TouchableOpacity onPress={handleMicPress} activeOpacity={0.7}>
                  <Animated.View style={[s.micButton, { transform: [{ scale: pulseAnim }] }, isListening && s.micButtonListening]}>
                    <Ionicons 
                      name={isListening ? "mic" : "mic-outline"} 
                      size={18} 
                      color={isListening ? (theme.colors.onPrimary || "#FFFFFF") : theme.colors.onSurfaceVariant} 
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Location Pill */}
            <TouchableOpacity
              style={s.locationPill}
              onPress={handleOpenLocationPicker}
              activeOpacity={0.8}
            >
              <View style={s.locationPillLeft}>
                <Ionicons name="location-outline" size={20} color={PRIMARY_BLUE} />
                {locationLoading ? (
                  <ActivityIndicator size="small" color={PRIMARY_BLUE} style={s.spinner} />
                ) : (
                  <Text style={s.locationText}>
                    {resolvedLocation.area} · {resolvedLocation.city}
                  </Text>
                )}
              </View>
              <Ionicons name="create-outline" size={18} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>

            {/* Submit Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[s.submitButton, isButtonDisabled && s.submitButtonDisabled]}
                disabled={isButtonDisabled}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleFindService}
                activeOpacity={0.9}
              >
                <Text style={[s.submitButtonText, isButtonDisabled && s.submitButtonTextDisabled]}>
                  Find Service
                </Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={18} 
                  color={isButtonDisabled ? (theme.colors.onSurfaceVariant + '80') : (theme.colors.onPrimary || "#FFFFFF")} 
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Recent Requests Section */}
            {recentRequests.length > 0 && (
              <View style={s.recentContainer}>
                <Text style={s.recentTitle}>RECENT REQUESTS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.recentScroll}>
                  {recentRequests.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={s.recentChip}
                      onPress={() => fillPromptFromChip(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={s.recentText} numberOfLines={1}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <LocationPickerSheet
        sheetRef={sheetRef}
        currentArea={resolvedLocation.area}
        currentCity={resolvedLocation.city}
        userCoords={coords ? { latitude: coords.latitude, longitude: coords.longitude } : null}
        onSelectLocation={handleSelectLocation}
      />
    </View>
  );
}

const createStyles = (theme: any, isDarkMode: boolean) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#0D1117',
    },
    keyboardContainer: {
      flex: 1,
    },
    container: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontFamily: 'NotoSerif-Bold',
      fontSize: 28,
      color: theme.colors.onSurface,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontFamily: 'Manrope-Regular',
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 20,
    },
    langContainer: {
      marginBottom: 20,
    },
    sectionLabel: {
      fontFamily: 'Manrope-Bold',
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      opacity: 0.7,
      marginBottom: 10,
      letterSpacing: 1.2,
    },
    langRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    langChip: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: '#1C2333',
      borderWidth: 1,
      borderColor: '#2D3748',
    },
    langChipActive: {
      backgroundColor: PRIMARY_BLUE + '1F',
      borderColor: PRIMARY_BLUE,
    },
    langText: {
      fontFamily: 'Manrope-Medium',
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    langTextActive: {
      color: PRIMARY_BLUE,
      fontWeight: '700',
    },
    inputCard: {
      backgroundColor: '#1C2333',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#2D3748',
      padding: 16,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 12,
      elevation: 3,
    },
    inputCardListening: {
      borderColor: PRIMARY_BLUE,
      backgroundColor: PRIMARY_BLUE + '15',
    },
    textInput: {
      fontFamily: 'Manrope-Regular',
      fontSize: 15,
      color: theme.colors.onSurface,
      minHeight: 100,
      textAlignVertical: 'top',
      padding: 0,
      lineHeight: 22,
    },
    inputFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#2D3748',
      paddingTop: 12,
    },
    charCount: {
      fontFamily: 'Manrope-Regular',
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      opacity: 0.6,
    },
    micButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: '#101726',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#2D3748',
    },
    micButtonListening: {
      backgroundColor: PRIMARY_BLUE,
      borderColor: PRIMARY_BLUE,
    },
    locationPill: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#1C2333',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#2D3748',
      marginBottom: 24,
    },
    locationPillLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationText: {
      fontFamily: 'Manrope-SemiBold',
      fontSize: 14,
      color: theme.colors.onSurface,
      marginLeft: 8,
    },
    spinner: {
      marginLeft: 12,
    },
    submitButton: {
      flexDirection: 'row',
      backgroundColor: PRIMARY_BLUE,
      borderRadius: 12,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      shadowColor: PRIMARY_BLUE,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
      marginBottom: 30,
    },
    submitButtonDisabled: {
      backgroundColor: '#101726',
      shadowOpacity: 0,
      elevation: 0,
    },
    submitButtonText: {
      fontFamily: 'Manrope-Bold',
      color: theme.colors.onPrimary || '#FFFFFF',
      fontSize: 16,
      letterSpacing: 0.5,
    },
    submitButtonTextDisabled: {
      color: theme.colors.onSurfaceVariant,
      opacity: 0.5,
    },
    // T-11: Demo mode badge
    demoBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(52, 168, 83, 0.12)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#34A853',
      paddingVertical: 4,
      paddingHorizontal: 8,
      gap: 4,
      marginTop: 6,
      marginBottom: 2,
    },
    demoBadgeText: {
      fontFamily: 'Manrope-Bold',
      fontSize: 11,
      color: '#34A853',
      letterSpacing: 0.3,
    },
    recentContainer: {
      marginTop: 8,
    },
    recentTitle: {
      fontFamily: 'Manrope-Bold',
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      opacity: 0.7,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    recentScroll: {
      gap: 10,
      paddingBottom: 20,
    },
    recentChip: {
      backgroundColor: '#1C2333',
      borderWidth: 1,
      borderColor: '#2D3748',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginRight: 10,
      maxWidth: 240,
    },
    recentText: {
      fontFamily: 'Manrope-Regular',
      fontSize: 13,
      color: theme.colors.onSurface,
    },
  });
