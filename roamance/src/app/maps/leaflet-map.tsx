'use client';

import { LeafletMap } from '@/components/maps';

interface MapProps {
  center: { lat: number; lng: number };
  locationName: string;
  userLocation: { lat: number; lng: number } | null;
  searchQuery: string;
  directions: boolean;
  onMapLoaded: () => void;
  isDarkMode: boolean;
  centerOnUser?: boolean;
}

export default function MapComponent({
  center,
  locationName,
  userLocation,
  searchQuery,
  directions,
  onMapLoaded,
  isDarkMode,
  centerOnUser,
}: MapProps) {
  // This component now simply passes props to the refactored LeafletMap component
  return (
    <LeafletMap
      center={center}
      locationName={locationName}
      userLocation={userLocation}
      searchQuery={searchQuery}
      directions={directions}
      onMapLoaded={onMapLoaded}
      isDarkMode={isDarkMode}
      centerOnUser={centerOnUser}
    />
  );
}
