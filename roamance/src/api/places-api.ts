import axios from 'axios';
import { touristPlaces } from '@/data/tourist-places';
import { TouristPlace } from '@/types';

const GEONAMES_USERNAME = 'yashrif';
const API_CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

/**
 * Interface for a single geoname item in the Geonames API response
 */
interface Geoname {
  // Essential location data
  name: string;
  toponymName: string;
  lat: string;
  lng: string;
  geonameId: number;

  // Country & region information
  countryName: string;
  countryCode: string;
  countryId: string;
  adminCode1: string;
  adminName1: string;
  adminCodes1?: {
    ISO3166_2: string;
  };

  // Feature classification
  fcl: string;
  fclName: string;
  fcode: string;
  fcodeName: string;

  // Additional attributes
  population: number;
  timezone?: {
    timeZoneId: string;
    dstOffset: number;
    gmtOffset: number;
  };
  bbox?: {
    east: number;
    south: number;
    north: number;
    west: number;
  };
  wikipediaURL?: string;
  thumbnailImg?: string;
}

/**
 * Interface for the Geonames API response
 */
interface GeoNamesResult {
  geonames: Geoname[];
  totalResultsCount?: number;
  status?: {
    message: string;
    value: number;
  };
}

// Simple cache implementation
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache: {
  [key: string]: CacheItem<any>;
} = {};

/**
 * Gets data from cache if it exists and is not expired
 */
function getFromCache<T>(key: string): T | null {
  const item = cache[key];
  if (!item) return null;

  const now = Date.now();
  if (now - item.timestamp > API_CACHE_DURATION) {
    // Cache expired
    delete cache[key];
    return null;
  }

  return item.data;
}

/**
 * Stores data in cache
 */
function setCache<T>(key: string, data: T): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  };
}

/**
 * Maps a Geonames result to our TouristPlace format
 */
function mapGeonamesToTouristPlace(geoname: any, index: number): TouristPlace {
  // Choose a color based on the index or country code
  const colors = ['var(--primary)', 'var(--ocean)', 'var(--forest)', 'var(--sunset)'];
  const colorIndex = geoname.countryCode ?
    geoname.countryCode.charCodeAt(0) % colors.length :
    index % colors.length;

  // Generate a more descriptive description based on available data
  let description = `${geoname.name} in ${geoname.countryName || 'Unknown'}`;

  // Add more specific description based on the feature code
  if (geoname.fcode === 'PPLC') {
    description += ' (Capital City)';
  } else if (geoname.fcode === 'ADM1') {
    description += ' (Administrative Region)';
  } else if (geoname.fcode === 'PPLA') {
    description += ' (Regional Capital)';
  }

  // Add population info if available
  if (geoname.population) {
    const popMillions = geoname.population / 1000000;
    if (popMillions >= 1) {
      description += ` (Pop: ${popMillions.toFixed(1)}M)`;
    } else if (geoname.population >= 1000) {
      description += ` (Pop: ${(geoname.population / 1000).toFixed(0)}K)`;
    }
  }

  // Add admin info if available and not already mentioned
  if (geoname.adminName1 && !description.includes(geoname.adminName1)) {
    description += `, ${geoname.adminName1}`;
  }

  // Calculate size based on population if available, otherwise default
  const size = geoname.population ?
    Math.min(1.5, Math.max(0.8, Math.log10(geoname.population) / 7)) :
    1.0;

  return {
    id: `api-${geoname.geonameId || index}-${geoname.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: geoname.toponymName || geoname.name,
    lat: parseFloat(geoname.lat),
    lng: parseFloat(geoname.lng),
    country: geoname.countryName || '',
    description,
    color: colors[colorIndex],
    size,
    // Use unsplash for more reliable, beautiful images
    image: `https://source.unsplash.com/featured/?${encodeURIComponent(geoname.name)},landmark,travel`,
  };
}

/**
 * Fetches initial tourist places for display on the globe
 * Uses cache if available, else tries API, and falls back to local data if needed
 */
export async function getInitialPlaces(): Promise<TouristPlace[]> {
  // Check cache first
  const cacheKey = 'initial_places';
  const cachedPlaces = getFromCache<TouristPlace[]>(cacheKey);
  if (cachedPlaces) {
    console.log(`Using ${cachedPlaces.length} cached places`);
    return cachedPlaces;
  }

  try {
    // Curated list of popular tourist destinations worldwide
    const popularDestinations = [
      'Paris', 'New York', 'Tokyo', 'Rome', 'Sydney',
      'Cairo', 'Rio de Janeiro', 'Barcelona', 'Istanbul', 'Dubai',
      'London', 'Venice', 'Santorini', 'Bali', 'Kyoto'
    ];

    console.log(`Attempting to fetch ${popularDestinations.length} popular destinations from Geonames API`);

    const promises = popularDestinations.map(destination =>
      axios.get<GeoNamesResult>('http://api.geonames.org/search', {
        params: {
          q: destination,
          maxRows: 1,
          username: GEONAMES_USERNAME,
          type: 'json',
          featureClass: 'P',
          style: 'full', // Request additional details
        },
      })
    );

    const results = await Promise.allSettled(promises);
    const places: TouristPlace[] = [];

    let successCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.data?.geonames?.length > 0) {
        successCount++;
        const geoname = result.value.data.geonames[0];
        if (geoname.name && geoname.lat && geoname.lng) {
          places.push(mapGeonamesToTouristPlace(geoname, index));
        }
      }
    });

    console.log(`Successfully fetched ${successCount} out of ${popularDestinations.length} places from Geonames API`);
    console.log(`Total places from API: ${places.length}`);

    // If we got at least some results, cache and return them
    if (places.length > 0) {
      setCache(cacheKey, places);
      return places;
    }

    // Fall back to local data if no results
    console.log(`Falling back to ${touristPlaces.length} local places`);
    return touristPlaces;
  } catch (error) {
    console.error('Error fetching initial places:', error);
    console.log(`Falling back to ${touristPlaces.length} local places due to error`);
    // Fall back to local data if API fails
    return touristPlaces;
  }
}

/**
 * Enhanced search function for tourist places
 */
export async function searchPlaces(query: string): Promise<TouristPlace[]> {
  if (!query || query.length < 2) return [];

  // Check cache first
  const cacheKey = `search_${query.toLowerCase()}`;
  const cachedResults = getFromCache<TouristPlace[]>(cacheKey);
  if (cachedResults) {
    console.log(`Using ${cachedResults.length} cached results for "${query}"`);
    return cachedResults;
  }

  // Filter local results first
  const localResults = touristPlaces.filter(
    (place) =>
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.country.toLowerCase().includes(query.toLowerCase())
  );

  try {
    console.log(`Searching Geonames API for: "${query}"`);
    const response = await axios.get<GeoNamesResult>(
      'http://api.geonames.org/search',
      {
        params: {
          q: query,
          maxRows: 10,
          username: GEONAMES_USERNAME,
          type: 'json',
          featureClass: 'P',  // Populated places
          style: 'full',      // Get more details
          orderby: 'relevance',
        },
      }
    );

    const geonames = response.data?.geonames || [];
    console.log(`Found ${geonames.length} results from Geonames API for query "${query}"`);

    // Map API results to our format
    const apiResults = geonames
      .filter((item) => item.name && item.lat && item.lng)
      .map((item, index) => mapGeonamesToTouristPlace(item, index));

    // Combine results with deduplication
    const allResults: TouristPlace[] = [...localResults];

    for (const apiResult of apiResults) {
      // Avoid duplicates by checking name and country
      if (!allResults.some((place) =>
          place.name.toLowerCase() === apiResult.name.toLowerCase() &&
          place.country.toLowerCase() === apiResult.country.toLowerCase())) {
        allResults.push(apiResult);
      }
    }

    console.log(`Total combined results: ${allResults.length} (${localResults.length} local + ${apiResults.filter(r => !localResults.some(l => l.name === r.name)).length} unique API)`);

    // Cache results
    setCache(cacheKey, allResults);

    return allResults;
  } catch (error) {
    console.error('Error fetching places:', error);
    console.log(`Falling back to ${localResults.length} local results for query "${query}"`);
    return localResults;
  }
}

/**
 * Get additional details about a specific place by name and country
 */
export async function getPlaceDetails(placeName: string, countryCode?: string): Promise<TouristPlace | null> {
  const cacheKey = `details_${placeName}_${countryCode || ''}`;
  const cachedDetails = getFromCache<TouristPlace>(cacheKey);

  if (cachedDetails) {
    return cachedDetails;
  }

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

    // Add country filter if available
    if (countryCode) {
      params.country = countryCode;
    }

    const response = await axios.get('http://api.geonames.org/search', { params });

    if (response.data?.geonames?.length > 0) {
      const place = mapGeonamesToTouristPlace(response.data.geonames[0], 0);
      setCache(cacheKey, place);
      return place;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching details for ${placeName}:`, error);
    return null;
  }
}
