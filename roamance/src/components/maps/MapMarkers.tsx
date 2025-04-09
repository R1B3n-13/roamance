'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import L from 'leaflet';
import { Compass, Eye, Plus, X } from 'lucide-react';
import { Marker, Popup } from 'react-leaflet';

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
      <Popup className={cn('rounded-lg shadow-lg', isDarkMode ? 'dark-popup' : '')}>
        <div className={cn('p-4 rounded-lg backdrop-blur-sm border border-opacity-20',
          isDarkMode ? 'bg-card/95 text-foreground border-white/10' : 'bg-white/95 border-black/10')}>
          <div className="space-y-1 mb-3">
            <h3 className={cn('font-bold text-lg', isDarkMode ? 'text-foreground' : 'text-gray-900')}>
              {locationName}
            </h3>
            <p className={cn('text-sm', isDarkMode ? 'text-muted-foreground' : 'text-gray-600')}>
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </p>
          </div>

          {userLocation && !directions && (
            <div className="flex items-center gap-2 mt-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "flex-1 h-9 transition-all hover:translate-y-[-1px] font-medium gap-1.5",
                      isDarkMode
                        ? "border-primary/30 hover:bg-primary/10 text-primary"
                        : "border-primary/50 hover:bg-primary/5 text-primary"
                    )}
                    onClick={() => {
                      const event = new CustomEvent('getDirections');
                      window.dispatchEvent(event);
                    }}
                  >
                    <Compass className="h-4 w-4" />
                    <span>Directions</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get directions from your location</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "flex-1 h-9 transition-all hover:translate-y-[-1px] font-medium gap-1.5",
                      isDarkMode
                        ? "border-emerald-600/30 hover:bg-emerald-600/10 text-emerald-500"
                        : "border-emerald-600/50 hover:bg-emerald-600/5 text-emerald-700"
                    )}
                    onClick={() => {
                      const mapElement = document.querySelector('.leaflet-map-pane')?.parentElement;

                      interface LeafletElement extends HTMLElement {
                        _leaflet_map: L.Map;
                      }

                      if (mapElement && 'leaflet' in mapElement) {
                        const map = (mapElement as unknown as LeafletElement)._leaflet_map;
                        if (map) {
                          map.setView([position.lat, position.lng], 18, { animate: true });
                        }
                      }
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    <span>Street View</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View street-level imagery</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
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
      <Popup className={cn('rounded-lg shadow-lg', isDarkMode ? 'dark-popup' : '')}>
        <div className={cn('p-4 rounded-lg backdrop-blur-sm border border-opacity-20',
          isDarkMode ? 'bg-card/95 text-foreground border-white/10' : 'bg-white/95 border-black/10')}>
          <div className="pulse-dot mb-2.5">
            <div className={cn('w-3 h-3 rounded-full inline-block mr-2',
              isDarkMode ? 'bg-blue-500' : 'bg-blue-500')}></div>
            <h3 className={cn('font-bold text-lg inline',
              isDarkMode ? 'text-foreground' : 'text-gray-900')}>
              Your Location
            </h3>
          </div>
          <p className={cn('text-sm', isDarkMode ? 'text-muted-foreground' : 'text-gray-600')}>
            {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

// Custom starting point marker (green pin)
interface CustomStartPointMarkerProps {
  position: { lat: number; lng: number };
  name: string;
  isDarkMode: boolean;
}

export function CustomStartPointMarker({
  position,
  name,
  isDarkMode,
}: CustomStartPointMarkerProps) {
  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={
        new L.Icon({
          iconUrl:
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCAzMCA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1IDQ0LjVDMTUgNDQuNSAzMCAyOS42NTQgMzAgMTVDMzAgNi43MTU3MyAyMy4yODQzIDAgMTUgMEM2LjcxNTczIDAgMCA2LjcxNTczIDAgMTVDMCAyOS42NTQgMTUgNDQuNSAxNSA0NC41WiIgZmlsbD0iIzEwQjk4MSIvPgo8Y2lyY2xlIGN4PSIxNSIgY3k9IjE1IiByPSI3LjUiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
          iconSize: [30, 45],
          iconAnchor: [15, 45],
          popupAnchor: [0, -45],
        })
      }
    >
      <Popup className={cn('rounded-lg shadow-lg', isDarkMode ? 'dark-popup' : '')}>
        <div className={cn('p-4 rounded-lg backdrop-blur-sm border border-opacity-20',
          isDarkMode ? 'bg-card/95 text-foreground border-white/10' : 'bg-white/95 border-black/10')}>
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-1.5">
              <div className={cn('w-2.5 h-2.5 rounded-full',
                isDarkMode ? 'bg-emerald-400' : 'bg-emerald-500')}></div>
              <h3 className={cn('font-bold text-lg',
                isDarkMode ? 'text-foreground' : 'text-gray-900')}>
                Starting Point
              </h3>
            </div>
            <p className={cn('text-sm font-medium',
              isDarkMode ? 'text-muted-foreground' : 'text-gray-700')}>
              {name}
            </p>
            <p className={cn('text-xs', isDarkMode ? 'text-muted-foreground' : 'text-gray-600')}>
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </p>
          </div>
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
      <Popup className={cn('rounded-lg shadow-lg', isDarkMode ? 'dark-popup' : '')}>
        <div className={cn('p-4 rounded-lg backdrop-blur-sm border border-opacity-20',
          isDarkMode ? 'bg-card/95 text-foreground border-white/10' : 'bg-white/95 border-black/10')}>
          <div className="space-y-1 mb-3">
            <div className="flex items-center">
              <span className={cn('inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium mr-2',
                isDarkMode ? 'bg-purple-400 text-gray-900' : 'bg-purple-100 text-purple-800')}>
                {index + 1}
              </span>
              <h3 className={cn('font-bold text-lg', isDarkMode ? 'text-foreground' : 'text-gray-900')}>
                Waypoint
              </h3>
            </div>
            <p className={cn('text-sm', isDarkMode ? 'text-muted-foreground' : 'text-gray-600')}>
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "flex-1 h-9 transition-all hover:translate-y-[-1px] font-medium gap-1.5",
                    isDarkMode
                      ? "border-purple-500/30 hover:bg-purple-500/10 text-purple-400"
                      : "border-purple-500/50 hover:bg-purple-500/5 text-purple-600"
                  )}
                  onClick={() => {
                    const mapElement = document.querySelector('.leaflet-map-pane')?.parentElement;

                    interface LeafletElement extends HTMLElement {
                      _leaflet_map: L.Map;
                    }

                    if (mapElement && 'leaflet' in mapElement) {
                      const map = (mapElement as unknown as LeafletElement)._leaflet_map;
                      if (map) {
                        map.setView([position.lat, position.lng], 16, { animate: true });
                      }
                    }
                  }}
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View this waypoint on map</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "flex-1 h-9 transition-all hover:translate-y-[-1px] font-medium gap-1.5 border-red-500/30",
                    isDarkMode
                      ? "hover:bg-red-500/10 text-red-400"
                      : "hover:bg-red-500/5 text-red-500"
                  )}
                  onClick={onRemove}
                >
                  <X className="h-4 w-4" />
                  <span>Remove</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove this waypoint from your route</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
      <Popup className={cn('rounded-lg shadow-lg', isDarkMode ? 'dark-popup' : '')}>
        <div className={cn('p-4 rounded-lg backdrop-blur-sm border border-opacity-20',
          isDarkMode ? 'bg-card/95 text-foreground border-white/10' : 'bg-white/95 border-black/10')}>
          <div className="space-y-1 mb-3">
            <h3 className={cn('font-bold text-lg', isDarkMode ? 'text-foreground' : 'text-gray-900')}>
              {name}
            </h3>
            <p className={cn('text-sm', isDarkMode ? 'text-muted-foreground' : 'text-gray-600')}>
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "flex-1 h-9 transition-all hover:translate-y-[-1px] font-medium gap-1.5",
                    isDarkMode
                      ? "border-blue-500/30 hover:bg-blue-500/10 text-blue-500"
                      : "border-blue-500/50 hover:bg-blue-500/5 text-blue-600"
                  )}
                  onClick={onClear}
                >
                  <X className="h-4 w-4" />
                  <span>Clear</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove this pin from the map</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "flex-1 h-9 transition-all hover:translate-y-[-1px] font-medium gap-1.5",
                    isDarkMode
                      ? "border-emerald-600/30 hover:bg-emerald-600/10 text-emerald-500"
                      : "border-emerald-600/50 hover:bg-emerald-600/5 text-emerald-700"
                  )}
                  onClick={() => {
                    const mapElement = document.querySelector('.leaflet-map-pane')?.parentElement;

                    interface LeafletElement extends HTMLElement {
                      _leaflet_map: L.Map;
                    }

                    if (mapElement && 'leaflet' in mapElement) {
                      const map = (mapElement as unknown as LeafletElement)._leaflet_map;
                      if (map) {
                        map.setView([position.lat, position.lng], 18, { animate: true });
                      }
                    }
                  }}
                >
                  <Eye className="h-4 w-4" />
                  <span>Street View</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View street-level imagery</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
      <Popup className={cn('rounded-lg shadow-lg', isDarkMode ? 'dark-popup' : '')}>
        <div className={cn('p-4 rounded-lg backdrop-blur-sm border border-opacity-20',
          isDarkMode ? 'bg-card/95 text-foreground border-white/10' : 'bg-white/95 border-black/10')}>
          <div className="space-y-1 mb-3">
            <h3 className={cn('font-bold text-lg', isDarkMode ? 'text-foreground' : 'text-gray-900')}>
              {name}
            </h3>
            <div className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
              isDarkMode ? 'bg-blue-900/30 text-blue-200' : 'bg-blue-100 text-blue-800')}>
              {category}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "flex-1 h-9 transition-all hover:translate-y-[-1px] font-medium gap-1.5",
                    isDarkMode
                      ? "border-primary/30 hover:bg-primary/10 text-primary"
                      : "border-primary/50 hover:bg-primary/5 text-primary"
                  )}
                  onClick={() => {
                    const mapElement = document.querySelector('.leaflet-map-pane')?.parentElement;

                    interface LeafletElement extends HTMLElement {
                      _leaflet_map: L.Map;
                    }

                    if (mapElement && 'leaflet' in mapElement) {
                      const map = (mapElement as unknown as LeafletElement)._leaflet_map;
                      if (map) {
                        map.setView(position, 16);
                      }
                    }
                  }}
                >
                  <Eye className="h-4 w-4" />
                  <span>Details</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View details about this location</p>
              </TooltipContent>
            </Tooltip>

            {directions && onAddAsWaypoint && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      "flex-1 h-9 transition-all hover:translate-y-[-1px] font-medium gap-1.5",
                      isDarkMode
                        ? "border-emerald-600/30 hover:bg-emerald-600/10 text-emerald-500"
                        : "border-emerald-600/50 hover:bg-emerald-600/5 text-emerald-700"
                    )}
                    onClick={onAddAsWaypoint}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Waypoint</span>
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
