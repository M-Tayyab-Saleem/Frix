// src/api/orchestrator.ts
// The single entry-point for all orchestration requests.
// Toggles between mock and real FastAPI backend via EXPO_PUBLIC_USE_MOCK env var.

import { getMockResponse } from './mockResponse';
import type { OrchestrateRequest, OrchestrateResponse } from '../types/api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

let sessionMockOverride = false;

/**
 * setUseMockOverride — enable or disable mock fallback for the current application session.
 * Called by the orchestratorStore.enableMockMode() (panic button) and handleUseDemo()
 * on AgentThinkingScreen.
 */
export function setUseMockOverride(value: boolean) {
  sessionMockOverride = value;
}

/**
 * getIsMockActive — returns true when mock mode is active (either via env or session override).
 * Exposed so screens can display a "DEMO MODE" badge.
 */
export function getIsMockActive(): boolean {
  return USE_MOCK || sessionMockOverride;
}

/**
 * orchestrate — call the AI orchestration backend.
 *
 * Mock path (EXPO_PUBLIC_USE_MOCK=true OR sessionMockOverride=true):
 *   - Waits exactly 4 000 ms so AgentThinkingScreen's 4 400 ms animation
 *     always completes before navigate() fires (T-11 requirement).
 *   - Returns the hardcoded mock response from mockResponse.ts.
 *   - No network request is made.
 *
 * Real path (EXPO_PUBLIC_USE_MOCK=false):
 *   - POSTs to {EXPO_PUBLIC_API_URL}/orchestrate with a 60-second timeout (T-12).
 *   - Throws an error with apiError attached on non-2xx responses or timeout.
 *   - Network failures and timeouts are caught and tagged appropriately (T-12).
 */
export async function orchestrate(req: OrchestrateRequest): Promise<OrchestrateResponse> {
  console.log(`[Orchestrator] payload:`, JSON.stringify(req, null, 2));

  if (USE_MOCK || sessionMockOverride) {
    console.log(
      `[Orchestrator] Mock mode active (USE_MOCK=${USE_MOCK}, sessionOverride=${sessionMockOverride}). Simulating 4 000 ms delay.`
    );
    // T-11: Fixed 4 000 ms keeps mock latency consistent with AgentThinking
    // animation (4 400 ms total) — response always arrives before navigation.
    await new Promise<void>((r) => setTimeout(r, 4000));
    return getMockResponse(req);
  }

  const url = `${BASE_URL}/orchestrate`;
  console.log(`[Orchestrator] POST ${url}`);

  // T-12: Create an AbortController for 60-second timeout
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 60000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: abortController.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`[Orchestrator] API error (Status: ${res.status}):`, JSON.stringify(err));
      throw Object.assign(new Error(`API error ${res.status}`), { 
        apiError: err,
        isTimeout: false,
      });
    }

    const data = await res.json();
    console.log(`[Orchestrator] Success:`, JSON.stringify(data, null, 2));
    return data as OrchestrateResponse;
  } catch (err: any) {
    clearTimeout(timeoutId);

    // T-12: Distinguish timeout from network errors
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('API request timed out after 60 seconds');
      Object.assign(timeoutErr, { isTimeout: true, originalError: err });
      console.error(`[Orchestrator] Timeout error:`, timeoutErr.message);
      throw timeoutErr;
    }

    // T-12: Network errors (offline, connection refused, etc.)
    console.error(`[Orchestrator] Request failed:`, err.message ?? err);
    throw Object.assign(err, { isTimeout: false });
  }
}
