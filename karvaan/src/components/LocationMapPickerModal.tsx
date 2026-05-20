// src/components/LocationMapPickerModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const KARACHI_AREAS: { area: string; lat: number; lng: number; city: string }[] = [
  { area: "DHA Phase 6", lat: 24.7920, lng: 67.0645, city: "Karachi" },
  { area: "DHA Phase 2", lat: 24.8104, lng: 67.0657, city: "Karachi" },
  { area: "Clifton Block 5", lat: 24.8090, lng: 67.0307, city: "Karachi" },
  { area: "Clifton Block 8", lat: 24.8207, lng: 67.0254, city: "Karachi" },
  { area: "Gulshan-e-Iqbal Block 13", lat: 24.9197, lng: 67.1134, city: "Karachi" },
  { area: "Gulshan-e-Iqbal Block 7", lat: 24.9253, lng: 67.1005, city: "Karachi" },
  { area: "PECHS Block 2", lat: 24.8654, lng: 67.0590, city: "Karachi" },
  { area: "PECHS Block 6", lat: 24.8694, lng: 67.0635, city: "Karachi" },
  { area: "North Nazimabad Block H", lat: 24.9439, lng: 67.0505, city: "Karachi" },
  { area: "North Nazimabad Block J", lat: 24.9476, lng: 67.0549, city: "Karachi" },
  { area: "Nazimabad No.3", lat: 24.9237, lng: 67.0317, city: "Karachi" },
  { area: "Bahadurabad", lat: 24.8787, lng: 67.0639, city: "Karachi" },
  { area: "Tariq Road", lat: 24.8638, lng: 67.0653, city: "Karachi" },
  { area: "Federal B Area Block 4", lat: 24.9304, lng: 67.0697, city: "Karachi" },
  { area: "Malir Cantonment", lat: 24.8936, lng: 67.2002, city: "Karachi" },
  { area: "Korangi", lat: 24.8296, lng: 67.1282, city: "Karachi" },
  { area: "Landhi", lat: 24.8554, lng: 67.2012, city: "Karachi" },
  { area: "Orangi Town", lat: 24.9604, lng: 67.0018, city: "Karachi" },
  { area: "Surjani Town", lat: 25.0165, lng: 67.0416, city: "Karachi" },
  { area: "Saddar", lat: 24.8607, lng: 67.0099, city: "Karachi" }
];

function nearestArea(lat: number, lng: number): { area: string; lat: number; lng: number; city: string } {
  let best = KARACHI_AREAS[0];
  let bestDist = Infinity;
  for (const s of KARACHI_AREAS) {
    const d = Math.abs(s.lat - lat) + Math.abs(s.lng - lng);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best;
}

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

interface LocationMapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (area: string, lat: number, lng: number) => void;
  initialLat: number;
  initialLng: number;
}

export function LocationMapPickerModal({
  visible,
  onClose,
  onConfirm,
  initialLat,
  initialLng
}: LocationMapPickerModalProps) {
  const [selectedCoords, setSelectedCoords] = useState({ latitude: initialLat, longitude: initialLng });
  const [selectedArea, setSelectedArea] = useState('DHA Phase 6');
  const [region, setRegion] = useState({
    latitude: initialLat,
    longitude: initialLng,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  const floatAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSelectedCoords({ latitude: initialLat, longitude: initialLng });
      const best = nearestArea(initialLat, initialLng);
      setSelectedArea(best.area);
      setRegion({
        latitude: initialLat,
        longitude: initialLng,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });

      // Pin floating micro-animation loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -8, duration: 800, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible, initialLat, initialLng]);

  const handleRegionChangeComplete = (newRegion: any) => {
    const newLat = newRegion.latitude;
    const newLng = newRegion.longitude;
    const best = nearestArea(newLat, newLng);
    setSelectedCoords({ latitude: newLat, longitude: newLng });
    setSelectedArea(best.area);
  };

  const handleConfirm = () => {
    onConfirm(selectedArea, selectedCoords.latitude, selectedCoords.longitude);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Dark Google Map */}
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={darkMapStyle}
          region={region}
          onRegionChangeComplete={handleRegionChangeComplete}
        />

        {/* Header Overlay */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pin Delivery Location</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Centered Fixed Pin Indicator representing target point */}
        <View style={styles.pinContainer} pointerEvents="none">
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <Ionicons name="location" size={48} color="#1A73E8" style={styles.pinIcon} />
            <View style={styles.pinDot} />
          </Animated.View>
        </View>

        {/* Premium Bottom Glassmorphic Card */}
        <View style={styles.bottomCardWrapper}>
          <View style={styles.glassCard}>
            <View style={styles.locationHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="navigate" size={20} color="#1A73E8" />
              </View>
              <View style={styles.locationMeta}>
                <Text style={styles.areaLabel}>{selectedArea}</Text>
                <Text style={styles.cityLabel}>Karachi, Pakistan</Text>
                <Text style={styles.coordLabel}>
                  {selectedCoords.latitude.toFixed(6)}, {selectedCoords.longitude.toFixed(6)}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmBtnText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1524',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: 48,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(13, 17, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  pinContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  pinIcon: {
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
  pinDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A73E8',
    alignSelf: 'center',
    marginTop: -4,
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  glassCard: {
    backgroundColor: 'rgba(28, 35, 51, 0.92)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(62, 76, 89, 0.35)',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(26, 115, 232, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationMeta: {
    flex: 1,
  },
  areaLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  cityLabel: {
    color: '#9AA0A6',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  coordLabel: {
    color: '#5F6368',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 4,
  },
  confirmBtn: {
    height: 52,
    backgroundColor: '#1A73E8',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
