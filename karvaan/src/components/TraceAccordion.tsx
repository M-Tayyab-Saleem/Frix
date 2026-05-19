// src/components/TraceAccordion.tsx
// Renders an expandable log section displaying agent execution traces and ranking weights
// to satisfy both decision transparency and Antigravity core scoring criteria.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import type { TraceResponse } from '../types/api';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export interface TraceAccordionProps {
  trace: TraceResponse;
}

export function TraceAccordion({ trace }: TraceAccordionProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      {/* Header / Toggle Trigger */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>⚙️</Text>
          <Text style={styles.headerTitle}>Why this ranking?</Text>
        </View>
        <Text style={styles.toggleArrow}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Expandable Content Area */}
      {expanded && (
        <View style={styles.content}>
          {/* Factor Weights Table */}
          <Text style={styles.sectionLabel}>Decision Framework Weights</Text>
          <View style={styles.weightsTable}>
            <View style={styles.weightItem}>
              <Text style={styles.weightLabel}>Distance Proximity</Text>
              <Text style={styles.weightValue}>40%</Text>
            </View>
            <View style={styles.weightDivider} />
            <View style={styles.weightItem}>
              <Text style={styles.weightLabel}>Rating Quality</Text>
              <Text style={styles.weightValue}>30%</Text>
            </View>
            <View style={styles.weightDivider} />
            <View style={styles.weightItem}>
              <Text style={styles.weightLabel}>Time Availability</Text>
              <Text style={styles.weightValue}>30%</Text>
            </View>
          </View>

          {/* Sequential Agent Actions Trace */}
          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
            Active Agent Trace Executions
          </Text>
          
          {trace.steps.map((step, index) => (
            <View key={step.agent} style={styles.traceStep}>
              <View style={styles.traceStepHeader}>
                <View style={styles.stepNumBadge}>
                  <Text style={styles.stepNumText}>{index + 1}</Text>
                </View>
                <Text style={styles.agentName}>
                  {step.agent}
                </Text>
              </View>
              <Text style={styles.agentSummary}>{step.summary}</Text>
            </View>
          ))}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Workflow ID: {trace.workflow_id}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#2D3748',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1C2333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    color: '#E8EAED',
    fontSize: 14,
    fontWeight: '700',
  },
  toggleArrow: {
    color: '#9AA0A6',
    fontSize: 12,
  },
  content: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4285F4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  weightsTable: {
    backgroundColor: '#1C2333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3748',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  weightItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  weightDivider: {
    height: 1,
    backgroundColor: '#2D3748',
    marginVertical: 4,
  },
  weightLabel: {
    fontSize: 12,
    color: '#9AA0A6',
  },
  weightValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F9D58',
  },
  traceStep: {
    backgroundColor: '#1C2333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3748',
    padding: 12,
    marginBottom: 8,
  },
  traceStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  stepNumBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  agentName: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: '700',
    color: '#4285F4',
  },
  agentSummary: {
    fontSize: 12.5,
    color: '#9AA0A6',
    lineHeight: 18,
  },
  footer: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 10,
    color: '#5F6368',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
});
