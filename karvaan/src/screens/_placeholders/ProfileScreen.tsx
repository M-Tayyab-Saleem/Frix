// src/screens/_placeholders/ProfileScreen.tsx
// Phase 1 placeholder — Profile tab
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function PlaceholderProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  text: { color: '#FFFFFF', fontSize: 18 },
});
