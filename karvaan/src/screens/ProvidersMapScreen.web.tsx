// src/screens/ProvidersMapScreen.web.tsx
// Renders a premium interactive simulated location-based providers map for Web.
// Avoids native-only react-native-maps import while providing a stunning dark mode visual grid.

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useOrchestratorStore } from '@/store/orchestratorStore';
import { ScoreBar } from '@/components/ScoreBar';
import { Ionicons } from '@expo/vector-icons';
import type { Provider } from '../types/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Islamabad mock providers across various sectors
const MOCK_MAP_PROVIDERS: (Provider & { lat: number; lng: number; sectorName: string })[] = [
  {
    id: 'p_001',
    name: 'Ali AC Services',
    category: 'ac_technician',
    location: 'G-13, Islamabad',
    distance_km: 1.2,
    rating: 4.9,
    availability: 'Available',
    score: 0.93,
    reasoning: 'Closest provider with highest rating.',
    lat: 33.650,
    lng: 72.990,
    sectorName: 'G-13',
  },
  {
    id: 'p_002',
    name: 'Karachi Cool Systems',
    category: 'ac_technician',
    location: 'F-10, Islamabad',
    distance_km: 3.4,
    rating: 4.7,
    availability: 'Available',
    score: 0.78,
    reasoning: 'High-quality feedback, slightly further distance.',
    lat: 33.706,
    lng: 73.022,
    sectorName: 'F-10',
  },
  {
    id: 'p_003',
    name: 'QuickFix AC',
    category: 'ac_technician',
    location: 'F-11, Islamabad',
    distance_km: 4.1,
    rating: 4.5,
    availability: 'Available Today',
    score: 0.61,
    reasoning: 'Decent feedback, but longer dispatch queue.',
    lat: 33.716,
    lng: 73.010,
    sectorName: 'F-11',
  },
  {
    id: 'p_004',
    name: 'Khan Plumbing Co.',
    category: 'plumber',
    location: 'G-9, Islamabad',
    distance_km: 2.1,
    rating: 4.8,
    availability: 'Available',
    score: 0.89,
    reasoning: 'Highly recommended local plumbing expert.',
    lat: 33.682,
    lng: 73.030,
    sectorName: 'G-9',
  },
  {
    id: 'p_005',
    name: 'Spark Electricians',
    category: 'electrician',
    location: 'I-8, Islamabad',
    distance_km: 5.2,
    rating: 4.6,
    availability: 'Available',
    score: 0.82,
    reasoning: 'Fast responder for electrical shortages.',
    lat: 33.671,
    lng: 73.064,
    sectorName: 'I-8',
  },
];

export function ProvidersMapScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const { setSelectedProvider } = useOrchestratorStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'ac_technician' | 'plumber' | 'electrician'>('all');
  const [selectedProviderObj, setSelectedProviderObj] = useState<Provider | null>(null);

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'AC Technician', value: 'ac_technician' },
    { label: 'Plumber', value: 'plumber' },
    { label: 'Electrician', value: 'electrician' },
  ];

  // Filter providers
  const filteredProviders = useMemo(() => {
    if (activeFilter === 'all') return MOCK_MAP_PROVIDERS;
    return MOCK_MAP_PROVIDERS.filter((p) => p.category === activeFilter);
  }, [activeFilter]);

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProviderObj(provider);
    setSelectedProvider(provider);
  };

  const handleBookNow = () => {
    if (selectedProviderObj) {
      navigation.navigate('BookingConfirm');
    }
  };

  const handleViewDetail = () => {
    if (selectedProviderObj) {
      navigation.navigate('ProviderDetail');
    }
  };

  const renderFilterChips = () => {
    return (
      <View style={styles.filterOverlay}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = activeFilter === item.value;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => {
                  setActiveFilter(item.value as any);
                  setSelectedProviderObj(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        
        {/* Visual Map Grid Simulator (Stunning premium web mockup) */}
        <View style={styles.mapSimulatorContainer}>
          <View style={styles.mapBackground}>
            <View style={styles.mapGridLineH1} />
            <View style={styles.mapGridLineH2} />
            <View style={styles.mapGridLineV1} />
            <View style={styles.mapGridLineV2} />
            <View style={styles.sectorLabelG13}><Text style={styles.sectorLabelText}>G-13 SECTOR</Text></View>
            <View style={styles.sectorLabelF10}><Text style={styles.sectorLabelText}>F-10 SECTOR</Text></View>
            <View style={styles.sectorLabelF11}><Text style={styles.sectorLabelText}>F-11 SECTOR</Text></View>
            <View style={styles.sectorLabelG9}><Text style={styles.sectorLabelText}>G-9 SECTOR</Text></View>
            <View style={styles.sectorLabelI8}><Text style={styles.sectorLabelText}>I-8 SECTOR</Text></View>
          </View>

          {/* Render markers inside the grid layout */}
          {filteredProviders.map((prov) => {
            // Map coordinates to simulated screen offsets
            let topOffset = '45%';
            let leftOffset = '50%';

            if (prov.sectorName === 'G-13') {
              topOffset = '30%';
              leftOffset = '20%';
            } else if (prov.sectorName === 'F-10') {
              topOffset = '22%';
              leftOffset = '75%';
            } else if (prov.sectorName === 'F-11') {
              topOffset = '18%';
              leftOffset = '48%';
            } else if (prov.sectorName === 'G-9') {
              topOffset = '55%';
              leftOffset = '35%';
            } else if (prov.sectorName === 'I-8') {
              topOffset = '65%';
              leftOffset = '72%';
            }

            const isSelected = selectedProviderObj?.name === prov.name;
            const markerColor = prov.category === 'ac_technician' ? '#1A73E8' : '#0F9D58';

            return (
              <TouchableOpacity
                key={prov.name}
                style={[
                  styles.marker,
                  { top: topOffset as any, left: leftOffset as any },
                  isSelected && styles.markerSelected,
                ]}
                onPress={() => handleProviderSelect(prov)}
                activeOpacity={0.8}
              >
                <View style={[styles.markerDot, { backgroundColor: markerColor }]} />
                <View style={styles.markerBadge}>
                  <Text style={styles.markerText}>{prov.name.split(' ')[0]}</Text>
                  <Text style={styles.markerSubText}><Ionicons name="star" size={10} color="#F9AB00" />{prov.rating.toFixed(1)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Categories Overlays */}
        {renderFilterChips()}

        {/* Bottom Drawer Overlay */}
        {selectedProviderObj ? (
          <View style={styles.bottomCardWrapper}>
            <View style={styles.providerCard}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarMini}>
                  <Text style={styles.avatarText}>
                    {selectedProviderObj.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.providerMeta}>
                  <Text style={styles.providerName}>{selectedProviderObj.name}</Text>
                  <Text style={styles.providerDetails}>
                    <Ionicons name="location" size={10} color="#9AA0A6" /> {selectedProviderObj.location} · {selectedProviderObj.distance_km.toFixed(1)} km
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeCardBtn}
                  onPress={() => setSelectedProviderObj(null)}
                >
                  <Ionicons name="close" size={16} color="#9AA0A6" />
                </TouchableOpacity>
              </View>

              <View style={styles.scoreRow}>
                <Text style={styles.scoreText}>Match Score</Text>
                <View style={{ flex: 1 }}>
                  <ScoreBar score={selectedProviderObj.score} />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={handleViewDetail}
                  activeOpacity={0.8}
                >
                  <Text style={styles.detailsBtnText}>Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={handleBookNow}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bookBtnText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.hintOverlay}>
            <Text style={styles.hintText}>Tap a location pin to view details (Simulated Map)</Text>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  mapSimulatorContainer: {
    flex: 1,
    backgroundColor: '#0b0f19',
    position: 'relative',
    overflow: 'hidden',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  mapGridLineH1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33%',
    height: 1,
    backgroundColor: '#1e293b',
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  mapGridLineH2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66%',
    height: 1,
    backgroundColor: '#1e293b',
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  mapGridLineV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33%',
    width: 1,
    backgroundColor: '#1e293b',
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  mapGridLineV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66%',
    width: 1,
    backgroundColor: '#1e293b',
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  sectorLabelG13: {
    position: 'absolute',
    top: '35%',
    left: '12%',
  },
  sectorLabelF10: {
    position: 'absolute',
    top: '25%',
    left: '78%',
  },
  sectorLabelF11: {
    position: 'absolute',
    top: '12%',
    left: '42%',
  },
  sectorLabelG9: {
    position: 'absolute',
    top: '58%',
    left: '38%',
  },
  sectorLabelI8: {
    position: 'absolute',
    top: '72%',
    left: '75%',
  },
  sectorLabelText: {
    color: '#334155',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  markerSelected: {
    zIndex: 10,
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  markerBadge: {
    marginTop: 4,
    backgroundColor: '#1C2333',
    borderColor: '#2D3748',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  markerText: {
    color: '#E8EAED',
    fontSize: 9,
    fontWeight: '700',
  },
  markerSubText: {
    color: '#F9AB00',
    fontSize: 8,
    marginTop: 1,
  },
  filterOverlay: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#101726',
    borderWidth: 1,
    borderColor: '#2D3748',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#1A73E8',
    borderColor: '#1A73E8',
  },
  filterText: {
    color: '#9AA0A6',
    fontSize: 13,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  providerCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  providerMeta: {
    flex: 1,
  },
  providerName: {
    color: '#E8EAED',
    fontSize: 15,
    fontWeight: '700',
  },
  providerDetails: {
    color: '#9AA0A6',
    fontSize: 12,
    marginTop: 2,
  },
  closeCardBtn: {
    padding: 6,
  },
  closeBtnText: {
    color: '#9AA0A6',
    fontSize: 16,
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  scoreText: {
    color: '#9AA0A6',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  detailsBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsBtnText: {
    color: '#9AA0A6',
    fontSize: 13.5,
    fontWeight: '700',
  },
  bookBtn: {
    flex: 2,
    height: 44,
    backgroundColor: '#1A73E8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  hintOverlay: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(16, 23, 38, 0.85)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  hintText: {
    color: '#9AA0A6',
    fontSize: 12,
    fontWeight: '600',
  },
});
