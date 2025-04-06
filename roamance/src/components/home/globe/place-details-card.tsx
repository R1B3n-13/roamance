import { cn } from '@/lib/utils';
import { TouristPlace } from '@/types';
import { getPlaceDetails } from '@/api/places-api';
import { motion } from 'framer-motion';
import { Globe, MapPin, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface PlaceDetailsCardProps {
  selectedPlace: TouristPlace;
  detailsPosition: 'left' | 'right';
}

export const PlaceDetailsCard = ({
  selectedPlace,
  detailsPosition,
}: PlaceDetailsCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [enrichedPlace, setEnrichedPlace] = useState<TouristPlace | null>(null);

  // Get additional details when a place is selected
  useEffect(() => {
    const fetchAdditionalDetails = async () => {
      // Only fetch for API sourced places - they have 'api' in the ID
      if (selectedPlace.id.includes('api-')) {
        setIsLoading(true);
        try {
          // Extract country code from country name if available
          const countryParts = selectedPlace.country.split(',');
          const countryCode = countryParts.length > 1 ? countryParts[1].trim() : undefined;

          const details = await getPlaceDetails(selectedPlace.name, countryCode);
          if (details) {
            setEnrichedPlace(details);
          }
        } catch (error) {
          console.error('Error fetching place details:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setEnrichedPlace(null);
      }
    };

    fetchAdditionalDetails();
  }, [selectedPlace.id, selectedPlace.name, selectedPlace.country]);

  // Use enriched data if available, otherwise use the selected place
  const displayPlace = enrichedPlace || selectedPlace;

  // Extract color name from the CSS variable
  const colorName = displayPlace.color.split('--')[1] || 'primary';

  // Format coordinates to be more readable
  const formatCoordinate = (coord: number): string => {
    const absCoord = Math.abs(coord);
    const degrees = Math.floor(absCoord);
    const minutes = Math.floor((absCoord - degrees) * 60);
    return `${degrees}°${minutes}'`;
  };

  const latitude = `${formatCoordinate(displayPlace.lat)}${displayPlace.lat >= 0 ? 'N' : 'S'}`;
  const longitude = `${formatCoordinate(displayPlace.lng)}${displayPlace.lng >= 0 ? 'E' : 'W'}`;

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
      <div className="bg-background/80 backdrop-blur-md rounded-xl border shadow-lg overflow-hidden">
        {displayPlace.image && (
          <div className="relative w-full h-[150px]">
            <Image
              src={displayPlace.image}
              alt={displayPlace.name}
              fill
              className="object-cover"
              sizes="(max-width: 300px) 100vw, 300px"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div
              className={cn(
                'p-2 rounded-lg',
                `bg-${colorName}/20`
              )}
            >
              <MapPin
                className={cn(
                  'h-5 w-5',
                  `text-${colorName}`
                )}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold">{displayPlace.name}</h3>
              <p className="text-sm text-muted-foreground">
                {displayPlace.country}
              </p>
            </div>
          </div>

          <p className="mb-4">{displayPlace.description}</p>

          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            <span>{latitude}, {longitude}</span>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${displayPlace.lat},${displayPlace.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            Explore more about {displayPlace.name}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};
