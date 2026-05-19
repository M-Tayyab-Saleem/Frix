// src/components/ProviderCard.tsx
// Displays ranked service provider details with score bars, AI reasoning, and call-to-actions.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ScoreBar } from './ScoreBar';
import type { Provider } from '../types/api';
import { Ionicons } from '@expo/vector-icons';

export interface ProviderCardProps {
  provider: Provider;
  rank?: number;
  isRecommended?: boolean;
  showReasoning?: boolean;
  onBook: (p: Provider) => void;
  onDetail?: (p: Provider) => void;
}

export function ProviderCard({
  provider,
  rank,
  isRecommended = false,
  showReasoning = true,
  onBook,
  onDetail,
}: ProviderCardProps): React.JSX.Element {
  const firstLetter = provider.name.charAt(0).toUpperCase();

  // Helper to format category for user friendly display
  const formatCategory = (cat: string) => {
    return cat
      .split('_')
      .map((word) => {
        if (word.toLowerCase() === 'ac') return 'AC';
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  return (
    <View style={[styles.card, isRecommended && styles.recommendedCard]}>
      {/* Recommended Badge */}
      {isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedBadgeText}><Ionicons name="star" size={10} color="#F9AB00" /> AI RECOMMENDS</Text>
        </View>
      )}

      {/* Main Info Row */}
      <View style={styles.mainRow}>
        {/* Avatar / Rank */}
        <View style={styles.avatarContainer}>
          {rank !== undefined && !isRecommended && (
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{rank}</Text>
            </View>
          )}
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{firstLetter}</Text>
          </View>
        </View>

        {/* Text Info */}
        <View style={styles.infoBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {provider.name}
            </Text>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>
                {formatCategory(provider.category)}
              </Text>
            </View>
          </View>

          {/* Location & Performance Stats */}
          <Text style={styles.statsText}>
            <Ionicons name="location" size={10} color="#9AA0A6" /> {provider.distance_km.toFixed(1)} km away  ·  <Ionicons name="star" size={10} color="#F9AB00" /> {provider.rating.toFixed(1)}  ·  {provider.availability}
          </Text>
        </View>
      </View>

      {/* Match Confidence Score */}
      <View style={styles.scoreContainer}>
        <ScoreBar score={provider.score} label="AI Match Score" />
      </View>

      {/* AI Reasoning Panel */}
      {showReasoning && provider.reasoning && (
        <View style={styles.reasoningPanel}>
          <Text style={styles.reasoningLabel}>AI Rationale:</Text>
          <Text style={styles.reasoningText}>"{provider.reasoning}"</Text>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => onBook(provider)}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>

        {onDetail && (
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => onDetail(provider)}
            activeOpacity={0.8}
          >
            <Text style={styles.detailButtonText}>Details</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D3748',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    position: 'relative',
  },
  recommendedCard: {
    borderColor: '#F9AB00',
    borderWidth: 1.5,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#3E2A00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#F9AB00',
  },
  recommendedBadgeText: {
    color: '#F9AB00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  rankBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#1C2333',
  },
  rankText: {
    color: '#9AA0A6',
    fontSize: 10,
    fontWeight: '700',
  },
  infoBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8EAED',
    flexShrink: 1,
  },
  categoryChip: {
    backgroundColor: '#1A3A5C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    color: '#4285F4',
    fontWeight: '700',
  },
  statsText: {
    fontSize: 12,
    color: '#9AA0A6',
  },
  scoreContainer: {
    marginBottom: 12,
  },
  reasoningPanel: {
    backgroundColor: '#141A29',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4285F4',
  },
  reasoningLabel: {
    fontSize: 11,
    color: '#4285F4',
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  reasoningText: {
    fontSize: 12.5,
    color: '#9AA0A6',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bookButton: {
    flex: 1.5,
    height: 40,
    backgroundColor: '#1A73E8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  detailButton: {
    flex: 1,
    height: 40,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2D3748',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#9AA0A6',
    fontSize: 13,
    fontWeight: '700',
  },
});
