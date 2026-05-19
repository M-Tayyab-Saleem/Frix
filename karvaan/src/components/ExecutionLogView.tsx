import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/colors';

export interface ExecutionLogViewProps {
  steps: string[];
  onComplete?: () => void;
}

export function ExecutionLogView({ steps, onComplete }: ExecutionLogViewProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (steps.length === 0) return;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setVisibleCount(current);
      if (current >= steps.length) {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 500); // Trigger complete after last step
        }
      }
    }, 400); // 400ms delay as per cursorrules

    return () => clearInterval(interval);
  }, [steps, onComplete]);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isVisible = index < visibleCount;
        if (!isVisible) return null;
        
        return (
          <View key={index} style={styles.stepRow}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C2333',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkIcon: {
    color: Colors.success,
    fontSize: 16,
    marginRight: 10,
    fontWeight: '800',
  },
  stepText: {
    color: '#E8EAED',
    fontSize: 14,
    flexShrink: 1,
  },
});
