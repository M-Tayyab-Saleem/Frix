// src/components/LocationPickerSheet.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';

const AREAS = [
  { area: 'DHA Phase 6', lat: 24.7920, lng: 67.0645, city: 'Karachi' },
  { area: 'Clifton Block 5', lat: 24.8090, lng: 67.0307, city: 'Karachi' },
  { area: 'Gulshan-e-Iqbal Block 13', lat: 24.9197, lng: 67.1134, city: 'Karachi' },
  { area: 'PECHS Block 2', lat: 24.8654, lng: 67.0590, city: 'Karachi' },
  { area: 'Saddar', lat: 24.8607, lng: 67.0099, city: 'Karachi' },
];

interface LocationPickerSheetProps {
  sheetRef: React.RefObject<BottomSheet>;
  currentArea: string;
  currentCity: string;
  userCoords?: { latitude: number; longitude: number } | null;
  onSelectLocation: (area: string, lat: number, lng: number) => void;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Manhattan distance for fast responsive sorting
  return Math.abs(lat1 - lat2) + Math.abs(lon1 - lon2);
}

export function LocationPickerSheet({
  sheetRef,
  currentArea,
  currentCity,
  userCoords,
  onSelectLocation,
}: LocationPickerSheetProps) {
  const snapPoints = useMemo(() => ['40%', '60%'], []);

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
  );

  // Dynamically sort the areas so the user's nearest local areas appear at the top
  const sortedAreas = useMemo(() => {
    if (!userCoords) {
      // Group-sort: Show current city's areas first, then other cities
      return [...AREAS].sort((a, b) => {
        const aMatch = a.city.toLowerCase() === currentCity.toLowerCase();
        const bMatch = b.city.toLowerCase() === currentCity.toLowerCase();
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    // Sort strictly by physical proximity to the user's GPS location
    return [...AREAS].sort((a, b) => {
      const distA = getDistance(userCoords.latitude, userCoords.longitude, a.lat, a.lng);
      const distB = getDistance(userCoords.latitude, userCoords.longitude, b.lat, b.lng);
      return distA - distB;
    });
  }, [userCoords, currentCity]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Select Your Area</Text>
        <Text style={styles.subtitle}>
          Choose your location (nearest areas sorted first)
        </Text>

        <BottomSheetFlatList
          data={sortedAreas}
          keyExtractor={(item) => `${item.city}-${item.area}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = item.area === currentArea;
            return (
              <TouchableOpacity
                style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                onPress={() => onSelectLocation(item.area, item.lat, item.lng)}
                activeOpacity={0.8}
              >
                <View style={styles.itemLeft}>
                  <Text style={styles.icon}>{isSelected ? '📍' : '🏢'}</Text>
                  <View>
                    <Text style={[styles.sectorName, isSelected && styles.sectorNameSelected]}>
                      {item.area}
                    </Text>
                    <Text style={styles.cityName}>{item.city}</Text>
                  </View>
                </View>
                {isSelected && <Text style={styles.checkIcon}>✓</Text>}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#1C2333',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#3E4C59',
    width: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9AA0A6',
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0D1117',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  itemCardSelected: {
    borderColor: '#1A73E8',
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 20,
  },
  sectorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E8EAED',
  },
  sectorNameSelected: {
    color: '#1A73E8',
  },
  cityName: {
    fontSize: 12,
    color: '#9AA0A6',
    marginTop: 2,
  },
  checkIcon: {
    color: '#1A73E8',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
