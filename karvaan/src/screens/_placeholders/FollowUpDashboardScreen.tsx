// src/screens/_placeholders/FollowUpDashboardScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function FollowUpDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Active Operations</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D1117' },
  text: { color: '#FFFFFF', fontSize: 18 },
});
