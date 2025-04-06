import axios from 'axios';
import { touristPlaces } from '@/data/tourist-places';
import { TouristPlace } from '@/types';

const GEONAMES_USERNAME = 'yashrif';

interface GeoNamesResult {
  geonames: Array<{
    name: string;
    countryName: string;
    lat: string;
    lng: string;
    fcl: string;
    fcode: string;
    population?: number;
    wikipedia?: string;
  }>;
}

/**
 * Fetches initial tourist places for display on the globe
 * Tries to fetch from the API first, falls back to local data if API fails
 */
export async function getInitialPlaces(): Promise<TouristPlace[]> {
  try {
    // Get some popular destinations to showcase
    const popularDestinations = ['Paris', 'New York', 'Tokyo', 'Rome', 'Sydney', 'Cairo', 'Rio de Janeiro'];
    console.log(`Attempting to fetch ${popularDestinations.length} popular destinations from Geonames API`);

    const promises = popularDestinations.map(destination =>
      axios.get<GeoNamesResult>('http://api.geonames.org/search', {
        params: {
          q: destination,
          maxRows: 1,
          username: GEONAMES_USERNAME,
          type: 'json',
          featureClass: 'P',
        },
      })
    );

    const results = await Promise.allSettled(promises);
    const places: TouristPlace[] = [];

    let successCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.data?.geonames?.length > 0) {
        successCount++;
        const item = result.value.data.geonames[0];
        if (item.name && item.lat && item.lng) {
          const colors = ['var(--primary)', 'var(--ocean)', 'var(--forest)', 'var(--sunset)'];
          places.push({
            id: `api-${index}-${item.name}`,
            name: item.name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng),
            country: item.countryName || '',
            description: `${item.name} in ${item.countryName || 'Unknown'}${item.fcode === 'PPLC' ? ' (Capital)' : ''}`,
            color: colors[index % colors.length],
            size: 1.0,
            image: `https://source.unsplash.com/featured/?${item.name},landmark`,
          });
        }
      }
    });

    console.log(`Successfully fetched ${successCount} out of ${popularDestinations.length} places from Geonames API`);
    console.log(`Total places from API: ${places.length}`);

    // If we got at least some results, return them
    if (places.length > 0) {
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

export async function searchPlaces(query: string): Promise<TouristPlace[]> {
  if (!query || query.length < 2) return [];

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
          featureClass: 'P',
        },
      }
    );

    const geonames = response.data?.geonames || [];
    console.log(`Found ${geonames.length} results from Geonames API for query "${query}"`);

    const apiResults = geonames
      .filter((item) => item.name && item.lat && item.lng)
      .map((item, index) => ({
        id: `api-${index}-${item.name}`,
        name: item.name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lng),
        country: item.countryName || '',
        description: `${item.name} in ${item.countryName || 'Unknown'}${item.fcode === 'PPLC' ? ' (Capital)' : ''}`,
        color: 'var(--primary)',
        size: 1.0,
        image:
          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=400&auto=format',
      }));

    const allResults = [...localResults];
    for (const apiResult of apiResults) {
      if (!allResults.some((place) => place.name === apiResult.name)) {
        allResults.push(apiResult);
      }
    }

    console.log(`Total combined results: ${allResults.length} (${localResults.length} local + ${apiResults.length} API)`);
    return allResults;
  } catch (error) {
    console.error('Error fetching places:', error);
    console.log(`Falling back to ${localResults.length} local results for query "${query}"`);
    return localResults;
  }
}
