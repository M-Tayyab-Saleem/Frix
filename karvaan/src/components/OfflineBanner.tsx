import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Colors } from '@/constants/colors';

interface OfflineBannerProps {
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function OfflineBanner({ dismissible = false, onDismiss }: OfflineBannerProps): React.JSX.Element | null {
  const networkState = useNetworkStatus();
  const [dismissed, setDismissed] = React.useState(false);

  // Check if device is offline
  const isOffline = networkState.isConnected === false || networkState.isInternetReachable === false;

  if (!isOffline || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={16} color={Colors.primary} style={styles.icon} />
        <Text style={styles.text}>You're offline</Text>
      </View>
      {dismissible && (
        <TouchableOpacity onPress={handleDismiss}>
          <Ionicons name="close" size={20} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 16 : 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
