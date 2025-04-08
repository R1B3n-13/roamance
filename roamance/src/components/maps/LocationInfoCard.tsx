'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MapPin } from 'lucide-react';

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
  if (!visible || center.lat === 0) return null;

  return (
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
  );
}
