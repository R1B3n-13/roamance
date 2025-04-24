'use client';

import { cn } from '@/lib/utils';
import L from 'leaflet';
import { useEffect } from 'react';
import { Marker, Popup } from 'react-leaflet';

interface UserLocationMarkerProps {
  position: { lat: number; lng: number };
  isDarkMode: boolean;
}

// Define icon URLs as constants
const USER_ICON_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTUiIGZpbGw9IiMzQjgyRjYiIGZpbGwtb3BhY2l0eT0iMC4yIiBzdHJva2U9IiMzQjgyRjYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI2IiBmaWxsPSIjM0I4MkY2Ii8+Cjwvc3ZnPg==';
const PLACE_ICON_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCAzMiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxkZWZzPgogICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9ImdyYWQiIGN4PSIwLjUiIGN5PSIwLjMiIHI9IjAuNyI+CiAgICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0EyNzhGRiIgLz4KICAgICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM3QzNBRUQiIC8+CiAgICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgICAgIDxmaWx0ZXIgaWQ9InNoYWRvdyIgeD0iLTIwJSIgeT0iMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjEzMCUiPgogICAgICAgIDxmZUdhdXNzaWFuQmx1ciBpbj0iU291cmNlQWxwaGEiIHN0ZERldmlhdGlvbj0iMiIgLz4KICAgICAgICA8ZmVPZmZzZXQgZHg9IjAiIGR5PSIzIiByZXN1bHQ9Im9mZk91dCIgLz4KICAgICAgICA8ZmVDb21wb3NpdGUgaW49IlNvdXJjZUdyYXBoaWMiIGluMj0ib2ZmT3V0IiBvcGVyYXRvcj0ib3ZlciIgLz4KICAgICAgPC9maWx0ZXI+CiAgICA8L2RlZnM+CiAgICA8cGF0aCBkPSJNMTYgMkM5LjM3MjU4IDIgNCA3LjM3MjU4IDQgMTRDNCAxOS45IDEyLjgwNCAzMi4yMTg0IDE1LjI3NSAzNS4zNzUyQzE1LjQzMDggMzUuNTY5OCAxNS42NDg2IDM1LjY4IDE1Ljg3NzQgMzUuNjhIMTYuMTQwNkMxNi4zNjk0IDM1LjY4IDE2LjU4NzIgMzUuNTY5OCAxNi43NDMgMzUuMzc1MkMxOS4yMTQgMzIuMjE4NCAyOCAxOS45IDI4IDE0QzI4IDcuMzcyNTggMjIuNjI3NCAyIDE2IDJaIiBmaWxsPSJ1cmwoI2dyYWQpIiBzdHJva2U9IiM2RDI4RDkiIHN0cm9rZS13aWR0aD0iMiIgZmlsdGVyPSJ1cmwoI3NoYWRvdykiLz4KICAgIDxjaXJjbGUgY3g9IjE2IiBjeT0iMTQiIHI9IjUiIGZpbGw9IndoaXRlIiAvPgo8L3N2Zz4K';

// Don't forget to update the icon anchor point for the new pin shape
export const createIcons = () => {
  return {
    userLocationIcon: new L.Icon({
      iconUrl: USER_ICON_URL,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -8],
    }),
    placeLocationIcon: new L.Icon({
      iconUrl: PLACE_ICON_URL,
      iconSize: [32, 42], // Height increased for pin shape
      iconAnchor: [16, 42], // Bottom center of the pin
      popupAnchor: [0, -42], // Popup appears above the pin
    }),
  };
};

// Export these for convenience, but they should only be used after component mounting
export let userLocationIcon: L.Icon;
export let placeLocationIcon: L.Icon;

// Initialize icons client-side only
if (typeof window !== 'undefined') {
  const icons = createIcons();
  userLocationIcon = icons.userLocationIcon;
  placeLocationIcon = icons.placeLocationIcon;
}

export function UserLocationMarker({
  position,
  isDarkMode,
}: UserLocationMarkerProps) {
  // Re-create icons on component mount to ensure they're available
  useEffect(() => {
    const icons = createIcons();
    userLocationIcon = icons.userLocationIcon;
    placeLocationIcon = icons.placeLocationIcon;
  }, []);

  // Use createIcons() directly in the component to guarantee icon availability
  const { userLocationIcon: icon } = createIcons();

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
  // Use createIcons() directly in the component to guarantee icon availability
  const { placeLocationIcon: icon } = createIcons();

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
