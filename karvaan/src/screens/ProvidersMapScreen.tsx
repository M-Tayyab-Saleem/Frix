// src/screens/ProvidersMapScreen.tsx
// Renders the interactive location-based providers map.
// Includes interactive category filter chips, visual map markers, and slide-up detailed bottom sheet profiles.

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useOrchestratorStore } from '@/store/orchestratorStore';
import { ScoreBar } from '@/components/ScoreBar';
import { Ionicons } from '@expo/vector-icons';
import type { Provider } from '../types/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Karachi mock providers across various areas
const MOCK_MAP_PROVIDERS: (Provider & { lat: number; lng: number })[] = [
  // ---- AC Technicians (6) ----
  {
    id: 'ac_001',
    name: 'Arctic Cool AC Services',
    category: 'ac_technician',
    location: 'DHA Phase 6, Karachi',
    distance_km: 1.2,
    rating: 4.8,
    availability: 'Available Tomorrow (10:00 AM)',
    score: 0.96,
    reasoning: 'Closest provider with highest rating and 96% on-time score.',
    lat: 24.7920,
    lng: 67.0645,
  },
  {
    id: 'ac_002',
    name: 'CoolBreeze AC Repair',
    category: 'ac_technician',
    location: 'Clifton Block 5, Karachi',
    distance_km: 3.4,
    rating: 4.7,
    availability: 'Available Tomorrow (11:30 AM)',
    score: 0.78,
    reasoning: 'High-quality feedback, slightly further distance.',
    lat: 24.8090,
    lng: 67.0307,
  },
  {
    id: 'ac_003',
    name: 'Al-Rehman AC Works',
    category: 'ac_technician',
    location: 'Gulshan-e-Iqbal Block 13, Karachi',
    distance_km: 4.1,
    rating: 4.5,
    availability: 'Available Today (5:00 PM)',
    score: 0.91,
    reasoning: 'Highly experienced split/cassette AC technician.',
    lat: 24.9197,
    lng: 67.1134,
  },
  {
    id: 'ac_004',
    name: 'SnowFlake Technicians',
    category: 'ac_technician',
    location: 'PECHS Block 2, Karachi',
    distance_km: 2.1,
    rating: 4.6,
    availability: 'Available Tomorrow (09:00 AM)',
    score: 0.95,
    reasoning: 'Great feedback on inverter AC and gas leakage fixes.',
    lat: 24.8654,
    lng: 67.0590,
  },
  {
    id: 'ac_005',
    name: 'Karachi Air Solutions',
    category: 'ac_technician',
    location: 'North Nazimabad Block H, Karachi',
    distance_km: 6.8,
    rating: 4.4,
    availability: 'Available Tomorrow (02:00 PM)',
    score: 0.89,
    reasoning: 'Solid performance on split AC installs and dismantling.',
    lat: 24.9439,
    lng: 67.0505,
  },
  {
    id: 'ac_006',
    name: 'Super Chiller AC',
    category: 'ac_technician',
    location: 'Saddar, Karachi',
    distance_km: 5.2,
    rating: 4.3,
    availability: 'Available Today (7:00 PM)',
    score: 0.88,
    reasoning: 'Window and commercial AC repairs specialist.',
    lat: 24.8607,
    lng: 67.0099,
  },

  // ---- Plumbers (6) ----
  {
    id: 'plumb_001',
    name: 'Hassan Plumbing Services',
    category: 'plumber',
    location: 'PECHS Block 6, Karachi',
    distance_km: 1.5,
    rating: 4.8,
    availability: 'Available Tomorrow (10:00 AM)',
    score: 0.97,
    reasoning: 'Highly recommended bathroom fittings & leak repairs expert.',
    lat: 24.8694,
    lng: 67.0635,
  },
  {
    id: 'plumb_002',
    name: 'AquaFix Plumbers',
    category: 'plumber',
    location: 'Clifton Block 8, Karachi',
    distance_km: 2.9,
    rating: 4.6,
    availability: 'Available Tomorrow (01:00 PM)',
    score: 0.93,
    reasoning: 'Pipeline unblocking & kitchen sink repair.',
    lat: 24.8207,
    lng: 67.0254,
  },
  {
    id: 'plumb_003',
    name: 'Al-Madina Plumbing',
    category: 'plumber',
    location: 'Gulshan-e-Iqbal Block 7, Karachi',
    distance_km: 4.8,
    rating: 4.5,
    availability: 'Available Today (6:00 PM)',
    score: 0.90,
    reasoning: 'Geyser repair and water tank cleaning specialist.',
    lat: 24.9253,
    lng: 67.1005,
  },
  {
    id: 'plumb_004',
    name: 'Quick Fix Plumbers',
    category: 'plumber',
    location: 'Bahadurabad, Karachi',
    distance_km: 2.3,
    rating: 4.7,
    availability: 'Available Tomorrow (09:30 AM)',
    score: 0.95,
    reasoning: 'Taps & showers repair with high satisfaction rating.',
    lat: 24.8787,
    lng: 67.0639,
  },
  {
    id: 'plumb_005',
    name: 'Nazimabad Plumbing Solutions',
    category: 'plumber',
    location: 'Nazimabad No.3, Karachi',
    distance_km: 5.7,
    rating: 4.4,
    availability: 'Available Tomorrow (03:00 PM)',
    score: 0.88,
    reasoning: 'Affordable pipe repairs & unclogging.',
    lat: 24.9237,
    lng: 67.0317,
  },
  {
    id: 'plumb_006',
    name: 'Korangi Aqua Experts',
    category: 'plumber',
    location: 'Korangi, Karachi',
    distance_km: 7.2,
    rating: 4.3,
    availability: 'Available Today (4:00 PM)',
    score: 0.85,
    reasoning: 'Water motor fixing & leakage detection.',
    lat: 24.8296,
    lng: 67.1282,
  },

  // ---- Electricians (6) ----
  {
    id: 'elec_001',
    name: 'Bright Spark Electricians',
    category: 'electrician',
    location: 'DHA Phase 2, Karachi',
    distance_km: 1.1,
    rating: 4.9,
    availability: 'Available Tomorrow (10:00 AM)',
    score: 0.98,
    reasoning: 'Master of short circuits & DB box installations.',
    lat: 24.8104,
    lng: 67.0657,
  },
  {
    id: 'elec_002',
    name: 'PowerLine Solutions',
    category: 'electrician',
    location: 'Tariq Road, Karachi',
    distance_km: 3.1,
    rating: 4.7,
    availability: 'Available Tomorrow (02:30 PM)',
    score: 0.94,
    reasoning: 'Fan repairs and safe house wiring services.',
    lat: 24.8638,
    lng: 67.0653,
  },
  {
    id: 'elec_003',
    name: 'Al-Noor Electric',
    category: 'electrician',
    location: 'Federal B Area Block 4, Karachi',
    distance_km: 5.4,
    rating: 4.6,
    availability: 'Available Today (6:30 PM)',
    score: 0.92,
    reasoning: 'Washing machine & generator overhauling.',
    lat: 24.9304,
    lng: 67.0697,
  },
  {
    id: 'elec_004',
    name: 'North Karachi Power Sparks',
    category: 'electrician',
    location: 'North Nazimabad Block J, Karachi',
    distance_km: 6.2,
    rating: 4.5,
    availability: 'Available Tomorrow (11:00 AM)',
    score: 0.91,
    reasoning: 'Smart switch installations & socket repairs.',
    lat: 24.9476,
    lng: 67.0549,
  },
  {
    id: 'elec_005',
    name: 'Malir Electric Hub',
    category: 'electrician',
    location: 'Malir Cantonment, Karachi',
    distance_km: 8.5,
    rating: 4.4,
    availability: 'Available Tomorrow (04:00 PM)',
    score: 0.89,
    reasoning: 'Solar inverter setups and light fittings.',
    lat: 24.8936,
    lng: 67.2002,
  },
  {
    id: 'elec_006',
    name: 'Saddar Electronics Repair',
    category: 'electrician',
    location: 'Saddar, Karachi',
    distance_km: 4.6,
    rating: 4.2,
    availability: 'Available Today (8:00 PM)',
    score: 0.86,
    reasoning: 'UPS battery replacement & electronics repairs.',
    lat: 24.8607,
    lng: 67.0099,
  },
];

// Dark Map Style Configuration
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0f1524' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f1524' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3930' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }
];

export function ProvidersMapScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
  const { setSelectedProvider } = useOrchestratorStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'ac_technician' | 'plumber' | 'electrician'>('all');
  const [selectedProviderObj, setSelectedProviderObj] = useState<Provider | null>(null);

  const mapRef = useRef<MapView>(null);

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
        
        {/* React Native Maps */}
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          customMapStyle={Platform.OS === 'android' ? darkMapStyle : undefined}
          initialRegion={{
            latitude: 24.8607,
            longitude: 67.0099,
            latitudeDelta: 0.18,
            longitudeDelta: 0.18,
          }}
        >
          {filteredProviders.map((prov) => (
            <Marker
              key={prov.name}
              coordinate={{ latitude: prov.lat, longitude: prov.lng }}
              onPress={() => handleProviderSelect(prov)}
              pinColor={prov.category === 'ac_technician' ? '#1A73E8' : prov.category === 'plumber' ? '#0F9D58' : '#F9AB00'}
            >
              <Callout tooltip>
                <View style={styles.calloutCard}>
                  <Text style={styles.calloutName}>{prov.name}</Text>
                  <Text style={styles.calloutRating}><Ionicons name="star" size={10} color="#F9AB00" /> {prov.rating.toFixed(1)}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* Categories Overlays */}
        {renderFilterChips()}

        {/* Bottom Drawer Overlay */}
        {selectedProviderObj ? (
          <View style={[styles.bottomCardWrapper, { bottom: tabBarHeight + 40 }]}>
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
          <View style={[styles.hintOverlay, { bottom: tabBarHeight + 40 }]}>
            <Text style={styles.hintText}>Tap a location pin to view details</Text>
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
  map: {
    width: SCREEN_WIDTH,
    height: '100%',
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
  calloutCard: {
    backgroundColor: '#101726',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3748',
    padding: 8,
    alignItems: 'center',
  },
  calloutName: {
    color: '#E8EAED',
    fontSize: 12,
    fontWeight: '700',
  },
  calloutRating: {
    color: '#F9AB00',
    fontSize: 10,
    marginTop: 2,
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
