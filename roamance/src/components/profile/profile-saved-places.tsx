'use client';

import { useState } from 'react';
import { User } from '@/types/auth';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Bookmark, MapPin, Star, Search, Globe, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProfileSavedPlacesProps {
  user: User | null;
  loading: boolean;
}

// Mock saved places data
const mockSavedPlaces = [
  {
    id: '1',
    name: 'Santorini, Greece',
    category: 'beach',
    rating: 4.9,
    saved: '2024-10-15',
    description:
      'Beautiful island with white buildings and blue domes overlooking the sea',
    tags: ['island', 'romantic', 'views'],
    image: '/santorini.jpg',
  },
  {
    id: '2',
    name: 'Mount Fuji, Japan',
    category: 'mountain',
    rating: 4.8,
    saved: '2024-11-05',
    description: "Japan's highest mountain and most iconic landmark",
    tags: ['hiking', 'nature', 'landmark'],
    image: '/fuji.jpg',
  },
  {
    id: '3',
    name: 'Grand Canyon, USA',
    category: 'nature',
    rating: 4.7,
    saved: '2024-09-22',
    description: 'One of the most spectacular natural wonders of the world',
    tags: ['hiking', 'views', 'nature'],
    image: '/grand-canyon.jpg',
  },
  {
    id: '4',
    name: 'Kyoto, Japan',
    category: 'city',
    rating: 4.6,
    saved: '2024-08-30',
    description:
      'Historic city known for its temples, gardens, and traditional architecture',
    tags: ['culture', 'history', 'food'],
    image: '/kyoto.jpg',
  },
  {
    id: '5',
    name: 'Amalfi Coast, Italy',
    category: 'beach',
    rating: 4.8,
    saved: '2024-07-15',
    description: 'Scenic coastline with colorful villages perched on cliffs',
    tags: ['scenic', 'food', 'romantic'],
    image: '/amalfi.jpg',
  },
  {
    id: '6',
    name: 'Serengeti National Park, Tanzania',
    category: 'nature',
    rating: 4.9,
    saved: '2024-06-18',
    description: 'Home to the annual migration of wildebeest and zebra',
    tags: ['safari', 'wildlife', 'nature'],
    image: '/serengeti.jpg',
  },
];

export function ProfileSavedPlaces({ loading }: ProfileSavedPlacesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filters = [
    { id: 'all', label: 'All Places', icon: Globe },
    { id: 'beach', label: 'Beaches', icon: Umbrella },
    { id: 'mountain', label: 'Mountains', icon: Mountain },
    { id: 'city', label: 'Cities', icon: Building },
    { id: 'nature', label: 'Nature', icon: Leaf },
  ];

  // Filter places based on search term and category filter
  const filteredPlaces = mockSavedPlaces.filter((place) => {
    const matchesSearch =
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      !activeFilter ||
      activeFilter === 'all' ||
      place.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search saved places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-wrap">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'flex items-center gap-1.5',
                  activeFilter === filter.id &&
                    (filter.id === 'beach'
                      ? 'bg-sunset'
                      : filter.id === 'mountain'
                        ? 'bg-forest'
                        : filter.id === 'nature'
                          ? 'bg-forest'
                          : filter.id === 'city'
                            ? 'bg-ocean'
                            : 'bg-primary')
                )}
                onClick={() =>
                  setActiveFilter(activeFilter === filter.id ? null : filter.id)
                }
              >
                <filter.icon className="h-3.5 w-3.5" />
                <span>{filter.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {filteredPlaces.length} saved places
          </p>

          <Button
            variant="ghost"
            size="sm"
            className="text-sm flex gap-1.5 items-center"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>More filters</span>
          </Button>
        </div>
      </div>

      {filteredPlaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <SavedPlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <EmptyState
          searchTerm={searchTerm}
          activeFilter={activeFilter}
          onClear={() => {
            setSearchTerm('');
            setActiveFilter(null);
          }}
        />
      )}
    </motion.div>
  );
}

interface SavedPlaceCardProps {
  place: {
    id: string;
    name: string;
    category: string;
    rating: number;
    description: string;
    tags: string[];
    image: string;
  };
}

function SavedPlaceCard({ place }: SavedPlaceCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all duration-300">
      {/* Place Image */}
      <div className="h-48 relative overflow-hidden">
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-gradient-to-tr',
            place.category === 'beach'
              ? 'from-sunset/50 to-sand/50'
              : place.category === 'mountain'
                ? 'from-forest/50 to-forest-dark/50'
                : place.category === 'nature'
                  ? 'from-forest/50 to-forest-light/50'
                  : 'from-ocean/50 to-ocean-dark/50'
          )}
        >
          <p className="text-white text-xl font-bold">{place.name}</p>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <Badge
            className={cn(
              'capitalize',
              place.category === 'beach'
                ? 'bg-sunset text-white'
                : place.category === 'mountain'
                  ? 'bg-forest text-white'
                  : place.category === 'nature'
                    ? 'bg-forest-light text-forest-dark'
                    : 'bg-ocean text-white'
            )}
          >
            {place.category}
          </Badge>
        </div>

        {/* Rating badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-foreground flex items-center gap-1 font-medium">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {place.rating}
          </Badge>
        </div>

        {/* Bookmark button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 text-sunset"
        >
          <Bookmark className="h-4 w-4 fill-sunset" />
        </Button>
      </div>

      {/* Place Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold mb-1 group-hover:text-ocean transition-colors">
              {place.name}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>{place.name.split(',')[1]?.trim()}</span>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground text-sm mt-3 line-clamp-2">
          {place.description}
        </p>

        {/* Tags */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {place.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-secondary/15 hover:bg-secondary/30 cursor-pointer"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}

function EmptyState({
  searchTerm,
  activeFilter,
  onClear,
}: {
  searchTerm: string;
  activeFilter: string | null;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 border rounded-lg border-dashed text-center px-4">
      <Bookmark className="h-12 w-12 text-muted-foreground mb-3 opacity-30" />
      <h3 className="text-lg font-medium mb-1">No saved places found</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {searchTerm || activeFilter
          ? `No places match your current search or filters.`
          : `You haven't saved any places yet. Start exploring to add places to your collection!`}
      </p>

      {(searchTerm || activeFilter) && (
        <Button
          onClick={onClear}
          variant="outline"
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

// Since these icons might not be imported at the top, defining them here
function Umbrella(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12a10.06 10.06 1 0 0-20 0Z" />
      <path d="M12 12v8a2 2 0 0 0 4 0" />
      <path d="M12 2v1" />
    </svg>
  );
}

function Mountain(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}

function Building(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function Leaf(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
