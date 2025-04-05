'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { searchPlaces } from '@/services/places-api';
import { TouristPlace } from '@/types';
import {
  ChevronsUpDown,
  Globe,
  Loader2,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

interface PlaceSearchCommandProps {
  readonly onPlaceSelect: (place: TouristPlace) => void;
  readonly className?: string;
}

export function PlaceSearchCommand({
  onPlaceSelect,
  className,
}: PlaceSearchCommandProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  const [open, setOpen] = React.useState(false);
  const [mainValue, setMainValue] = React.useState('');
  const [refinedValue, setRefinedValue] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [places, setPlaces] = React.useState<TouristPlace[]>([]);
  const [searchMode, setSearchMode] = React.useState<'location' | 'region'>(
    'location'
  );

  // Refs
  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const refinedInputRef = React.useRef<HTMLInputElement>(null);

  // Transfer main value to refined value when opening dropdown
  React.useEffect(() => {
    if (open && mainValue && !refinedValue) {
      setRefinedValue(mainValue);
    }
  }, [open, mainValue, refinedValue]);

  // Perform search when refined value changes
  React.useEffect(() => {
    if (refinedValue.length < 2) {
      setPlaces([]);
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(refinedValue);
        setPlaces(results);
      } catch (error) {
        console.error('Error searching places:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [refinedValue]);

  // Handle place selection
  const handleSelectPlace = (placeId: string) => {
    const selectedPlace = places.find((place) => place.id === placeId);
    if (selectedPlace) {
      onPlaceSelect(selectedPlace);
      setMainValue(selectedPlace.name);
      setOpen(false);
      setRefinedValue('');
    }
  };

  // Clear input and reset
  const handleClearMain = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMainValue('');
  };

  const handleClearRefined = () => {
    setRefinedValue('');
    if (refinedInputRef.current) {
      refinedInputRef.current.focus();
    }
  };

  // Toggle search mode
  const toggleSearchMode = () => {
    setSearchMode(searchMode === 'location' ? 'region' : 'location');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn('w-full relative', className)}>
          <Search
            className={cn(
              'absolute left-3 top-3.5 h-5 w-5 z-10',
              isDarkMode ? 'text-white/60' : 'text-gray-400'
            )}
          />
          <Button
            variant="outline"
            aria-expanded={open}
            className={cn(
              'w-full h-12 pl-10 pr-10 justify-start text-left font-normal',
              mainValue ? '' : 'text-muted-foreground',
              isDarkMode
                ? 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                : 'bg-white/50 text-gray-900 hover:bg-white/60',
              'transition-colors'
            )}
            onClick={() => setOpen(true)}
          >
            {mainValue || 'Where would you like to go?'}
          </Button>
          {mainValue && (
            <button
              onClick={handleClearMain}
              className={cn(
                'absolute right-10 top-3.5 z-10',
                isDarkMode ? 'text-white/60' : 'text-gray-400',
                'hover:text-primary transition-colors'
              )}
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <ChevronsUpDown
            className={cn(
              'absolute right-3 top-4 h-4 w-4',
              isDarkMode ? 'text-white/40' : 'text-gray-400/70'
            )}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'p-0 w-[calc(100vw-2rem)] sm:w-[450px] z-50 shadow-lg',
          isDarkMode
            ? 'bg-slate-900/90 backdrop-blur-sm border-white/10'
            : 'bg-white/95 backdrop-blur-sm border-gray-200'
        )}
        align="start"
        side="bottom"
        sideOffset={8}
      >
        <Command shouldFilter={false}>
          <div className="flex items-center gap-2 p-2 border-b border-border">
            <div className="relative flex-1">
              <Search
                className={cn(
                  'absolute left-3 top-2.5 h-4 w-4 transition-colors',
                  isDarkMode ? 'text-white/50' : 'text-gray-400',
                  refinedValue && 'text-primary'
                )}
              />
              <CommandInput
                ref={refinedInputRef}
                placeholder={
                  searchMode === 'location'
                    ? 'Search specific destinations...'
                    : 'Search regions or countries...'
                }
                value={refinedValue}
                onValueChange={setRefinedValue}
                className={cn(
                  'h-9 pl-9 pr-9 rounded-md font-normal border',
                  isDarkMode
                    ? 'bg-slate-800/50 text-white border-white/10 focus:border-white/20'
                    : 'bg-white text-gray-900 border-gray-200',
                  'transition-all focus-visible:ring-primary/30'
                )}
              />
              {refinedValue && (
                <button
                  onClick={handleClearRefined}
                  className={cn(
                    'absolute right-3 top-2.5',
                    isDarkMode ? 'text-white/50' : 'text-gray-400',
                    'hover:text-primary transition-colors'
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={toggleSearchMode}
              className={cn(
                'h-9 w-9 flex items-center justify-center rounded-md transition-colors',
                isDarkMode
                  ? 'hover:bg-white/10 text-white/70 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              )}
              title={
                searchMode === 'location'
                  ? 'Search by region'
                  : 'Search by location'
              }
            >
              {searchMode === 'location' ? (
                <Globe className="h-5 w-5" />
              ) : (
                <MapPin className="h-5 w-5" />
              )}
            </button>
          </div>

          <CommandList className="max-h-[350px] overflow-auto">
            {isSearching && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            {!isSearching && refinedValue.length > 1 && places.length === 0 && (
              <CommandEmpty className="py-6 text-center">
                No destinations found
                <p className="text-xs text-muted-foreground mt-2">
                  Try searching for a different{' '}
                  {searchMode === 'location' ? 'place' : 'region'} or toggle
                  search mode
                </p>
              </CommandEmpty>
            )}

            {!isSearching && places.length > 0 && (
              <CommandGroup
                heading={searchMode === 'location' ? 'Destinations' : 'Regions'}
                className="py-2"
              >
                {places.map((place) => (
                  <CommandItem
                    key={place.id}
                    value={place.id}
                    onSelect={handleSelectPlace}
                    className={cn(
                      'p-3 cursor-pointer rounded-md m-1',
                      isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-md bg-cover bg-center flex-shrink-0 border"
                        style={{
                          backgroundImage: `url(${place.image})`,
                          borderColor: place.color,
                        }}
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{place.name}</span>
                          <div
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              isDarkMode ? 'bg-white/50' : 'bg-gray-300'
                            )}
                          ></div>
                          <span className="text-sm text-muted-foreground">
                            {place.country}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {place.description ||
                            `Popular destination in ${place.country}`}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!isSearching && refinedValue.length < 2 && (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Globe
                  className={cn(
                    'h-10 w-10 mb-3',
                    isDarkMode ? 'text-white/30' : 'text-gray-300'
                  )}
                />
                <p className="text-center text-sm text-muted-foreground">
                  Start typing to discover amazing destinations around the globe
                </p>
                <div
                  className={cn(
                    'mt-4 grid grid-cols-2 gap-2 w-full max-w-sm',
                    isDarkMode ? 'text-white/70' : 'text-gray-500'
                  )}
                >
                  <button
                    type="button"
                    className={cn(
                      'text-center py-2 px-3 rounded-md text-sm cursor-pointer',
                      isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    )}
                    onClick={() => setRefinedValue('Paris')}
                  >
                    Paris
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'text-center py-2 px-3 rounded-md text-sm cursor-pointer',
                      isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    )}
                    onClick={() => setRefinedValue('Tokyo')}
                  >
                    Tokyo
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'text-center py-2 px-3 rounded-md text-sm cursor-pointer',
                      isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    )}
                    onClick={() => setRefinedValue('New York')}
                  >
                    New York
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'text-center py-2 px-3 rounded-md text-sm cursor-pointer',
                      isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                    )}
                    onClick={() => setRefinedValue('Bali')}
                  >
                    Bali
                  </button>
                </div>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
