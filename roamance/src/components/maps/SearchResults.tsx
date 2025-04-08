'use client';

import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';

interface SearchResultsProps {
  results: {
    name: string;
    lat: number;
    lng: number;
    country?: string;
    adminName?: string;
    population?: number;
  }[];
  onSelect: (lat: number, lng: number) => void;
  isDarkMode: boolean;
  isSearching: boolean;
}

export function SearchResults({
  results,
  onSelect,
  isDarkMode,
  isSearching,
}: SearchResultsProps) {
  return isSearching || results.length > 0 ? (
    <div
      className={cn(
        'absolute top-20 left-4 z-[1000] max-w-md w-full md:w-80 rounded-xl shadow-md border',
        'max-h-[320px] overflow-y-auto scrollbar-thin',
        isDarkMode
          ? 'bg-background/60 border-muted/30 backdrop-blur-md scrollbar-thumb-gray-700'
          : 'bg-white/80 border-muted/20 backdrop-blur-sm scrollbar-thumb-gray-300'
      )}
    >
      {isSearching && (
        <div className="p-4 flex flex-col items-center justify-center">
          <div
            className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Searching locations...
          </p>
        </div>
      )}

      {results.map((item, index) => (
        <div
          key={index}
          className={cn(
            'px-4 py-3 border-b last:border-0 cursor-pointer transition-colors',
            isDarkMode
              ? 'border-muted/10 hover:bg-muted/10'
              : 'border-muted/10 hover:bg-muted/10'
          )}
          onClick={() => onSelect(item.lat, item.lng)}
        >
          <h4
            className={cn(
              'font-medium text-sm',
              isDarkMode ? 'text-foreground' : ''
            )}
          >
            {item.name}
          </h4>
          {(item.country || item.adminName) && (
            <p
              className={cn(
                'text-xs',
                isDarkMode
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/70'
              )}
            >
              {[item.adminName, item.country].filter(Boolean).join(', ')}
              {item.population && item.population > 0 && (
                <span className="ml-1">
                  {item.population >= 1000000
                    ? `(Pop: ${(item.population / 1000000).toFixed(1)}M)`
                    : item.population >= 1000
                      ? `(Pop: ${(item.population / 1000).toFixed(0)}K)`
                      : `(Pop: ${item.population})`}
                </span>
              )}
            </p>
          )}
          <p
            className={cn(
              'text-xs mt-1 flex items-center',
              isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground/70'
            )}
          >
            <MapPin
              className={cn('h-3 w-3 mr-1', isDarkMode ? 'text-primary' : '')}
            />
            {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
          </p>
        </div>
      ))}
    </div>
  ) : null;
}
