// src/types/api.ts
// Phase 2 will fill this in fully. Stub created in Phase 1 to satisfy navigation.ts imports.

export interface UserLocation {
  sector?: string | null;
  city?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface Intent {
  service_type: string;
  location: string;
  time_window: string;
  language_detected: 'english' | 'urdu' | 'roman_urdu' | 'mixed' | 'unknown';
  notes?: string | null;
}

export interface Provider {
  id: string;
  name: string;
  category: string;
  location: string;
  distance_km: number;
  rating: number;
  availability: string;
  price_range?: string | null;
  score: number;
  reasoning: string;
}

export interface BookingResult {
  provider_id: string;
  provider_name: string;
  slot: string;
  confirmation_id: string;
  message: string;
  // Fields added when booking is persisted to the store:
  followup_reminder_at?: string;   // ISO datetime — from followup.reminder_at
  status?: 'CONFIRMED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt?: string;              // ISO datetime — when the booking was made
}

export interface FollowUpResult {
  booking_id: string;
  reminder_at: string;
  channel: string;
  message: string;
}

export interface TraceStep {
  agent: string;
  summary: string;
}

export interface TraceResponse {
  workflow_id: string;
  steps: TraceStep[];
}

export interface OrchestrateRequest {
  user_prompt: string;
  user_location?: UserLocation | null;
  current_time?: string | null;
}

export interface OrchestrateResponse {
  intent: Intent;
  top_providers: Provider[];
  recommended: Provider;
  booking: BookingResult;
  followup: FollowUpResult;
  trace: TraceResponse;
  error?: string | null;
}
