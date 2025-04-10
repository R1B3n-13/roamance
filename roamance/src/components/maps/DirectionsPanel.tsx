'use client';

import { searchGeonames } from '@/api/places-api';
import { RouteData } from '@/components/maps/MapController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Geoname } from '@/types/places';
import { formatDistance } from '@/utils/format';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Car,
  ChevronRight,
  Clock,
  Compass,
  CornerRightDown,
  CornerUpLeft,
  CornerUpRight,
  Flag,
  Info,
  LocateFixed,
  Map,
  MapPin,
  MoveRight,
  MoveUp,
  Navigation,
  PanelLeftClose,
  RotateCw,
  Route,
  Search,
  Split,
  Timer,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

// Helper function to get turn type icon
function getTurnTypeIcon(
  turnType: string | undefined,
  modifier: string | undefined
) {
  // If we have a modifier, it takes precedence for certain turn types
  if (modifier) {
    switch (modifier) {
      case 'Right':
        return <ArrowRight className="h-3 w-3" />;
      case 'Left':
        return <ArrowLeft className="h-3 w-3" />;
      case 'SlightRight':
        return <CornerUpRight className="h-3 w-3" />;
      case 'SlightLeft':
        return <CornerUpLeft className="h-3 w-3" />;
      case 'Straight':
        return <ArrowUp className="h-3 w-3" />;
      case 'Uturn':
        return <RotateCw className="h-3 w-3" />;
    }
  }

  // Handle based on turn type if no specific modifier or modifier didn't match
  switch (turnType) {
    case 'Head':
      return <MoveRight className="h-3 w-3" />;
    case 'Left':
      return <ArrowLeft className="h-3 w-3" />;
    case 'Right':
      return <ArrowRight className="h-3 w-3" />;
    case 'Continue':
      return <MoveUp className="h-3 w-3" />;
    case 'Uturn':
      return <RotateCw className="h-3 w-3" />;
    case 'Fork':
      return <Split className="h-3 w-3" />;
    case 'Straight':
      return <ArrowUp className="h-3 w-3" />;
    case 'Roundabout':
      return <RotateCw className="h-3 w-3 scale-75" />;
    case 'SlightLeft':
      return <CornerUpLeft className="h-3 w-3" />;
    case 'SlightRight':
      return <CornerUpRight className="h-3 w-3" />;
    case 'Merge':
      return <ArrowUpRight className="h-3 w-3" />;
    case 'EndOfRoad':
      return <CornerRightDown className="h-3 w-3" />;
    case 'DestinationReached':
      return <Flag className="h-3 w-3" />;
    default:
      return <Navigation className="h-3 w-3" />;
  }
}

// Helper function to get human-readable turn instruction
function getTurnDescription(instruction: any): string {
  // If the instruction already has a text field, use that
  if (instruction.text) {
    return instruction.text;
  }

  // Otherwise construct a description based on type and modifier
  let description = '';

  switch (instruction.type) {
    case 'Head':
      description = `Head ${instruction.direction || ''} ${instruction.road ? 'on ' + instruction.road : ''}`;
      break;
    case 'Continue':
      description = `Continue ${instruction.modifier ? instruction.modifier.toLowerCase() : ''} ${instruction.road ? 'on ' + instruction.road : ''}`;
      break;
    case 'Uturn':
      description = `Make a U-turn ${instruction.road ? 'on ' + instruction.road : ''}`;
      break;
    case 'Fork':
      description = `Keep ${instruction.modifier ? instruction.modifier.toLowerCase() : ''} at the fork ${instruction.road ? 'onto ' + instruction.road : ''}`;
      break;
    case 'Merge':
      description = `Merge ${instruction.modifier ? instruction.modifier.toLowerCase() : ''} ${instruction.road ? 'onto ' + instruction.road : ''}`;
      break;
    case 'Roundabout':
      description = `At the roundabout, take the ${instruction.exit}${getOrdinalSuffix(instruction.exit)} exit ${instruction.road ? 'onto ' + instruction.road : ''}`;
      break;
    case 'EndOfRoad':
      description = `At the end of the road, turn ${instruction.modifier ? instruction.modifier.toLowerCase() : ''} ${instruction.road ? 'onto ' + instruction.road : ''}`;
      break;
    case 'DestinationReached':
      description = 'You have reached your destination';
      break;
    default:
      // For Left, Right, SlightLeft, SlightRight, Straight
      if (
        instruction.type.includes('Left') ||
        instruction.type.includes('Right') ||
        instruction.type === 'Straight'
      ) {
        description = `Turn ${instruction.type.toLowerCase()} ${instruction.road ? 'onto ' + instruction.road : ''}`;
      } else {
        description = instruction.type;
      }
  }

  return description.trim();
}

// Helper function to get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }

  return 'th';
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
  const [isSearchingDestination, setIsSearchingDestination] =
    useState<boolean>(false);
  const [showStartResults, setShowStartResults] = useState<boolean>(false);
  const [showDestResults, setShowDestResults] = useState<boolean>(false);

  // Format the distance to be more user-friendly
  const getTravelTimeEstimate = (): string => {
    if (!routeData || !routeData.summary) return 'Calculating...';

    // Convert seconds to minutes for display
    const minutes = Math.round(routeData.summary.totalTime / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} h${remainingMinutes > 0 ? ' ' + remainingMinutes + ' min' : ''}`;
  };

  // Format time for individual step
  const formatStepTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} sec`;
    const minutes = Math.round(seconds / 60);
    return `${minutes} min`;
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
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            'absolute top-0 left-0 h-full w-72 md:w-80 lg:w-96 border-r overflow-y-auto z-[9999]',
            isDarkMode
              ? 'bg-background/90 backdrop-blur-xl border-muted/30'
              : 'bg-white/95 backdrop-blur-xl border-muted/20'
          )}
        >
          <div className="p-5 space-y-5">
            {/* Header Section with Glass Effect */}
            <div
              className={cn(
                'rounded-xl p-4 bg-gradient-to-br shadow-sm',
                isDarkMode
                  ? 'from-primary/20 to-ocean-dark/10 border border-primary/10'
                  : 'from-ocean-light/20 to-primary/5 border border-ocean-light/20'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-full',
                      isDarkMode
                        ? 'bg-primary/30 shadow-inner'
                        : 'bg-primary/20 shadow-sm'
                    )}
                  >
                    <Navigation className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Your Journey</h2>
                    {routeData && (
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <div
                          className={cn(
                            'rounded-full p-1',
                            isDarkMode ? 'bg-primary/20' : 'bg-primary/10'
                          )}
                        >
                          <Clock className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground">
                          {getTravelTimeEstimate()}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          {formatDistance(routeData.summary.totalDistance)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full hover:bg-muted/20"
                >
                  <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Route Planning Section */}
            <div
              className={cn(
                'rounded-xl p-4 border mb-3',
                isDarkMode
                  ? 'border-muted/40 bg-gradient-to-br from-background/80 to-muted/5'
                  : 'border-muted/30 bg-gradient-to-br from-background/90 to-muted/10'
              )}
            >
              <h3 className="text-sm font-medium flex items-center gap-2 mb-4 text-muted-foreground">
                <Compass className="h-4 w-4" />
                Route Planning
              </h3>

              <div className="space-y-4">
                {/* Starting Point Search */}
                <div className="relative">
                  <div
                    className={cn(
                      'rounded-xl p-4 border transition-colors',
                      isDarkMode
                        ? 'bg-card/50 border-muted/20 hover:border-blue-500/30'
                        : 'bg-card/80 border-muted/30 hover:border-blue-500/30'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-500 shadow-sm shadow-blue-500/20 h-6 w-6 rounded-full flex items-center justify-center">
                        <LocateFixed className="h-3 w-3 text-white" />
                      </div>
                      <p className="text-sm font-medium">Starting Point</p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        placeholder="Search starting point..."
                        value={startPointSearch}
                        onChange={(e) => setStartPointSearch(e.target.value)}
                        className={cn(
                          'text-xs h-9 bg-background/80 rounded-lg border-muted/30 focus-visible:ring-blue-500/50',
                          isDarkMode
                            ? 'placeholder:text-muted-foreground/70'
                            : 'placeholder:text-muted-foreground/50'
                        )}
                      />
                      {isSearchingStart ? (
                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-blue-500 border-r-transparent"></div>
                      ) : startPointSearch ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-muted/20"
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2 mt-3">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        <p>Your current location</p>
                      </div>
                    )}
                  </div>

                  {/* Starting point search results */}
                  {showStartResults && startPointResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'absolute left-0 right-0 mt-1 rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto',
                        isDarkMode
                          ? 'bg-card border border-muted/30'
                          : 'bg-white border border-muted/20'
                      )}
                    >
                      {startPointResults.map((result) => (
                        <div
                          key={`start-${result.geonameId || result.name}`}
                          className={cn(
                            'px-3 py-2 text-xs cursor-pointer flex items-start gap-2 transition-colors',
                            isDarkMode
                              ? 'hover:bg-muted/30'
                              : 'hover:bg-muted/20'
                          )}
                          onClick={() => handleSelectStartPoint(result)}
                        >
                          <MapPin className="h-3 w-3 mt-0.5 text-blue-500" />
                          <div>
                            <p className="font-medium">
                              {result.toponymName || result.name}
                            </p>
                            <p className="text-2xs text-muted-foreground">
                              {[result.adminName1, result.countryName]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Connector between points */}
                <div className="flex items-center justify-center py-1">
                  <div className={cn('flex flex-col items-center gap-1')}>
                    <div
                      className={cn(
                        'h-5 w-0.5 rounded-full',
                        isDarkMode ? 'bg-muted/70' : 'bg-muted/60'
                      )}
                    ></div>
                    <div
                      className={cn(
                        'h-5 w-5 rounded-full flex items-center justify-center',
                        isDarkMode
                          ? 'bg-primary/20 border border-primary/40'
                          : 'bg-muted/40 border border-muted/50'
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          'h-3 w-3',
                          isDarkMode
                            ? 'text-primary/90'
                            : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div
                      className={cn(
                        'h-5 w-0.5 rounded-full',
                        isDarkMode ? 'bg-muted/70' : 'bg-muted/60'
                      )}
                    ></div>
                  </div>
                </div>

                {/* Destination Search */}
                <div className="relative">
                  <div
                    className={cn(
                      'rounded-xl p-4 border transition-colors',
                      isDarkMode
                        ? 'bg-card/50 border-muted/20 hover:border-primary/30'
                        : 'bg-card/80 border-muted/30 hover:border-primary/30'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-primary shadow-sm shadow-primary/20 h-6 w-6 rounded-full flex items-center justify-center">
                        <Flag className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <p className="text-sm font-medium">Destination</p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        placeholder="Search destination..."
                        value={destinationSearch}
                        onChange={(e) => setDestinationSearch(e.target.value)}
                        className={cn(
                          'text-xs h-9 bg-background/80 rounded-lg border-muted/30 focus-visible:ring-primary/50',
                          isDarkMode
                            ? 'placeholder:text-muted-foreground/70'
                            : 'placeholder:text-muted-foreground/50'
                        )}
                      />
                      {isSearchingDestination ? (
                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                      ) : destinationSearch ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-muted/20"
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2 mt-3">
                        <MapPin className="h-3 w-3 text-primary" />
                        <p>{locationName}</p>
                      </div>
                    )}
                  </div>

                  {/* Destination search results */}
                  {showDestResults && destinationResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'absolute left-0 right-0 mt-1 rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto',
                        isDarkMode
                          ? 'bg-card border border-muted/30'
                          : 'bg-white border border-muted/20'
                      )}
                    >
                      {destinationResults.map((result) => (
                        <div
                          key={`dest-${result.geonameId || result.name}`}
                          className={cn(
                            'px-3 py-2 text-xs cursor-pointer flex items-start gap-2 transition-colors',
                            isDarkMode
                              ? 'hover:bg-muted/30'
                              : 'hover:bg-muted/20'
                          )}
                          onClick={() => handleSelectDestination(result)}
                        >
                          <MapPin className="h-3 w-3 mt-0.5 text-primary" />
                          <div>
                            <p className="font-medium">
                              {result.toponymName || result.name}
                            </p>
                            <p className="text-2xs text-muted-foreground">
                              {[result.adminName1, result.countryName]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Journey Overview Card */}
            {routeData &&
              routeData.instructions &&
              routeData.instructions.length > 0 && (
                <div className="mt-3 space-y-4">
                  <div
                    className={cn(
                      'rounded-xl p-4 border transition-colors',
                      isDarkMode
                        ? 'bg-gradient-to-br from-forest-dark/20 to-background border-forest-dark/20'
                        : 'bg-gradient-to-br from-forest-light/10 to-background border-forest-light/20'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={cn(
                          'h-7 w-7 rounded-full flex items-center justify-center',
                          isDarkMode
                            ? 'bg-forest-dark/30'
                            : 'bg-forest-light/30'
                        )}
                      >
                        <Route className="h-3.5 w-3.5 text-forest" />
                      </div>
                      <h3 className="text-sm font-medium">Journey Overview</h3>
                    </div>

                    <div className="flex items-start gap-3 bg-card/60 p-3 rounded-lg border border-muted/20">
                      <Car className="h-4 w-4 text-sunset mt-0.5" />
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-muted-foreground">From: </span>
                          <span className="font-medium text-blue-500">
                            Your location
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">To: </span>
                          <span className="font-medium text-primary">
                            {locationName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 pt-1 border-t border-muted/10">
                          <div className="flex items-center gap-1">
                            <Map className="h-3 w-3 text-forest" />
                            <span>
                              {formatDistance(routeData.summary.totalDistance)}
                            </span>
                          </div>
                          <span className="text-muted-foreground/50">•</span>
                          <div className="flex items-center gap-1">
                            <Timer className="h-3 w-3 text-sunset" />
                            <span>{getTravelTimeEstimate()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Turn-by-Turn Directions */}
                  <div
                    className={cn(
                      'rounded-xl overflow-hidden border',
                      isDarkMode
                        ? 'bg-card/80 border-muted/40'
                        : 'bg-card/80 border-muted/30'
                    )}
                  >
                    <div className="p-4 border-b border-muted/10">
                      <h3
                        className={cn(
                          'text-base font-medium flex items-center gap-2',
                          isDarkMode ? 'text-white' : 'text-foreground'
                        )}
                      >
                        <Navigation
                          className={cn(
                            'h-4 w-4',
                            isDarkMode
                              ? 'text-primary-light'
                              : 'text-primary/70'
                          )}
                        />
                        Turn-by-Turn Directions
                      </h3>
                    </div>

                    {/* Combined Directions List */}
                    <div className="max-h-[400px] overflow-y-auto">
                      {routeData.instructions.map((step, index) => (
                        <motion.div
                          key={`step-${index}`}
                          whileHover={{
                            backgroundColor: isDarkMode
                              ? 'rgba(255,255,255,0.1)'
                              : 'rgba(0,0,0,0.02)',
                          }}
                          className={cn(
                            'flex items-start gap-3 p-3 border-b border-muted/10 last:border-b-0 transition-colors',
                            activeStep === index
                              ? isDarkMode
                                ? 'bg-primary/25 border-primary/30'
                                : 'bg-primary/10'
                              : isDarkMode
                                ? 'hover:bg-muted/20'
                                : 'hover:cursor-pointer'
                          )}
                          onClick={() => setActiveStep(index)}
                        >
                          {index === 0 ? (
                            <div
                              className={cn(
                                'bg-blue-500 text-white h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm',
                                isDarkMode
                                  ? 'shadow-blue-500/40 ring-1 ring-blue-400/30'
                                  : 'shadow-blue-500/20'
                              )}
                            >
                              <LocateFixed className="h-3.5 w-3.5" />
                            </div>
                          ) : index === routeData.instructions.length - 1 ? (
                            <div
                              className={cn(
                                'bg-primary text-primary-foreground h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm',
                                isDarkMode
                                  ? 'shadow-primary/40 ring-1 ring-primary-light/30'
                                  : 'shadow-primary/20'
                              )}
                            >
                              <Flag className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div
                              className={cn(
                                'h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0',
                                step.type === 'Turn'
                                  ? isDarkMode
                                    ? 'bg-sunset-dark/60 text-sunset-light ring-1 ring-sunset-light/30'
                                    : 'bg-sunset-light/40 text-sunset-dark'
                                  : isDarkMode
                                    ? 'bg-muted/50 text-white ring-1 ring-white/20'
                                    : 'bg-muted/50 text-muted-foreground'
                              )}
                            >
                              {getTurnTypeIcon(step.type, step.modifier)}
                            </div>
                          )}

                          <div className="flex-1">
                            <p
                              className={cn(
                                'text-sm font-medium leading-tight',
                                isDarkMode ? 'text-white/90' : 'text-foreground'
                              )}
                            >
                              {step.text || getTurnDescription(step)}
                            </p>
                            {step.road && (
                              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-2">
                                {step.road && (
                                  <div
                                    className={cn(
                                      'px-1.5 py-0.5 rounded-full flex items-center gap-1',
                                      isDarkMode
                                        ? 'bg-forest-dark/40 text-forest-light/90 ring-1 ring-forest-light/20'
                                        : 'bg-muted/20 text-forest'
                                    )}
                                  >
                                    <Map className="h-3 w-3" />
                                    <span>{step.road}</span>
                                  </div>
                                )}

                                {step.distance && (
                                  <div
                                    className={cn(
                                      'px-1.5 py-0.5 rounded-full flex items-center gap-1',
                                      isDarkMode
                                        ? 'bg-ocean-dark/40 text-ocean-light/90 ring-1 ring-ocean-light/20'
                                        : 'bg-muted/20 text-ocean'
                                    )}
                                  >
                                    <Route className="h-3 w-3" />
                                    <span>{formatDistance(step.distance)}</span>
                                  </div>
                                )}

                                {step.time && (
                                  <div
                                    className={cn(
                                      'px-1.5 py-0.5 rounded-full flex items-center gap-1',
                                      isDarkMode
                                        ? 'bg-sunset-dark/40 text-sunset-light/90 ring-1 ring-sunset-light/20'
                                        : 'bg-muted/20 text-sunset'
                                    )}
                                  >
                                    <Timer className="h-3 w-3" />
                                    <span>{formatStepTime(step.time)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex-shrink-0">
                            <Info
                              className={cn(
                                'h-4 w-4 cursor-help transition-colors',
                                isDarkMode
                                  ? 'text-muted-foreground/60 hover:text-white/80'
                                  : 'text-muted-foreground/40 hover:text-muted-foreground/80'
                              )}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {!routeData && (
              <div
                className={cn(
                  'flex flex-col items-center justify-center space-y-3 p-6 mt-3 rounded-xl border',
                  isDarkMode
                    ? 'border-muted/20 bg-card/20'
                    : 'border-muted/30 bg-muted/5'
                )}
              >
                <div className="animate-pulse flex items-center justify-center h-12 w-12 rounded-full bg-muted/20">
                  <Route className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Calculating your route...
                  <br />
                  Please wait a moment.
                </p>
                <div className="w-16 h-1 rounded-full bg-muted/20"></div>
              </div>
            )}

            <Button
              variant="outline"
              className={cn(
                'w-full mt-3 border-muted/30 rounded-lg',
                isDarkMode
                  ? 'hover:bg-muted/20 transition-colors'
                  : 'hover:bg-muted/10 transition-colors'
              )}
              onClick={onClose}
            >
              <PanelLeftClose className="h-4 w-4 mr-2" />
              Hide Directions
            </Button>
          </div>
        </motion.div>
      )}
    </>
  );
}
