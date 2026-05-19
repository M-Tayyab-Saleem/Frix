// src/screens/_placeholders/RequestScreen.tsx
// Phase 1 placeholder — replaced in Phase 4
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function RequestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Request</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  text: { color: '#FFFFFF', fontSize: 18 },
});
