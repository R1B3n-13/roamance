import { TouristPlace } from '@/types';
import {
  fetchPopularDestinations,
  searchGeonames,
  getGeoname,
  getFromCache,
  setCache,
  touristPlaces,
  Geoname
} from '@/api/places-api';
import { fetchImages } from '@/api/unsplash-api';

/**
 * Maps a Geonames result to our TouristPlace format with Unsplash images
 */
async function mapGeonamesToTouristPlace(geoname: Geoname, index: number): Promise<TouristPlace> {
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

  // Fetch multiple images for the place using Unsplash API
  const images = await fetchImages(geoname.name);

  return {
    id: `api-${geoname.geonameId || index}-${geoname.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: geoname.toponymName || geoname.name,
    lat: parseFloat(geoname.lat),
    lng: parseFloat(geoname.lng),
    country: geoname.countryName || '',
    description,
    color: colors[colorIndex],
    size,
    // Use the first image as the primary image (for backward compatibility)
    image: images[0],
    // Add the full array of images for carousel display
    images,
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

    const geonames = await fetchPopularDestinations(popularDestinations);

    // Map geonames to tourist places with images
    const places = await Promise.all(
      geonames.map((geoname, index) => mapGeonamesToTouristPlace(geoname, index))
    );

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
    // Get results from Geonames API
    const geonames = await searchGeonames(query);

    // Map API results to our format with images from Unsplash
    const apiResults = await Promise.all(
      geonames
        .filter((item) => item.name && item.lat && item.lng)
        .map((item, index) => mapGeonamesToTouristPlace(item, index))
    );

    console.log(`Found ${apiResults.length} API results and ${localResults.length} local results for "${query}"`);

    // Combine local and API results, prioritizing API results for duplicates
    const combinedResults = [...apiResults];

    // Add local results that don't have an API counterpart
    localResults.forEach((localPlace) => {
      const isDuplicate = combinedResults.some(
        (apiPlace) =>
          apiPlace.name.toLowerCase() === localPlace.name.toLowerCase() ||
          (apiPlace.lat === localPlace.lat && apiPlace.lng === localPlace.lng)
      );

      if (!isDuplicate) {
        combinedResults.push(localPlace);
      }
    });

    // Cache results for future searches
    setCache(cacheKey, combinedResults);

    return combinedResults;
  } catch (error) {
    console.error(`Error searching places for "${query}":`, error);
    // Fall back to local results on error
    return localResults;
  }
}

/**
 * Gets details for a specific place by ID or name
 */
export async function getPlaceDetails(placeId: string): Promise<TouristPlace | null> {
  // Check if it's an API place ID format
  const apiPlaceMatch = placeId.match(/^api-(\d+)-(.+)$/);

  if (apiPlaceMatch) {
    const geonameId = apiPlaceMatch[1];
    const placeName = apiPlaceMatch[2].replace(/-/g, ' ');

    try {
      // Try to find this place in the cache first
      const cacheKey = `place_${geonameId}`;
      const cachedPlace = getFromCache<TouristPlace>(cacheKey);
      if (cachedPlace) return cachedPlace;

      // Get details from Geonames API
      const geoname = await getGeoname(placeName);

      if (geoname) {
        const place = await mapGeonamesToTouristPlace(geoname, 0);
        setCache(cacheKey, place);
        return place;
      }
    } catch (error) {
      console.error(`Error fetching place details for ID ${placeId}:`, error);
    }
  }

  // Try to find in local data
  const localPlace = touristPlaces.find(place => place.id === placeId);
  if (localPlace) return localPlace;

  return null;
}
