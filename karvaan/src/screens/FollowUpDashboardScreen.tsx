import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type Operation = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'done';
  time: string;
};

const MOCK_OPERATIONS: Operation[] = [
  { id: '1', title: 'Provider Ping', description: 'Checking availability with Ali AC Services.', status: 'done', time: '10:02 AM' },
  { id: '2', title: 'Booking Confirmation', description: 'Generated booking ID BK-20260520-0001.', status: 'done', time: '10:04 AM' },
  { id: '3', title: 'Service Reminder', description: 'Reminding provider about scheduled slot.', status: 'active', time: '10:30 AM (Est)' },
  { id: '4', title: 'Completion Check', description: 'Waiting for service completion.', status: 'pending', time: 'Pending' },
];

function StatusDot({ status }: { status: Operation['status'] }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (status === 'active') {
      scale.value = withRepeat(withTiming(1.3, { duration: 600 }), -1, true);
    } else {
      scale.value = 1;
    }
  }, [status]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBackgroundColor = () => {
    switch (status) {
      case 'done': return '#34A853';
      case 'active': return '#1A73E8';
      case 'pending': return '#2D3748';
    }
  };

  return (
    <Animated.View style={[styles.dotContainer, animatedStyle]}>
      <View style={[styles.dot, { backgroundColor: getBackgroundColor() }]} />
    </Animated.View>
  );
}

export function FollowUpDashboardScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D1117', '#111827']} style={StyleSheet.absoluteFill} />
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Active Operations</Text>
        <Text style={styles.headerSubtitle}>System-wide agentic workflow</Text>
        
        <View style={styles.timelineContainer}>
          {MOCK_OPERATIONS.map((op, index) => (
            <Animated.View 
              key={op.id} 
              entering={FadeInUp.delay(index * 200).springify().damping(12)}
              style={styles.cardWrapper}
            >
              {/* Timeline Connector */}
              {index !== MOCK_OPERATIONS.length - 1 && (
                <View style={styles.connector} />
              )}
              
              <View style={styles.leftColumn}>
                <StatusDot status={op.status} />
              </View>
              
              <View style={[
                styles.card, 
                op.status === 'active' && styles.cardActive
              ]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{op.title}</Text>
                  <Text style={styles.cardTime}>{op.time}</Text>
                </View>
                <Text style={styles.cardDesc}>{op.description}</Text>
                {op.status === 'done' && (
                  <View style={styles.iconRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#34A853" />
                    <Text style={styles.iconText}>Completed</Text>
                  </View>
                )}
                {op.status === 'active' && (
                  <View style={styles.iconRow}>
                    <Ionicons name="sync" size={16} color="#1A73E8" />
                    <Text style={[styles.iconText, { color: '#1A73E8' }]}>Processing</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  scrollContent: { padding: 24, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#E8EAED', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#9AA0A6', marginBottom: 32 },
  timelineContainer: { marginTop: 10 },
  cardWrapper: { flexDirection: 'row', marginBottom: 24 },
  leftColumn: { width: 30, alignItems: 'center', zIndex: 10 },
  connector: { position: 'absolute', left: 14, top: 20, bottom: -30, width: 2, backgroundColor: '#2D3748', zIndex: 1 },
  dotContainer: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D1117' },
  dot: { width: 12, height: 12, borderRadius: 6, zIndex: 10 },
  card: { flex: 1, marginLeft: 16, backgroundColor: '#1C2333', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2D3748' },
  cardActive: { borderColor: '#1A73E8', backgroundColor: '#1C2333' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#E8EAED' },
  cardTime: { fontSize: 12, color: '#9AA0A6' },
  cardDesc: { fontSize: 14, color: '#9AA0A6', lineHeight: 20, marginBottom: 8 },
  iconRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  iconText: { fontSize: 13, color: '#34A853', marginLeft: 6, fontWeight: '500' },
});
