import {
  fetchPopularDestinations,
  getFromCache,
  getLocation,
  searchLocations,
  setCache,
  touristPlaces,
} from '@/api/geosearch-api';
import { fetchImages } from '@/api/unsplash-api';
import { GeosearchResult, TouristPlace } from '@/types';

async function mapGeosearchResultToTouristPlace(
  result: GeosearchResult,
  index: number
): Promise<TouristPlace> {
  const colors = [
    'var(--primary)',
    'var(--ocean)',
    'var(--forest)',
    'var(--sunset)',
  ];

  // Use the first character of country name to determine color index
  const colorIndex = result.country
    ? result.country.charCodeAt(0) % colors.length
    : index % colors.length;

  let description = `${result.name}`;

  // Get city and country information from the result
  if (result.city && !description.includes(result.city)) {
    description = result.city;
  }

  if (result.country && !description.includes(result.country)) {
    description += ` in ${result.country}`;
  }

  // Set a default size for places without additional information
  const size = 1.0;

  // Fetch images for the place
  const images = await fetchImages(result.name);

  return {
    id: `api-${result.id || index}-${result.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: result.name,
    lat: result.lat,
    lng: result.lng,
    country: result.country || '',
    description,
    color: colors[colorIndex],
    size,
    image: images[0],
    images,
  };
}

export async function getInitialPlaces(): Promise<TouristPlace[]> {
  const cacheKey = 'initial_places';
  const cachedPlaces = getFromCache<TouristPlace[]>(cacheKey);
  if (cachedPlaces) {
    console.log(`Using ${cachedPlaces.length} cached places`);
    return cachedPlaces;
  }

  try {
    const popularDestinations = [
      'Paris',
      'Tokyo',
      'Rome',
      'Sydney',
      'Cairo',
      'Istanbul',
      'Dubai',
      'Venice',
      'Santorini',
      'Bali',
      'Kyoto',
    ];

    const searchResults = await fetchPopularDestinations(popularDestinations);
    const places = await Promise.all(
      searchResults.map((result, index) =>
        mapGeosearchResultToTouristPlace(result, index)
      )
    );

    console.log(`Total places from API: ${places.length}`);

    if (places.length > 0) {
      setCache(cacheKey, places);
      return places;
    }

    console.log(`Falling back to ${touristPlaces.length} local places`);
    return touristPlaces;
  } catch (error) {
    console.error('Error fetching initial places:', error);
    console.log(
      `Falling back to ${touristPlaces.length} local places due to error`
    );
    return touristPlaces;
  }
}

export async function searchPlaces(query: string): Promise<TouristPlace[]> {
  if (!query || query.length < 2) return [];

  const cacheKey = `search_${query.toLowerCase()}`;
  const cachedResults = getFromCache<TouristPlace[]>(cacheKey);
  if (cachedResults) {
    console.log(`Using ${cachedResults.length} cached results for "${query}"`);
    return cachedResults;
  }

  const localResults = touristPlaces.filter(
    (place) =>
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.country.toLowerCase().includes(query.toLowerCase())
  );

  try {
    const searchResults = await searchLocations(query);
    const apiResults = await Promise.all(
      searchResults
        .filter((item) => item.name && item.lat && item.lng)
        .map((item, index) => mapGeosearchResultToTouristPlace(item, index))
    );

    console.log(
      `Found ${apiResults.length} API results and ${localResults.length} local results for "${query}"`
    );

    const combinedResults = [...apiResults];

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

    setCache(cacheKey, combinedResults);
    return combinedResults;
  } catch (error) {
    console.error(`Error searching places for "${query}":`, error);
    return localResults;
  }
}

export async function getPlaceDetails(
  placeId: string
): Promise<TouristPlace | null> {
  const apiPlaceMatch = placeId.match(/^api-(.+)-(.+)$/);

  if (apiPlaceMatch) {
    const locationId = apiPlaceMatch[1];
    const placeName = apiPlaceMatch[2].replace(/-/g, ' ');

    try {
      const cacheKey = `place_${locationId}`;
      const cachedPlace = getFromCache<TouristPlace>(cacheKey);
      if (cachedPlace) return cachedPlace;

      const locationResult = await getLocation(placeName);
      if (locationResult) {
        const place = await mapGeosearchResultToTouristPlace(locationResult, 0);
        setCache(cacheKey, place);
        return place;
      }
    } catch (error) {
      console.error(`Error fetching place details for ID ${placeId}:`, error);
    }
  }

  const localPlace = touristPlaces.find((place) => place.id === placeId);
  if (localPlace) return localPlace;

  return null;
}
