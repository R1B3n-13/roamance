'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import { LocateFixed, MapPin } from 'lucide-react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type * as LeafletType from 'leaflet';
import { useMap } from 'react-leaflet';
import { createIcons, UserLocationMarker } from './markers/UserLocationMarker';

// Define types for the dynamically imported modules
type GeoSearchControlType = typeof import('leaflet-geosearch').GeoSearchControl;
type OpenStreetMapProviderType =
  typeof import('leaflet-geosearch').OpenStreetMapProvider;
// Define type for an instance of the provider
type OpenStreetMapProviderInstanceType =
  import('leaflet-geosearch').OpenStreetMapProvider;

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
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
  Leaflet, // Receive Leaflet object as prop
  GeoSearchControl, // Receive dynamically imported GeoSearchControl
  OpenStreetMapProvider, // Receive dynamically imported OpenStreetMapProvider
}: {
  onLocationChange: (lat: number, lng: number) => void;
  Leaflet: typeof LeafletType; // Add type annotation
  GeoSearchControl: GeoSearchControlType | null; // Add type annotation
  OpenStreetMapProvider: OpenStreetMapProviderType | null; // Add type annotation
}) {
  const map = useMap();

  useEffect(() => {
    // Ensure Leaflet and geosearch modules are loaded
    if (!Leaflet || !GeoSearchControl || !OpenStreetMapProvider) return;

    const provider = new OpenStreetMapProvider();

    // Use the passed Leaflet object and dynamically imported controls
    const searchControl = new (GeoSearchControl as unknown as new (options: {
      provider: OpenStreetMapProviderInstanceType; // Use the instance type
      style: string;
      showMarker: boolean;
      showPopup: boolean;
      autoClose: boolean;
      retainZoomLevel: boolean;
      animateZoom: boolean;
      keepResult: boolean;
      searchLabel: string;
    }) => LeafletType.Control)({
      provider,
      style: 'bar',
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search for a location',
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (e: LeafletType.LeafletEvent) => {
      const result = e as unknown as {
        location: { x: number; y: number; label: string };
      };
      const { x, y } = result.location;
      onLocationChange(y, x);
      map.setView([y, x], 13);
    });

    return () => {
      // Check if map and searchControl exist before removing
      if (map && map.removeControl) {
         map.removeControl(searchControl);
      }
    };
    // Add Leaflet, GeoSearchControl, OpenStreetMapProvider to dependency array
  }, [map, onLocationChange, Leaflet, GeoSearchControl, OpenStreetMapProvider]);

  return null;
}

// Helper component to add marker and handle map interactions
function MapInteractionHandler({
  initialLocation,
  onLocationChangeAction,
  userLocation,
  Leaflet, // Receive Leaflet object as prop
}: {
  initialLocation: { latitude: number; longitude: number };
  onLocationChangeAction: (lat: number, lng: number) => void;
  userLocation: { lat: number; lng: number } | null;
  Leaflet: typeof LeafletType; // Add type annotation
}) {
  const map = useMap();
  const markerRef = useRef<LeafletType.Marker | null>(null);
  const hasSetInitialLocation = useRef(false);

  // Initialize marker position with user location or initialLocation
  useEffect(() => {
    // Ensure Leaflet is loaded
    if (!Leaflet) return;

    // If we have user location and haven't set an initial location yet, use it
    if (
      userLocation &&
      !hasSetInitialLocation.current &&
      initialLocation.latitude === 0 &&
      initialLocation.longitude === 0
    ) {
      // Update the form state with user's location
      onLocationChangeAction(userLocation.lat, userLocation.lng);

      const position = Leaflet.latLng(userLocation.lat, userLocation.lng);
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
      const position = Leaflet.latLng(
        initialLocation.latitude,
        initialLocation.longitude
      );
      map.setView(position, 13);

      if (markerRef.current) {
        markerRef.current.setLatLng(position);
      }

      hasSetInitialLocation.current = true;
    }
  }, [initialLocation, map, userLocation, onLocationChangeAction, Leaflet]); // Add Leaflet

  // Handle map click events
  useEffect(() => {
    // Ensure Leaflet is loaded
    if (!Leaflet) return;

    const handleMapClick = (e: LeafletType.LeafletMouseEvent) => {
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
  }, [map, onLocationChangeAction, Leaflet]); // Add Leaflet

  // Initialize marker when component mounts
  useEffect(() => {
    // Ensure Leaflet is loaded
    if (!Leaflet) return;

    const initializeMarker = async () => {
      if (!markerRef.current) {
        // Determine the best initial position: userLocation > initialLocation > map center
        let initialPosition: LeafletType.LatLngExpression;

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

        // Get a fresh instance of the icon - await the Promise
        const icons = await createIcons();
        const { placeLocationIcon } = icons;

        markerRef.current = Leaflet.marker(initialPosition, {
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
    };

    initializeMarker();

    return () => {
      if (markerRef.current) {
        // Check if map exists before removing layer
        if (map && map.hasLayer(markerRef.current)) {
           map.removeLayer(markerRef.current);
        }
        markerRef.current = null;
      }
    };
    // Add Leaflet to dependency array
  }, [map, initialLocation, onLocationChangeAction, userLocation, Leaflet]);

  return null;
}

// Add this new component to handle map events and references
function MapController({
  onMapReady,
  Leaflet, // Receive Leaflet object as prop
}: {
  onMapReady: (map: LeafletType.Map) => void; // Use LeafletType
  Leaflet: typeof LeafletType; // Add type annotation
}) {
  const map = useMap();

  // Use effect to ensure the map is ready and properly stored in the ref
  useEffect(() => {
    // Ensure Leaflet is loaded
    if (!Leaflet) return;
    onMapReady(map as unknown as LeafletType.Map); // Use LeafletType
  }, [map, onMapReady, Leaflet]); // Add Leaflet

  return null;
}

export function LocationPickerMap({
  initialLocation,
  onLocationChangeAction,
  height = '250px',
}: LocationPickerMapProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const mapRef = useRef<LeafletType.Map | null>(null);
  // State to hold the dynamically imported Leaflet module
  const [Leaflet, setLeaflet] = useState<typeof LeafletType | null>(null);
  // State to hold dynamically imported geosearch modules
  const [GeoSearchControl, setGeoSearchControl] =
    useState<GeoSearchControlType | null>(null);
  const [OpenStreetMapProvider, setOpenStreetMapProvider] =
    useState<OpenStreetMapProviderType | null>(null);

  // State for user's current location
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Dynamically import Leaflet on mount
  useEffect(() => {
    import('leaflet').then((L) => {
      setLeaflet(L);
    });
  }, []);

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

  // Dynamically import leaflet-geosearch when Leaflet is ready
  useEffect(() => {
    if (Leaflet) {
      import('leaflet-geosearch').then((module) => {
        setGeoSearchControl(() => module.GeoSearchControl); // Use function form for state update
        setOpenStreetMapProvider(() => module.OpenStreetMapProvider); // Use function form for state update
      });
    }
  }, [Leaflet]); // Depend on Leaflet state

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
    // Ensure Leaflet is loaded
    if (userLocation && mapRef.current && Leaflet) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [userLocation, Leaflet]); // Add Leaflet

  // Callback to store map reference
  const handleMapReady = useCallback((map: LeafletType.Map) => {
    mapRef.current = map;
  }, []);

  // Render loading or placeholder if Leaflet or geosearch modules are not yet loaded
  if (!Leaflet || !GeoSearchControl || !OpenStreetMapProvider) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center rounded-lg border bg-muted/30 text-muted-foreground"
      >
        Loading Map...
      </div>
    );
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
        {/* Conditionally render MapContainer only when Leaflet is loaded */}
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          className={cn({ 'dark-map-picker': isDarkMode })}
        >
          <MapController onMapReady={handleMapReady} Leaflet={Leaflet} />
          <TileLayer
            attribution={mapAttribution}
            url={
              isDarkMode ? mapStyles.standard.dark : mapStyles.standard.light
            }
          />
          <SearchControl
            onLocationChange={onLocationChangeAction}
            Leaflet={Leaflet}
            GeoSearchControl={GeoSearchControl} // Pass dynamically loaded module
            OpenStreetMapProvider={OpenStreetMapProvider} // Pass dynamically loaded module
          />
          <MapInteractionHandler
            initialLocation={initialLocation}
            onLocationChangeAction={onLocationChangeAction}
            userLocation={userLocation}
            Leaflet={Leaflet}
          />
          {/* Render UserLocationMarker if location is available */}
          {userLocation && (
            <UserLocationMarker
              position={userLocation}
              isDarkMode={isDarkMode}
              // Pass Leaflet if UserLocationMarker needs it, otherwise remove
              // Leaflet={Leaflet}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
