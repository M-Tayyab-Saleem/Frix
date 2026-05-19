// src/components/AgentStepCard.tsx
// Renders a single agent step card with fade-in and scale animations,
// pulsing indicator for the active state, and a green mark for the done state.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AgentStepCardProps {
  stepName: string;
  summary: string;
  status: 'pending' | 'active' | 'done';
  index: number;
}

export function AgentStepCard({
  stepName,
  summary,
  status,
  index,
}: AgentStepCardProps): React.JSX.Element {
  // Animation values using standard React Native Animated for maximum stability and robustness
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Fade-in and slide-up on component mount or status update
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pulsing dot animation for the active step
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (status === 'active') {
      pulseAnim.setValue(1);
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [status]);

  // Dot color styling based on status
  const dotColor =
    status === 'done'
      ? '#34A853' // Green for done
      : status === 'active'
      ? '#1A73E8' // Blue for active
      : '#2D3748'; // Gray for pending

  // Text colors based on status
  const summaryColor =
    status === 'done'
      ? '#E8EAED'
      : status === 'active'
      ? '#9AA0A6'
      : '#5F6368';

  return (
    <Animated.View
      style={[
        styles.card,
        status === 'active' && styles.cardActive,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Visual Indicator Dot */}
      <View style={styles.indicatorContainer}>
        <Animated.View
          style={[
            styles.dot,
            status !== 'done' && { backgroundColor: dotColor },
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          {status === 'done' && (
            <Ionicons name="checkmark-circle" size={16} color="#34A853" style={styles.checkIcon} />
          )}
        </Animated.View>
        {status === 'active' && <View style={[styles.pulseRing, { borderColor: '#1A73E8' }]} />}
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        <Text style={[styles.stepName, status === 'pending' && styles.textPending]}>
          [{index + 1}] {stepName}
        </Text>
        <Text style={[styles.summary, { color: summaryColor }]}>{summary}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C2333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#2D3748',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cardActive: {
    borderColor: '#1A73E8',
    borderLeftWidth: 4,
    borderLeftColor: '#1A73E8',
  },
  indicatorContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    marginLeft: -3,
    marginTop: -3,
  },
  pulseRing: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    opacity: 0.5,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  stepName: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: '700',
    color: '#4285F4',
    marginBottom: 4,
  },
  textPending: {
    color: '#5F6368',
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
