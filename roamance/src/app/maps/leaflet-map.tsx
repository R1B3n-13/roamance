'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, Ruler, Share, TrafficCone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Circle,
  FeatureGroup,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import { searchGeonames } from '@/api/places-api';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Add Leaflet Draw for distance measurement and drawing
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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

// Different map tile layers similar to Google Maps
const mapLayers = {
  standard: {
    light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    name: 'Standard',
    description: 'Default map view showing roads and basic features',
  },
  satellite: {
    light:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    name: 'Satellite',
    description: 'Satellite imagery of the area',
  },
  terrain: {
    light:
      'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
    dark: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-dark/{z}/{x}/{y}{r}.png',
    name: 'Terrain',
    description: 'Map showing topography and elevation features',
  },
  transport: {
    light: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    dark: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    name: 'Transport',
    description: 'Map showing roads, transit routes and cycling paths',
  },
};

const mapLayerAttribution = {
  standard:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  satellite: '&copy; <a href="https://www.arcgis.com/">Esri</a>',
  terrain:
    '&copy; <a href="http://stamen.com">Stamen Design</a>, <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  transport:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="https://github.com/cyclosm/cyclosm-cartocss-style">CyclOSM</a>',
};

// POI categories
const poiCategories = [
  {
    name: 'Restaurant',
    icon: '🍽️',
    description: 'Places to dine and enjoy local cuisine',
  },
  {
    name: 'Hotel',
    icon: '🏨',
    description: 'Accommodation options in the area',
  },
  {
    name: 'Museum',
    icon: '🏛️',
    description: 'Cultural and historical attractions',
  },
  {
    name: 'Park',
    icon: '🌳',
    description: 'Green spaces, parks and recreation areas',
  },
  {
    name: 'Hospital',
    icon: '🏥',
    description: 'Medical facilities and emergency services',
  },
  {
    name: 'Shopping',
    icon: '🛍️',
    description: 'Shopping centers, markets and retail areas',
  },
];

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
  waypoints,
}: {
  center: { lat: number; lng: number };
  userLocation: { lat: number; lng: number } | null;
  directions: boolean;
  onMapLoaded: () => void;
  waypoints: Array<{ lat: number; lng: number }>;
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
      const points: [number, number][] = [];

      // Start with user location
      if (userLocation) {
        points.push([userLocation.lat, userLocation.lng]);
      }

      // Add all waypoints
      if (waypoints.length > 0) {
        waypoints.forEach((wp) => {
          points.push([wp.lat, wp.lng]);
        });
      }

      // End with destination
      if (center.lat !== 0 && center.lng !== 0) {
        points.push([center.lat, center.lng]);
      }

      setRoute(points);

      // Create bounds that include all points
      const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      setRoute([]);
    }
  }, [directions, userLocation, center, map, waypoints]);

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

function StreetViewButton({
  position,
  isDarkMode,
}: {
  position: { lat: number; lng: number };
  isDarkMode: boolean;
}) {
  const [streetViewUrl, setStreetViewUrl] = useState('');
  const [streetViewOpen, setStreetViewOpen] = useState(false);

  useEffect(() => {
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.lat},${position.lng}`;
    setStreetViewUrl(url);
  }, [position]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={isDarkMode ? 'outline' : 'secondary'}
            className={cn(
              'mt-2 w-full',
              isDarkMode ? 'bg-background/60 hover:bg-background/80' : ''
            )}
            onClick={() => setStreetViewOpen(true)}
          >
            Street View
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>See 360° street-level imagery of this location</p>
        </TooltipContent>
      </Tooltip>

      <Dialog open={streetViewOpen} onOpenChange={setStreetViewOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStreetViewOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <iframe
            src={streetViewUrl}
            className="w-full h-full border-none"
            title="Street View"
            allow="fullscreen"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function MapLayerControl({
  currentLayer,
  setCurrentLayer,
  isDarkMode,
}: {
  currentLayer: keyof typeof mapLayers;
  setCurrentLayer: (layer: keyof typeof mapLayers) => void;
  isDarkMode: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'h-10 w-10 rounded-full backdrop-blur-md shadow-lg',
                isDarkMode
                  ? 'bg-card/90 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                  : 'bg-white/90 border-muted hover:bg-white'
              )}
            >
              <Layers className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Map Type</h4>
              <RadioGroup
                value={currentLayer}
                onValueChange={(value) =>
                  setCurrentLayer(value as keyof typeof mapLayers)
                }
              >
                {Object.entries(mapLayers).map(([key, layer]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`layer-${key}`} />
                    <div>
                      <Label htmlFor={`layer-${key}`}>{layer.name}</Label>
                      <p className="text-xs text-muted-foreground">
                        {layer.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </PopoverContent>
        </Popover>
      </TooltipTrigger>
      <TooltipContent>
        <p>Change map style</p>
      </TooltipContent>
    </Tooltip>
  );
}

function MapMeasureControl({ isDarkMode }: { isDarkMode: boolean }) {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const map = useMap();
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (isMeasuring && map) {
      // Add measurement functionality
      const drawControl = new L.Control.Draw({
        draw: {
          polygon: false,
          marker: false,
          circle: false,
          rectangle: false,
          circlemarker: false,
          polyline: {
            shapeOptions: {
              color: '#3b82f6',
              weight: 3,
            },
            metric: true,
            feet: false,
          },
        },
        edit: {
          featureGroup: featureGroupRef.current as L.FeatureGroup,
          edit: false,
          remove: true,
        },
      });

      map.addControl(drawControl);

      return () => {
        map.removeControl(drawControl);
      };
    }
  }, [isMeasuring, map]);

  const handleMeasurementClick = () => {
    setIsMeasuring(!isMeasuring);
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isMeasuring ? 'default' : 'outline'}
            size="icon"
            onClick={handleMeasurementClick}
            className={cn(
              'h-10 w-10 rounded-full backdrop-blur-md shadow-lg',
              isMeasuring
                ? 'bg-primary text-primary-foreground'
                : isDarkMode
                  ? 'bg-card/90 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                  : 'bg-white/90 border-muted hover:bg-white'
            )}
          >
            <Ruler className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isMeasuring ? 'Stop measuring' : 'Measure distances'}</p>
        </TooltipContent>
      </Tooltip>

      {isMeasuring && (
        <FeatureGroup
          ref={(el) => {
            featureGroupRef.current = el as L.FeatureGroup;
          }}
        >
          <EditControl
            position="topright"
            onCreated={(e) => {
              const layer = e.layer;
              if (layer instanceof L.Polyline) {
                const distanceInMeters = calculatePolylineDistance(layer);
                layer
                  .bindPopup(`Distance: ${formatDistance(distanceInMeters)}`)
                  .openPopup();
              }
            }}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polygon: false,
              polyline: true,
            }}
          />
        </FeatureGroup>
      )}
    </>
  );
}

// Helper function to calculate polyline distance
function calculatePolylineDistance(polyline: L.Polyline): number {
  const latlngs = polyline.getLatLngs() as L.LatLng[];
  let totalDistance = 0;

  for (let i = 1; i < latlngs.length; i++) {
    totalDistance += latlngs[i - 1].distanceTo(latlngs[i]);
  }

  return totalDistance;
}

// Helper function to format distance
function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  } else {
    return `${Math.round(meters)} m`;
  }
}

type TrafficPoint = {
  position: [number, number];
  radius: number;
  intensity: number;
};

function TrafficLayer({
  showTraffic,
  isDarkMode,
}: {
  showTraffic: boolean;
  isDarkMode: boolean;
}) {
  const map = useMap();
  const [trafficData, setTrafficData] = useState<TrafficPoint[]>([]);

  useEffect(() => {
    if (showTraffic) {
      // Simulate traffic data
      // In a real app, this would be fetched from a traffic API
      const bounds = map.getBounds();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      // Generate random traffic points
      const trafficPoints = [];
      for (let i = 0; i < 10; i++) {
        const lat = sw.lat + Math.random() * (ne.lat - sw.lat);
        const lng = sw.lng + Math.random() * (ne.lng - sw.lng);
        const intensity = Math.random(); // 0 to 1 (light to heavy)

        trafficPoints.push({
          position: [lat, lng] as [number, number],
          radius: 200 + Math.random() * 500,
          intensity,
        });
      }

      setTrafficData(trafficPoints);
    } else {
      setTrafficData([]);
    }
  }, [showTraffic, map]);

  if (!showTraffic) return null;

  return (
    <>
      {trafficData.map((point, index) => (
        <Circle
          key={index}
          center={[point.position[0], point.position[1]]}
          radius={point.radius}
          pathOptions={{
            color: getTrafficColor(point.intensity),
            fillOpacity: 0.4,
            weight: 2,
          }}
        >
          <Popup>
            <div className={cn(isDarkMode ? 'text-white' : 'text-black')}>
              <h4 className="font-medium">Traffic {index + 1}</h4>
              <p className="text-sm">
                {getTrafficDescription(point.intensity)}
              </p>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
}

function getTrafficColor(intensity: number): string {
  if (intensity < 0.3) return '#4ade80'; // Light traffic - green
  if (intensity < 0.7) return '#facc15'; // Medium traffic - yellow
  return '#ef4444'; // Heavy traffic - red
}

function getTrafficDescription(intensity: number): string {
  if (intensity < 0.3) return 'Light traffic';
  if (intensity < 0.7) return 'Moderate traffic';
  return 'Heavy traffic';
}

function ShareMapButton({
  position,
  locationName,
  isDarkMode,
}: {
  position: { lat: number; lng: number };
  locationName: string;
  isDarkMode: boolean;
}) {
  const shareMap = async () => {
    const shareUrl = `${window.location.origin}/maps?lat=${position.lat}&lng=${position.lng}&name=${encodeURIComponent(locationName)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${locationName} on Roamance`,
          text: `I found this amazing place: ${locationName}`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to clipboard
        copyToClipboard(shareUrl);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Map link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={shareMap}
          className={cn(
            'h-10 w-10 rounded-full backdrop-blur-md shadow-lg',
            isDarkMode
              ? 'bg-card/90 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
              : 'bg-white/90 border-muted hover:bg-white'
          )}
        >
          <Share className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Share this location</p>
      </TooltipContent>
    </Tooltip>
  );
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
  const [currentMapLayer, setCurrentMapLayer] =
    useState<keyof typeof mapLayers>('standard');
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [waypoints, setWaypoints] = useState<
    Array<{ lat: number; lng: number }>
  >([]);
  const [pois, setPois] = useState<
    Array<{
      name: string;
      category: string;
      icon: string;
      position: [number, number];
    }>
  >([]);

  // Move these functions outside of any hook that requires map context
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

  // Create a separate component for map controls that will be rendered inside MapContainer
  const MapControls = () => {
    const map = useMap(); // This is now safely inside the MapContainer context

    useEffect(() => {
      if (centerOnUser && userLocation) {
        map.setView([userLocation.lat, userLocation.lng], 15, {
          animate: true,
          duration: 1,
        });

        const event = new CustomEvent('userLocationCentered');
        window.dispatchEvent(event);
      }
    }, [centerOnUser, map]);

    return (
      <>
        <DarkModeMapLayer isDarkMode={isDarkMode} />
        <TrafficLayer showTraffic={showTraffic} isDarkMode={isDarkMode} />
      </>
    );
  };

  // Handle functions that don't need the map context
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
    if (center.lat !== 0 && center.lng !== 0) {
      const generatePOIs = () => {
        const genPois = [];
        for (let i = 0; i < 15; i++) {
          // Random offset between -0.01 and 0.01 (roughly 1km)
          const latOffset = (Math.random() - 0.5) * 0.02;
          const lngOffset = (Math.random() - 0.5) * 0.02;

          const category =
            poiCategories[Math.floor(Math.random() * poiCategories.length)];

          genPois.push({
            name: `${category.name} ${i + 1}`,
            category: category.name,
            icon: category.icon,
            position: [center.lat + latOffset, center.lng + lngOffset] as [
              number,
              number,
            ],
          });
        }
        setPois(genPois);
      };

      generatePOIs();
    }
  }, [center]);

  const handleSelectSearchResult = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 15);
      setSearchResults([]);
    }
  };

  // Create a wrapper for the map control buttons that will be outside MapContainer
  const MapControlWrapper = () => {
    // This component doesn't rely on useMap() or useLeafletContext()
    const shareMap = async () => {
      const shareUrl = `${window.location.origin}/maps?lat=${center.lat}&lng=${center.lng}&name=${encodeURIComponent(locationName)}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: `Check out ${locationName} on Roamance`,
            text: `I found this amazing place: ${locationName}`,
            url: shareUrl,
          });
        } catch (err) {
          console.error('Error sharing:', err);
          // Fallback to clipboard
          copyToClipboard(shareUrl);
        }
      } else {
        // Fallback for browsers that don't support Web Share API
        copyToClipboard(shareUrl);
      }
    };

    const copyToClipboard = (text: string) => {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert('Map link copied to clipboard!');
        })
        .catch((err) => {
          console.error('Could not copy text: ', err);
        });
    };

    return (
      <div className="absolute top-24 right-4 z-[1000] flex flex-col gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-10 w-10 rounded-full backdrop-blur-md shadow-lg',
                    isDarkMode
                      ? 'bg-card/90 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                      : 'bg-white/90 border-muted hover:bg-white'
                  )}
                >
                  <Layers className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Map Type</h4>
                  <RadioGroup
                    value={currentMapLayer}
                    onValueChange={(value) =>
                      setCurrentMapLayer(value as keyof typeof mapLayers)
                    }
                  >
                    {Object.entries(mapLayers).map(([key, layer]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <RadioGroupItem value={key} id={`layer-${key}`} />
                        <div>
                          <Label htmlFor={`layer-${key}`}>{layer.name}</Label>
                          <p className="text-xs text-muted-foreground">
                            {layer.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent>
            <p>Change map style</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                // Instead of using the MapMeasureControl component that has useMap,
                // we toggle a state that will be used inside MapContainer's children
                const event = new CustomEvent('toggle-measure');
                window.dispatchEvent(event);
              }}
              className={cn(
                'h-10 w-10 rounded-full backdrop-blur-md shadow-lg',
                isDarkMode
                  ? 'bg-card/90 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                  : 'bg-white/90 border-muted hover:bg-white'
              )}
            >
              <Ruler className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Measure distances</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showTraffic ? 'default' : 'outline'}
              size="icon"
              onClick={toggleTraffic}
              className={cn(
                'h-10 w-10 rounded-full backdrop-blur-md shadow-lg',
                showTraffic
                  ? 'bg-primary text-primary-foreground'
                  : isDarkMode
                    ? 'bg-card/90 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                    : 'bg-white/90 border-muted hover:bg-white'
              )}
            >
              <TrafficCone className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{showTraffic ? 'Hide traffic' : 'Show traffic'}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={shareMap}
              className={cn(
                'h-10 w-10 rounded-full backdrop-blur-md shadow-lg',
                isDarkMode
                  ? 'bg-card/90 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                  : 'bg-white/90 border-muted hover:bg-white'
              )}
            >
              <Share className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share this location</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  };

  // Create a component for measurement tools that will be inside MapContainer
  const MeasurementTools = () => {
    const map = useMap();
    const [isMeasuring, setIsMeasuring] = useState(false);
    const featureGroupRef = useRef<L.FeatureGroup | null>(null);

    useEffect(() => {
      const handleToggleMeasure = () => {
        setIsMeasuring((prev) => !prev);
      };

      window.addEventListener('toggle-measure', handleToggleMeasure);

      return () => {
        window.removeEventListener('toggle-measure', handleToggleMeasure);
      };
    }, []);

    useEffect(() => {
      if (isMeasuring && map) {
        // Add measurement functionality
        const drawControl = new L.Control.Draw({
          draw: {
            polygon: false,
            marker: false,
            circle: false,
            rectangle: false,
            circlemarker: false,
            polyline: {
              shapeOptions: {
                color: '#3b82f6',
                weight: 3,
              },
              metric: true,
              feet: false,
            },
          },
          edit: {
            featureGroup: featureGroupRef.current as L.FeatureGroup,
            edit: false,
            remove: true,
          },
        });

        map.addControl(drawControl);

        return () => {
          map.removeControl(drawControl);
        };
      }
    }, [isMeasuring, map]);

    return isMeasuring ? (
      <FeatureGroup
        ref={(el) => {
          featureGroupRef.current = el as L.FeatureGroup;
        }}
      >
        <EditControl
          position="topright"
          onCreated={(e) => {
            const layer = e.layer;
            if (layer instanceof L.Polyline) {
              const distanceInMeters = calculatePolylineDistance(layer);
              layer
                .bindPopup(`Distance: ${formatDistance(distanceInMeters)}`)
                .openPopup();
            }
          }}
          draw={{
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
            polygon: false,
            polyline: true,
          }}
        />
      </FeatureGroup>
    ) : null;
  };

  return (
    <TooltipProvider delayDuration={300}>
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
            attribution={mapLayerAttribution[currentMapLayer]}
            url={
              isDarkMode
                ? mapLayers[currentMapLayer].dark
                : mapLayers[currentMapLayer].light
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
                    Coordinates: {center.lat.toFixed(4)},{' '}
                    {center.lng.toFixed(4)}
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
                  <StreetViewButton position={center} isDarkMode={isDarkMode} />
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

          {/* Display waypoints */}
          {waypoints.map((wp, index) => (
            <Marker
              key={`waypoint-${index}`}
              position={[wp.lat, wp.lng]}
              icon={
                new L.Icon({
                  iconUrl:
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAyNCAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDM2QzEyIDM2IDI0IDIzLjcyMyAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDIzLjcyMyAxMiAzNiAxMiAzNloiIGZpbGw9IiM2MzY2RjEiLz4KPGNpcmxlIGN4PSIxMiIgY3k9IjEyIiByPSI2IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
                  iconSize: [24, 36],
                  iconAnchor: [12, 36],
                  popupAnchor: [0, -36],
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
                    Waypoint {index + 1}
                  </h3>
                  <p
                    className={cn(
                      'text-sm',
                      isDarkMode ? 'text-muted-foreground' : ''
                    )}
                  >
                    {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="mt-2 w-full"
                        onClick={() => removeWaypoint(index)}
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
          ))}

          {/* Display POIs */}
          {pois.map((poi, index) => (
            <Marker
              key={`poi-${index}`}
              position={poi.position}
              icon={
                new L.DivIcon({
                  html: `<div style="font-size: 18px; background-color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);" title="${poi.name}">${poi.icon}</div>`,
                  className: '',
                  iconSize: [30, 30],
                  iconAnchor: [15, 15],
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
                    {poi.name}
                  </h3>
                  <p
                    className={cn(
                      'text-sm',
                      isDarkMode ? 'text-muted-foreground' : ''
                    )}
                  >
                    Category: {poi.category}
                  </p>
                  <div className="flex flex-col gap-2 mt-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="default"
                          className="w-full"
                          onClick={() => {
                            if (mapRef.current) {
                              mapRef.current.setView(poi.position, 16);
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

                    {directions && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              addWaypoint(poi.position[0], poi.position[1])
                            }
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
          ))}

          <MapController
            center={center}
            userLocation={userLocation}
            directions={directions}
            onMapLoaded={onMapLoaded}
            waypoints={waypoints}
          />

          {/* These components now safely use the useMap() hook within MapContainer */}
          <MapControls />
          <MeasurementTools />
        </MapContainer>

        {/* Components outside of MapContainer that don't use Leaflet hooks */}
        <SearchResults
          results={searchResults}
          onSelect={handleSelectSearchResult}
          isDarkMode={isDarkMode}
          isSearching={isSearching}
        />

        {/* Controls that are rendered outside of MapContainer that don't use Leaflet hooks */}
        <MapControlWrapper />

        {/* Waypoints panel - only show when directions are active */}
        {directions && waypoints.length > 0 && (
          <Card
            className={cn(
              'absolute left-4 bottom-20 z-[1000] p-4 max-w-xs backdrop-blur-md border',
              isDarkMode
                ? 'bg-card/80 border-card-foreground/10'
                : 'bg-white/90 border-muted'
            )}
          >
            <h3 className="font-medium text-sm mb-2">
              Waypoints ({waypoints.length})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {waypoints.map((wp, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-xs"
                >
                  <span>Waypoint {index + 1}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 p-0"
                        onClick={() => removeWaypoint(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove waypoint {index + 1}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => setWaypoints([])}
                >
                  Clear All
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove all waypoints from route</p>
              </TooltipContent>
            </Tooltip>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
