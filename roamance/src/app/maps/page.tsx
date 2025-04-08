'use client';

import { BackButton, MapFeaturesInfo, SearchBar } from '@/components/maps';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight, MapPin, Navigation } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MapContainer } from './map-container';

export const DEFAULT_META_DESCRIPTION =
  'Discover, plan and experience your next adventure with Roamance, the ultimate tourism companion.';
export const MAX_WIDTH = 1400;

// Default map center coordinates (New York City)
export const defaultCenter = { lat: 40.7128, lng: -74.006 };

export default function MapPage() {
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  // Map state
  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [locationName, setLocationName] = useState('');
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [directions, setDirections] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);
  const [centerOnUser, setCenterOnUser] = useState(false);

  // Get query parameters
  useEffect(() => {
    const lat = searchParams?.get('lat');
    const lng = searchParams?.get('lng');
    const name = searchParams?.get('name') || 'Selected Location';
    const dir = searchParams?.get('dir') === 'true';

    if (lat && lng) {
      setCenter({
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      });
      setLocationName(name);
      setDirections(dir);
    } else {
      // Default location if no coordinates provided (New York)
      setCenter(defaultCenter);
      setLocationName('New York City');
    }
  }, [searchParams]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location', error);
        }
      );
    }
  }, []);

  // Listen for "get directions" events
  useEffect(() => {
    const handleGetDirections = () => {
      setDirections(true);
      setShowDirectionsPanel(true);
    };

    window.addEventListener('getDirections', handleGetDirections);

    return () => {
      window.removeEventListener('getDirections', handleGetDirections);
    };
  }, []);

  // Handle search query changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Center map on user's location
  const handleCenterOnUser = () => {
    if (userLocation) {
      setCenterOnUser(true);
      // Reset the flag after a short delay to allow re-centering in the future
      setTimeout(() => setCenterOnUser(false), 1000);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Map Header */}
      <div
        className={cn(
          'w-full py-3 px-4 flex items-center justify-between border-b',
          isDarkMode
            ? 'bg-background/90 backdrop-blur-md border-muted/20'
            : 'bg-white/90 backdrop-blur-md border-muted/30'
        )}
      >
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="font-semibold text-lg md:text-xl">
            {directions ? 'Directions' : 'Map'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {userLocation && (
            <Button
              size="sm"
              variant="outline"
              className={cn(
                'flex items-center gap-1 text-xs',
                isDarkMode ? 'bg-background/90' : 'bg-white/90'
              )}
              onClick={handleCenterOnUser}
            >
              <MapPin className="h-3 w-3" />
              Your Location
            </Button>
          )}

          {directions ? (
            <Button
              size="sm"
              variant="default"
              className="gap-1 text-xs"
              onClick={() => setShowDirectionsPanel(!showDirectionsPanel)}
            >
              <Navigation className="h-3 w-3" />
              {showDirectionsPanel ? 'Hide' : 'Show'} Directions
              <ChevronRight
                className={cn(
                  'h-3 w-3 transition-transform',
                  showDirectionsPanel ? 'rotate-90' : ''
                )}
              />
            </Button>
          ) : null}
        </div>
      </div>

      {/* Search Bar */}
      <div
        className={cn(
          'w-full py-2 px-4 border-b',
          isDarkMode
            ? 'bg-background/90 backdrop-blur-md border-muted/20'
            : 'bg-white/90 backdrop-blur-md border-muted/30'
        )}
      >
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          center={center}
          locationName={locationName}
          userLocation={userLocation}
          searchQuery={searchQuery}
          directions={directions}
          isDarkMode={isDarkMode}
          centerOnUser={centerOnUser}
        />

        {/* Direction panel could be added here when needed */}
        {directions && showDirectionsPanel && (
          <div
            className={cn(
              'absolute top-0 left-0 h-full w-64 md:w-80 border-r overflow-y-auto',
              isDarkMode
                ? 'bg-background/90 backdrop-blur-md border-muted/20'
                : 'bg-white/90 backdrop-blur-md border-muted/30'
            )}
          >
            <div className="p-4">
              <h2 className="font-semibold text-lg">Directions</h2>
              {/* Direction steps would go here */}
              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Route details and turn-by-turn directions would appear here.
                  This is a placeholder for the directions panel functionality.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowDirectionsPanel(false)}
                >
                  Hide Directions
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Info displays at the bottom of some mobile screens */}
      <MapFeaturesInfo isDarkMode={isDarkMode} />
    </div>
  );
}
