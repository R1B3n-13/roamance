'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Ruler, TrafficCone } from 'lucide-react';
import { MapLayerControl } from './MapLayerControl';
import { ShareMapButton } from './ShareMapButton';

interface MapControlButtonsProps {
  currentMapLayer: 'standard' | 'satellite' | 'terrain' | 'transport';
  setCurrentMapLayer: (
    layer: 'standard' | 'satellite' | 'terrain' | 'transport'
  ) => void;
  showTraffic: boolean;
  toggleTraffic: () => void;
  isDarkMode: boolean;
  position: { lat: number; lng: number };
  locationName: string;
}

export function MapControlButtons({
  currentMapLayer,
  setCurrentMapLayer,
  showTraffic,
  toggleTraffic,
  isDarkMode,
  position,
  locationName,
}: MapControlButtonsProps) {
  // Helper function to emit hover events for contextual help
  const emitMapControlHover = (feature: string) => {
    const event = new CustomEvent('mapControlHover', { detail: { feature } });
    window.dispatchEvent(event);
  };

  const emitMapControlLeave = () => {
    const event = new CustomEvent('mapControlLeave');
    window.dispatchEvent(event);
  };

  return (
    <div className="absolute top-24 right-4 z-[1000] flex flex-col gap-3">
      <MapLayerControl
        currentLayer={currentMapLayer}
        setCurrentLayer={setCurrentMapLayer}
        isDarkMode={isDarkMode}
        onMouseEnter={() => emitMapControlHover('layers')}
        onMouseLeave={emitMapControlLeave}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const event = new CustomEvent('toggle-measure');
              window.dispatchEvent(event);
            }}
            className={cn(
              'h-10 w-10 rounded-full backdrop-blur-md shadow-lg',
              isDarkMode
                ? 'bg-card/90 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50'
                : 'bg-white/90 border-muted hover:bg-white'
            )}
            onMouseEnter={() => emitMapControlHover('measure')}
            onMouseLeave={emitMapControlLeave}
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
            onMouseEnter={() => emitMapControlHover('traffic')}
            onMouseLeave={emitMapControlLeave}
          >
            <TrafficCone className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{showTraffic ? 'Hide traffic' : 'Show traffic'}</p>
        </TooltipContent>
      </Tooltip>

      <ShareMapButton
        position={position}
        locationName={locationName}
        isDarkMode={isDarkMode}
        onMouseEnter={() => emitMapControlHover('share')}
        onMouseLeave={emitMapControlLeave}
      />
    </div>
  );
}
