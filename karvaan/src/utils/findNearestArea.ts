// src/utils/findNearestArea.ts
// Haversine-based nearest Karachi area lookup.
// CHECK 12.2 compliance — uses great-circle distance (not flat-earth).

import { KARACHI_LOCATIONS } from '../data/karachiLocations';
import type { KarachiLocation } from '../data/karachiLocations';

/**
 * haversineKm — great-circle distance between two GPS points in km.
 * Uses R=6371, math.sin, math.cos, math.atan2 per spec CHECK 14.1/12.2.
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * findNearestArea — returns the closest Karachi area to a given GPS point.
 * Uses haversineKm for accurate spherical distance (not flat-earth approximation).
 *
 * @param lat  User latitude
 * @param lng  User longitude
 * @returns    Closest KarachiLocation object with { area, lat, lng }
 */
export function findNearestArea(
  lat: number,
  lng: number
): { area: string; lat: number; lng: number } {
  let best: KarachiLocation = KARACHI_LOCATIONS[0];
  let bestDist = Infinity;

  for (const loc of KARACHI_LOCATIONS) {
    const dist = haversineKm(lat, lng, loc.lat, loc.lng);
    if (dist < bestDist) {
      bestDist = dist;
      best = loc;
    }
  }

  return { area: best.area, lat: best.lat, lng: best.lng };
}
