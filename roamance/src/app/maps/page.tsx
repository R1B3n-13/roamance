'use client';

import { BackButton, MapFeaturesInfo, SearchBar } from '@/components/maps';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight, Compass, Globe, MapPin, Navigation, Route, Clock } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MapContainer } from './map-container';
import { motion, AnimatePresence } from 'framer-motion';
import { RouteData } from '@/components/maps/MapController';

export const DEFAULT_META_DESCRIPTION =
  'Discover, plan and experience your next adventure with Roamance, the ultimate tourism companion.';
export const MAX_WIDTH = 1400;

export const defaultCenter = { lat: 40.7128, lng: -74.006 };

// Helper function to format time
const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

// Helper function to format distance
const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

export default function MapPage() {
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

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
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);

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
      setCenter(defaultCenter);
      setLocationName('New York City');
    }
  }, [searchParams]);

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCenterOnUser = () => {
    if (userLocation) {
      setCenterOnUser(true);

      setTimeout(() => {
        setCenterOnUser(false);
      }, 500);
    }
  };

  const handleRouteCalculated = (data: RouteData) => {
    setRouteData(data);
    setShowDirectionsPanel(true);
  };

  const getTravelTimeEstimate = (): string => {
    if (!routeData) return "Calculating...";

    const minutes = Math.round(routeData.duration / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} h${remainingMinutes > 0 ? ' ' + remainingMinutes + ' min' : ''}`;
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

      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          center={center}
          locationName={locationName}
          userLocation={userLocation}
          searchQuery={searchQuery}
          directions={directions}
          isDarkMode={isDarkMode}
          centerOnUser={centerOnUser}
          onRouteCalculated={handleRouteCalculated}
        />

        <AnimatePresence>
          {directions && showDirectionsPanel && (
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'absolute top-0 left-0 h-full w-64 md:w-80 lg:w-96 border-r overflow-y-auto z-[9999]',
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
                  <div>
                    <h2 className="font-semibold text-lg">Directions</h2>
                    {routeData && (
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Est. {getTravelTimeEstimate()}</span>
                        <span>•</span>
                        <span>{formatDistance(routeData.distance)}</span>
                      </div>
                    )}
                  </div>
                </div>

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

                  {/* Route steps visualization */}
                  {routeData && routeData.legs.length > 0 && (
                    <div className="pl-1 space-y-0">
                      {routeData.legs.flatMap((leg, legIndex) =>
                        leg.steps.map((step, stepIndex) => {
                          const isFirstStep = stepIndex === 0 && legIndex === 0;
                          const isLastStep = stepIndex === leg.steps.length - 1 && legIndex === routeData.legs.length - 1;
                          const globalStepIndex = routeData.legs.slice(0, legIndex).reduce(
                            (acc, currentLeg) => acc + currentLeg.steps.length, 0
                          ) + stepIndex;

                          if (isFirstStep || isLastStep || step.maneuver !== 'turn') return null;

                          return (
                            <div
                              key={`${legIndex}-${stepIndex}`}
                              className={cn(
                                "flex items-start gap-3 py-2 px-1.5 rounded-md cursor-pointer transition-colors",
                                activeStep === globalStepIndex
                                  ? isDarkMode
                                    ? "bg-primary/20"
                                    : "bg-primary/10"
                                  : "hover:bg-muted/30"
                              )}
                              onClick={() => setActiveStep(globalStepIndex)}
                            >
                              <div className="flex flex-col items-center">
                                <div className="w-0.5 h-3 bg-muted-foreground/30"></div>
                                <div className={cn(
                                  "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                                  isDarkMode ? "bg-muted/50 text-foreground" : "bg-muted/30 text-foreground"
                                )}>
                                  <Route className="h-3 w-3" />
                                </div>
                                <div className="w-0.5 h-3 bg-muted-foreground/30"></div>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-medium">{step.instruction}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistance(step.distance)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

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

                  {/* Turn-by-turn directions */}
                  {routeData && (
                    <div className={cn(
                      'rounded-lg p-3 mt-4',
                      isDarkMode ? 'bg-muted/30' : 'bg-muted/20'
                    )}>
                      <h3 className="text-sm font-medium mb-2">Turn-by-turn Directions</h3>
                      <div className="space-y-3 text-xs mt-3">
                        {routeData.legs.flatMap((leg, legIndex) =>
                          leg.steps.map((step, stepIndex) => {
                            const globalStepIndex = routeData.legs.slice(0, legIndex).reduce(
                              (acc, currentLeg) => acc + currentLeg.steps.length, 0
                            ) + stepIndex;

                            return (
                              <div
                                key={`full-${legIndex}-${stepIndex}`}
                                className={cn(
                                  "flex items-center gap-3 py-1.5 border-b border-muted/20 last:border-b-0",
                                  activeStep === globalStepIndex && "font-medium"
                                )}
                                onClick={() => setActiveStep(globalStepIndex)}
                              >
                                {step.maneuver === 'start' ? (
                                  <div className="bg-blue-500 text-white h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-3 w-3" />
                                  </div>
                                ) : step.maneuver === 'arrive' ? (
                                  <div className="bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-3 w-3" />
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground h-5 w-5 flex items-center justify-center flex-shrink-0">
                                    {stepIndex + 1}.
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p>{step.instruction}</p>
                                  {step.distance > 0 && (
                                    <p className="text-muted-foreground text-2xs">
                                      {formatDistance(step.distance)}
                                      {step.duration > 0 && ` (${formatTime(step.duration)})`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {!routeData && (
                    <div className="text-sm text-muted-foreground mt-5 italic">
                      Calculating route... Please wait.
                    </div>
                  )}

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
        </AnimatePresence>
      </div>

      <MapFeaturesInfo isDarkMode={isDarkMode} />
    </div>
  );
}
