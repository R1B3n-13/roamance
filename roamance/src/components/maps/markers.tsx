'use client';

import L from 'leaflet';
import React from 'react';
import { Marker, Popup } from 'react-leaflet';

// Custom marker icon for destinations
const createCustomIcon = (isDarkMode: boolean) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="relative">
        <div class="absolute -top-5 -left-3 flex items-center justify-center h-10 w-10 rounded-full backdrop-blur-sm transition-all">
          <div class="absolute inset-0 rounded-full ${isDarkMode ? 'bg-indigo-600/80' : 'bg-indigo-600/90'} animate-pulse"></div>
          <svg class="w-5 h-5 text-white z-10 relative" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <div class="absolute inset-0 rounded-full border-2 ${isDarkMode ? 'border-white/30' : 'border-white/60'}"></div>
        </div>
      </div>
    `,
    iconSize: [24, 40],
    iconAnchor: [12, 40],
    popupAnchor: [0, -40],
  });
};

// Destination marker component
interface DestinationMarkerProps {
  position: { lat: number; lng: number };
  locationName: string;
  isDarkMode?: boolean;
}

export const DestinationMarker: React.FC<DestinationMarkerProps> = ({
  position,
  locationName,
  isDarkMode = false,
}) => {
  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={createCustomIcon(isDarkMode)}
    >
      <Popup className={`leaflet-popup ${isDarkMode ? 'dark-popup' : ''}`}>
        <div className={`p-2 rounded-md text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <strong>{locationName}</strong>
          <div className="mt-1 text-xs opacity-80">
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Route waypoint marker
interface WaypointMarkerProps {
  position: { lat: number; lng: number };
  index: number;
  isStart?: boolean;
  isEnd?: boolean;
  isDarkMode?: boolean;
}

export const WaypointMarker: React.FC<WaypointMarkerProps> = ({
  position,
  index,
  isStart = false,
  isEnd = false,
  isDarkMode = false,
}) => {
  const markerColor = isStart
    ? 'bg-green-500'
    : isEnd
      ? 'bg-red-500'
      : 'bg-amber-500';

  const customIcon = L.divIcon({
    className: 'waypoint-marker',
    html: `
      <div class="relative">
        <div class="absolute -top-4 -left-4 flex items-center justify-center w-8 h-8 rounded-full ${markerColor} ${isDarkMode ? 'text-white' : 'text-white'} font-medium shadow-md">
          ${index}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={customIcon}
    >
      <Popup className={`leaflet-popup ${isDarkMode ? 'dark-popup' : ''}`}>
        <div className={`p-2 rounded-md text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <div className="font-medium">{isStart ? 'Starting Point' : isEnd ? 'Destination' : `Waypoint ${index}`}</div>
          <div className="mt-1 text-xs opacity-80">
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
