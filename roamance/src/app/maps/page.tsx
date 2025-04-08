'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowLeft, Locate, Navigation, Search } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { MapContainer } from './map-container';

export default function MapPage() {
  const searchParams = useSearchParams();
  const lat = searchParams?.get('lat') ? parseFloat(searchParams.get('lat') as string) : 0;
  const lng = searchParams?.get('lng') ? parseFloat(searchParams.get('lng') as string) : 0;
  const name = searchParams?.get('name') || 'Location';

  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [directions, setDirections] = useState<boolean>(false);
  const [centerOnUser, setCenterOnUser] = useState<boolean>(false);

  const getUserLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          setCenterOnUser(true);
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLocating(false);
          alert('Could not get your location. Please check your browser permissions.');
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
      window.removeEventListener('userLocationCentered', handleUserLocationCentered);
    };
  }, []);

  const toggleDirections = () => {
    if (!userLocation && !directions) {
      getUserLocation();
    }
    setDirections(!directions);
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-105",
                isDarkMode
                  ? "bg-card/80 border-card-foreground/20 text-primary hover:bg-card/90 hover:text-primary"
                  : "bg-white/90 border-muted hover:bg-white"
              )}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div className="max-w-md w-full md:w-80">
            <div className={cn(
              "flex items-center px-4 py-2 backdrop-blur-md shadow-sm border rounded-full overflow-hidden transition-all duration-200",
              isDarkMode
                ? "bg-background/50 border-muted/30 hover:bg-background/70"
                : "bg-white/80 border-muted/20 hover:bg-white/90"
            )}>
              <Search className={cn("h-3.5 w-3.5 mr-2", isDarkMode ? "text-muted-foreground/70" : "text-muted-foreground/60")} />
              <Input
                placeholder="Search places..."
                className={cn(
                  "border-none shadow-none focus-visible:ring-0 bg-transparent h-7 px-0",
                  isDarkMode
                    ? "placeholder:text-muted-foreground/50 text-foreground"
                    : "placeholder:text-muted-foreground/50 text-foreground",
                  "text-sm"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 w-6 p-0 rounded-full ml-1",
                    isDarkMode
                      ? "hover:bg-muted/20 text-muted-foreground"
                      : "hover:bg-muted/20 text-muted-foreground"
                  )}
                  onClick={() => setSearchQuery('')}
                >
                  <ArrowLeft className="h-3 w-3 rotate-45" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-4 z-[1000] flex flex-col gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={getUserLocation}
          disabled={isLocating}
          className={cn(
            "h-12 w-12 rounded-full backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-105",
            isDarkMode
              ? "bg-card/90 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50"
              : "bg-white/90 border-muted hover:bg-white",
            isLocating && "animate-pulse"
          )}
        >
          <Locate className="h-5 w-5" />
        </Button>

        <Button
          variant={directions ? "default" : "outline"}
          size="icon"
          onClick={toggleDirections}
          className={cn(
            "h-12 w-12 rounded-full backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-105",
            directions
              ? "bg-primary text-primary-foreground"
              : isDarkMode
                ? "bg-card/90 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50"
                : "bg-white/90 border-muted hover:bg-white"
          )}
        >
          <Navigation className="h-5 w-5" />
        </Button>
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
  );
}
