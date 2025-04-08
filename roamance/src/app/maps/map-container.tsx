'use client';

import { FeatureHelpCard } from '@/components/maps/FeatureHelpCard';
import { LocationInfoCard } from '@/components/maps/LocationInfoCard';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Info, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import the LeafletMap component to avoid SSR issues
const LeafletMap = dynamic(() => import('@/components/maps/LeafletMap'), {
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
  ),
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
  centerOnUser,
}: MapContainerProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [infoCardVisible, setInfoCardVisible] = useState(true);
  const [mapFeatureHelp, setMapFeatureHelp] = useState<string | null>(null);

  // Set up tooltips for map features
  const mapFeatures = {
    layers:
      'Switch between map styles like Standard, Satellite, Terrain, and Transport',
    measure: 'Measure distances on the map by drawing lines',
    traffic: 'Show simulated traffic conditions in the area',
    share: 'Share this location with others or copy a link to it',
    waypoints: 'Add stops along your route when getting directions',
  };

  useEffect(() => {
    if (mapLoaded) {
      const timer = setTimeout(() => {
        setInfoCardVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [mapLoaded]);

  // Listen for map control hover events
  useEffect(() => {
    const handleMapControlHover = (e: Event) => {
      setMapFeatureHelp((e as CustomEvent).detail.feature);
    };

    const handleMapControlLeave = () => {
      // Add a small timeout before hiding to make the UI feel smoother
      setTimeout(() => setMapFeatureHelp(null), 100);
    };

    window.addEventListener('mapControlHover', handleMapControlHover);
    window.addEventListener('mapControlLeave', handleMapControlLeave);

    return () => {
      window.removeEventListener('mapControlHover', handleMapControlHover);
      window.removeEventListener('mapControlLeave', handleMapControlLeave);
    };
  }, []);

  return (
    <div className="h-full w-full relative">
      {/* Location info card */}
      <LocationInfoCard
        visible={infoCardVisible && mapLoaded}
        locationName={locationName}
        center={center}
        isDarkMode={isDarkMode}
      />

      {/* Feature help card */}
      {mapFeatureHelp && (
        <FeatureHelpCard
          featureName={mapFeatureHelp}
          description={mapFeatures[mapFeatureHelp as keyof typeof mapFeatures]}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Map help tooltip */}
      <TooltipProvider>
        <div className="absolute bottom-4 right-4 z-[1000]">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'p-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-105',
                  isDarkMode
                    ? 'bg-card/80 border border-primary/30 text-primary'
                    : 'bg-white/90 border border-muted text-muted-foreground'
                )}
              >
                <Info className="h-5 w-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-xs z-[2000] backdrop-blur-sm border border-primary/20 shadow-lg p-0 overflow-hidden"
              sideOffset={5}
            >
              <div className={cn(
                "space-y-3",
                isDarkMode
                  ? "bg-card/95 text-card-foreground"
                  : "bg-white/95"
              )}>
                <div className={cn(
                  "px-4 py-2.5 border-b",
                  isDarkMode ? "border-primary/20" : "border-muted/50"
                )}>
                  <h4 className="font-medium text-sm flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    <span>Map Features</span>
                  </h4>
                </div>
                <ul className="px-4 pb-3 space-y-2 text-xs">
                  {Object.entries(mapFeatures).map(([key, description]) => (
                    <li key={key} className="flex items-start gap-2">
                      <span className={cn(
                        "font-medium capitalize flex-shrink-0 px-1.5 py-0.5 rounded text-xs",
                        isDarkMode
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {key}
                      </span>
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
