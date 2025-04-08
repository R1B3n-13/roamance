'use client';

import { cn } from '@/lib/utils';
import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StreetViewButton } from './StreetViewButton';

// Destination marker (red pin)
interface DestinationMarkerProps {
  position: { lat: number; lng: number };
  locationName: string;
  isDarkMode: boolean;
  userLocation?: { lat: number; lng: number } | null;
  directions?: boolean;
}

export function DestinationMarker({
  position,
  locationName,
  isDarkMode,
  userLocation,
  directions = false,
}: DestinationMarkerProps) {
  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={
        new L.Icon({
          iconUrl:
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iNTQiIHZpZXdCb3g9IjAgMCAzNiA1NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE4IDUzLjVDMTggNTMuNSAzNiAzNS41ODUgMzYgMThDMzYgOC4wNTg5MSAyNy45NDExIDAgMTggMEM4LjA1ODkgMCAwIDguMDU4OTEgMCAxOEMwIDM1LjU4NSAxOCA1My41IDE4IDUzLjVaIiBmaWxsPSIjRTUzOTM1Ii8+CjxjaXJjbGUgY3g9IjE4IiBjeT0iMTgiIHI9IjkiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
          iconSize: [36, 54],
          iconAnchor: [18, 54],
          popupAnchor: [0, -54],
        })
      }
    >
      <Popup>
        <div className={cn('p-2', isDarkMode ? 'bg-card text-foreground' : '')}>
          <h3 className={cn('font-bold', isDarkMode ? 'text-foreground' : '')}>
            {locationName}
          </h3>
          <p
            className={cn('text-sm', isDarkMode ? 'text-muted-foreground' : '')}
          >
            Coordinates: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
          {userLocation && !directions && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => {
                    const event = new CustomEvent('getDirections');
                    window.dispatchEvent(event);
                  }}
                >
                  Get Directions
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Get directions from your location</p>
              </TooltipContent>
            </Tooltip>
          )}
          <StreetViewButton position={position} isDarkMode={isDarkMode} />
        </div>
      </Popup>
    </Marker>
  );
}

// User location marker (blue dot)
interface UserLocationMarkerProps {
  position: { lat: number; lng: number };
  isDarkMode: boolean;
}

export function UserLocationMarker({
  position,
  isDarkMode,
}: UserLocationMarkerProps) {
  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={
        new L.Icon({
          iconUrl:
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTUiIGZpbGw9IiMzQjgyRjYiIGZpbGwtb3BhY2l0eT0iMC4yIiBzdHJva2U9IiMzQjgyRjYiIHN0cm9rZS13aWR0aD0iMiIvPgo8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI2IiBmaWxsPSIjM0I4MkY2Ii8+Cjwvc3ZnPg==',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -8],
        })
      }
    >
      <Popup>
        <div className={cn('p-2', isDarkMode ? 'bg-card text-foreground' : '')}>
          <h3 className={cn('font-bold', isDarkMode ? 'text-foreground' : '')}>
            Your Location
          </h3>
          <p
            className={cn('text-sm', isDarkMode ? 'text-muted-foreground' : '')}
          >
            {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

// Waypoint marker (purple pin)
interface WaypointMarkerProps {
  position: { lat: number; lng: number };
  index: number;
  isDarkMode: boolean;
  onRemove: () => void;
}

export function WaypointMarker({
  position,
  index,
  isDarkMode,
  onRemove,
}: WaypointMarkerProps) {
  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={
        new L.Icon({
          iconUrl:
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAyNCAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDM2QzEyIDM2IDI0IDIzLjcyMyAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxOEMwIDIzLjcyMyAxMiAzNiAxMiAzNloiIGZpbGw9IiM2MzY2RjEiLz4KPGNpcmxlIGN4PSIxMiIgY3k9IjEyIiByPSI2IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
          iconSize: [24, 36],
          iconAnchor: [12, 36],
          popupAnchor: [0, -36],
        })
      }
    >
      <Popup>
        <div className={cn('p-2', isDarkMode ? 'bg-card text-foreground' : '')}>
          <h3 className={cn('font-bold', isDarkMode ? 'text-foreground' : '')}>
            Waypoint {index + 1}
          </h3>
          <p
            className={cn('text-sm', isDarkMode ? 'text-muted-foreground' : '')}
          >
            {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="destructive"
                className="mt-2 w-full"
                onClick={onRemove}
              >
                Remove
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove this waypoint from your route</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </Popup>
    </Marker>
  );
}

// POI Marker (Points of Interest)
interface POIMarkerProps {
  position: [number, number];
  name: string;
  category: string;
  icon: string;
  isDarkMode: boolean;
  onAddAsWaypoint?: () => void;
  directions?: boolean;
}

// Search pin marker (blue pin)
interface SearchPinMarkerProps {
  position: { lat: number; lng: number };
  name: string;
  isDarkMode: boolean;
  onClear: () => void;
}

export function SearchPinMarker({
  position,
  name,
  isDarkMode,
  onClear,
}: SearchPinMarkerProps) {
  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={
        new L.Icon({
          iconUrl:
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCAzMCA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1IDQ0LjVDMTUgNDQuNSAzMCAyOS42NTQgMzAgMTVDMzAgNi43MTU3MyAyMy4yODQzIDAgMTUgMEM2LjcxNTczIDAgMCA2LjcxNTczIDAgMTVDMCAyOS42NTQgMTUgNDQuNSAxNSA0NC41WiIgZmlsbD0iIzNiODJmNiIvPgo8Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSI3LjUiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
          iconSize: [30, 45],
          iconAnchor: [15, 45],
          popupAnchor: [0, -45],
        })
      }
    >
      <Popup>
        <div className={cn('p-2', isDarkMode ? 'bg-card text-foreground' : '')}>
          <h3 className={cn('font-bold', isDarkMode ? 'text-foreground' : '')}>
            {name}
          </h3>
          <p
            className={cn('text-sm', isDarkMode ? 'text-muted-foreground' : '')}
          >
            Coordinates: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={onClear}
              >
                Clear Pin
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove this pin from the map</p>
            </TooltipContent>
          </Tooltip>
          <StreetViewButton position={position} isDarkMode={isDarkMode} />
        </div>
      </Popup>
    </Marker>
  );
}

export function POIMarker({
  position,
  name,
  category,
  icon,
  isDarkMode,
  directions,
  onAddAsWaypoint,
}: POIMarkerProps) {
  return (
    <Marker
      position={position}
      icon={
        new L.DivIcon({
          html: `<div style="font-size: 18px; background-color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" title="${name}">${icon}</div>`,
          className: '',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })
      }
    >
      <Popup>
        <div className={cn('p-2', isDarkMode ? 'bg-card text-foreground' : '')}>
          <h3 className={cn('font-bold', isDarkMode ? 'text-foreground' : '')}>
            {name}
          </h3>
          <p
            className={cn('text-sm', isDarkMode ? 'text-muted-foreground' : '')}
          >
            Category: {category}
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="default"
                  className="w-full"
                  onClick={() => {
                    const mapElement =
                      document.querySelector(
                        '.leaflet-map-pane'
                      )?.parentElement;

                    interface LeafletElement extends HTMLElement {
                      _leaflet_map: L.Map;
                    }

                    if (mapElement && 'leaflet' in mapElement) {
                      const map = (mapElement as unknown as LeafletElement)
                        ._leaflet_map;
                      if (map) {
                        map.setView(position, 16);
                      }
                    }
                  }}
                >
                  View Details
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom in to view this point of interest</p>
              </TooltipContent>
            </Tooltip>

            {directions && onAddAsWaypoint && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={onAddAsWaypoint}
                  >
                    Add as Waypoint
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add this location as a stop on your route</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
