export interface TouristPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  description: string;
  color: string;
  size: number;
  image?: string;
  images?: string[];
}

// Interface for leaflet-geosearch results
export interface GeosearchResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
  raw?: unknown;
  originalSearch?: string; // Used when searching for specific destinations
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
}
