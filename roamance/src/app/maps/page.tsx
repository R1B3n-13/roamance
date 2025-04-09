'use client';

import { MapFeaturesInfo } from '@/components/maps';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MapContainer } from './map-container';
import { AnimatePresence } from 'framer-motion';
import { RouteData } from '@/components/maps/MapController';
import { MapPageHeader } from '@/components/maps/MapPageHeader';
import { SearchSection } from '@/components/maps/SearchSection';
import { DirectionsPanel } from '@/components/maps/DirectionsPanel';

export const DEFAULT_META_DESCRIPTION =
  'Discover, plan and experience your next adventure with Roamance, the ultimate tourism companion.';
export const MAX_WIDTH = 1400;

export const defaultCenter = { lat: 40.7128, lng: -74.006 };

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

  const toggleDirectionsPanel = () => {
    setShowDirectionsPanel(!showDirectionsPanel);
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

      <MapPageHeader
        isDarkMode={isDarkMode}
        userLocation={userLocation}
        directions={directions}
        showDirectionsPanel={showDirectionsPanel}
        handleCenterOnUser={handleCenterOnUser}
        toggleDirectionsPanel={toggleDirectionsPanel}
      />

      <SearchSection
        isDarkMode={isDarkMode}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

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
            <DirectionsPanel
              routeData={routeData}
              locationName={locationName}
              isDarkMode={isDarkMode}
              showDirectionsPanel={showDirectionsPanel}
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              onClose={toggleDirectionsPanel}
            />
          )}
        </AnimatePresence>
      </div>

      <MapFeaturesInfo isDarkMode={isDarkMode} />
    </div>
  );
}
