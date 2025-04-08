'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { DarkModeMapLayer } from './DarkModeMapLayer';
import { MeasurementTools } from './MeasurementControl';
import { TrafficLayer } from './TrafficControl';

interface MapInternalControlsProps {
  isDarkMode: boolean;
  showTraffic: boolean;
  centerOnUser?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

export function MapInternalControls({
  isDarkMode,
  showTraffic,
  centerOnUser,
  userLocation,
}: MapInternalControlsProps) {
  const map = useMap();
  const [isMeasuring, setIsMeasuring] = useState(false);

  // Handle centering on user location
  useEffect(() => {
    if (centerOnUser && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15, {
        animate: true,
        duration: 1,
      });

      const event = new CustomEvent('userLocationCentered');
      window.dispatchEvent(event);
    }
  }, [centerOnUser, map, userLocation]);

  // Handle measurement toggle
  useEffect(() => {
    const handleToggleMeasure = () => {
      setIsMeasuring((prev) => !prev);
    };

    window.addEventListener('toggle-measure', handleToggleMeasure);

    return () => {
      window.removeEventListener('toggle-measure', handleToggleMeasure);
    };
  }, []);

  return (
    <>
      <DarkModeMapLayer isDarkMode={isDarkMode} />
      {showTraffic && <TrafficLayer isDarkMode={isDarkMode} />}
      {isMeasuring && <MeasurementTools />}
    </>
  );
}
