'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Itinerary } from '@/types/itinerary';
import { differenceInDays, format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Eye,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ItineraryCardProps {
  itinerary: Itinerary;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ItineraryCard({
  itinerary,
  onEdit,
  onDelete,
}: ItineraryCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  // Calculate status
  const now = new Date();
  const startDate = parseISO(itinerary.start_date);
  const endDate = parseISO(itinerary.end_date);
  let status: 'upcoming' | 'ongoing' | 'past';

  if (startDate > now) {
    status = 'upcoming';
  } else if (endDate < now) {
    status = 'past';
  } else {
    status = 'ongoing';
  }

  // Calculate days until or days since
  const daysUntil = differenceInDays(startDate, now);
  const daysSince = differenceInDays(now, endDate);

  // Calculate trip duration
  const duration = differenceInDays(endDate, startDate) + 1;

  // Determine primary location
  const primaryLocation =
    itinerary.locations && itinerary.locations.length > 0
      ? itinerary.locations[0]
      : null;

  // Format location
  const locationText = primaryLocation
    ? `${primaryLocation.latitude.toFixed(2)}, ${primaryLocation.longitude.toFixed(2)}`
    : 'Multiple Destinations';

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
    >
      <Card className="overflow-hidden border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md transition-all duration-300 hover:shadow-xl py-0">
        {/* Header with background */}
        <div className="relative h-44 w-full bg-muted">
          {/* Status indicator */}
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="outline"
              className={cn(
                'px-2 py-1 text-xs rounded-full font-medium backdrop-blur-sm',
                status === 'upcoming'
                  ? 'bg-forest/70 text-white border-white/20'
                  : status === 'ongoing'
                    ? 'bg-ocean/70 text-white border-white/20'
                    : 'bg-sunset/70 text-white border-white/20'
              )}
            >
              {status === 'upcoming'
                ? 'Upcoming'
                : status === 'ongoing'
                  ? 'Ongoing'
                  : 'Past'}
            </Badge>
          </div>

          {/* Actions menu */}
          <div className="absolute top-3 right-3 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm border border-white/10 hover:bg-background/70"
                >
                  <MoreVertical className="h-4 w-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/itinerary/details?id=${itinerary.id}`}
                    className="flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    <span>View</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(itinerary.id)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(itinerary.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Background gradient overlay */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-background via-transparent',
              status === 'upcoming'
                ? 'to-forest/20'
                : status === 'ongoing'
                  ? 'to-ocean/20'
                  : 'to-sunset/20'
            )}
          />
        </div>

        <CardContent className="p-5">
          {/* Title and date range */}
          <Link
            href={`/itinerary/details?id=${itinerary.id}`}
            className="block space-y-1 group"
          >
            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
              {itinerary.title}
            </h3>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="text-sm truncate">
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
              </span>
            </div>
          </Link>

          {/* Status information */}
          <div className="mt-3 flex items-center">
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3',
                status === 'upcoming'
                  ? 'bg-forest/10 text-forest'
                  : status === 'ongoing'
                    ? 'bg-ocean/10 text-ocean'
                    : 'bg-sunset/10 text-sunset'
              )}
            >
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p
                className={cn(
                  'text-sm font-medium',
                  status === 'upcoming'
                    ? 'text-forest'
                    : status === 'ongoing'
                      ? 'text-ocean'
                      : 'text-sunset'
                )}
              >
                {status === 'upcoming' &&
                  (daysUntil === 0
                    ? 'Starting today'
                    : daysUntil === 1
                      ? 'Starting tomorrow'
                      : `${daysUntil} days until departure`)}
                {status === 'ongoing' &&
                  (daysSince === 0
                    ? 'Ending today'
                    : daysSince === 1
                      ? 'Ending tomorrow'
                      : `${daysSince} days remaining`)}
                {status === 'past' &&
                  `Completed ${Math.abs(daysSince)} days ago`}
              </p>
              <p className="text-xs text-muted-foreground">
                {duration} {duration === 1 ? 'day' : 'days'} trip
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="mt-3 flex items-center text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span className="text-sm truncate">
              {itinerary.locations && itinerary.locations.length > 0
                ? itinerary.locations.length === 1
                  ? locationText
                  : `${itinerary.locations.length} destinations`
                : 'No locations set'}
            </span>
          </div>

          {/* View button (only shown on hover) */}
          <div
            className={cn(
              'mt-4 transition-opacity',
              isHovering ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Button
              asChild
              variant="outline"
              className="w-full rounded-xl border-primary/30 hover:bg-primary/5"
            >
              <Link href={`/itinerary/details?id=${itinerary.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
