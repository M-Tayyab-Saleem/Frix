import type { OrchestrateResponse, Provider, UserLocation } from '../types/api';

export type RootStackParamList = {
  MainTabs: undefined;
  AgentThinking: { userPrompt: string; userLocation: UserLocation; currentTime: string };
  Results: { response: OrchestrateResponse };
  ProviderDetail: { provider?: Provider } | undefined;
  BookingConfirm: { provider?: Provider; response?: OrchestrateResponse | null } | undefined;
  BookingDetail: { confirmationId: string };
  Dispute: { confirmationId: string; providerName: string };
};

export type MainTabParamList = {
  Request: undefined;
  MyBookings: undefined;
  Providers: undefined;
  FollowUps: undefined;
};
