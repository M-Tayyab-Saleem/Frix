// src/screens/ResultsScreen.tsx
// Renders the orchestrator search results, detailing extracted intent slots,
// showing the TraceAccordion, highlighting the top match, and listing ranked alternatives.

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrchestratorStore } from '@/store/orchestratorStore';
import { ProviderCard } from '@/components/ProviderCard';
import { TraceAccordion } from '@/components/TraceAccordion';
import { OfflineBanner } from '@/components/OfflineBanner';
import type { RootStackParamList } from '@/navigation/types';
import type { Provider } from '@/types/api';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;

export function ResultsScreen(): React.JSX.Element {
  const route = useRoute<ResultsScreenRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { response } = route.params;
  const { setSelectedProvider } = useOrchestratorStore();

  const { intent, top_providers, trace } = response;
  const recommendedProvider = response.recommended || top_providers[0];
  const otherProviders = top_providers.filter((p) => p.id !== recommendedProvider.id);

  const handleBack = () => {
    navigation.navigate('MainTabs');
  };

  const handleBook = (provider: Provider) => {
    setSelectedProvider(provider);
    navigation.navigate('BookingConfirm', { provider, response });
  };

  const handleDetail = (provider: Provider) => {
    setSelectedProvider(provider);
    navigation.navigate('ProviderDetail');
  };

  // Helper to format category
  const formatCategory = (cat: string) => {
    return cat
      .split('_')
      .map((word) => {
        if (word.toLowerCase() === 'ac') return 'AC';
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  // Dynamic urgency color coding
  const getUrgencyColor = (urg: string) => {
    const u = urg.toLowerCase();
    if (u === 'high' || u === 'critical' || u === 'emergency') return Colors.error;
    if (u === 'medium' || u === 'urgent') return Colors.warning;
    return Colors.success;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <OfflineBanner />
      <LinearGradient colors={['#0F1524', '#0D1117']} style={styles.gradient}>
        
        {/* Sticky Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={Colors.border} />
          </TouchableOpacity>
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>AI Recommendations</Text>
            <Text style={styles.headerSubtitle}>
              {top_providers.length} matches found
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* Section 1: Intent Slots Card */}
          <View style={styles.intentCard}>
            <Text style={styles.sectionLabel}>AI Intent Extraction</Text>
            
            <View style={styles.grid}>
              {/* Category */}
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>INTENT CATEGORY</Text>
                <Text style={styles.gridValue} numberOfLines={1}>
                  <Ionicons name="build" size={12} color={Colors.border} /> {formatCategory(intent.service_type || 'Unknown')}
                </Text>
              </View>

              {/* Sector */}
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>TARGET AREA</Text>
                <Text style={styles.gridValue} numberOfLines={1}>
                  <Ionicons name="location" size={12} color={Colors.border} /> {typeof intent.location === 'string' ? intent.location : 'Islamabad'}
                </Text>
              </View>

              {/* Language */}
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>INPUT LANGUAGE</Text>
                <Text style={styles.gridValue} numberOfLines={1}>
                  <Ionicons name="language" size={12} color={Colors.border} /> {(intent.language_detected || 'english').toUpperCase()}
                </Text>
              </View>

              {/* Urgency */}
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>TIME WINDOW</Text>
                <Text
                  style={styles.gridValueHighlight}
                  numberOfLines={1}
                >
                  <Ionicons name="flash" size={12} color={Colors.success} /> {(intent.time_window || 'immediate').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Section 2: TraceAccordion */}
          <TraceAccordion trace={trace} />

          {/* Section 3: Recommended Provider */}
          {recommendedProvider && (
            <View style={styles.recommendationContainer}>
              <Text style={styles.subSectionTitle}>Top Service Match</Text>
              <ProviderCard
                provider={recommendedProvider}
                isRecommended={true}
                onBook={handleBook}
                onDetail={handleDetail}
              />
            </View>
          )}

          {/* Section 4: Other Options */}
          {otherProviders.length > 0 && (
            <View style={styles.alternativesContainer}>
              <Text style={styles.subSectionTitle}>Other Qualified Matches</Text>
              {otherProviders.map((p, idx) => (
                <ProviderCard
                  key={p.name}
                  provider={p}
                  isRecommended={false}
                  rank={idx + 2}
                  onBook={handleBook}
                  onDetail={handleDetail}
                />
              ))}
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
  headerTitleBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.border,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textHint,
    marginTop: 2,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  intentCard: {
    backgroundColor: '#1C2333',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.agentBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  gridLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textHint,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.border,
  },
  gridValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.success,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textHint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  recommendationContainer: {
    marginBottom: 16,
  },
  alternativesContainer: {
    marginTop: 8,
  },
});
