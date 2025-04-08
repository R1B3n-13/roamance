'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import { searchGeonames } from '@/api/places-api';

delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .dark-map .leaflet-tile-pane {
      filter: brightness(0.6) contrast(1.1) saturate(1.1);
    }
    .dark-map .leaflet-control,
    .dark-map .leaflet-control a {
      background-color: #1e1e1e !important;
      color: #f3f4f6 !important;
      border-color: #374151 !important;
    }
    .dark-map .leaflet-control a:hover {
      background-color: #374151 !important;
    }
    .dark-map .leaflet-popup-content-wrapper,
    .dark-map .leaflet-popup-tip {
      background-color: #1e1e1e !important;
      color: #f3f4f6 !important;
      border-color: #374151 !important;
    }
  `;
  document.head.appendChild(styleElement);
}

interface MapProps {
  center: { lat: number; lng: number };
  locationName: string;
  userLocation: { lat: number; lng: number } | null;
  searchQuery: string;
  directions: boolean;
  onMapLoaded: () => void;
  isDarkMode: boolean;
  centerOnUser?: boolean;
}

function MapController({
  center,
  userLocation,
  directions,
  onMapLoaded,
}: {
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
  directions: boolean;
  onMapLoaded: () => void;
}) {
  const map = useMap();
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    if (center.lat !== 0 && center.lng !== 0) {
      map.setView([center.lat, center.lng], 13);
    }
    onMapLoaded();
  }, [center, map, onMapLoaded]);

  useEffect(() => {
    if (directions && userLocation && center.lat !== 0 && center.lng !== 0) {
      const points: [number, number][] = [
        [userLocation.lat, userLocation.lng],
        [center.lat, center.lng],
      ];
      setRoute(points);

      const bounds = new L.LatLngBounds([
        [userLocation.lat, userLocation.lng],
        [center.lat, center.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      setRoute([]);
    }
  }, [directions, userLocation, center, map]);

  return (
    <>
      {route.length > 0 && (
        <Polyline
          positions={route}
          color="#3b82f6"
          weight={5}
          dashArray="10, 10"
          opacity={0.8}
        />
      )}
    </>
  );
}

function DarkModeMapLayer({ isDarkMode }: { isDarkMode: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (isDarkMode) {
      map.getContainer().classList.add('dark-map');
    } else {
      map.getContainer().classList.remove('dark-map');
    }
  }, [isDarkMode, map]);

  return null;
}

function SearchResults({
  results,
  onSelect,
  isDarkMode,
  isSearching,
}: {
  results: {
    name: string;
    lat: number;
    lng: number;
    country?: string;
    adminName?: string;
    population?: number;
  }[];
  onSelect: (lat: number, lng: number) => void;
  isDarkMode: boolean;
  isSearching: boolean;
}) {
  return isSearching || results.length > 0 ? (
    <div
      className={cn(
        'absolute top-20 left-4 z-[1000] max-w-md w-full md:w-80 rounded-xl shadow-md border',
        'max-h-[320px] overflow-y-auto scrollbar-thin',
        isDarkMode
          ? 'bg-background/60 border-muted/30 backdrop-blur-md scrollbar-thumb-gray-700'
          : 'bg-white/80 border-muted/20 backdrop-blur-sm scrollbar-thumb-gray-300'
      )}
    >
      {isSearching && (
        <div className="p-4 flex flex-col items-center justify-center">
          <div
            className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Searching locations...
          </p>
        </div>
      )}

      {results.map((item, index) => (
        <div
          key={index}
          className={cn(
            'px-4 py-3 border-b last:border-0 cursor-pointer transition-colors',
            isDarkMode
              ? 'border-muted/10 hover:bg-muted/10'
              : 'border-muted/10 hover:bg-muted/10'
          )}
          onClick={() => onSelect(item.lat, item.lng)}
        >
          <h4
            className={cn(
              'font-medium text-sm',
              isDarkMode ? 'text-foreground' : ''
            )}
          >
            {item.name}
          </h4>
          {(item.country || item.adminName) && (
            <p
              className={cn(
                'text-xs',
                isDarkMode
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/70'
              )}
            >
              {[item.adminName, item.country].filter(Boolean).join(', ')}
              {item.population && item.population > 0 && (
                <span className="ml-1">
                  {item.population >= 1000000
                    ? `(Pop: ${(item.population / 1000000).toFixed(1)}M)`
                    : item.population >= 1000
                      ? `(Pop: ${(item.population / 1000).toFixed(0)}K)`
                      : `(Pop: ${item.population})`}
                </span>
              )}
            </p>
          )}
          <p
            className={cn(
              'text-xs mt-1 flex items-center',
              isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground/70'
            )}
          >
            <MapPin
              className={cn('h-3 w-3 mr-1', isDarkMode ? 'text-primary' : '')}
            />
            {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
          </p>
        </div>
      ))}
    </div>
  ) : null;
}

export default function LeafletMap({
  center,
  locationName,
  userLocation,
  searchQuery,
  directions,
  onMapLoaded,
  isDarkMode,
  centerOnUser,
}: MapProps) {
  const [searchResults, setSearchResults] = useState<
    { name: string; lat: number; lng: number }[]
  >([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const geonames = await searchGeonames(searchQuery);

        // Map Geoname objects to the format expected by SearchResults
        const formattedResults = geonames
          .filter((geoname) => geoname.lat && geoname.lng && geoname.name)
          .map((geoname) => ({
            name: geoname.toponymName || geoname.name,
            lat: parseFloat(geoname.lat),
            lng: parseFloat(geoname.lng),
            country: geoname.countryName || '',
            adminName: geoname.adminName1 || '',
            population: geoname.population || 0,
          }))
          .slice(0, 10);

        setSearchResults(formattedResults);
      } catch (error) {
        console.error('Error searching locations:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSearchResults();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    if (centerOnUser && userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 15, {
        animate: true,
        duration: 1,
      });

      const event = new CustomEvent('userLocationCentered');
      window.dispatchEvent(event);
    }
  }, [centerOnUser, userLocation]);

  const handleSelectSearchResult = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
      setSearchResults([]);
    }
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[center.lat || 0, center.lng || 0]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={false}
        className={cn({ 'dark-mode': isDarkMode })}
      >
        <ZoomControl position="topright" />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            isDarkMode
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />

        {center.lat !== 0 && center.lng !== 0 && (
          <Marker
            position={[center.lat, center.lng]}
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
              <div
                className={cn(
                  'p-2',
                  isDarkMode ? 'bg-card text-foreground' : ''
                )}
              >
                <h3
                  className={cn(
                    'font-bold',
                    isDarkMode ? 'text-foreground' : ''
                  )}
                >
                  {locationName}
                </h3>
                <p
                  className={cn(
                    'text-sm',
                    isDarkMode ? 'text-muted-foreground' : ''
                  )}
                >
                  Coordinates: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                </p>
                {userLocation && !directions && (
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
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
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
              <div
                className={cn(
                  'p-2',
                  isDarkMode ? 'bg-card text-foreground' : ''
                )}
              >
                <h3
                  className={cn(
                    'font-bold',
                    isDarkMode ? 'text-foreground' : ''
                  )}
                >
                  Your Location
                </h3>
                <p
                  className={cn(
                    'text-sm',
                    isDarkMode ? 'text-muted-foreground' : ''
                  )}
                >
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        <MapController
          center={center}
          userLocation={userLocation}
          directions={directions}
          onMapLoaded={onMapLoaded}
        />

        <DarkModeMapLayer isDarkMode={isDarkMode} />
      </MapContainer>

      <SearchResults
        results={searchResults}
        onSelect={handleSelectSearchResult}
        isDarkMode={isDarkMode}
        isSearching={isSearching}
      />
    </div>
  );
}
