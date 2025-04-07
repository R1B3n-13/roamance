import axios from 'axios';
import { touristPlaces } from '@/data/tourist-places';
import { Geoname, GeoNamesResult, CacheItem } from '@/types/places';

const GEONAMES_USERNAME = 'yashrif';
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

export async function fetchPopularDestinations(destinations: string[]): Promise<Geoname[]> {
  console.log(`Attempting to fetch ${destinations.length} popular destinations from Geonames API`);

  const promises = destinations.map(destination =>
    axios.get<GeoNamesResult>('http://api.geonames.org/search', {
      params: {
        q: destination,
        maxRows: 1,
        username: GEONAMES_USERNAME,
        type: 'json',
        featureClass: 'P',
        style: 'full',
      },
    })
  );

  const results = await Promise.allSettled(promises);
  const geonames: Geoname[] = [];

  let successCount = 0;
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.data?.geonames?.length > 0) {
      successCount++;
      const geoname = result.value.data.geonames[0];
      if (geoname.name && geoname.lat && geoname.lng) {
        geonames.push(geoname);
      }
    }
  });

  console.log(`Successfully fetched ${successCount} out of ${destinations.length} places from Geonames API`);
  return geonames;
}

export async function searchGeonames(query: string, maxRows: number = 10): Promise<Geoname[]> {
  console.log(`Searching Geonames API for: "${query}"`);
  const response = await axios.get<GeoNamesResult>(
    'http://api.geonames.org/search',
    {
      params: {
        q: query,
        maxRows,
        username: GEONAMES_USERNAME,
        type: 'json',
        featureClass: 'P',
        style: 'full',
        orderby: 'relevance',
      },
    }
  );

  const geonames = response.data?.geonames || [];
  console.log(`Found ${geonames.length} results from Geonames API for query "${query}"`);
  return geonames;
}

export async function getGeoname(placeName: string, countryCode?: string): Promise<Geoname | null> {
  try {
    interface GeonamesParams {
      q: string;
      maxRows: number;
      username: string;
      type: string;
      style: string;
      country?: string;
    }
    const params: GeonamesParams = {
      q: placeName,
      maxRows: 1,
      username: GEONAMES_USERNAME,
      type: 'json',
      style: 'full',
    };

    if (countryCode) {
      params.country = countryCode;
    }

    const response = await axios.get<GeoNamesResult>('http://api.geonames.org/search', { params });

    if (response.data?.geonames?.length > 0) {
      return response.data.geonames[0];
    }

    return null;
  } catch (error) {
    console.error(`Error fetching details for ${placeName}:`, error);
    return null;
  }
}

export { touristPlaces };
