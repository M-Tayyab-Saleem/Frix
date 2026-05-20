// src/components/LocationPickerSheet.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { KARACHI_LOCATIONS } from '@/data/karachiLocations';

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
      return [...KARACHI_LOCATIONS].sort((a, b) => {
        const aMatch = a.city.toLowerCase() === currentCity.toLowerCase();
        const bMatch = b.city.toLowerCase() === currentCity.toLowerCase();
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    return [...KARACHI_LOCATIONS].sort((a, b) => {
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
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Select Your Area</Text>
            <Text style={styles.subtitle}>Choose from all mock locations.</Text>
          </View>
        </View>

        <BottomSheetFlatList
          data={sortedAreas}
          keyExtractor={(item) => `${item.city}-${item.area}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.currentLocationCard}>
              <Text style={styles.currentLocationLabel}>Current selection</Text>
              <Text style={styles.currentLocationValue}>{currentArea}</Text>
            </View>
          }
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
  headerRow: {
    marginBottom: 16,
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
  currentLocationCard: {
    backgroundColor: '#0D1117',
    borderWidth: 1,
    borderColor: '#2D3748',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  currentLocationLabel: {
    color: '#9AA0A6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  currentLocationValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
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
