import axios from 'axios';
import { touristPlaces } from '@/data/tourist-places';
import { TouristPlace } from '@/types';

const GEONAMES_USERNAME = 'demo';

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

export async function searchPlaces(query: string): Promise<TouristPlace[]> {
  if (!query || query.length < 2) return [];

  const localResults = touristPlaces.filter(
    (place) =>
      place.name.toLowerCase().includes(query.toLowerCase()) ||
      place.country.toLowerCase().includes(query.toLowerCase())
  );

  try {
    const response = await axios.get<GeoNamesResult>(
      'http://api.geonames.org/searchJSON',
      {
        params: {
          q: query,
          maxRows: 10,
          username: GEONAMES_USERNAME,
          featureClass: 'A',
          featureCode: 'PCLI,PPLC,PPL,PPLA,PPLA2,PPLA3,PPLA4',
          isNameRequired: true,
        },
      }
    );

    const geonames = response.data?.geonames || [];

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

    return allResults;
  } catch (error) {
    console.error('Error fetching places:', error);
    return localResults;
  }
}
