// src/screens/ProviderDetailScreen.tsx
// Renders a premium high-fidelity detailed profile view for the selected service provider
// including stats row, specialization chips, dynamic pricing breakdown, mock reviews, and availability grid.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrchestratorStore } from '@/store/orchestratorStore';
import { ScoreBar } from '@/components/ScoreBar';
import { Ionicons } from '@expo/vector-icons';

export function ProviderDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const { selectedProvider, response } = useOrchestratorStore();

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  if (!selectedProvider) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No provider selected.</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const firstLetter = selectedProvider.name.charAt(0).toUpperCase();

  const handleBook = () => {
    navigation.navigate('BookingConfirm');
  };

  const formatCategory = (cat: string) => {
    return cat
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Specializations derived from category
  const getSpecializations = (cat: string) => {
    const formatted = formatCategory(cat);
    return [
      `Standard ${formatted}`,
      `Emergency Repair`,
      `Installation & Setup`,
      `Commercial Diagnostics`,
    ];
  };

  // Availability grid: 3 days (Today, Tomorrow, Day After) x 3 slots (Morning, Afternoon, Evening)
  const availabilityGrid = [
    { id: 0, day: 'Today', slot: 'Morning (09:00 AM - 12:00 PM)', status: 'available' },
    { id: 1, day: 'Today', slot: 'Afternoon (01:00 PM - 04:00 PM)', status: 'unavailable' },
    { id: 2, day: 'Today', slot: 'Evening (05:00 PM - 08:00 PM)', status: 'available' },
    { id: 3, day: 'Tomorrow', slot: 'Morning (09:00 AM - 12:00 PM)', status: 'available' },
    { id: 4, day: 'Tomorrow', slot: 'Afternoon (01:00 PM - 04:00 PM)', status: 'available' },
    { id: 5, day: 'Tomorrow', slot: 'Evening (05:00 PM - 08:00 PM)', status: 'unavailable' },
    { id: 6, day: 'Day After', slot: 'Morning (09:00 AM - 12:00 PM)', status: 'available' },
    { id: 7, day: 'Day After', slot: 'Afternoon (01:00 PM - 04:00 PM)', status: 'available' },
    { id: 8, day: 'Day After', slot: 'Evening (05:00 PM - 08:00 PM)', status: 'available' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient colors={['#0F1524', '#0D1117']} style={styles.gradient}>
        
        {/* Sticky Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#E8EAED" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Provider Details</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroBlock}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLetterLarge}>{firstLetter}</Text>
            </View>
            <Text style={styles.nameText}>{selectedProvider.name}</Text>
            
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>
                <Ionicons name="build" size={11} color="#4285F4" /> {formatCategory(selectedProvider.category)}
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}><Ionicons name="star" size={14} color="#F9AB00" /> {selectedProvider.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>96%</Text>
              <Text style={styles.statLabel}>On-Time %</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>&lt; 30m</Text>
              <Text style={styles.statLabel}>Response</Text>
            </View>
          </View>

          {/* AI Match Insights */}
          <View style={styles.insightsCard}>
            <Text style={styles.sectionLabel}>AI Match Insights</Text>
            <ScoreBar score={selectedProvider.score} label="Match Compatibility Score" />
            
            {selectedProvider.reasoning && (
              <View style={styles.reasoningBubble}>
                <Text style={styles.reasoningLabel}>AI MATCH RATIONALE</Text>
                <Text style={styles.reasoningText}>
                  "{selectedProvider.reasoning}"
                </Text>
              </View>
            )}
          </View>

          {/* Specializations */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Core Competencies</Text>
            <View style={styles.specializationsContainer}>
              {getSpecializations(selectedProvider.category).map((spec, i) => (
                <View key={i} style={styles.specChip}>
                  <Text style={styles.specChipText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Transparent Pricing Card */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Pricing & Fees</Text>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Base Diagnostic Fee</Text>
              <Text style={styles.priceValue}>PKR 500</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Standard Labor Rate</Text>
              <Text style={styles.priceValue}>PKR 300/hr</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Urgency Surcharge (Same-Day)</Text>
              <Text style={styles.priceValue}>1.5x Multiplier</Text>
            </View>
            <View style={styles.divider} />
            <View style={[styles.priceItem, { borderBottomWidth: 0 }]}>
              <Text style={styles.totalEstimateLabel}>Total Job Estimate Range</Text>
              <Text style={styles.totalEstimateValue}>PKR 1,200 - 1,800</Text>
            </View>
          </View>

          {/* Availability Grid */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Select Availability Window</Text>
            <View style={styles.gridContainer}>
              {availabilityGrid.map((item, idx) => {
                const isUnavailable = item.status === 'unavailable';
                const isSelected = selectedSlotIndex === idx;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.gridItem,
                      isUnavailable && styles.gridItemUnavailable,
                      isSelected && styles.gridItemSelected,
                    ]}
                    disabled={isUnavailable}
                    onPress={() => setSelectedSlotIndex(idx)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.gridDay,
                        isUnavailable && styles.gridTextUnavailable,
                        isSelected && styles.gridTextSelected,
                      ]}
                    >
                      {item.day}
                    </Text>
                    <Text
                      style={[
                        styles.gridTime,
                        isUnavailable && styles.gridTextUnavailable,
                        isSelected && styles.gridTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {item.slot.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Mock Customer Reviews */}
          <View style={[styles.card, { marginBottom: 20 }]}>
            <Text style={styles.sectionLabel}>Customer Reviews</Text>
            
            <View style={styles.reviewWrapper}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>Tayyab S.</Text>
                <View style={{flexDirection: 'row'}}><Ionicons name="star" size={11} color="#F9AB00" /><Ionicons name="star" size={11} color="#F9AB00" /><Ionicons name="star" size={11} color="#F9AB00" /><Ionicons name="star" size={11} color="#F9AB00" /><Ionicons name="star" size={11} color="#F9AB00" /></View>
              </View>
              <Text style={styles.reviewBody}>
                "Prompt service and absolute professional diagnosis. Explained what compressor coils needed repairs and completed it within an hour."
              </Text>
            </View>

            <View style={[styles.reviewWrapper, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>Aisha M.</Text>
                <View style={{flexDirection: 'row'}}><Ionicons name="star" size={11} color="#F9AB00" /><Ionicons name="star" size={11} color="#F9AB00" /><Ionicons name="star" size={11} color="#F9AB00" /><Ionicons name="star" size={11} color="#F9AB00" /><Ionicons name="star" size={11} color="#F9AB00" /></View>
              </View>
              <Text style={styles.reviewBody}>
                "Very honest billing. Ali completed the setup quickly and left the work area clean. Highly recommend for any home services."
              </Text>
            </View>
          </View>

        </ScrollView>

        {/* Footer Navigation Bar */}
        <View style={styles.footerBar}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Go Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bookBtn}
            onPress={handleBook}
            activeOpacity={0.8}
          >
            <Text style={styles.bookBtnText}>Book This Provider</Text>
          </TouchableOpacity>
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
    paddingBottom: 100, // Leave space for footer
  },
  heroBlock: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  avatarLetterLarge: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E8EAED',
    marginBottom: 6,
  },
  categoryChip: {
    backgroundColor: '#1A3A5C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#4285F4',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1C2333',
    borderWidth: 1,
    borderColor: '#2D3748',
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E8EAED',
  },
  statLabel: {
    fontSize: 10,
    color: '#9AA0A6',
    marginTop: 4,
    fontWeight: '600',
  },
  insightsCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4285F4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  reasoningBubble: {
    backgroundColor: '#141A29',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#4285F4',
  },
  reasoningLabel: {
    fontSize: 8.5,
    color: '#4285F4',
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  reasoningText: {
    fontSize: 12.5,
    color: '#9AA0A6',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    marginBottom: 16,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specChip: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#2D3748',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  specChipText: {
    fontSize: 12,
    color: '#9AA0A6',
    fontWeight: '600',
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
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
    marginVertical: 4,
  },
  totalEstimateLabel: {
    fontSize: 13.5,
    color: '#E8EAED',
    fontWeight: '700',
  },
  totalEstimateValue: {
    fontSize: 14.5,
    color: '#0F9D58',
    fontWeight: '800',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '31%',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#2D3748',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  gridItemUnavailable: {
    opacity: 0.35,
  },
  gridItemSelected: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  gridDay: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#E8EAED',
    marginBottom: 2,
  },
  gridTime: {
    fontSize: 9.5,
    color: '#9AA0A6',
    fontWeight: '500',
  },
  gridTextUnavailable: {
    color: '#5F6368',
  },
  gridTextSelected: {
    color: '#FFFFFF',
  },
  reviewWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
    paddingBottom: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#E8EAED',
  },
  reviewStars: {
    fontSize: 11,
  },
  reviewBody: {
    fontSize: 12.5,
    color: '#9AA0A6',
    lineHeight: 18,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#101726',
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#9AA0A6',
    fontSize: 14,
    fontWeight: '700',
  },
  bookBtn: {
    flex: 2,
    height: 48,
    backgroundColor: '#1A73E8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
