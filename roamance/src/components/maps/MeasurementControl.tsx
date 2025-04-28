'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Ruler } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';

import type L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import dynamic from 'next/dynamic';

const FeatureGroup = dynamic(
  () => import('react-leaflet').then((mod) => mod.FeatureGroup),
  { ssr: false }
);

const EditControl = dynamic(
  () => import('react-leaflet-draw').then((mod) => mod.EditControl),
  { ssr: false }
);

interface MeasurementControlProps {
  isDarkMode: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function MeasurementControl({
  isDarkMode,
  onMouseEnter,
  onMouseLeave,
}: MeasurementControlProps) {
  const [isMeasuring, setIsMeasuring] = useState(false);

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
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <Ruler className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isMeasuring ? 'Stop measuring' : 'Measure distances'}</p>
        </TooltipContent>
      </Tooltip>

      {isMeasuring && <MeasurementTools />}
    </>
  );
}

export function MeasurementTools() {
  const map = useMap();
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const [leaflet, setLeaflet] = useState<typeof L | null>(null);

  useEffect(() => {
    if (map && !leaflet) {
      // Dynamically import Leaflet and its dependencies
      Promise.all([import('leaflet'), import('leaflet-draw')]).then(([L]) => {
        setLeaflet(L.default);
      });
    }
  }, [map, leaflet]);

  useEffect(() => {
    if (map && leaflet && featureGroupRef.current) {
      const DrawControl = leaflet.Control.Draw;

      const drawControl = new DrawControl({
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
          featureGroup: featureGroupRef.current,
          edit: false,
          remove: true,
        },
      });

      map.addControl(drawControl);

      return () => {
        map.removeControl(drawControl);
      };
    }
  }, [map, leaflet]);

  if (!leaflet) {
    return null;
  }

  return (
    <FeatureGroup
      ref={(el) => {
        featureGroupRef.current = el as L.FeatureGroup;
      }}
    >
      <EditControl
        position="topright"
        onCreated={(e) => {
          if (!leaflet) return;

          const layer = e.layer;
          if (
            layer instanceof leaflet.Polyline &&
            !(layer instanceof leaflet.Polygon) &&
            !(layer instanceof leaflet.Rectangle)
          ) {
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
  );
}

// Helper function to calculate polyline distance
export function calculatePolylineDistance(polyline: L.Polyline): number {
  const latlngs = polyline.getLatLngs() as L.LatLng[];
  let totalDistance = 0;

  for (let i = 1; i < latlngs.length; i++) {
    totalDistance += latlngs[i - 1].distanceTo(latlngs[i]);
  }

  return totalDistance;
}

// Helper function to format distance
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  } else {
    return `${Math.round(meters)} m`;
  }
}
