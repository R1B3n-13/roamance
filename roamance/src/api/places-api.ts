import { touristPlaces } from '@/data/tourist-places';
import { CacheItem } from '@/types/places';
import { TouristPlace } from '@/types';

const API_CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

const cache: {
  [key: string]: CacheItem<unknown>;
} = {};

export function getFromCache<T>(key: string): T | null {
  const item = cache[key];
  if (!item) return null;

  const now = Date.now();
  if (now - item.timestamp > API_CACHE_DURATION) {
    delete cache[key];
    return null;
  }

  return item.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  };
}

// This function is added to fix the error in globe-showcase.tsx
export async function getInitialPlaces(): Promise<TouristPlace[]> {
  return Promise.resolve(touristPlaces);
}

export { touristPlaces };
