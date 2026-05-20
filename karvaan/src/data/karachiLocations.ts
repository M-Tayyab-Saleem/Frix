export interface KarachiLocation {
  area: string;
  lat: number;
  lng: number;
  city: string;
}

export const KARACHI_LOCATIONS: KarachiLocation[] = [
  { area: 'DHA Phase 6', lat: 24.7920, lng: 67.0645, city: 'Karachi' },
  { area: 'DHA Phase 2', lat: 24.8104, lng: 67.0657, city: 'Karachi' },
  { area: 'Clifton Block 5', lat: 24.8090, lng: 67.0307, city: 'Karachi' },
  { area: 'Clifton Block 8', lat: 24.8207, lng: 67.0254, city: 'Karachi' },
  { area: 'Gulshan-e-Iqbal Block 13', lat: 24.9197, lng: 67.1134, city: 'Karachi' },
  { area: 'Gulshan-e-Iqbal Block 7', lat: 24.9253, lng: 67.1005, city: 'Karachi' },
  { area: 'PECHS Block 2', lat: 24.8654, lng: 67.0590, city: 'Karachi' },
  { area: 'PECHS Block 6', lat: 24.8694, lng: 67.0635, city: 'Karachi' },
  { area: 'North Nazimabad Block H', lat: 24.9439, lng: 67.0505, city: 'Karachi' },
  { area: 'North Nazimabad Block J', lat: 24.9476, lng: 67.0549, city: 'Karachi' },
  { area: 'Nazimabad No.3', lat: 24.9237, lng: 67.0317, city: 'Karachi' },
  { area: 'Bahadurabad', lat: 24.8787, lng: 67.0639, city: 'Karachi' },
  { area: 'Tariq Road', lat: 24.8638, lng: 67.0653, city: 'Karachi' },
  { area: 'Federal B Area Block 4', lat: 24.9304, lng: 67.0697, city: 'Karachi' },
  { area: 'Malir Cantonment', lat: 24.8936, lng: 67.2002, city: 'Karachi' },
  { area: 'Korangi', lat: 24.8296, lng: 67.1282, city: 'Karachi' },
  { area: 'Landhi', lat: 24.8554, lng: 67.2012, city: 'Karachi' },
  { area: 'Orangi Town', lat: 24.9604, lng: 67.0018, city: 'Karachi' },
  { area: 'Surjani Town', lat: 25.0165, lng: 67.0416, city: 'Karachi' },
  { area: 'Saddar', lat: 24.8607, lng: 67.0099, city: 'Karachi' },
];

export function getNearestKarachiLocation(lat: number, lng: number): KarachiLocation {
  let best = KARACHI_LOCATIONS[0];
  let bestDist = Infinity;

  for (const location of KARACHI_LOCATIONS) {
    const dist = Math.abs(location.lat - lat) + Math.abs(location.lng - lng);
    if (dist < bestDist) {
      bestDist = dist;
      best = location;
    }
  }

  return best;
}

export function findKarachiLocation(area: string): KarachiLocation | undefined {
  return KARACHI_LOCATIONS.find((location) => location.area === area);
}
