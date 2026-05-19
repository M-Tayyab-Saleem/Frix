// src/components/ScoreBar.tsx
// Renders an animated score match percentage bar with dynamic color-coding.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/colors';

export interface ScoreBarProps {
  score: number; // 0.0 to 1.0
  label?: string;
  showText?: boolean;
}

export function ScoreBar({
  score,
  label,
  showText = true,
}: ScoreBarProps): React.JSX.Element {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  // Clamp score between 0 and 1
  const clampedScore = Math.max(0, Math.min(1, score));

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clampedScore,
      duration: 800,
      useNativeDriver: false, // width cannot use native driver
    }).start();
  }, [clampedScore]);

  // Determine dynamic bar color based on score thresholds
  const barColor =
    clampedScore >= 0.8
      ? Colors.scoreGreen
      : clampedScore >= 0.6
      ? Colors.scoreAmber
      : Colors.scoreRed;

  const percentageText = `${Math.round(clampedScore * 100)}%`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label || 'Match Confidence'}</Text>
        {showText && (
          <Text style={[styles.percentageText, { color: barColor }]}>
            {percentageText}
          </Text>
        )}
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: barColor,
              width: animatedWidth.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: Colors.textHint,
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});
