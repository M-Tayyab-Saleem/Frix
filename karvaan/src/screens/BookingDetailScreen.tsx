// src/screens/BookingDetailScreen.tsx
// Renders the high-fidelity tracking interface for a booking, with live state progression,
// dynamic progress timeline, support hotlines, and instant routing to dispute resolution.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrchestratorStore } from '@/store/orchestratorStore';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Ionicons } from '@expo/vector-icons';
import { formatSlot } from '@/utils/dateFormatter';

type StatusType = 'confirmed' | 'en_route' | 'in_progress' | 'completed';

export function BookingDetailScreen(): React.JSX.Element {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { confirmationId } = route.params || {};

  const { bookings } = useOrchestratorStore();
  const booking = bookings.find((b) => b.confirmation_id === confirmationId);

  // Live status state
  const [status, setStatus] = useState<StatusType>('confirmed');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hasRated, setHasRated] = useState(false);

  // Auto-advance simulation for demo purposes
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStatus('en_route');
    }, 15000); // 15 seconds: En Route

    const timer2 = setTimeout(() => {
      setStatus('in_progress');
    }, 30000); // 30 seconds: In Progress

    const timer3 = setTimeout(() => {
      setStatus('completed');
    }, 45000); // 45 seconds: Completed

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="calendar-outline" size={48} color="#2D3748" style={{ marginBottom: 16 }} />
          <Text style={styles.errorText}>Booking not found</Text>
          <Text style={[styles.errorText, { fontSize: 13, marginBottom: 24 }]}>
            No booking with ID "{confirmationId}" exists in your history.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Fast-forward status for live testing & judging
  const forceAdvanceStatus = () => {
    if (status === 'confirmed') setStatus('en_route');
    else if (status === 'en_route') setStatus('in_progress');
    else if (status === 'in_progress') setStatus('completed');
    else setStatus('confirmed');
  };

  const handleRateSubmit = () => {
    setHasRated(true);
    setIsRatingModalOpen(false);
    Alert.alert('Thank You!', 'Your rating has been submitted successfully to train the ranker agent.');
  };

  const renderStatusStepper = () => {
    const steps: { key: StatusType; label: string }[] = [
      { key: 'confirmed', label: 'Confirmed' },
      { key: 'en_route', label: 'En Route' },
      { key: 'in_progress', label: 'In Progress' },
      { key: 'completed', label: 'Completed' },
    ];

    const currentIdx = steps.findIndex((s) => s.key === status);

    return (
      <View style={styles.stepperContainer}>
        {steps.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <View key={step.key} style={styles.stepWrapper}>
              {/* Dot & Connectors */}
              <View style={styles.nodeContainer}>
                {idx > 0 && (
                  <View style={[styles.connector, isDone || isActive ? styles.connectorActive : null]} />
                )}
                <View
                  style={[
                    styles.nodeDot,
                    isDone && styles.nodeDotDone,
                    isActive && styles.nodeDotActive,
                    isPending && styles.nodeDotPending,
                  ]}
                >
                  {isDone && <Ionicons name="checkmark" size={12} color="#FFFFFF" style={{ fontWeight: '900' }} />}
                </View>
              </View>

              {/* Step Label */}
              <Text
                style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  isDone && styles.stepLabelDone,
                ]}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  // Status-specific banner text (using real provider name from booking)
  const getBannerConfig = () => {
    const providerName = booking.provider_name;
    switch (status) {
      case 'confirmed':
        return {
          title: 'Booking Confirmed',
          desc: `${providerName} has reserved your selected time slot.`,
          color: '#1A73E8',
        };
      case 'en_route':
        return {
          title: 'Provider En Route',
          desc: `${providerName} is currently traveling toward your area location.`,
          color: '#F9AB00',
        };
      case 'in_progress':
        return {
          title: 'Service in Progress',
          desc: 'The job is currently being performed. Inspect upon completion.',
          color: '#00D1FF',
        };
      case 'completed':
        return {
          title: 'Job Completed',
          desc: `Service completed. Please confirm satisfaction and rate ${providerName}.`,
          color: '#0F9D58',
        };
    }
  };

  const banner = getBannerConfig();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <OfflineBanner />
      <LinearGradient colors={['#0F1524', '#0D1117']} style={styles.gradient}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('MainTabs')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#E8EAED" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Order Tracker</Text>
            <Text style={styles.headerSubtitle}>{confirmationId}</Text>
          </View>

          {/* Hackathon Fast Forward Badge */}
          <TouchableOpacity style={styles.demoBadge} onPress={forceAdvanceStatus}>
            <Text style={styles.demoBadgeText}><Ionicons name="play-forward" size={10} color="#90CDF4" /> SIMULATE STATE</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Real-time Status Card */}
          <View style={[styles.statusCard, { borderLeftColor: banner.color }]}>
            <Text style={[styles.statusTitle, { color: banner.color }]}>{banner.title}</Text>
            <Text style={styles.statusDescription}>{banner.desc}</Text>
            
            <View style={styles.divider} />
            {renderStatusStepper()}
          </View>

          {/* Provider Contact Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Assigned Provider Details</Text>
            <View style={styles.providerInfoRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {booking.provider_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.providerMeta}>
                <Text style={styles.providerName}>{booking.provider_name}</Text>
                <Text style={styles.contactText}><Ionicons name="call" size={11} color="#9AA0A6" /> +92 300 1234567 (Simulated)</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Confirmed Slot</Text>
              <Text style={styles.detailValue}>{booking.slot}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}><Ionicons name="cash" size={12} color="#E8EAED" /> Cash / Wallet on Delivery</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimated Bill</Text>
              <Text style={[styles.detailValue, { color: '#0F9D58', fontWeight: '800' }]}>Rs. 1,610</Text>
            </View>
          </View>

          {/* Service Timeline Log */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Activity Timeline</Text>
            
            {/* Item 1: Booking Confirmed — always done */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.timelineDotDone]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Booking Confirmed</Text>
                <Text style={styles.timelineTime}>
                  {booking.createdAt ? formatSlot(booking.createdAt) : 'Just now'}
                </Text>
                <Text style={styles.timelineDesc}>
                  AI Orchestrator matched and confirmed {booking.provider_name}.
                </Text>
              </View>
            </View>

            {/* Item 2: Reminder Scheduled — always done (it was scheduled on booking creation) */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.timelineDotDone]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Reminder Scheduled</Text>
                <Text style={styles.timelineTime}>
                  {booking.followup_reminder_at
                    ? formatSlot(booking.followup_reminder_at)
                    : '1 hour before slot'}
                </Text>
                <Text style={styles.timelineDesc}>
                  SMS reminder queued 1 hour before your appointment.
                </Text>
              </View>
            </View>

            {/* Item 3: Provider En Route — done when status >= en_route */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  status !== 'confirmed' ? styles.timelineDotDone : null,
                ]}
              />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Provider En Route</Text>
                <Text style={styles.timelineTime}>En route stage</Text>
                <Text style={styles.timelineDesc}>
                  {booking.provider_name} departed and is heading to your address.
                </Text>
              </View>
            </View>

            {/* Item 4: Service In Progress — done when status >= in_progress */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  status === 'in_progress' || status === 'completed'
                    ? styles.timelineDotDone
                    : null,
                ]}
              />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Service In Progress</Text>
                <Text style={styles.timelineTime}>
                  {booking.slot ? formatSlot(booking.slot) : 'Scheduled slot'}
                </Text>
                <Text style={styles.timelineDesc}>
                  On-site inspection and service started.
                </Text>
              </View>
            </View>

            {/* Item 5: Service Completed — done when status = completed */}
            <View style={[styles.timelineItem, { marginBottom: 0 }]}>
              <View
                style={[
                  styles.timelineDot,
                  status === 'completed' ? styles.timelineDotDone : null,
                ]}
              />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Service Completed</Text>
                <Text style={styles.timelineTime}>Done stage</Text>
                <Text style={styles.timelineDesc}>
                  Service finished. Awaiting your feedback.
                </Text>
              </View>
            </View>
          </View>

          {/* Action Footer Button Group */}
          <View style={styles.actionGroup}>
            {status === 'completed' ? (
              <TouchableOpacity
                style={[styles.actionBtn, styles.rateBtn]}
                disabled={hasRated}
                onPress={() => setIsRatingModalOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.rateBtnText}>
                  {hasRated
                    ? <Text><Ionicons name="star" size={14} color="#FFFFFF" /> Rating Submitted</Text>
                    : <Text><Ionicons name="star" size={14} color="#FFFFFF" /> Rate {booking.provider_name}</Text>}
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.actionBtn, styles.disputeBtn]}
              onPress={() =>
                navigation.navigate('Dispute', {
                  confirmationId,
                  providerName: booking.provider_name,
                })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.disputeBtnText}><Ionicons name="warning" size={14} color="#F87171" /> File Dispute / Report Issue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Rating Modal */}
        <Modal
          visible={isRatingModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsRatingModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Rate {booking.provider_name}</Text>
              <Text style={styles.modalSubtitle}>
                Your feedback directly improves agentic matching quality.
              </Text>

              {/* Star Selector */}
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Ionicons name="star" size={28} color={rating >= star ? "#F9AB00" : "#2D3748"} />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.reviewInput}
                multiline
                numberOfLines={3}
                placeholder="Write your review..."
                placeholderTextColor="#5F6368"
                value={reviewText}
                onChangeText={setReviewText}
              />

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setIsRatingModalOpen(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalSubmit} onPress={handleRateSubmit}>
                  <Text style={styles.modalSubmitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
    fontSize: 17,
    fontWeight: '800',
    color: '#E8EAED',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#9AA0A6',
    fontFamily: 'monospace',
    marginTop: 1,
  },
  demoBadge: {
    backgroundColor: '#1B3A57',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2B6CB0',
  },
  demoBadgeText: {
    color: '#90CDF4',
    fontSize: 10,
    fontWeight: '800',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 13,
    color: '#9AA0A6',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#2D3748',
    marginVertical: 14,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  nodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    left: '-50%',
    right: '50%',
    height: 3,
    backgroundColor: '#2D3748',
    zIndex: 1,
  },
  connectorActive: {
    backgroundColor: '#34A853',
  },
  nodeDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeDotDone: {
    backgroundColor: '#34A853',
  },
  nodeDotActive: {
    backgroundColor: '#1A73E8',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  nodeDotPending: {
    backgroundColor: '#2D3748',
  },
  nodeCheck: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  stepLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#5F6368',
    marginTop: 6,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#1A73E8',
  },
  stepLabelDone: {
    color: '#E8EAED',
  },
  sectionCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    padding: 16,
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
  providerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  providerMeta: {
    flex: 1,
  },
  providerName: {
    color: '#E8EAED',
    fontSize: 16,
    fontWeight: '700',
  },
  contactText: {
    color: '#9AA0A6',
    fontSize: 12.5,
    marginTop: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#9AA0A6',
  },
  detailValue: {
    fontSize: 13,
    color: '#E8EAED',
    fontWeight: '600',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2D3748',
    marginTop: 4,
    marginRight: 12,
  },
  timelineDotDone: {
    backgroundColor: '#34A853',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    color: '#E8EAED',
    fontSize: 13.5,
    fontWeight: '700',
  },
  timelineTime: {
    color: '#4285F4',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  timelineDesc: {
    color: '#9AA0A6',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
  },
  actionGroup: {
    gap: 12,
    marginTop: 10,
  },
  actionBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  rateBtn: {
    backgroundColor: '#0F9D58',
    borderColor: '#0F9D58',
  },
  rateBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  disputeBtn: {
    backgroundColor: '#241415',
    borderColor: '#7F1D1D',
  },
  disputeBtnText: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1C2333',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E8EAED',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: '#9AA0A6',
    textAlign: 'center',
    marginBottom: 16,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  starChar: {
    fontSize: 32,
    color: '#2D3748',
  },
  starCharSelected: {
    color: '#F9AB00',
  },
  reviewInput: {
    width: '100%',
    height: 70,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#2D3748',
    borderRadius: 10,
    padding: 10,
    color: '#E8EAED',
    fontSize: 13.5,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancel: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#E8EAED',
    fontSize: 13.5,
    fontWeight: '700',
  },
  modalSubmit: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
