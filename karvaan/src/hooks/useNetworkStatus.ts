// src/hooks/useNetworkStatus.ts
// Hook to detect network connectivity changes using @react-native-community/netinfo
// Returns the current connection state and a boolean flag for easy checking

import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

export function useNetworkStatus(): NetworkState {
  const [state, setState] = useState<NetworkState>({
    isConnected: true, // Optimistic default
    isInternetReachable: true,
  });

  useEffect(() => {
    // Immediately check current state
    const unsubscribe = NetInfo.addEventListener((newState) => {
      setState({
        isConnected: newState.isConnected,
        isInternetReachable: newState.isInternetReachable,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}
