'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StreetViewButtonProps {
  position: { lat: number; lng: number };
  isDarkMode: boolean;
}

export function StreetViewButton({
  position,
  isDarkMode,
}: StreetViewButtonProps) {
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
