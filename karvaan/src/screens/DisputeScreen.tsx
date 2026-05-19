// src/screens/DisputeScreen.tsx
// Renders the AI-driven immediate dispute resolution interface.
// Allows users to select grievance categories, input descriptions, and see instantaneous
// simulated agent compensation/escalation adjustments.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Ionicons } from '@expo/vector-icons';

type IssueType = 'No-show' | 'Late Arrival' | 'Quality Issue' | 'Price Dispute' | 'Other';

export function DisputeScreen(): React.JSX.Element {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { confirmationId, providerName } = route.params || {};

  const [selectedIssue, setSelectedIssue] = useState<IssueType | null>(null);
  const [description, setDescription] = useState('');
  
  // Resolution flow state machine: 'input' | 'reviewing' | 'resolved'
  const [flowState, setFlowState] = useState<'input' | 'reviewing' | 'resolved'>('input');

  const issueTypes: IssueType[] = [
    'No-show',
    'Late Arrival',
    'Quality Issue',
    'Price Dispute',
    'Other',
  ];

  const handleSubmit = () => {
    if (!selectedIssue) return;
    
    setFlowState('reviewing');
    
    // Simulate real-time 2-second agent review loop
    setTimeout(() => {
      setFlowState('resolved');
    }, 2000);
  };

  const handleEscalate = () => {
    Alert.alert(
      'Escalated to Human Supervisor',
      'A Frix human operations director has been paged and will contact you at your registered phone number within 24 hours.',
      [{ text: 'Understood' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <OfflineBanner />
      <LinearGradient colors={['#0F1524', '#0D1117']} style={styles.gradient}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#E8EAED" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking: {confirmationId}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {flowState === 'input' && (
            /* STEP 1: INPUT GAI FORM */
            <View>
              <Text style={styles.sectionTitle}>Report an Issue</Text>
              <Text style={styles.subHeader}>
                Please provide details below.
              </Text>

              {/* Category selector */}
              <Text style={styles.label}>Select Issue Category</Text>
              <View style={styles.chipGrid}>
                {issueTypes.map((issue) => {
                  const isSelected = selectedIssue === issue;
                  return (
                    <TouchableOpacity
                      key={issue}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setSelectedIssue(issue)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {issue}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Description Input */}
              <Text style={[styles.label, { marginTop: 18 }]}>Detailed Description</Text>
              <TextInput
                style={styles.descriptionInput}
                multiline
                numberOfLines={4}
                placeholder="Help our AI agent understand the exact details. e.g. 'Ali arrived 45 minutes late and demanded extra cash fuel surcharges not visible on the bill.'"
                placeholderTextColor="#5F6368"
                value={description}
                onChangeText={setDescription}
              />

              {/* Visual media attachment note */}
              <View style={styles.evidencePlaceholder}>
                <Text style={styles.evidenceText}>
                  <Ionicons name="camera-outline" size={14} color="#E8EAED" /> Photo Evidence (Auto-extracts timestamps/geolocations)
                </Text>
                <Text style={styles.evidenceDesc}>
                  Highly recommended for quality or price disputes. Mock upload active.
                </Text>
              </View>

              {/* Submit Action */}
              <TouchableOpacity
                style={[styles.submitBtn, !selectedIssue && styles.submitBtnDisabled]}
                disabled={!selectedIssue}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.submitBtnText}>Submit to AI Claims Adjuster</Text>
              </TouchableOpacity>
            </View>
          )}

          {flowState === 'reviewing' && (
            /* STEP 2: REVIEWING STATE */
            <View style={styles.centeredContainer}>
              <ActivityIndicator size="large" color="#EA4335" style={{ marginBottom: 20 }} />
              <Text style={styles.reviewTextHeader}>Agent Reviewing Claim...</Text>
              <Text style={styles.reviewTextDesc}>
                Our AI safety and billing engine is validating timestamps, provider GPS paths, and contract invoices.
              </Text>
            </View>
          )}

          {flowState === 'resolved' && (
            /* STEP 3: RESOLVED STATE CARD */
            <View style={styles.resolvedContainer}>
              <View style={styles.successIconWrapper}>
                <Ionicons name="shield-checkmark" size={32} color="#34A853" />
              </View>

              <Text style={styles.successHeader}>AI Instant Resolution</Text>
              <Text style={styles.successSubHeader}>Claim Verified Automatically</Text>

              {/* Resolution Card */}
              <View style={styles.resolutionCard}>
                <Text style={styles.resCardTitle}><Ionicons name="checkmark" size={14} color="#FFFFFF" /> Resolution Approved</Text>
                <Text style={styles.resCardBody}>
                  We have successfully completed verification of your case:
                  {'\n\n'}
                  • <Text style={styles.highlightText}>PKR 500 Refund</Text> has been credited back to your wallet due to service terms deviation.
                  {'\n\n'}
                  • <Text style={styles.highlightText}>{providerName}</Text> has been flagged for service standards audit. Their matchmaking priority score has been downgraded.
                </Text>
              </View>

              {/* Human Escalation Button */}
              <TouchableOpacity
                style={styles.escalateBtn}
                onPress={handleEscalate}
                activeOpacity={0.8}
              >
                <Text style={styles.escalateBtnText}>Escalate to Human Support</Text>
              </TouchableOpacity>

              {/* Return to Dashboard */}
              <TouchableOpacity
                style={styles.backHomeBtn}
                onPress={() => navigation.navigate('MainTabs')}
                activeOpacity={0.8}
              >
                <Text style={styles.backHomeBtnText}>Return to Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
    backgroundColor: '#101726',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#1C2333',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  backArrow: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8EAED',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#EA4335',
  },
  subHeader: {
    fontSize: 12,
    color: '#9AA0A6',
    marginTop: 4,
    marginBottom: 20,
  },
  monospaceId: {
    fontFamily: 'monospace',
    color: '#4285F4',
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4285F4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1C2333',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  chipActive: {
    backgroundColor: '#EA4335',
    borderColor: '#EA4335',
  },
  chipText: {
    color: '#9AA0A6',
    fontSize: 12.5,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  descriptionInput: {
    height: 100,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#2D3748',
    borderRadius: 10,
    padding: 12,
    color: '#E8EAED',
    fontSize: 13.5,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  evidencePlaceholder: {
    borderWidth: 1.5,
    borderColor: '#2D3748',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#111827',
    marginBottom: 24,
  },
  evidenceText: {
    color: '#E8EAED',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  evidenceDesc: {
    color: '#5F6368',
    fontSize: 11,
    textAlign: 'center',
  },
  submitBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#EA4335',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14.5,
  },
  centeredContainer: {
    paddingTop: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  reviewTextHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E8EAED',
    marginBottom: 10,
  },
  reviewTextDesc: {
    fontSize: 13.5,
    color: '#9AA0A6',
    textAlign: 'center',
    lineHeight: 20,
  },
  resolvedContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  successIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A2F1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#34A853',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 32,
  },
  successHeader: {
    fontSize: 22,
    fontWeight: '800',
    color: '#34A853',
  },
  successSubHeader: {
    fontSize: 12.5,
    color: '#9AA0A6',
    marginTop: 4,
    marginBottom: 20,
  },
  resolutionCard: {
    width: '100%',
    backgroundColor: '#112211',
    borderColor: '#225522',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  resCardTitle: {
    color: '#34A853',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  resCardBody: {
    color: '#C2E7C2',
    fontSize: 13,
    lineHeight: 19,
  },
  highlightText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  escalateBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  escalateBtnText: {
    color: '#9AA0A6',
    fontWeight: '700',
    fontSize: 13.5,
  },
  backHomeBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13.5,
  },
});
