'use client';

import { useEffect, useState, useRef } from 'react';
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
  const previousCenterOnUser = useRef(centerOnUser);
  const userLocationCentered = useRef(false);

  // Handle centering on user location
  useEffect(() => {
    // Only center the map when centerOnUser changes from false to true
    if (centerOnUser && !previousCenterOnUser.current && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15, {
        animate: true,
        duration: 1,
      });

      // Mark that we've centered on user location to prevent any other component
      // from re-centering the map on a different location
      userLocationCentered.current = true;

      // After a short delay, reset the flag to allow future centering actions
      const resetTimer = setTimeout(() => {
        userLocationCentered.current = false;
      }, 2000);

      const event = new CustomEvent('userLocationCentered');
      window.dispatchEvent(event);

      return () => clearTimeout(resetTimer);
    }

    // Update the ref to track the current value
    previousCenterOnUser.current = centerOnUser;
  }, [centerOnUser, map, userLocation]);

  // Override the map's default centering behavior when we're handling user location centering
  useEffect(() => {
    if (userLocationCentered.current) {
      // Temporarily disable the map's setView method if we have just centered on user location
      const originalSetView = map.setView;
      map.setView = function (...args) {
        // Only apply if we're not actively centering on user
        if (!userLocationCentered.current) {
          return originalSetView.apply(this, args);
        }
        return this;
      };

      return () => {
        // Restore the original method when component unmounts or dependencies change
        map.setView = originalSetView;
      };
    }
  }, [centerOnUser, map]);

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
