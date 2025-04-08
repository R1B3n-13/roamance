'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Layers, Ruler, TrafficCone, Share, Navigation } from 'lucide-react';

interface FeatureHelpCardProps {
  featureName: string;
  description: string;
  isDarkMode: boolean;
}

export function FeatureHelpCard({
  featureName,
  description,
  isDarkMode,
}: FeatureHelpCardProps) {
  // Map feature icons
  const featureIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    layers: Layers,
    measure: Ruler,
    traffic: TrafficCone,
    share: Share,
    waypoints: Navigation,
  };

  const Icon = featureIcons[featureName] || Layers;

  return (
    <Card
      className={cn(
        'absolute bottom-20 right-4 z-[1000] p-3 max-w-[200px] backdrop-blur-md border transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-5',
        isDarkMode
          ? 'bg-card/80 border-card-foreground/10'
          : 'bg-white/90 border-muted'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'p-2 rounded-full',
            isDarkMode ? 'bg-primary/20' : 'bg-primary/10'
          )}
        >
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-medium capitalize">{featureName}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}
