// src/store/orchestratorStore.ts
// Zustand store for orchestration state, bookings, and recent requests.
// Persists data securely to MMKV local storage.

import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { setUseMockOverride } from '@/api/orchestrator';
import type { OrchestrateRequest, OrchestrateResponse, BookingResult, Provider } from '../types/api';

interface OrchestratorState {
  request: OrchestrateRequest | null;
  response: OrchestrateResponse | null;
  selectedProvider: Provider | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  bookings: BookingResult[];
  recentRequests: string[];
  /** T-11: true when the panic button has been tapped 5× in this session */
  mockModeEnabled: boolean;

  setRequest: (req: OrchestrateRequest) => void;
  setResponse: (res: OrchestrateResponse) => void;
  setSelectedProvider: (p: Provider) => void;
  setStatus: (s: OrchestratorState['status']) => void;
  setError: (e: string | null) => void;
  addBooking: (b: BookingResult) => void;
  addRecentRequest: (prompt: string) => void;
  clearCurrent: () => void;
  /**
   * T-11: enableMockMode — called by the 5-tap panic button.
   * Flips the in-process sessionMockOverride flag in orchestrator.ts so
   * subsequent calls to orchestrate() use mock data without a restart.
   */
  enableMockMode: () => void;
}

export const useOrchestratorStore = create<OrchestratorState>((set, get) => {
  // Load persisted bookings from MMKV
  const savedBookings = storage.getString(STORAGE_KEYS.BOOKINGS);
  const bookings: BookingResult[] = savedBookings ? JSON.parse(savedBookings) : [];

  // Load recent search queries
  const savedRecent = storage.getString(STORAGE_KEYS.RECENT_REQUESTS);
  const recentRequests: string[] = savedRecent ? JSON.parse(savedRecent) : [];

  // T-11: Restore mock override from previous panic-button activation in this
  // build session (stored as a string flag).  Note: the env-var USE_MOCK is
  // evaluated at bundle time; sessionMockOverride is runtime-only.
  const savedMock = storage.getBoolean(STORAGE_KEYS.MOCK_MODE_ENABLED) ?? false;
  if (savedMock) {
    // Re-arm the runtime override so the orchestrator uses mock immediately.
    setUseMockOverride(true);
  }

  return {
    request: null,
    response: null,
    selectedProvider: null,
    status: 'idle',
    error: null,
    bookings,
    recentRequests,
    mockModeEnabled: savedMock,

    setRequest: (req) => set({ request: req }),
    setResponse: (res) => set({ response: res, status: 'success' }),
    setSelectedProvider: (p) => set({ selectedProvider: p }),
    setStatus: (s) => set({ status: s }),
    setError: (e) => set({ error: e, status: 'error' }),

    addBooking: (b) => {
      const next = [b, ...get().bookings];
      storage.set(STORAGE_KEYS.BOOKINGS, JSON.stringify(next));
      set({ bookings: next });
    },

    addRecentRequest: (prompt) => {
      const next = [prompt, ...get().recentRequests.filter((r) => r !== prompt)].slice(0, 3);
      storage.set(STORAGE_KEYS.RECENT_REQUESTS, JSON.stringify(next));
      set({ recentRequests: next });
    },

    clearCurrent: () =>
      set({
        request: null,
        response: null,
        selectedProvider: null,
        status: 'idle',
        error: null,
      }),

    // T-11 — panic button handler
    enableMockMode: () => {
      // 1. Flip the runtime flag so orchestrate() returns mock immediately
      setUseMockOverride(true);
      // 2. Persist so store re-arms on hot-reload (not a full restart)
      storage.set(STORAGE_KEYS.MOCK_MODE_ENABLED, true);
      set({ mockModeEnabled: true });
    },
  };
});
