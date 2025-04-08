'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowLeft, Layers, Locate, Navigation, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MapContainer } from './map-container';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function MapPage() {
  const searchParams = useSearchParams();
  const lat = searchParams?.get('lat')
    ? parseFloat(searchParams.get('lat') as string)
    : 0;
  const lng = searchParams?.get('lng')
    ? parseFloat(searchParams.get('lng') as string)
    : 0;
  const name = searchParams?.get('name') || 'Location';

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    if (!localStorage.getItem('theme') && systemPrefersDark) {
      setIsDarkMode(true);
    } else if (localStorage.getItem('theme') === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      setIsDarkMode(resolvedTheme === 'dark');
    }
  }, [resolvedTheme, mounted]);

  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [directions, setDirections] = useState<boolean>(false);
  const [centerOnUser, setCenterOnUser] = useState<boolean>(false);

  // Add state for feature tooltips
  const [showingTooltip, setShowingTooltip] = useState<string | null>(null);

  // Event listener for showing directions from a popup
  useEffect(() => {
    const handleDirectionsRequest = () => {
      if (!userLocation) {
        getUserLocation();
      }
      setDirections(true);
    };

    window.addEventListener('getDirections', handleDirectionsRequest);

    return () => {
      window.removeEventListener('getDirections', handleDirectionsRequest);
    };
  }, [userLocation]);

  const getUserLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userPos);
          setCenterOnUser(true);
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
          alert(
            'Could not get your location. Please check your browser permissions.'
          );
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setIsLocating(false);
    }
  };

  useEffect(() => {
    const handleUserLocationCentered = () => {
      setCenterOnUser(false);
    };

    window.addEventListener('userLocationCentered', handleUserLocationCentered);

    return () => {
      window.removeEventListener(
        'userLocationCentered',
        handleUserLocationCentered
      );
    };
  }, []);

  const toggleDirections = () => {
    if (!userLocation && !directions) {
      getUserLocation();
    }
    setDirections(!directions);
  };

  if (!mounted) {
    return <div className="h-[calc(100vh-4rem)] w-full bg-background"></div>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative h-[calc(100vh-4rem)] w-full">
        <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/">
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      'h-10 w-10 rounded-full backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-105',
                      isDarkMode
                        ? 'bg-card/80 border-card-foreground/20 text-primary hover:bg-card/90 hover:text-primary'
                        : 'bg-white/90 border-muted hover:bg-white'
                    )}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back to home</p>
              </TooltipContent>
            </Tooltip>

            <div className="max-w-md w-full md:w-80">
              <div
                className={cn(
                  'flex items-center px-4 py-2 backdrop-blur-md shadow-sm border rounded-full overflow-hidden transition-all duration-200',
                  isDarkMode
                    ? 'bg-background/50 border-muted/30 hover:bg-background/70'
                    : 'bg-white/80 border-muted/20 hover:bg-white/90'
                )}
              >
                <Search
                  className={cn(
                    'h-3.5 w-3.5 mr-2',
                    isDarkMode
                      ? 'text-muted-foreground/70'
                      : 'text-muted-foreground/60'
                  )}
                />
                <Input
                  placeholder="Search places..."
                  className={cn(
                    'border-none shadow-none focus-visible:ring-0 bg-transparent h-7 px-0',
                    isDarkMode
                      ? 'placeholder:text-muted-foreground/50 text-foreground'
                      : 'placeholder:text-muted-foreground/50 text-foreground',
                    'text-sm'
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-6 w-6 p-0 rounded-full ml-1',
                      isDarkMode
                        ? 'hover:bg-muted/20 text-muted-foreground'
                        : 'hover:bg-muted/20 text-muted-foreground'
                    )}
                    onClick={() => setSearchQuery('')}
                  >
                    <ArrowLeft className="h-3 w-3 rotate-45" />
                  </Button>
                )}
              </div>
            </div>

            {/* Map options popover with tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover open={showingTooltip === 'features'} onOpenChange={(open) => setShowingTooltip(open ? 'features' : null)}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className={cn(
                        'ml-auto h-10 w-10 rounded-full backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-105',
                        isDarkMode
                          ? 'bg-card/80 border-card-foreground/20 text-primary hover:bg-card/90 hover:text-primary'
                          : 'bg-white/90 border-muted hover:bg-white'
                      )}
                    >
                      <Layers className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Map Features</h4>
                      <div className="text-xs text-muted-foreground">
                        <p>This map includes the following features:</p>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          <li>Different map layers (Standard, Satellite, Terrain)</li>
                          <li>Distance measurement tools</li>
                          <li>Traffic visualization</li>
                          <li>Points of interest</li>
                          <li>Street View integration</li>
                          <li>Waypoint management for routing</li>
                          <li>Map sharing functionality</li>
                        </ul>
                      </div>
                      <p className="text-xs">Look for control buttons on the right side of the map.</p>
                    </div>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>
                <p>Map features info</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="absolute bottom-8 right-4 z-[1000] flex flex-col gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={getUserLocation}
                disabled={isLocating}
                className={cn(
                  'h-12 w-12 rounded-full backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-105',
                  isDarkMode
                    ? 'bg-card/90 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                    : 'bg-white/90 border-muted hover:bg-white',
                  isLocating && 'animate-pulse'
                )}
                aria-label="Locate me"
              >
                <Locate className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Find my location</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={directions ? 'default' : 'outline'}
                size="icon"
                onClick={toggleDirections}
                className={cn(
                  'h-12 w-12 rounded-full backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-105',
                  directions
                    ? 'bg-primary text-primary-foreground'
                    : isDarkMode
                      ? 'bg-card/90 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                      : 'bg-white/90 border-muted hover:bg-white'
                )}
                aria-label={directions ? "Hide directions" : "Show directions"}
                onMouseEnter={() => {
                  const event = new CustomEvent('mapControlHover', {
                    detail: { feature: 'waypoints' }
                  });
                  window.dispatchEvent(event);
                }}
                onMouseLeave={() => {
                  const event = new CustomEvent('mapControlLeave');
                  window.dispatchEvent(event);
                }}
              >
                <Navigation className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{directions ? 'Hide directions' : 'Get directions'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <MapContainer
          center={{ lat, lng }}
          locationName={name}
          userLocation={userLocation}
          searchQuery={searchQuery}
          directions={directions}
          isDarkMode={isDarkMode}
          centerOnUser={centerOnUser}
        />
      </div>
    </TooltipProvider>
  );
}
