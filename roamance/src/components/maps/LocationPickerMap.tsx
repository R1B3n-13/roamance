'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, MapPin, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import { createIcons, UserLocationMarker } from './markers/UserLocationMarker';
import dynamic from 'next/dynamic';
// Import types for dynamic import
import type {
  GeoSearchControl as GeoSearchControlType,
  OpenStreetMapProvider as OpenStreetMapProviderType,
} from 'leaflet-geosearch';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  {
    ssr: false,
  }
);

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
  L,
}: {
  onLocationChange: (lat: number, lng: number) => void;
  L: typeof import('leaflet');
}) {
  const map = useMap();
  const [geosearchModules, setGeosearchModules] = useState<{
    GeoSearchControl: typeof GeoSearchControlType;
    OpenStreetMapProvider: typeof OpenStreetMapProviderType;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Define constructor type for GeoSearchControl
  type GeoSearchControlConstructor = new (options: {
    provider: OpenStreetMapProviderType;
    style: string;
    showMarker: boolean;
    showPopup: boolean;
    autoClose: boolean;
    retainZoomLevel: boolean;
    animateZoom: boolean;
    keepResult: boolean;
    searchLabel: string;
  }) => import('leaflet').Control;

  // Dynamically import leaflet-geosearch
  useEffect(() => {
    if (!L) return; // Don't import if Leaflet isn't loaded

    const loadGeoSearch = async () => {
      setIsLoading(true);
      try {
        // Dynamically import the necessary parts
        const { GeoSearchControl, OpenStreetMapProvider } = await import(
          'leaflet-geosearch'
        );
        setGeosearchModules({ GeoSearchControl, OpenStreetMapProvider });
      } catch (error) {
        console.error('Failed to load leaflet-geosearch:', error);
        // Handle error appropriately, maybe show a message to the user
      } finally {
        setIsLoading(false);
      }
    };

    loadGeoSearch();
  }, [L]); // Depend on L

  // Add search control once modules are loaded
  useEffect(() => {
    if (!L || !map || !geosearchModules || isLoading) return;

    const { GeoSearchControl, OpenStreetMapProvider } = geosearchModules;
    const provider = new OpenStreetMapProvider();

    // Cast to our constructor signature
    const GeoSearchControlClass = GeoSearchControl as unknown as GeoSearchControlConstructor;
    const searchControl = new GeoSearchControlClass({
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
    const handleSearchResult = (e: import('leaflet').LeafletEvent) => {
      // Use imported L's LeafletEvent type
      // Cast the event to access the location property
      const result = e as unknown as {
        location: { x: number; y: number; label: string };
      };
      const { x, y } = result.location;
      onLocationChange(y, x); // y is lat, x is lng in the result
      map.setView([y, x], 13);
    };

    map.on('geosearch/showlocation', handleSearchResult);

    return () => {
      // Clean up event listener and control
      map.off('geosearch/showlocation', handleSearchResult);
      if (map && map.removeControl) {
        map.removeControl(searchControl);
      }
    };
    // Depend on map, onLocationChange, L, and the loaded modules
  }, [map, onLocationChange, L, geosearchModules, isLoading]);

  // Optionally render a loading state or null while geosearch is loading
  // if (isLoading) return <div>Loading search...</div>;

  return null;
}

// Helper component to add marker and handle map interactions
function MapInteractionHandler({
  initialLocation,
  onLocationChangeAction,
  userLocation,
  L,
}: {
  initialLocation: { latitude: number; longitude: number };
  onLocationChangeAction: (lat: number, lng: number) => void;
  userLocation: { lat: number; lng: number } | null;
  L: typeof import('leaflet');
}) {
  const map = useMap();
  const markerRef = useRef<import('leaflet').Marker | null>(null); // Use imported L's Marker type
  const hasSetInitialLocation = useRef(false);

  // Initialize marker position with user location or initialLocation
  useEffect(() => {
    if (!L) return; // Don't run if L is not loaded

    // If we have user location and haven't set an initial location yet, use it
    if (
      userLocation &&
      !hasSetInitialLocation.current &&
      initialLocation.latitude === 0 &&
      initialLocation.longitude === 0
    ) {
      // Update the form state with user's location
      onLocationChangeAction(userLocation.lat, userLocation.lng);

      const position = L.latLng(userLocation.lat, userLocation.lng); // Use passed L
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
        // Use passed L
        initialLocation.latitude,
        initialLocation.longitude
      );
      map.setView(position, 13);

      if (markerRef.current) {
        markerRef.current.setLatLng(position);
      }

      hasSetInitialLocation.current = true;
    }
  }, [initialLocation, map, userLocation, onLocationChangeAction, L]); // Add L to dependency array

  // Handle map click events
  useEffect(() => {
    if (!L) return; // Don't run if L is not loaded

    const handleMapClick = (e: import('leaflet').LeafletMouseEvent) => {
      // Use imported L's LeafletMouseEvent type
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
  }, [map, onLocationChangeAction, L]); // Add L to dependency array

  // Initialize marker when component mounts
  useEffect(() => {
    if (!L) return () => {}; // Don't run if L is not loaded

    let isMounted = true; // Flag to prevent state update on unmounted component

    if (!markerRef.current) {
      // Determine the best initial position: userLocation > initialLocation > map center
      let initialPosition: import('leaflet').LatLngExpression; // Use imported L's LatLngExpression type

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

      // Create and add the marker with async icon
      (async () => {
        // Assume createIcons is adapted to accept L
        const { placeLocationIcon } = await createIcons();
        if (!isMounted) return; // Check if component is still mounted

        markerRef.current = L.marker(initialPosition, {
          // Use passed L
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
      })();
    }

    return () => {
      isMounted = false; // Set flag on unmount
      if (markerRef.current) {
        // Check if map exists before removing layer
        if (map && map.hasLayer(markerRef.current)) {
          map.removeLayer(markerRef.current);
        }
        markerRef.current = null;
      }
    };
    // Add L to dependency array
  }, [map, initialLocation, onLocationChangeAction, userLocation, L]);

  return null;
}

// Add this new component to handle map events and references
function MapController({
  onMapReady,
  L, // Added L prop (optional, mainly for type consistency if needed later)
}: {
  onMapReady: (map: import('leaflet').Map) => void; // Use imported L's Map type
  L: typeof import('leaflet') | null; // Added L prop type
}) {
  const map = useMap();

  // Use effect to ensure the map is ready and properly stored in the ref
  useEffect(() => {
    if (L) {
      // Ensure L is loaded before calling onMapReady
      onMapReady(map);
    }
  }, [map, onMapReady, L]); // Add L to dependency array

  return null;
}

export function LocationPickerMap({
  initialLocation,
  onLocationChangeAction,
  height = '250px',
}: LocationPickerMapProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const mapRef = useRef<import('leaflet').Map | null>(null); // Use imported L's Map type
  const [leafletInstance, setLeafletInstance] = useState<
    typeof import('leaflet') | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Dynamically import Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const L = await import('leaflet');
        setLeafletInstance(L);
      } catch (err) {
        console.error('Failed to load Leaflet:', err);
        setError('Map library failed to load. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    loadLeaflet();
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
    // Check if leafletInstance and mapRef are available
    if (userLocation && mapRef.current && leafletInstance) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [userLocation, leafletInstance]); // Add leafletInstance dependency

  // Callback to store map reference
  const handleMapReady = useCallback((map: import('leaflet').Map) => {
    // Use imported L's Map type
    mapRef.current = map;
  }, []);

  if (isLoading) {
    return (
      <div
        className="flex h-[250px] items-center justify-center rounded-lg border bg-muted/30"
        style={{ height }}
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading Map...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex h-[250px] items-center justify-center rounded-lg border border-destructive bg-destructive/10 text-destructive"
        style={{ height }}
      >
        <span>{error}</span>
      </div>
    );
  }

  // Only render map when Leaflet is loaded
  if (!leafletInstance) {
    return null; // Or some fallback UI
  }

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
        {/* Button to center on user location */}
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
          <MapController onMapReady={handleMapReady} L={leafletInstance} />
          <TileLayer
            attribution={mapAttribution}
            url={
              isDarkMode ? mapStyles.standard.dark : mapStyles.standard.light
            }
          />
          {/* Pass the loaded L instance to child components */}
          <SearchControl
            onLocationChange={onLocationChangeAction}
            L={leafletInstance}
          />
          <MapInteractionHandler
            initialLocation={initialLocation}
            onLocationChangeAction={onLocationChangeAction}
            userLocation={userLocation}
            L={leafletInstance}
          />
          {/* Render UserLocationMarker if location is available */}
          {/* Assuming UserLocationMarker uses react-leaflet Marker and doesn't need L directly */}
          {/* If UserLocationMarker or createIcons needs L, pass it here too */}
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
