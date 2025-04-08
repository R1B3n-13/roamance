'use client';

import { useEffect, useState } from 'react';
import { POIMarker } from './MapMarkers';

// POI categories with emoji icons
export const poiCategories = [
  { name: 'Restaurant', icon: '🍽️' },
  { name: 'Hotel', icon: '🏨' },
  { name: 'Museum', icon: '🏛️' },
  { name: 'Park', icon: '🌳' },
  { name: 'Beach', icon: '🏖️' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Landmark', icon: '🗿' },
  { name: 'Entertainment', icon: '🎭' },
  { name: 'Cafe', icon: '☕' },
  { name: 'Bar', icon: '🍸' },
];

interface PointsOfInterestProps {
  center: { lat: number; lng: number };
  isDarkMode: boolean;
  directions?: boolean;
  onAddWaypoint?: (lat: number, lng: number) => void;
}

export function PointsOfInterest({
  center,
  isDarkMode,
  directions = false,
  onAddWaypoint,
}: PointsOfInterestProps) {
  const [pois, setPois] = useState<
    Array<{
      name: string;
      category: string;
      icon: string;
      position: [number, number];
    }>
  >([]);

  useEffect(() => {
    if (center.lat !== 0 && center.lng !== 0) {
      const generatePOIs = () => {
        const genPois = [];
        for (let i = 0; i < 15; i++) {
          // Random offset between -0.01 and 0.01 (roughly 1km)
          const latOffset = (Math.random() - 0.5) * 0.02;
          const lngOffset = (Math.random() - 0.5) * 0.02;

          const category =
            poiCategories[Math.floor(Math.random() * poiCategories.length)];

          genPois.push({
            name: `${category.name} ${i + 1}`,
            category: category.name,
            icon: category.icon,
            position: [center.lat + latOffset, center.lng + lngOffset] as [
              number,
              number,
            ],
          });
        }
        setPois(genPois);
      };

      generatePOIs();
    }
  }, [center]);

  return (
    <>
      {pois.map((poi, index) => (
        <POIMarker
          key={`poi-${index}`}
          position={poi.position}
          name={poi.name}
          category={poi.category}
          icon={poi.icon}
          isDarkMode={isDarkMode}
          directions={directions}
          onAddAsWaypoint={
            onAddWaypoint
              ? () => onAddWaypoint(poi.position[0], poi.position[1])
              : undefined
          }
        />
      ))}
    </>
  );
}
