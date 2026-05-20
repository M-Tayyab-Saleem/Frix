// src/constants/karachiAreas.ts
// Canonical Karachi areas list for the AI Service Orchestrator.
// Re-exports from src/data/karachiLocations.ts for backwards compatibility
// and audit compliance (CHECK 2.6).

export type { KarachiLocation } from '../data/karachiLocations';
export {
  KARACHI_LOCATIONS as karachiAreas,
  KARACHI_LOCATIONS,
  getNearestKarachiLocation,
  findKarachiLocation,
} from '../data/karachiLocations';
