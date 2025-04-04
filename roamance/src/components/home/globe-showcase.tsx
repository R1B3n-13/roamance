'use client';

import { SectionHeading } from '@/components/common/section-heading';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { GlobeMethods } from 'react-globe.gl';
import { touristPlaces } from '@/constants';
import { TouristPlace } from '@/types';

const Globe = dynamic(
  () => import('react-globe.gl').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] w-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    ),
  }
);

export function GlobeShowcase() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [places, setPlaces] = useState<TouristPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<TouristPlace | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const timer = setTimeout(() => {
      setPlaces(touristPlaces);
    }, 1000);

    let interval: NodeJS.Timeout;
    const startAutoRotation = () => {
      interval = setInterval(() => {
        if (globeRef.current) {
          const pov = globeRef.current.pointOfView();
          const currentLng = pov ? pov.lng : 0;
          globeRef.current.pointOfView({
            lat: 25,
            lng: currentLng + 1,
            altitude: 2.5,
          });
        }
      }, 100);
    };

    const stopInterval = () => clearInterval(interval);

    if (isClient) {
      setTimeout(() => {
        startAutoRotation();
      }, 2000);
    }

    return () => {
      clearTimeout(timer);
      stopInterval();
    };
  }, [isClient]);

  const handlePlaceHover = (place: TouristPlace | null) => {
    setSelectedPlace(place);
    if (globeRef.current && place) {
      globeRef.current.pointOfView(
        {
          lat: place.lat,
          lng: place.lng,
          altitude: 1.8,
        },
        1000
      );
    }
  };

  return (
    <section className="py-24 overflow-hidden relative bg-background/80">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-forest/5 blur-3xl"></div>
        <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] rounded-full bg-sunset/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <SectionHeading
          title="Explore the World"
          titleHighlight="World"
          subtitle="Discover breathtaking destinations around the globe with our interactive 3D map"
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-12">
          <div className="lg:w-2/3 h-[500px] flex items-center justify-center relative">
            {isClient && (
              <Globe
                ref={globeRef}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                backgroundImageUrl=""
                backgroundColor="rgba(0,0,0,0)"
                pointsData={places}
                pointLat="lat"
                pointLng="lng"
                pointColor="color"
                pointAltitude={0.01}
                pointRadius="size"
                pointsMerge={true}
                pointLabel={(d) => {
                  const place = d as TouristPlace;
                  return `
                <div class="bg-background/90 backdrop-blur-md p-2 rounded-lg border shadow-lg text-sm">
                  <b>${place.name}</b><br/>
                  ${place.country}
                </div>
              `;
                }}
                onPointHover={(point) =>
                  handlePlaceHover(point as TouristPlace | null)
                }
                width={500}
                height={500}
              />
            )}
          </div>

          <div className="lg:w-1/3 px-4">
            {selectedPlace ? (
              <motion.div
                className="bg-background/80 backdrop-blur-md p-6 rounded-xl border shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                key={selectedPlace.id}
              >
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
              </motion.div>
            ) : (
              <div className="bg-background/80 backdrop-blur-md p-6 rounded-xl border h-full flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-4">Interactive Globe</h3>
                <p className="text-muted-foreground">
                  Hover over the markers to learn more about some of the
                  world&apos;s most famous destinations. Click to explore
                  further details about each location.
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  The globe shows 7 of the world&apos;s most iconic tourist
                  destinations across different continents.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
