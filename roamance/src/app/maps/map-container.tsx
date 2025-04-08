'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
// Import Leaflet Draw CSS for the measurement tools
import 'leaflet-draw/dist/leaflet.draw.css';
import { Info, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-100">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-16 w-16 bg-slate-300 rounded-full mb-4 flex items-center justify-center">
          <MapPin className="h-8 w-8 text-slate-400" />
        </div>
        <div className="h-4 w-48 bg-slate-300 rounded"></div>
        <div className="h-3 w-64 bg-slate-300 rounded mt-2"></div>
      </div>
    </div>
  )
});

interface MapContainerProps {
  center: { lat: number; lng: number };
  locationName: string;
  userLocation: { lat: number; lng: number } | null;
  searchQuery: string;
  directions: boolean;
  isDarkMode: boolean;
  centerOnUser?: boolean;
}

export function MapContainer({
  center,
  locationName,
  userLocation,
  searchQuery,
  directions,
  isDarkMode,
  centerOnUser
}: MapContainerProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [infoCardVisible, setInfoCardVisible] = useState(true);
  const [mapFeatureHelp, setMapFeatureHelp] = useState<string | null>(null);

  // Set up tooltips for map features
  const mapFeatures = {
    layers: "Switch between map styles like Standard, Satellite, Terrain, and Transport",
    measure: "Measure distances on the map by drawing lines",
    traffic: "Show simulated traffic conditions in the area",
    share: "Share this location with others or copy a link to it",
    waypoints: "Add stops along your route when getting directions"
  };

  useEffect(() => {
    if (mapLoaded) {
      const timer = setTimeout(() => {
        setInfoCardVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [mapLoaded]);

  useEffect(() => {
    const handleGetDirections = () => {
      const event = new CustomEvent('getDirections');
      window.dispatchEvent(event);
    };

    window.addEventListener('getDirections', handleGetDirections);

    return () => {
      window.removeEventListener('getDirections', handleGetDirections);
    };
  }, []);

  return (
    <div className="h-full w-full relative">
      {/* Info card about the current location */}
      {infoCardVisible && mapLoaded && center.lat !== 0 && (
        <Card className={cn(
          "absolute top-20 left-4 z-[1000] p-4 max-w-xs backdrop-blur-md shadow-lg transition-all duration-300 animate-in fade-in-0 slide-in-from-left-5 border",
          isDarkMode
            ? "bg-card/80 border-card-foreground/10"
            : "bg-white/90 border-muted"
        )}>
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isDarkMode ? "bg-primary/20" : "bg-primary/10"
            )}>
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{locationName}</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant={isDarkMode ? "default" : "outline"} className={cn(
                  "text-xs font-normal",
                  isDarkMode
                    ? "bg-primary/20 text-primary-foreground border-primary/30"
                    : "bg-primary/10 text-primary border-primary/30"
                )}>
                  Destination
                </Badge>
                <Badge variant="outline" className={cn(
                  "text-xs font-normal",
                  isDarkMode
                    ? "bg-muted/30 text-muted-foreground border-muted/50"
                    : "bg-muted/50 text-muted-foreground border-muted/70"
                )}>
                  {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Features help tooltip */}
      <TooltipProvider>
        <div className="absolute bottom-4 right-4 z-[1000]">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "p-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-105",
                isDarkMode
                  ? "bg-card/80 border border-primary/30 text-primary"
                  : "bg-white/90 border border-muted text-muted-foreground"
              )}>
                <Info className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-2">
                <h4 className="font-medium">Map Features</h4>
                <ul className="space-y-1 text-sm">
                  {Object.entries(mapFeatures).map(([key, description]) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className="font-medium capitalize">{key}:</span>
                      <span className="text-muted-foreground">{description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <LeafletMap
        center={center}
        locationName={locationName}
        userLocation={userLocation}
        searchQuery={searchQuery}
        directions={directions}
        onMapLoaded={() => setMapLoaded(true)}
        isDarkMode={isDarkMode}
        centerOnUser={centerOnUser}
      />
    </div>
  );
}
