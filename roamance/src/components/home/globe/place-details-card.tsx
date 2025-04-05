import { cn } from '@/lib/utils';
import { TouristPlace } from '@/types';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface PlaceDetailsCardProps {
  selectedPlace: TouristPlace;
  detailsPosition: 'left' | 'right';
}

export const PlaceDetailsCard = ({
  selectedPlace,
  detailsPosition,
}: PlaceDetailsCardProps) => {
  return (
    <motion.div
      className={cn(
        'absolute top-1/2 transform -translate-y-1/2 w-[300px] z-20',
        detailsPosition === 'left' ? 'left-8' : 'right-8'
      )}
      initial={{ opacity: 0, x: detailsPosition === 'left' ? -50 : 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: detailsPosition === 'left' ? -50 : 50 }}
      transition={{ duration: 0.3 }}
      key={`${selectedPlace.id}-${detailsPosition}`}
    >
      <div className="bg-background/80 backdrop-blur-md p-6 rounded-xl border shadow-lg">
        <div className="flex items-start gap-3 mb-4">
          <div
            className={cn(
              'p-2 rounded-lg',
              `bg-${selectedPlace.color.split('--')[1]}/20`
            )}
          >
            <MapPin
              className={cn(
                'h-5 w-5',
                `text-${selectedPlace.color.split('--')[1]}`
              )}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold">{selectedPlace.name}</h3>
            <p className="text-sm text-muted-foreground">
              {selectedPlace.country}
            </p>
          </div>
        </div>
        <p className="mb-4">{selectedPlace.description}</p>
        <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors">
          Explore more about {selectedPlace.name}
        </button>
      </div>
    </motion.div>
  );
};
