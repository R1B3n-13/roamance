'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    if (mapLoaded) {
      const timer = setTimeout(() => {
        setInfoCardVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [mapLoaded]);

  return (
    <div className="h-full w-full relative">
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
