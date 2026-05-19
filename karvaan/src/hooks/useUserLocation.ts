// src/hooks/useUserLocation.ts
import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { storage, STORAGE_KEYS } from '@/lib/storage';

const LOCATION_CACHE_MAX_AGE_MS = 10 * 60 * 1000;
const FETCH_TIMEOUT_MS = 6000;

export interface UserCoords {
  latitude: number;
  longitude: number;
}

interface CachedLocation {
  latitude: number;
  longitude: number;
  neighbourhood: string | null;
  timestamp: number;
}

export interface UseUserLocationResult {
  coords: UserCoords | null;
  neighbourhood: string | null;
  permissionStatus: Location.PermissionStatus | null;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
  updateLocationManually: (coords: UserCoords, neighbourhood: string) => void;
}

const readCachedLocation = (): CachedLocation | null => {
  const raw = storage.getString(STORAGE_KEYS.LAST_KNOWN_LOCATION);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CachedLocation;
    if (
      typeof parsed.latitude !== 'number' ||
      typeof parsed.longitude !== 'number' ||
      typeof parsed.timestamp !== 'number'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const isCacheFresh = (timestamp: number): boolean => {
  return Date.now() - timestamp < LOCATION_CACHE_MAX_AGE_MS;
};

const resolveNeighbourhood = async (latitude: number, longitude: number): Promise<string | null> => {
  try {
    const geocode = await Promise.race([
      Location.reverseGeocodeAsync({ latitude, longitude }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
    ]);
    
    if (!geocode || geocode.length === 0) return null;
    const best = geocode[0];
    return best.district ?? best.subregion ?? best.city ?? best.region ?? null;
  } catch (error) {
    console.warn('resolveNeighbourhood: Geocoder service unavailable', error);
    return null;
  }
};

// Fallback to G-13 Islamabad coordinates if GPS is unavailable
const getFallbackLocation = (): CachedLocation => ({
  latitude: 33.650,
  longitude: 72.990,
  neighbourhood: 'G-13',
  timestamp: Date.now(),
});

export const useUserLocation = (): UseUserLocationResult => {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [neighbourhood, setNeighbourhood] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateLocationManually = useCallback((newCoords: UserCoords, newNeighbourhood: string) => {
    setCoords(newCoords);
    setNeighbourhood(newNeighbourhood);
    const cachePayload: CachedLocation = {
      ...newCoords,
      neighbourhood: newNeighbourhood,
      timestamp: Date.now(),
    };
    storage.set(STORAGE_KEYS.LAST_KNOWN_LOCATION, JSON.stringify(cachePayload));
  }, []);

  useEffect(() => {
    let mounted = true;

    const initLocation = async () => {
      const cached = readCachedLocation();
      if (cached && isCacheFresh(cached.timestamp)) {
        setCoords({ latitude: cached.latitude, longitude: cached.longitude });
        setNeighbourhood(cached.neighbourhood);
      }

      try {
        const permission = await Location.getForegroundPermissionsAsync();
        if (mounted) setPermissionStatus(permission.status);

        if (permission.status === Location.PermissionStatus.GRANTED && (!cached || !isCacheFresh(cached.timestamp))) {
          if (mounted) setIsLoading(true);
          
          const positionPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), FETCH_TIMEOUT_MS));
          
          const position = await Promise.race([positionPromise, timeoutPromise]);
          
          if (position && mounted) {
            const nextCoords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
            const nextNeighbourhood = await resolveNeighbourhood(nextCoords.latitude, nextCoords.longitude);

            setCoords(nextCoords);
            setNeighbourhood(nextNeighbourhood);

            storage.set(STORAGE_KEYS.LAST_KNOWN_LOCATION, JSON.stringify({
              ...nextCoords,
              neighbourhood: nextNeighbourhood,
              timestamp: Date.now(),
            }));
          } else if (!cached && mounted) {
            // fallback
            const fallback = getFallbackLocation();
            setCoords({ latitude: fallback.latitude, longitude: fallback.longitude });
            setNeighbourhood(fallback.neighbourhood);
          }
        } else if (permission.status !== Location.PermissionStatus.GRANTED && !cached && mounted) {
          // If no permission and no cache, set fallback immediately
          const fallback = getFallbackLocation();
          setCoords({ latitude: fallback.latitude, longitude: fallback.longitude });
          setNeighbourhood(fallback.neighbourhood);
        }
      } catch (err) {
        console.warn('Location init failed', err);
        if (!cached && mounted) {
          const fallback = getFallbackLocation();
          setCoords({ latitude: fallback.latitude, longitude: fallback.longitude });
          setNeighbourhood(fallback.neighbourhood);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initLocation();
    return () => { mounted = false; };
  }, []);

  const requestPermission = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    storage.set(STORAGE_KEYS.LOCATION_PERMISSION_ASKED, true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(permission.status);

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        const fallback = getFallbackLocation();
        setCoords({ latitude: fallback.latitude, longitude: fallback.longitude });
        setNeighbourhood(fallback.neighbourhood);
        return;
      }

      const positionPromise = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), FETCH_TIMEOUT_MS));
      
      const position = await Promise.race([positionPromise, timeoutPromise]);
      
      if (position) {
        const nextCoords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        const nextNeighbourhood = await resolveNeighbourhood(nextCoords.latitude, nextCoords.longitude);

        setCoords(nextCoords);
        setNeighbourhood(nextNeighbourhood);

        storage.set(STORAGE_KEYS.LAST_KNOWN_LOCATION, JSON.stringify({
          ...nextCoords,
          neighbourhood: nextNeighbourhood,
          timestamp: Date.now(),
        }));
      } else {
        throw new Error("Timeout getting location");
      }
    } catch (error) {
      console.warn('Location request failed, using fallback/cache', error);
      const cached = readCachedLocation();
      if (cached) {
        setCoords({ latitude: cached.latitude, longitude: cached.longitude });
        setNeighbourhood(cached.neighbourhood);
      } else {
        const fallback = getFallbackLocation();
        setCoords({ latitude: fallback.latitude, longitude: fallback.longitude });
        setNeighbourhood(fallback.neighbourhood);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    coords,
    neighbourhood,
    permissionStatus,
    isLoading,
    requestPermission,
    updateLocationManually,
  };
};
