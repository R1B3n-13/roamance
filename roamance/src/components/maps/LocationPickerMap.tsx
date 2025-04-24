'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { createIcons, UserLocationMarker } from './markers/UserLocationMarker';

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
  userLocation,
}: {
  initialLocation: { latitude: number; longitude: number };
  onLocationChangeAction: (lat: number, lng: number) => void;
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const hasSetInitialLocation = useRef(false);

  // Initialize marker position with user location or initialLocation
  useEffect(() => {
    // If we have user location and haven't set an initial location yet, use it
    if (
      userLocation &&
      !hasSetInitialLocation.current &&
      initialLocation.latitude === 0 &&
      initialLocation.longitude === 0
    ) {
      // Update the form state with user's location
      onLocationChangeAction(userLocation.lat, userLocation.lng);

      const position = L.latLng(userLocation.lat, userLocation.lng);
      map.setView(position, 13);

      if (markerRef.current) {
        markerRef.current.setLatLng(position);
      }

      hasSetInitialLocation.current = true;
    }
    // If we have a valid initial location, use it
    else if (
      (initialLocation.latitude !== 0 || initialLocation.longitude !== 0) &&
      !hasSetInitialLocation.current
    ) {
      const position = L.latLng(
        initialLocation.latitude,
        initialLocation.longitude
      );
      map.setView(position, 13);

      if (markerRef.current) {
        markerRef.current.setLatLng(position);
      }

      hasSetInitialLocation.current = true;
    }
  }, [initialLocation, map, userLocation, onLocationChangeAction]);

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
      // Determine the best initial position: userLocation > initialLocation > map center
      let initialPosition: L.LatLngExpression;

      if (
        userLocation &&
        initialLocation.latitude === 0 &&
        initialLocation.longitude === 0
      ) {
        initialPosition = [userLocation.lat, userLocation.lng] as [
          number,
          number,
        ];
      } else if (
        initialLocation.latitude !== 0 ||
        initialLocation.longitude !== 0
      ) {
        initialPosition = [
          initialLocation.latitude,
          initialLocation.longitude,
        ] as [number, number];
      } else {
        initialPosition = map.getCenter();
      }

      // Get a fresh instance of the icon
      const { placeLocationIcon } = createIcons();

      markerRef.current = L.marker(initialPosition, {
        draggable: true,
        icon: placeLocationIcon,
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
  }, [map, initialLocation, onLocationChangeAction, userLocation]);

  return null;
}

// Add this new component to handle map events and references
function MapController({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap();

  // Use effect to ensure the map is ready and properly stored in the ref
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
}

export function LocationPickerMap({
  initialLocation,
  onLocationChangeAction,
  height = '250px',
}: LocationPickerMapProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const mapRef = useRef<L.Map | null>(null);

  // State for user's current location
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Fetch user location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('Error getting user location:', error);
      },
      { enableHighAccuracy: true }
    );
  }, []);

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

  // Default center logic - prioritize user location, then initialLocation, then default
  const defaultCenter: [number, number] = [20.6295, 92.3208]; // Saint Martin Island as fallback

  // Calculate the map center based on available locations
  const center =
    userLocation &&
    initialLocation.latitude === 0 &&
    initialLocation.longitude === 0
      ? ([userLocation.lat, userLocation.lng] as [number, number])
      : initialLocation.latitude !== 0 || initialLocation.longitude !== 0
        ? ([initialLocation.latitude, initialLocation.longitude] as [
            number,
            number,
          ])
        : defaultCenter;

  // Function to center the map on user location
  const handleCenterOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [userLocation]);

  // Callback to store map reference
  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
  }, []);

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
          'relative overflow-hidden rounded-lg border',
          isDarkMode ? 'border-muted/30' : 'border-muted/60'
        )}
        style={{ height }}
      >
        {/* Button to center on user location - using type="button" to prevent form submission */}
        {userLocation && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              'absolute top-2 right-12 z-[1000] h-8 w-8 p-1.5',
              isDarkMode
                ? 'bg-background/80 hover:bg-muted/80 border-muted/30'
                : 'bg-white/80 hover:bg-gray-100/80 border-muted/60'
            )}
            onClick={handleCenterOnUser}
            title="Center on my location"
          >
            <LocateFixed className="h-full w-full" />
          </Button>
        )}
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          className={cn({ 'dark-map-picker': isDarkMode })}
        >
          <MapController onMapReady={handleMapReady} />
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
            userLocation={userLocation}
          />
          {/* Render UserLocationMarker if location is available */}
          {userLocation && (
            <UserLocationMarker
              position={userLocation}
              isDarkMode={isDarkMode}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
