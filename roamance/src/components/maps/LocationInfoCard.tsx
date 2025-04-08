'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MapPin, Navigation, Share2, X } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface LocationInfoCardProps {
  visible: boolean;
  locationName: string;
  center: { lat: number; lng: number };
  isDarkMode: boolean;
}

export function LocationInfoCard({
  visible,
  locationName,
  center,
  isDarkMode,
}: LocationInfoCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!visible || center.lat === 0) return null;

  const handleGetDirections = () => {
    const event = new CustomEvent('getDirections');
    window.dispatchEvent(event);
  };

  const handleShare = () => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: `${locationName} on Roamance`,
        text: `Check out ${locationName} on Roamance Maps!`,
        url: `${window.location.origin}/maps?lat=${center.lat}&lng=${center.lng}&name=${encodeURIComponent(locationName)}`,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(
        `${window.location.origin}/maps?lat=${center.lat}&lng=${center.lng}&name=${encodeURIComponent(locationName)}`
      );
      // In a real app, you'd want to show a toast notification here
    }
  };

  return (
    <motion.div
      className="absolute top-4 left-4 z-[1000] max-w-xs"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "backdrop-blur-md border shadow-lg p-0 overflow-hidden",
          isDarkMode
            ? "bg-card/50 border-card-foreground/10 shadow-black/10"
            : "bg-white/80 border-muted/30 shadow-black/5"
        )}
      >
        <div className="relative">
          {/* Card header with decorative elements */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1.5",
              isDarkMode ? "bg-primary/40" : "bg-primary/30"
            )}
          />

          <div className="pt-4 px-4 pb-3 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-full",
                isDarkMode ? "bg-primary/20" : "bg-primary/10"
              )}>
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold leading-tight mb-1.5">{locationName}</h3>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={cn(
                    "text-xs font-normal",
                    isDarkMode
                      ? "bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                      : "bg-primary/5 hover:bg-primary/10 text-primary/90 border-primary/20"
                  )}>
                    Destination
                  </Badge>
                  <Badge variant="outline" className={cn(
                    "text-xs font-normal",
                    isDarkMode
                      ? "bg-muted/30 text-muted-foreground border-muted/50"
                      : "bg-muted/30 text-muted-foreground border-muted/50"
                  )}>
                    {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-full"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <X className="h-4 w-4" /> : <Navigation className="h-4 w-4" />}
            </Button>
          </div>

          {/* Expanded section with actions */}
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "px-4 pb-4 border-t",
                isDarkMode ? "border-muted/20" : "border-muted/30"
              )}
            >
              <div className="pt-3 flex items-center gap-2">
                <Button
                  className={cn(
                    "flex-1 h-9 rounded-full gap-2",
                    isDarkMode
                      ? "bg-primary/80 hover:bg-primary/70"
                      : ""
                  )}
                  onClick={handleGetDirections}
                >
                  <Navigation className="h-4 w-4" />
                  <span>Directions</span>
                </Button>

                <Button
                  variant="outline"
                  className={cn(
                    "h-9 w-9 p-0 rounded-full",
                    isDarkMode
                      ? "border-primary/20 hover:bg-primary/10"
                      : "border-primary/10 hover:bg-primary/5"
                  )}
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className={cn(
                "text-xs mt-3 px-3 py-2 rounded-md",
                isDarkMode ? "bg-muted/30 text-muted-foreground" : "bg-muted/20 text-muted-foreground"
              )}>
                <p>Tap on the map to view more details and discover nearby points of interest.</p>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
