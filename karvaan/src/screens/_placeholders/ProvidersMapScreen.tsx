// src/screens/_placeholders/ProvidersMapScreen.tsx
// Phase 1 placeholder — replaced in Phase 15
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function ProvidersMapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Providers</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  text: { color: '#FFFFFF', fontSize: 18 },
});
