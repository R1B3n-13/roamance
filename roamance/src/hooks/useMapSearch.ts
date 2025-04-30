import { useState, useEffect } from 'react';
import { searchLocations } from '@/api/geosearch-api';

export interface SearchResult {
  name: string;
  lat: number;
  lng: number;
  country?: string;
  city?: string;
}

export function useMapSearch(searchQuery: string) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Handle search functionality
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);

        // Map GeosearchResult objects to the format expected by SearchResults
        const formattedResults = results
          .filter((result) => result.lat && result.lng && result.name)
          .map((result) => ({
            name: result.name,
            lat: result.lat,
            lng: result.lng,
            country: result.country || '',
            city: result.city || '',
          }))
          .slice(0, 10);

        setSearchResults(formattedResults);
      } catch (error) {
        console.error('Error searching locations:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSearchResults();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return { searchResults, isSearching, setSearchResults };
}
