// src/screens/_placeholders/BookingsListScreen.tsx
// Phase 1 placeholder — replaced in Phase 11
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function BookingsListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Bookings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  text: { color: '#FFFFFF', fontSize: 18 },
});
