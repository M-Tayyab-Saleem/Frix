// src/screens/BookingsListScreen.tsx
// Renders the My Bookings tab view, displaying all locally persisted active and completed bookings.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useOrchestratorStore } from '@/store/orchestratorStore';
import { Ionicons } from '@expo/vector-icons';
import type { BookingResult } from '../types/api';

export function BookingsListScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
  const { bookings } = useOrchestratorStore();

  const handleBookingPress = (booking: BookingResult) => {
    navigation.navigate('BookingDetail', { confirmationId: booking.confirmation_id });
  };

  const renderBookingCard = ({ item }: { item: BookingResult }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleBookingPress(item)}
        activeOpacity={0.8}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.confirmationId}>
            {item.confirmation_id}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>CONFIRMED</Text>
          </View>
        </View>

        {/* Card Content */}
        <View style={styles.cardBody}>
          <Text style={styles.providerLabel}>PROVIDER</Text>
          <Text style={styles.providerName}>{item.provider_name}</Text>
          
          <Text style={[styles.providerLabel, { marginTop: 10 }]}>SCHEDULED SLOT</Text>
          <Text style={styles.slotTime}>{item.slot}</Text>
        </View>

        {/* Card Footer Chevron */}
        <View style={styles.cardFooter}>
          <Text style={styles.detailsLink}>Track Status</Text>
          <Ionicons name="arrow-forward" size={14} color="#9AA0A6" style={styles.chevron} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>
          {bookings.length} {bookings.length === 1 ? 'service' : 'services'} scheduled
        </Text>
      </View>

      {bookings.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#2D3748" style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyText}>
            Type a request in the Request tab to book your first AI-orchestrated provider.
          </Text>
        </View>
      ) : (
        /* FlatList */
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.confirmation_id}
          renderItem={renderBookingCard}
          contentContainerStyle={[styles.listContainer, { paddingBottom: tabBarHeight + 20 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
    backgroundColor: '#101726',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E8EAED',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9AA0A6',
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
    paddingBottom: 10,
  },
  confirmationId: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#4285F4',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: '#1B3A24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#34A853',
    fontSize: 9,
    fontWeight: '800',
  },
  cardBody: {
    marginBottom: 14,
  },
  providerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9AA0A6',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E8EAED',
  },
  slotTime: {
    fontSize: 13.5,
    color: '#E8EAED',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
    paddingTop: 10,
  },
  detailsLink: {
    fontSize: 13,
    color: '#4285F4',
    fontWeight: '600',
  },
  chevron: {
    color: '#4285F4',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8EAED',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13.5,
    color: '#9AA0A6',
    textAlign: 'center',
    lineHeight: 20,
  },
});
