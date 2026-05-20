// src/api/mockResponse.ts
// Hardcoded mock OrchestrateResponse matching api-contract.md exactly.
// Used when EXPO_PUBLIC_USE_MOCK=true — guaranteed safe demo fallback.

import type { OrchestrateRequest, OrchestrateResponse } from '../types/api';

export function getMockResponse(_req: OrchestrateRequest): OrchestrateResponse {
  return {
    intent: {
      service_type: 'AC Technician',
      location: 'DHA Phase 6',
      time_window: 'tomorrow morning',
      language_detected: 'roman_urdu',
    },
    top_providers: [
      {
        id: 'ac_001',
        name: 'Arctic Cool AC Services',
        category: 'ac_technician',
        location: 'DHA Phase 6, Karachi',
        distance_km: 1.2,
        rating: 4.8,
        availability: 'tomorrow 10:00 AM',
        score: 0.93,
        reasoning:
          'Closest provider (1.2 km), highest rating (4.8★), confirmed availability tomorrow morning.',
      },
      {
        id: 'ac_002',
        name: 'CoolBreeze AC Repair',
        category: 'ac_technician',
        location: 'Clifton Block 5, Karachi',
        distance_km: 3.7,
        rating: 4.5,
        availability: 'tomorrow 11:30 AM',
        score: 0.78,
        reasoning:
          'Strong rating, slightly farther at 3.7 km, available within requested window.',
      },
      {
        id: 'ac_003',
        name: 'Al-Rehman AC Works',
        category: 'ac_technician',
        location: 'Gulshan-e-Iqbal Block 13, Karachi',
        distance_km: 5.1,
        rating: 4.1,
        availability: 'today 5:00 PM',
        score: 0.61,
        reasoning:
          'Furthest at 5.1 km and lower rating, but still available within the requested window.',
      },
    ],
    recommended: {
      id: 'ac_001',
      name: 'Arctic Cool AC Services',
      category: 'ac_technician',
      location: 'DHA Phase 6, Karachi',
      distance_km: 1.2,
      rating: 4.8,
      availability: 'tomorrow 10:00 AM',
      score: 0.93,
      reasoning:
        'Closest provider (1.2 km), highest rating (4.8★), confirmed availability tomorrow morning.',
    },
    booking: {
      provider_id: 'ac_001',
      provider_name: 'Arctic Cool AC Services',
      slot: '2026-05-20T10:00:00+05:00',
      confirmation_id: 'BK-20260520-0001',
      message: 'Booking confirmed with Arctic Cool AC Services for tomorrow at 10:00 AM.',
    },
    followup: {
      booking_id: 'BK-20260520-0001',
      reminder_at: '2026-05-20T09:00:00+05:00',
      channel: 'sms_simulated',
      message: 'Reminder: Your AC technician (Arctic Cool AC Services) arrives in 1 hour.',
    },
    trace: {
      workflow_id: 'wf-mock-20260520-001',
      steps: [
        {
          agent: 'IntentParser',
          summary:
            'Detected Roman Urdu input. Extracted service_type=AC Technician, location=DHA Phase 6, time_window=tomorrow morning. Language confidence: 0.97.',
        },
        {
          agent: 'ProviderFinder',
          summary:
            'Queried provider registry for area DHA Phase 6 ± 5 km. Found 6 active AC technicians. Filtered to 3 with confirmed availability.',
        },
        {
          agent: 'Ranker',
          summary:
            'Scored providers: Distance 40% weight, Rating 30%, Availability 30%. Arctic Cool AC Services achieved 0.93 composite score — 15% above next candidate.',
        },
        {
          agent: 'Booking',
          summary:
            'Reserved slot 10:00 AM with Arctic Cool AC Services. Confirmation ID BK-20260520-0001 generated. Provider notified via SMS.',
        },
        {
          agent: 'FollowUp',
          summary:
            'Scheduled reminder for 09:00 AM via sms_simulated channel — 1 hour before appointment. Calendar entry created.',
        },
      ],
    },
  };
}
