import { touristPlaces } from '@/data/tourist-places';
import { CacheItem, GeosearchResult } from '@/types/places';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

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

// Initialize the OpenStreetMap provider
let provider: OpenStreetMapProvider | null = null;

// Initialize the provider if we're in a browser environment
if (typeof window !== 'undefined') {
  provider = new OpenStreetMapProvider();
}

/**
 * Search locations using leaflet-geosearch
 */
export async function searchLocations(query: string, maxResults: number = 10): Promise<GeosearchResult[]> {
  console.log(`Searching locations for: "${query}"`);

  // Check cache first
  const cacheKey = `geosearch:${query}:${maxResults}`;
  const cachedResults = getFromCache<GeosearchResult[]>(cacheKey);
  if (cachedResults) {
    console.log(`Using cached results for "${query}"`);
    return cachedResults;
  }

  try {
    if (!provider && typeof window !== 'undefined') {
      provider = new OpenStreetMapProvider();
    }

    if (!provider) {
      throw new Error('Geosearch provider not initialized - are you in a server environment?');
    }

    // Search using the provider
    const results = await provider.search({ query });

    // Limit results to maxResults
    const limitedResults = results.slice(0, maxResults);

    // Transform to GeosearchResult format
    const formattedResults = limitedResults.map((result) => ({
      id: result.raw.place_id?.toString() || String(Date.now()),
      name: result.label,
      lat: result.y,
      lng: result.x,
      country: extractCountry(result.label),
      city: extractCity(result.label),
      raw: result.raw
    }));

    console.log(`Found ${formattedResults.length} results for query "${query}"`);

    // Cache results
    setCache(cacheKey, formattedResults);

    return formattedResults;
  } catch (error) {
    console.error(`Error searching locations for ${query}:`, error);
    throw new Error(`Failed to search locations for "${query}"`);
  }
}

/**
 * Fetch popular destinations using geosearch
 */
export async function fetchPopularDestinations(destinations: string[]): Promise<GeosearchResult[]> {
  console.log(`Attempting to fetch ${destinations.length} popular destinations`);

  try {
    const promises = destinations.map(destination => searchLocations(destination, 1));
    const results = await Promise.allSettled(promises);

    const allResults: GeosearchResult[] = [];

    let successCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        successCount++;
        // Get the first result for each destination
        allResults.push({
          ...result.value[0],
          // Add an additional property to identify the original search term
          originalSearch: destinations[index]
        });
      }
    });

    console.log(`Successfully fetched ${successCount}/${destinations.length} destinations`);
    return allResults;
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    throw new Error('Failed to fetch popular destinations');
  }
}

/**
 * Get a specific location by name and optional country code
 */
export async function getLocation(placeName: string, countryCode?: string): Promise<GeosearchResult | null> {
  const query = countryCode ? `${placeName}, ${countryCode}` : placeName;

  try {
    const results = await searchLocations(query, 1);
    if (results.length > 0) {
      return results[0];
    }
    return null;
  } catch (error) {
    console.error(`Error fetching details for ${placeName}:`, error);
    throw new Error(`Failed to fetch details for "${placeName}"`);
  }
}

// Helper function to extract country from a geosearch result label
function extractCountry(label: string): string {
  // Typically, geosearch results have format "City, State, Country"
  const parts = label.split(',');
  if (parts.length > 0) {
    return parts[parts.length - 1].trim();
  }
  return '';
}

// Helper function to extract city from a geosearch result label
function extractCity(label: string): string {
  // Typically, geosearch results have the city as the first part
  const parts = label.split(',');
  if (parts.length > 0) {
    return parts[0].trim();
  }
  return '';
}

// Export the tourist places data for backward compatibility
export { touristPlaces };
