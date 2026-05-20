// src/components/LocationMapPickerModal.web.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getNearestKarachiLocation } from '@/data/karachiLocations';

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
  
  // Interactive Web Grid pan positions
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setSelectedCoords({ latitude: initialLat, longitude: initialLng });
      const best = getNearestKarachiLocation(initialLat, initialLng);
      setSelectedArea(best.area);

      // Pin floating micro-animation loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -8, duration: 800, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [visible, initialLat, initialLng]);

  // Pan Responder to simulate map dragging on Web
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Robust coordinate extraction for Web touch/mouse events
        const native = (evt.nativeEvent || {}) as any;
        const touches = native.touches || [];
        const pageY = native.pageY ?? native.clientY ?? (touches[0]?.pageY) ?? 0;
        const screenHeight = Dimensions.get('window').height || 800;
        
        // If coordinate is 0, check the target element to avoid capturing on interactive components
        if (pageY === 0) {
          const target = (evt.target as any) || {};
          const className = String(target.className || '').toLowerCase();
          const id = String(target.id || '').toLowerCase();
          if (
            className.includes('button') || 
            className.includes('touchable') || 
            className.includes('btn') ||
            id.includes('button') ||
            id.includes('btn')
          ) {
            return false;
          }
        }
        
        if (pageY > 0 && (pageY < 110 || pageY > screenHeight - 250)) {
          return false;
        }
        return true;
      },
      onPanResponderMove: (e, gestureState) => {
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(e, gestureState);
        
        // Calculate new coordinate based on delta movement (1px ≈ 0.0002 degrees for cool realistic feel)
        const newLat = initialLat - gestureState.dy * 0.0002;
        const newLng = initialLng + gestureState.dx * 0.0002;
        const best = getNearestKarachiLocation(newLat, newLng);
        setSelectedCoords({ latitude: newLat, longitude: newLng });
        setSelectedArea(best.area);
      },
      onPanResponderRelease: () => {
        // Smoothly snap map grid back slightly to keep center reference
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      },
    })
  ).current;

  const handleConfirm = () => {
    onConfirm(selectedArea, selectedCoords.latitude, selectedCoords.longitude);
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      
      {/* Visual Map Grid Simulator (Stunning premium web mockup) */}
      <View style={styles.mapSimulatorContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.mapBackground,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
        >
          {/* Dashed grid lines */}
          <View style={styles.mapGridLineH1} />
          <View style={styles.mapGridLineH2} />
          <View style={styles.mapGridLineV1} />
          <View style={styles.mapGridLineV2} />
          
          {/* Custom styled Karachi Area labels in grid */}
          <View style={styles.sectorLabel}><Text style={styles.sectorLabelText}>DHA PHASE 6</Text></View>
          <View style={[styles.sectorLabel, { top: '25%', left: '70%' }]}><Text style={styles.sectorLabelText}>CLIFTON BLOCK 5</Text></View>
          <View style={[styles.sectorLabel, { top: '15%', left: '42%' }]}><Text style={styles.sectorLabelText}>GULSHAN-E-IQBAL</Text></View>
          <View style={[styles.sectorLabel, { top: '55%', left: '32%' }]}><Text style={styles.sectorLabelText}>PECHS BLOCK 2</Text></View>
          <View style={[styles.sectorLabel, { top: '75%', left: '78%' }]}><Text style={styles.sectorLabelText}>SADDAR</Text></View>
        </Animated.View>
      </View>

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
              <Text style={styles.cityLabel}>Karachi, Pakistan (Simulated Web Map)</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'fixed' as any,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F1524',
    zIndex: 9999,
  },
  mapSimulatorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f1524',
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  mapGridLineH1: {
    position: 'absolute',
    left: '-50%',
    right: '-50%',
    top: '33%',
    height: 1,
    backgroundColor: '#1e293b',
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  mapGridLineH2: {
    position: 'absolute',
    left: '-50%',
    right: '-50%',
    top: '66%',
    height: 1,
    backgroundColor: '#1e293b',
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  mapGridLineV1: {
    position: 'absolute',
    top: '-50%',
    bottom: '-50%',
    left: '33%',
    width: 1,
    backgroundColor: '#1e293b',
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  mapGridLineV2: {
    position: 'absolute',
    top: '-50%',
    bottom: '-50%',
    left: '66%',
    width: 1,
    backgroundColor: '#1e293b',
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  sectorLabel: {
    position: 'absolute',
    top: '35%',
    left: '12%',
  },
  sectorLabelText: {
    color: '#3E4C59',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
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
    fontFamily: 'monospace',
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
