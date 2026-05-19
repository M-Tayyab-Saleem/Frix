// src/components/LocationPickerSheet.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';

const SECTORS = [
  { sector: 'G-13', lat: 33.650, lng: 72.990 },
  { sector: 'F-10', lat: 33.706, lng: 73.022 },
  { sector: 'F-11', lat: 33.716, lng: 73.010 },
  { sector: 'G-9',  lat: 33.682, lng: 73.030 },
  { sector: 'I-8',  lat: 33.671, lng: 73.064 },
];

interface LocationPickerSheetProps {
  sheetRef: React.RefObject<BottomSheet>;
  currentSector: string;
  onSelectLocation: (sector: string, lat: number, lng: number) => void;
}

export function LocationPickerSheet({ sheetRef, currentSector, onSelectLocation }: LocationPickerSheetProps) {
  const snapPoints = useMemo(() => ['40%', '50%'], []);

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
  );

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
        <Text style={styles.title}>Select Your Sector</Text>
        <Text style={styles.subtitle}>Choose your location in Islamabad</Text>

        <BottomSheetFlatList
          data={SECTORS}
          keyExtractor={(item) => item.sector}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isSelected = item.sector === currentSector;
            return (
              <TouchableOpacity
                style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                onPress={() => onSelectLocation(item.sector, item.lat, item.lng)}
                activeOpacity={0.8}
              >
                <View style={styles.itemLeft}>
                  <Text style={styles.icon}>{isSelected ? '📍' : '🏢'}</Text>
                  <View>
                    <Text style={[styles.sectorName, isSelected && styles.sectorNameSelected]}>
                      {item.sector}
                    </Text>
                    <Text style={styles.cityName}>Islamabad</Text>
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
