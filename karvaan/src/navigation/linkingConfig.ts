// src/navigation/linkingConfig.ts
import { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';

/**
 * Deep linking configuration for ServisAI (AI Service Orchestrator).
 * Kept minimal — no deep links required for hackathon demo.
 */
export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'frix://',
    'servisai://',
    'https://frix.pk',
  ],
  config: {
    screens: {
      MainTabs: {
        path: '',
        screens: {
          Request: 'request',
          MyBookings: 'bookings',
          Providers: 'providers',
          Profile: 'profile',
        },
      },
      AgentThinking: 'agent-thinking',
      Results: 'results',
      ProviderDetail: 'provider-detail',
      BookingConfirm: 'booking-confirm',
      BookingDetail: 'booking/:confirmationId',
      Dispute: 'dispute/:confirmationId',
    },
  },
};
