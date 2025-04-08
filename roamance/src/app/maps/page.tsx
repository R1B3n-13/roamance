'use client';

import { BackButton, MapFeaturesInfo, SearchBar } from '@/components/maps';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight, Compass, Globe, MapPin, Navigation } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MapContainer } from './map-container';
import { motion } from 'framer-motion';

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
      <div
        className={cn(
          'absolute inset-0 -z-10',
          isDarkMode
            ? 'bg-gradient-to-br from-background to-background/90'
            : 'bg-gradient-to-br from-sky-50/80 via-blue-50/50 to-white'
        )}
      />

      {/* Map Header */}
      <div
        className={cn(
          'w-full py-4 px-5 flex items-center justify-between relative z-10',
          isDarkMode
            ? 'bg-background/60 backdrop-blur-xl border-b border-muted/20'
            : 'bg-white/70 backdrop-blur-xl border-b border-muted/20'
        )}
      >
        <div className="flex items-center gap-3">
          <BackButton />
          <div className="flex flex-col">
            <h1 className="font-semibold text-lg md:text-xl flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary hidden sm:inline-block" />
              <span>{directions ? 'Directions' : 'Interactive Map'}</span>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Explore destinations and find your way around the world
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userLocation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  'flex items-center gap-1.5 h-9 px-3 rounded-full border-primary/20 shadow-sm',
                  isDarkMode
                    ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                    : 'bg-primary/5 hover:bg-primary/10 text-primary'
                )}
                onClick={handleCenterOnUser}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="font-medium">Your Location</span>
              </Button>
            </motion.div>
          )}

          {directions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Button
                size="sm"
                variant={showDirectionsPanel ? "secondary" : "default"}
                className={cn(
                  'flex items-center gap-1.5 h-9 px-3 rounded-full shadow-sm',
                  showDirectionsPanel
                    ? isDarkMode
                      ? 'bg-muted/80 text-foreground'
                      : 'bg-muted/50 text-foreground'
                    : 'bg-primary text-primary-foreground'
                )}
                onClick={() => setShowDirectionsPanel(!showDirectionsPanel)}
              >
                <Navigation className="h-3.5 w-3.5" />
                <span className="font-medium">{showDirectionsPanel ? 'Hide' : 'Show'} Directions</span>
                <ChevronRight
                  className={cn(
                    'h-3 w-3 transition-transform',
                    showDirectionsPanel ? 'rotate-90' : ''
                  )}
                />
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div
        className={cn(
          'w-full py-3 px-5 relative z-10',
          isDarkMode
            ? 'bg-background/50 backdrop-blur-lg'
            : 'bg-white/60 backdrop-blur-lg'
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

        {/* Direction panel with enhanced styling */}
        {directions && showDirectionsPanel && (
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'absolute top-0 left-0 h-full w-64 md:w-80 lg:w-96 border-r overflow-y-auto',
              isDarkMode
                ? 'bg-background/80 backdrop-blur-xl border-muted/30'
                : 'bg-white/90 backdrop-blur-xl border-muted/20'
            )}
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'p-2 rounded-full',
                  isDarkMode ? 'bg-primary/20' : 'bg-primary/10'
                )}>
                  <Compass className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-semibold text-lg">Directions</h2>
              </div>

              {/* Directions panel content with stylish placeholder */}
              <div className="mt-6 space-y-5">
                <div className={cn(
                  'rounded-lg p-3',
                  isDarkMode ? 'bg-muted/30' : 'bg-muted/20'
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="text-sm font-medium">Starting Point</p>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5">Your current location</p>
                </div>

                <div className="flex items-center gap-2 px-2.5">
                  <div className="w-0.5 h-8 bg-muted-foreground/30"></div>
                </div>

                <div className={cn(
                  'rounded-lg p-3',
                  isDarkMode ? 'bg-muted/30' : 'bg-muted/20'
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <p className="text-sm font-medium">Destination</p>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5">{locationName}</p>
                </div>

                <p className="text-sm text-muted-foreground mt-5 italic">
                  Route details and turn-by-turn directions will appear here.
                  This is a placeholder for the directions panel functionality.
                </p>

                <Button
                  variant="outline"
                  className={cn(
                    "w-full mt-3 border-primary/20",
                    isDarkMode ? "hover:bg-primary/10" : "hover:bg-primary/5"
                  )}
                  onClick={() => setShowDirectionsPanel(false)}
                >
                  <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
                  Hide Directions
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Map Info displays at the bottom of some mobile screens */}
      <MapFeaturesInfo isDarkMode={isDarkMode} />
    </div>
  );
}
