'use client';

import { cn } from '@/lib/utils';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

// Map styles - similar to the main map component
const mapStyles = {
  standard: {
    light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  },
};

const mapAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

interface LocationPickerMapProps {
  initialLocation: { latitude: number; longitude: number };
  onLocationChangeAction: (lat: number, lng: number) => void;
  height?: string;
}

// Helper component to add search control to the map
function SearchControl({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    // Create proper type for GeoSearchControl constructor
    const searchControl = new (GeoSearchControl as unknown as new (options: {
      provider: OpenStreetMapProvider;
      style: string;
      showMarker: boolean;
      showPopup: boolean;
      autoClose: boolean;
      retainZoomLevel: boolean;
      animateZoom: boolean;
      keepResult: boolean;
      searchLabel: string;
    }) => L.Control)({
      provider,
      style: 'bar',
      showMarker: false, // We'll handle the marker ourselves
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search for a location',
    });

    map.addControl(searchControl);

    // Handle the search result
    map.on('geosearch/showlocation', (e: L.LeafletEvent) => {
      // Cast the event to access the location property
      const result = e as unknown as {
        location: { x: number; y: number; label: string };
      };
      const { x, y } = result.location;
      onLocationChange(y, x); // y is lat, x is lng in the result
      map.setView([y, x], 13);
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onLocationChange]);

  return null;
}

// Helper component to add marker and handle map interactions
function MapInteractionHandler({
  initialLocation,
  onLocationChangeAction,
}: {
  initialLocation: { latitude: number; longitude: number };
  onLocationChangeAction: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize marker position
  useEffect(() => {
    // If we have a valid initial location, use it
    if (initialLocation.latitude !== 0 || initialLocation.longitude !== 0) {
      const position = L.latLng(
        initialLocation.latitude,
        initialLocation.longitude
      );
      map.setView(position, 13);

      if (markerRef.current) {
        markerRef.current.setLatLng(position);
      }
    }
  }, [initialLocation, map]);

  // Handle map click events
  useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onLocationChangeAction(lat, lng);

      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onLocationChangeAction]);

  // Initialize marker when component mounts
  useEffect(() => {
    if (!markerRef.current) {
      // Fix the type issue by ensuring we have a proper LatLngExpression
      let initialPosition: L.LatLngExpression;

      if (initialLocation.latitude !== 0 || initialLocation.longitude !== 0) {
        initialPosition = [
          initialLocation.latitude,
          initialLocation.longitude,
        ] as [number, number];
      } else {
        initialPosition = map.getCenter();
      }

      markerRef.current = L.marker(initialPosition, {
        draggable: true,
        icon: new L.Icon({
          iconUrl:
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iNTQiIHZpZXdCb3g9IjAgMCAzNiA1NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE4IDUzLjVDMTggNTMuNSAzNiAzNS41ODUgMzYgMThDMzYgOC4wNTg5MSAyNy45NDExIDAgMTggMEM4LjA1ODkgMCAwIDguMDU4OTEgMCAxOEMwIDM1LjU4NSAxOCA1My41IDE4IDUzLjVaIiBmaWxsPSIjRTUzOTM1Ii8+CjxjaXJjbGUgY3g9IjE4IiBjeT0iMTgiIHI9IjkiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
          iconSize: [28, 42],
          iconAnchor: [14, 42],
        }),
      }).addTo(map);

      // Handle marker drag end
      markerRef.current.on('dragend', () => {
        const position = markerRef.current?.getLatLng();
        if (position) {
          onLocationChangeAction(position.lat, position.lng);
        }
      });
    }

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [map, initialLocation, onLocationChangeAction]);

  return null;
}

export function LocationPickerMap({
  initialLocation,
  onLocationChangeAction,
  height = '250px',
}: LocationPickerMapProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Add dark mode styles
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'location-picker-dark-mode-styles';

      if (!document.getElementById(styleId) && isDarkMode) {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = `
          .dark-map-picker .leaflet-tile-pane {
            filter: brightness(0.95) contrast(1.05) saturate(1.1);
          }
          .dark-map-picker .leaflet-control,
          .dark-map-picker .leaflet-control a,
          .dark-map-picker .leaflet-geosearch-bar {
            background-color: #1e1e1e !important;
            color: #f3f4f6 !important;
            border-color: #374151 !important;
          }
          .dark-map-picker .leaflet-control a:hover,
          .dark-map-picker .leaflet-geosearch-bar input {
            background-color: #374151 !important;
          }
          .dark-map-picker .results.active {
            background-color: #1e1e1e !important;
          }
          .dark-map-picker .results.active > * {
            color: #f3f4f6 !important;
            border-color: #374151 !important;
          }
          .dark-map-picker .results.active > *:hover {
            background-color: #374151 !important;
          }
        `;
        document.head.appendChild(styleElement);
      } else if (document.getElementById(styleId) && !isDarkMode) {
        const element = document.getElementById(styleId);
        if (element) element.remove();
      }
    }
  }, [isDarkMode]);

  // Default center (if no location provided)
  const defaultCenter: [number, number] = [20.6295, 92.3208]; // Saint Martin Island
  const center =
    initialLocation.latitude !== 0 || initialLocation.longitude !== 0
      ? ([initialLocation.latitude, initialLocation.longitude] as [
          number,
          number,
        ])
      : defaultCenter;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>Click to set location or drag the marker</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {initialLocation.latitude !== 0 && (
            <span className="font-mono">
              {initialLocation.latitude.toFixed(5)},{' '}
              {initialLocation.longitude.toFixed(5)}
            </span>
          )}
        </div>
      </div>
      <div
        className={cn(
          'overflow-hidden rounded-lg border',
          isDarkMode ? 'border-muted/30' : 'border-muted/60'
        )}
        style={{ height }}
      >
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          className={cn({ 'dark-map-picker': isDarkMode })}
        >
          <TileLayer
            attribution={mapAttribution}
            url={
              isDarkMode ? mapStyles.standard.dark : mapStyles.standard.light
            }
          />
          <SearchControl onLocationChange={onLocationChangeAction} />
          <MapInteractionHandler
            initialLocation={initialLocation}
            onLocationChangeAction={onLocationChangeAction}
          />
        </MapContainer>
      </div>
    </div>
  );
}
