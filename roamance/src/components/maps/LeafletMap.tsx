'use client';

import { searchGeonames } from '@/api/places-api';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

// Import refactored components
import { FeatureHelpCard } from './FeatureHelpCard';
import { MapControlButtons } from './MapControlButtons';
import { MapController, RouteData } from './MapController';
import { MapInternalControls } from './MapInternalControls';
import { mapLayerAttribution, mapLayers } from './MapLayerControl';
import { DestinationMarker, SearchPinMarker, UserLocationMarker } from './MapMarkers';
import { PointsOfInterest } from './PointsOfInterest';
import { SearchResults } from './SearchResults';
import { WaypointsPanel } from './WaypointsPanel';

// Initialize Leaflet icons
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

// Add dark mode styles globally if document is available
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
    .leaflet-draw-tooltip {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(0, 0, 0, 0.5);
      color: #fff;
    }
    .dark-map .leaflet-draw-toolbar a {
      background-color: #1e1e1e !important;
      color: #f3f4f6 !important;
      border-color: #374151 !important;
    }
    .dark-map .leaflet-draw-actions a {
      background-color: #1e1e1e !important;
      color: #f3f4f6 !important;
      border-color: #374151 !important;
    }
  `;
  document.head.appendChild(styleElement);
}

// Map features descriptions for contextual help
const mapFeatures = {
  layers:
    'Switch between map styles like Standard, Satellite, Terrain, and Transport',
  measure: 'Measure distances on the map by drawing lines',
  traffic: 'Show simulated traffic conditions in the area',
  share: 'Share this location with others or copy a link to it',
  waypoints: 'Add stops along your route when getting directions',
  theme: 'Toggle between light and dark mode for better visibility',
};

interface LeafletMapProps {
  center: { lat: number; lng: number };
  locationName: string;
  userLocation: { lat: number; lng: number } | null;
  searchQuery: string;
  directions: boolean;
  onMapLoaded: () => void;
  isDarkMode: boolean;
  centerOnUser?: boolean;
  onRouteCalculated?: (routeData: RouteData) => void;
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
  onRouteCalculated,
}: LeafletMapProps) {
  const [searchResults, setSearchResults] = useState<
    {
      name: string;
      lat: number;
      lng: number;
      country?: string;
      adminName?: string;
      population?: number;
    }[]
  >([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const mapRef = useRef<L.Map | null>(null);
  const [currentMapLayer, setCurrentMapLayer] =
    useState<keyof typeof mapLayers>('standard');
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [waypoints, setWaypoints] = useState<
    Array<{ lat: number; lng: number }>
  >([]);
  const [mapFeatureHelp, setMapFeatureHelp] = useState<string | null>(null);
  // Add state for search pin
  const [searchPin, setSearchPin] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

  // Event handlers
  const handleSelectSearchResult = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);

      // Set the search pin when selecting a result
      const selectedResult = searchResults.find(r => r.lat === lat && r.lng === lng);
      if (selectedResult) {
        setSearchPin({
          lat,
          lng,
          name: selectedResult.name
        });
      }

      setSearchResults([]);
    }
  };

  const toggleTraffic = () => {
    setShowTraffic(!showTraffic);
  };

  const addWaypoint = (lat: number, lng: number) => {
    setWaypoints([...waypoints, { lat, lng }]);
  };

  const removeWaypoint = (index: number) => {
    const updatedWaypoints = [...waypoints];
    updatedWaypoints.splice(index, 1);
    setWaypoints(updatedWaypoints);
  };

  const clearWaypoints = () => {
    setWaypoints([]);
  };

  // Handle route data calculation
  const handleRouteCalculated = (routeData: RouteData) => {
    if (onRouteCalculated) {
      onRouteCalculated(routeData);
    }
  };

  // Event listeners for feature help
  useEffect(() => {
    const handleMapControlHover = (e: CustomEvent) => {
      setMapFeatureHelp(e.detail.feature);
    };

    const handleMapControlLeave = () => {
      setMapFeatureHelp(null);
    };

    window.addEventListener(
      'mapControlHover',
      handleMapControlHover as EventListener
    );
    window.addEventListener('mapControlLeave', handleMapControlLeave);

    return () => {
      window.removeEventListener(
        'mapControlHover',
        handleMapControlHover as EventListener
      );
      window.removeEventListener('mapControlLeave', handleMapControlLeave);
    };
  }, []);

  // Handle search functionality
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        // Clear the search pin when search query is cleared or too short
        if (searchPin && searchQuery.length === 0) {
          setSearchPin(null);
        }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-full w-full relative">
        <MapContainer
          center={[center.lat || 0, center.lng || 0]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
          className={cn({ 'dark-map': isDarkMode })}
        >
          <TileLayer
            attribution={mapLayerAttribution[currentMapLayer]}
            url={
              isDarkMode
                ? mapLayers[currentMapLayer].dark
                : mapLayers[currentMapLayer].light
            }
          />

          {/* Map markers */}
          {center.lat !== 0 && center.lng !== 0 && (
            <DestinationMarker
              position={center}
              locationName={locationName}
              isDarkMode={isDarkMode}
              userLocation={userLocation}
              directions={directions}
            />
          )}

          {userLocation && (
            <UserLocationMarker
              position={userLocation}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Display search pin marker */}
          {searchPin && (
            <SearchPinMarker
              position={{ lat: searchPin.lat, lng: searchPin.lng }}
              name={searchPin.name}
              isDarkMode={isDarkMode}
              onClear={() => setSearchPin(null)}
            />
          )}

          {/* Points of interest */}
          <PointsOfInterest
            center={center}
            isDarkMode={isDarkMode}
            directions={directions}
            onAddWaypoint={addWaypoint}
          />

          {/* Map Controller for route directions */}
          <MapController
            center={center}
            userLocation={userLocation}
            directions={directions}
            waypoints={waypoints}
            onMapLoaded={onMapLoaded}
            onRouteCalculated={handleRouteCalculated}
          />

          {/* Components that require map context */}
          <MapInternalControls
            isDarkMode={isDarkMode}
            showTraffic={showTraffic}
            centerOnUser={centerOnUser}
            userLocation={userLocation}
          />
        </MapContainer>

        {/* Search results */}
        <SearchResults
          results={searchResults}
          onSelect={handleSelectSearchResult}
          isDarkMode={isDarkMode}
          isSearching={isSearching}
        />

        {/* Map controls outside of MapContainer */}
        <MapControlButtons
          currentMapLayer={currentMapLayer}
          setCurrentMapLayer={setCurrentMapLayer}
          showTraffic={showTraffic}
          toggleTraffic={toggleTraffic}
          isDarkMode={isDarkMode}
          position={center}
          locationName={locationName}
        />

        {/* Feature help card - displays helpful information about map features when hovering */}
        {mapFeatureHelp && (
          <FeatureHelpCard
            featureName={mapFeatureHelp}
            description={
              mapFeatures[mapFeatureHelp as keyof typeof mapFeatures]
            }
            isDarkMode={isDarkMode}
          />
        )}

        {/* Waypoints panel */}
        {directions && waypoints.length > 0 && (
          <WaypointsPanel
            waypoints={waypoints}
            removeWaypoint={removeWaypoint}
            setWaypoints={setWaypoints}
            clearWaypoints={clearWaypoints}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
