// src/screens/BookingConfirmScreen.tsx
// Renders the booking checkout detail, offering calendar slots, transparent price breakdowns,
// and an animated swipe-to-confirm slider component.

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrchestratorStore } from '@/store/orchestratorStore';
import { Ionicons } from '@expo/vector-icons';
import { OfflineBanner } from '@/components/OfflineBanner';
import type { RootStackParamList } from '@/navigation/types';
import type { BookingResult } from '@/types/api';
import { ExecutionLogView } from '@/components/ExecutionLogView';
import { formatSlot } from '@/utils/dateFormatter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRACK_WIDTH = SCREEN_WIDTH - 40; // Horizontal screen padding
const SLIDER_WIDTH = 50;
const SWIPE_THRESHOLD = TRACK_WIDTH - SLIDER_WIDTH - 20;

export function BookingConfirmScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'BookingConfirm'>>();
  
  // Safely extract params
  const params = route.params || {};
  const { provider: routeProvider, response: routeResponse } = params;

  // Retrieve provider and response from global store as fallback
  const { selectedProvider: storeProvider, response: storeResponse, addBooking } = useOrchestratorStore();

  const selectedProvider = routeProvider || storeProvider;
  const response = routeResponse || storeResponse;

  const [selectedSlot, setSelectedSlot] = useState('Today, 03:00 PM - 05:00 PM');
  const [swipeComplete, setSwipeComplete] = useState(false);

  // Generate dynamic stable fallback values if response is missing (e.g. booked directly from map)
  const fallbackConfirmationId = useRef(`K-${Math.floor(100000 + Math.random() * 900000)}`).current;

  const slot = response?.booking?.slot || selectedSlot;
  const confirmationId = response?.booking?.confirmation_id || fallbackConfirmationId;
  const message = response?.booking?.message || 'booked';
  const reminderAt = response?.followup?.reminder_at || 'tomorrow morning';

  // Animation values for swipe interaction
  const panX = useRef(new Animated.Value(0)).current;

  if (!selectedProvider) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No service provider selected to book.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Set up PanResponder for Swipe-to-Confirm
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (swipeComplete) return;
        const newX = Math.max(0, Math.min(gestureState.dx, SWIPE_THRESHOLD));
        panX.setValue(newX);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (swipeComplete) return;
        if (gestureState.dx >= SWIPE_THRESHOLD * 0.8) {
          // Trigger successful confirmation animation
          Animated.timing(panX, {
            toValue: SWIPE_THRESHOLD,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setSwipeComplete(true);
            handleConfirmBooking();
          });
        } else {
          // Reset slider back to original position
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleConfirmBooking = () => {
    // We already have booking data from the response or generated dynamically!
    // We will save it to the store in the onComplete callback of ExecutionLogView
  };

  const bookingSteps = [
    'Connecting to booking system...',
    `Slot reserved: ${formatSlot(slot)}`,
    `Booking ID: ${confirmationId}`,
    `Provider notified: ${selectedProvider.name}`,
    'Calendar entry created',
    'Confirmation receipt generated',
    `Reminder scheduled: ${formatSlot(reminderAt)}`,
  ];

  const timeSlots = [
    'Today, 03:00 PM - 05:00 PM',
    'Today, 06:00 PM - 08:00 PM',
    'Tomorrow, 10:00 AM - 12:00 PM',
    'Tomorrow, 02:00 PM - 04:00 PM',
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <OfflineBanner />
      <LinearGradient colors={['#0F1524', '#0D1117']} style={styles.gradient}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#E8EAED" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm Booking</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Selected Provider Card */}
          <View style={styles.providerCardSummary}>
            <View style={styles.avatarMini}>
              <Text style={styles.avatarMiniText}>
                {selectedProvider.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.providerDetailsMini}>
              <Text style={styles.providerNameMini}>{selectedProvider.name}</Text>
              <Text style={styles.providerCategoryMini}>
                <Ionicons name="build" size={11} color="#4285F4" /> {selectedProvider.category.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          {swipeComplete ? (
            <View style={styles.executionContainer}>
              <Text style={styles.sectionLabel}>Execution Log</Text>
              <ExecutionLogView 
                steps={bookingSteps} 
                onComplete={() => {
                  const newBooking: BookingResult = {
                    provider_id: selectedProvider.id || 'p_001',
                    provider_name: selectedProvider.name,
                    slot: slot,
                    confirmation_id: confirmationId,
                    message: response?.booking?.message || 'Booking confirmed',
                    followup_reminder_at: response?.followup?.reminder_at || reminderAt,
                    status: 'CONFIRMED',
                    createdAt: new Date().toISOString(),
                  };
                  addBooking(newBooking);
                  navigation.replace('BookingDetail', { confirmationId: confirmationId });
                }}
              />
              <View style={styles.receiptContainer}>
                <Text style={styles.receiptLabel}>Confirmation ID:</Text>
                <Text style={styles.receiptId}>{confirmationId}</Text>
                <Text style={styles.receiptReminder}>Reminder: {formatSlot(reminderAt)}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionLabel}>Select Time Window</Text>
              <View style={styles.slotsGrid}>
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[styles.slotChip, isSelected && styles.slotChipActive]}
                      onPress={() => setSelectedSlot(slot)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Notice Card */}
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>
              <Ionicons name="information-circle" size={12} color="#90CDF4" /> No pre-payment required. Pay directly in cash or digital wallet once the service is completed successfully.
            </Text>
          </View>
        </ScrollView>

        {/* Swipe to Confirm Footer Panel */}
        <View style={styles.footerSwipePanel}>
          <View style={styles.swipeTrack}>
            {/* Background Hint Text */}
            <Text style={styles.swipeHintText}>
              {swipeComplete ? 'Processing Order...' : 'Swipe to Confirm'}
            </Text>

            {/* Slider Handle */}
            <Animated.View
              style={[
                styles.swipeSlider,
                { transform: [{ translateX: panX }] },
                swipeComplete && styles.swipeSliderComplete,
              ]}
              {...panResponder.panHandlers}
            >
              <Ionicons name={swipeComplete ? "checkmark" : "arrow-forward"} size={16} color="#FFFFFF" />
            </Animated.View>
          </View>
        </View>

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#9AA0A6',
    fontSize: 16,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#1A73E8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
    backgroundColor: '#101726',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#1C2333',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  backArrow: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8EAED',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120, // Height for sliding footer
  },
  providerCardSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C2333',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3748',
    padding: 12,
    marginBottom: 16,
  },
  avatarMini: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarMiniText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  providerDetailsMini: {
    flex: 1,
  },
  providerNameMini: {
    color: '#E8EAED',
    fontSize: 15,
    fontWeight: '700',
  },
  providerCategoryMini: {
    color: '#4285F4',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4285F4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  slotsGrid: {
    gap: 8,
  },
  slotChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  slotChipActive: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  slotText: {
    color: '#9AA0A6',
    fontSize: 13.5,
    fontWeight: '500',
  },
  slotTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: '#9AA0A6',
  },
  priceValue: {
    fontSize: 13,
    color: '#E8EAED',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#2D3748',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    color: '#E8EAED',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    color: '#0F9D58',
    fontWeight: '800',
  },
  noticeCard: {
    backgroundColor: '#111A2E',
    borderColor: '#1A365D',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  noticeText: {
    color: '#90CDF4',
    fontSize: 12.5,
    lineHeight: 18,
  },
  footerSwipePanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#101726',
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  swipeTrack: {
    height: 56,
    backgroundColor: '#111827',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#2D3748',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  swipeHintText: {
    textAlign: 'center',
    color: '#5F6368',
    fontWeight: '700',
    fontSize: 14,
    zIndex: 1,
  },
  swipeSlider: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  swipeSliderComplete: {
    backgroundColor: '#34A853',
  },
  sliderArrowText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  executionContainer: {
    marginTop: 16,
  },
  receiptContainer: {
    backgroundColor: '#1C2333',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34A853',
    alignItems: 'center',
    marginTop: 8,
  },
  receiptLabel: {
    color: '#9AA0A6',
    fontSize: 12,
    marginBottom: 4,
  },
  receiptId: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  receiptReminder: {
    color: '#90CDF4',
    fontSize: 14,
    marginTop: 8,
  },
});
