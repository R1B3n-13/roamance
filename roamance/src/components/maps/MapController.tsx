'use client';

import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { Polyline } from 'react-leaflet';
import L from 'leaflet';

interface MapControllerProps {
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
  directions: boolean;
  waypoints: Array<{ lat: number; lng: number }>;
  onMapLoaded?: () => void;
}

export function MapController({
  center,
  userLocation,
  directions,
  waypoints,
  onMapLoaded,
}: MapControllerProps) {
  const map = useMap();
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    if (center.lat !== 0 && center.lng !== 0) {
      map.setView([center.lat, center.lng], 13);
    }
    if (onMapLoaded) {
      onMapLoaded();
    }
  }, [center, map, onMapLoaded]);

  useEffect(() => {
    if (directions && userLocation && center.lat !== 0 && center.lng !== 0) {
      const points: [number, number][] = [];

      // Start with user location
      if (userLocation) {
        points.push([userLocation.lat, userLocation.lng]);
      }

      // Add all waypoints
      if (waypoints.length > 0) {
        waypoints.forEach((wp) => {
          points.push([wp.lat, wp.lng]);
        });
      }

      // End with destination
      if (center.lat !== 0 && center.lng !== 0) {
        points.push([center.lat, center.lng]);
      }

      setRoute(points);

      // Create bounds that include all points
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      setRoute([]);
    }
  }, [directions, userLocation, center, map, waypoints]);

  return (
    <>
      {route.length > 0 && (
        <Polyline
          positions={route}
          color="#3b82f6"
          weight={5}
          dashArray="10, 10"
          opacity={0.8}
        />
      )}
    </>
  );
}
