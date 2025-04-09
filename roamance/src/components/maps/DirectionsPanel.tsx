'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistance, formatTime } from '@/utils/format';
import { ChevronRight, Clock, Compass, MapPin, Route, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { RouteData } from '@/components/maps/MapController';
import { useState, useEffect } from 'react';
import { searchGeonames } from '@/api/places-api';
import { Geoname } from '@/types/places';
import { Input } from '@/components/ui/input';

interface DirectionsPanelProps {
  routeData: RouteData | null;
  locationName: string;
  isDarkMode: boolean;
  showDirectionsPanel: boolean;
  activeStep: number | null;
  setActiveStep: (step: number | null) => void;
  onClose: () => void;
  onChangeStartPoint?: (lat: number, lng: number, name: string) => void;
  onChangeDestination?: (lat: number, lng: number, name: string) => void;
}

export function DirectionsPanel({
  routeData,
  locationName,
  isDarkMode,
  showDirectionsPanel,
  activeStep,
  setActiveStep,
  onClose,
  onChangeStartPoint,
  onChangeDestination,
}: DirectionsPanelProps) {
  const [startPointSearch, setStartPointSearch] = useState<string>('');
  const [destinationSearch, setDestinationSearch] = useState<string>('');
  const [startPointResults, setStartPointResults] = useState<Geoname[]>([]);
  const [destinationResults, setDestinationResults] = useState<Geoname[]>([]);
  const [isSearchingStart, setIsSearchingStart] = useState<boolean>(false);
  const [isSearchingDestination, setIsSearchingDestination] = useState<boolean>(false);
  const [showStartResults, setShowStartResults] = useState<boolean>(false);
  const [showDestResults, setShowDestResults] = useState<boolean>(false);

  // Format the distance to be more user-friendly
  const getTravelTimeEstimate = (): string => {
    if (!routeData) return "Calculating...";

    // Convert seconds to minutes for display
    const minutes = Math.round(routeData.duration / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} h${remainingMinutes > 0 ? ' ' + remainingMinutes + ' min' : ''}`;
  };

  // Search for starting point locations
  useEffect(() => {
    if (startPointSearch.length < 3) {
      setStartPointResults([]);
      setShowStartResults(false);
      return;
    }

    const fetchStartPointResults = async () => {
      setIsSearchingStart(true);
      try {
        const results = await searchGeonames(startPointSearch, 5);
        setStartPointResults(results);
        setShowStartResults(true);
      } catch (error) {
        console.error('Error searching for starting points:', error);
      } finally {
        setIsSearchingStart(false);
      }
    };

    const timer = setTimeout(() => {
      fetchStartPointResults();
    }, 500);

    return () => clearTimeout(timer);
  }, [startPointSearch]);

  // Search for destination locations
  useEffect(() => {
    if (destinationSearch.length < 3) {
      setDestinationResults([]);
      setShowDestResults(false);
      return;
    }

    const fetchDestinationResults = async () => {
      setIsSearchingDestination(true);
      try {
        const results = await searchGeonames(destinationSearch, 5);
        setDestinationResults(results);
        setShowDestResults(true);
      } catch (error) {
        console.error('Error searching for destinations:', error);
      } finally {
        setIsSearchingDestination(false);
      }
    };

    const timer = setTimeout(() => {
      fetchDestinationResults();
    }, 500);

    return () => clearTimeout(timer);
  }, [destinationSearch]);

  // Handle selection of starting point
  const handleSelectStartPoint = (geoname: Geoname) => {
    if (onChangeStartPoint) {
      onChangeStartPoint(
        parseFloat(geoname.lat),
        parseFloat(geoname.lng),
        geoname.toponymName || geoname.name
      );
      setStartPointSearch(geoname.toponymName || geoname.name);
    }
    setShowStartResults(false);
    // Reset active step when changing route
    setActiveStep(null);
  };

  // Handle selection of destination
  const handleSelectDestination = (geoname: Geoname) => {
    if (onChangeDestination) {
      onChangeDestination(
        parseFloat(geoname.lat),
        parseFloat(geoname.lng),
        geoname.toponymName || geoname.name
      );
      setDestinationSearch(geoname.toponymName || geoname.name);
    }
    setShowDestResults(false);
    // Reset active step when changing route
    setActiveStep(null);
  };

  return (
    <>
      {showDirectionsPanel && (
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
              {/* Starting Point Search */}
              <div className="relative">
                <div className={cn(
                  'rounded-lg p-3',
                  isDarkMode ? 'bg-muted/30' : 'bg-muted/20'
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="text-sm font-medium">Starting Point</p>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      placeholder="Search starting point..."
                      value={startPointSearch}
                      onChange={(e) => setStartPointSearch(e.target.value)}
                      className={cn(
                        "text-xs h-8 bg-background/50",
                        isDarkMode ? "placeholder:text-muted-foreground/70" : "placeholder:text-muted-foreground/50"
                      )}
                    />
                    {isSearchingStart ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                    ) : startPointSearch ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setStartPointSearch('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Search className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Show current starting point if no search is active */}
                  {!showStartResults && !startPointSearch && (
                    <p className="text-xs text-muted-foreground pl-5 mt-2">Your current location</p>
                  )}
                </div>

                {/* Starting point search results */}
                {showStartResults && startPointResults.length > 0 && (
                  <div className={cn(
                    "absolute left-0 right-0 mt-1 rounded-md shadow-lg z-50 max-h-[200px] overflow-y-auto",
                    isDarkMode ? "bg-background border border-muted/30" : "bg-white border border-muted/20"
                  )}>
                    {startPointResults.map((result) => (
                      <div
                        key={`start-${result.geonameId || result.name}`}
                        className={cn(
                          "px-3 py-2 text-xs cursor-pointer flex items-start gap-2",
                          isDarkMode ? "hover:bg-muted/30" : "hover:bg-muted/20"
                        )}
                        onClick={() => handleSelectStartPoint(result)}
                      >
                        <MapPin className="h-3 w-3 mt-0.5 text-blue-500" />
                        <div>
                          <p className="font-medium">{result.toponymName || result.name}</p>
                          <p className="text-2xs text-muted-foreground">
                            {[
                              result.adminName1,
                              result.countryName
                            ].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 px-2.5">
                <div className="w-0.5 h-8 bg-muted-foreground/30"></div>
              </div>

              {/* Destination Search */}
              <div className="relative">
                <div className={cn(
                  'rounded-lg p-3',
                  isDarkMode ? 'bg-muted/30' : 'bg-muted/20'
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <p className="text-sm font-medium">Destination</p>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      placeholder="Search destination..."
                      value={destinationSearch}
                      onChange={(e) => setDestinationSearch(e.target.value)}
                      className={cn(
                        "text-xs h-8 bg-background/50",
                        isDarkMode ? "placeholder:text-muted-foreground/70" : "placeholder:text-muted-foreground/50"
                      )}
                    />
                    {isSearchingDestination ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                    ) : destinationSearch ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setDestinationSearch('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Search className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Show current destination if no search is active */}
                  {!showDestResults && !destinationSearch && (
                    <p className="text-xs text-muted-foreground pl-5 mt-2">{locationName}</p>
                  )}
                </div>

                {/* Destination search results */}
                {showDestResults && destinationResults.length > 0 && (
                  <div className={cn(
                    "absolute left-0 right-0 mt-1 rounded-md shadow-lg z-50 max-h-[200px] overflow-y-auto",
                    isDarkMode ? "bg-background border border-muted/30" : "bg-white border border-muted/20"
                  )}>
                    {destinationResults.map((result) => (
                      <div
                        key={`dest-${result.geonameId || result.name}`}
                        className={cn(
                          "px-3 py-2 text-xs cursor-pointer flex items-start gap-2",
                          isDarkMode ? "hover:bg-muted/30" : "hover:bg-muted/20"
                        )}
                        onClick={() => handleSelectDestination(result)}
                      >
                        <MapPin className="h-3 w-3 mt-0.5 text-primary" />
                        <div>
                          <p className="font-medium">{result.toponymName || result.name}</p>
                          <p className="text-2xs text-muted-foreground">
                            {[
                              result.adminName1,
                              result.countryName
                            ].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                onClick={onClose}
              >
                <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
                Hide Directions
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
