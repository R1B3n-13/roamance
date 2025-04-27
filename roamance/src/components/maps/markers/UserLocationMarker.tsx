'use client';

import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { Icon } from 'leaflet';
import { useState, useEffect } from 'react';

// Dynamically import react-leaflet components to avoid SSR issues
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});

interface UserLocationMarkerProps {
  position: { lat: number; lng: number };
  isDarkMode: boolean;
}

// Define icon URLs as constants
const USER_ICON_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTUiIGZpbGw9IiMzQjgyRjYiIGZpbGwtb3BhY2l0eT0iMC4yIiBzdHJva2U9IiMzQjgyRjYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI2IiBmaWxsPSIjM0I4MkY2Ii8+Cjwvc3ZnPg==';
const PLACE_ICON_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCAzMiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9ImdyYWQiIGN4PSIwLjUiIGN5PSIwLjMiIHI9IjAuNyI+CiAgICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0EyNzhGRiIgLz4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3QzNBRUQiIC8+CiAgICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgICAgIDxmaWx0ZXIgaWQ9InNoYWRvdyIgeD0iLTIwJSIgeT0iMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjEzMCUiPgogICAgICAgIDxmZUdhdXNzaWFuQmx1ciBpbj0iU291cmNlQWxwaGEiIHN0ZERldmlhdGlvbj0iMiIgLz4KICAgICAgICA8ZmVPZmZzZXQgZHg9IjAiIGR5PSIzIiByZXN1bHQ9Im9mZk91dCIgLz4KICAgICAgICA8ZmVDb21wb3NpdGUgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0ib2ZmT3V0IiBvcGVyYXRvcj0ib3ZlciIgLz4KICAgICAgPC9maWx0ZXI+CiAgICA8L2RlZnM+CiAgICA8cGF0aCBkPSJNMTYgMkM5LjM3MjU4IDIgNCA3LjM3MjU4IDQgMTRDNCAxOS45IDEyLjgwNCAzMi4yMTg0IDE1LjI3NSAzNS4zNzUyQzE1LjQzMDggMzUuNTY5OCAxNS42NDg2IDM1LjY4IDE1Ljg3NzQgMzUuNjhIMTYuMTQwNkMxNi4zNjk0IDM1LjY4IDE2LjU4NzIgMzUuNTY5OCAxNi43NDMgMzUuMzc1MkMxOS4yMTQgMzIuMjE4NCAyOCAxOS45IDI4IDE0QzI4IDcuMzcyNTggMjIuNjI3NCAyIDE2IDJaIiBmaWxsPSJ1cmwoI2dyYWQpIiBzdHJva2U9IiM2RDI4RDkiIHN0cm9rZS13aWR0aD0iMiIgZmlsdGVyPSJ1cmwoI3NoYWRvdykiLz4KICAgIDxjaXJjbGUgY3g9IjE2IiBjeT0iMTQiIHI9IjUiIGZpbGw9IndoaXRlIiAvPgo8L3N2Zz4K';

// Modify createIcons to be async and dynamically import Leaflet
export const createIcons = async () => {
  // Only create icons in the browser to avoid SSR issues
  if (typeof window === 'undefined') {
    return {
      userLocationIcon: null as unknown as Icon,
      placeLocationIcon: null as unknown as Icon,
    };
  }

  // Dynamically import Leaflet
  const Leaflet = (await import('leaflet')).default;

  return {
    userLocationIcon: new Leaflet.Icon({
      iconUrl: USER_ICON_URL,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -8],
    }),
    placeLocationIcon: new Leaflet.Icon({
      iconUrl: PLACE_ICON_URL,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
    }),
  };
};

// Remove global icon initialization and instead create them on demand
// This ensures they're only created in the browser context

export function UserLocationMarker({
  position,
  isDarkMode,
}: UserLocationMarkerProps) {
  // Use state to manage the icon
  const [icon, setIcon] = useState<Icon | null>(null);

  useEffect(() => {
    // Call createIcons and set the state when the promise resolves
    createIcons().then(({ userLocationIcon }) => {
      setIcon(userLocationIcon);
    });
  }, []); // Empty dependency array ensures this runs once on mount

  // Render nothing until the icon is loaded
  if (!icon) {
    return null;
  }

  return (
    <Marker position={[position.lat, position.lng]} icon={icon}>
      <Popup
        className={cn('rounded-lg shadow-lg', isDarkMode ? 'dark-popup' : '')}
      >
        <div
          className={cn(
            'p-4 rounded-lg backdrop-blur-sm border border-opacity-20',
            isDarkMode
              ? 'bg-card/95 text-foreground border-white/10'
              : 'bg-white/95 border-black/10'
          )}
        >
          <div className="pulse-dot mb-2.5">
            <div
              className={cn(
                'w-3 h-3 rounded-full inline-block mr-2',
                isDarkMode ? 'bg-blue-500' : 'bg-blue-500'
              )}
            ></div>
            <h3
              className={cn(
                'font-bold text-lg inline',
                isDarkMode ? 'text-foreground' : 'text-gray-900'
              )}
            >
              Your Location
            </h3>
          </div>
          <p
            className={cn(
              'text-sm',
              isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
            )}
          >
            {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

interface PlaceLocationMarkerProps {
  position: { lat: number; lng: number };
  isDarkMode: boolean;
  name: string;
  description?: string;
}

export function PlaceLocationMarker({
  position,
  isDarkMode,
  name,
  description,
}: PlaceLocationMarkerProps) {
  // Use state to manage the icon
  const [icon, setIcon] = useState<Icon | null>(null);

  useEffect(() => {
    // Call createIcons and set the state when the promise resolves
    createIcons().then(({ placeLocationIcon }) => {
      setIcon(placeLocationIcon);
    });
  }, []); // Empty dependency array ensures this runs once on mount

  // Render nothing until the icon is loaded
  if (!icon) {
    return null;
  }

  return (
    <Marker position={[position.lat, position.lng]} icon={icon}>
      <Popup
        className={cn('rounded-lg shadow-lg', isDarkMode ? 'dark-popup' : '')}
      >
        <div
          className={cn(
            'p-4 rounded-lg backdrop-blur-sm border border-opacity-20',
            isDarkMode
              ? 'bg-card/95 text-foreground border-white/10'
              : 'bg-white/95 border-black/10'
          )}
        >
          <div className="pulse-dot mb-2.5">
            <div
              className={cn(
                'w-3 h-3 rounded-full inline-block mr-2',
                isDarkMode ? 'bg-purple-500' : 'bg-purple-500'
              )}
            ></div>
            <h3
              className={cn(
                'font-bold text-lg inline',
                isDarkMode ? 'text-foreground' : 'text-gray-900'
              )}
            >
              {name}
            </h3>
          </div>
          {description && (
            <p
              className={cn(
                'text-sm mt-1',
                isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
              )}
            >
              {description}
            </p>
          )}
          <p
            className={cn(
              'text-sm mt-2 font-mono',
              isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
            )}
          >
            {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}
