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
  Edit,
  Eye,
  Globe,
  MapPin,
  MoreHorizontal,
  Share2,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ShareItinerary } from './ItineraryDetail';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useTheme } from 'next-themes';

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
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

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

  // Status-based styling
  const statusConfig = {
    upcoming: {
      gradientFrom: 'from-forest/5',
      gradientTo: 'to-forest/20',
      textColor: 'text-forest',
      borderColor: 'border-forest/30',
      hoverBg: 'hover:bg-forest/10',
      badgeBg: 'bg-forest/70',
    },
    ongoing: {
      gradientFrom: 'from-ocean/5',
      gradientTo: 'to-ocean/20',
      textColor: 'text-ocean',
      borderColor: 'border-ocean/30',
      hoverBg: 'hover:bg-ocean/10',
      badgeBg: 'bg-ocean/70',
    },
    past: {
      gradientFrom: 'from-sunset/5',
      gradientTo: 'to-sunset/20',
      textColor: 'text-sunset',
      borderColor: 'border-sunset/30',
      hoverBg: 'hover:bg-sunset/10',
      badgeBg: 'bg-sunset/70',
    },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      className="will-change-transform"
    >
      <Card className="overflow-hidden border-muted/20 bg-gradient-to-b from-background/80 to-background/50 backdrop-blur-md shadow-md transition-all duration-300 hover:shadow-xl rounded-xl relative h-full py-0">
        {/* Share Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
            <ShareItinerary
              itineraryId={itinerary.id}
              title={itinerary.title}
              onClose={() => setIsShareDialogOpen(false)}
              isDarkMode={isDarkMode}
            />
          </DialogContent>
        </Dialog>

        {/* Decorative top accent bar */}
        <div
          className={`absolute top-0 left-0 w-full h-1 ${status === 'upcoming' ? 'bg-forest' : status === 'ongoing' ? 'bg-ocean' : 'bg-sunset'}`}
        ></div>

        {/* Decorative background elements */}
        <div
          className={`absolute -right-12 -top-12 w-24 h-24 rounded-full blur-xl opacity-10 ${status === 'upcoming' ? 'bg-forest' : status === 'ongoing' ? 'bg-ocean' : 'bg-sunset'}`}
        ></div>
        <div
          className={`absolute -left-12 -bottom-12 w-24 h-24 rounded-full blur-xl opacity-10 ${status === 'upcoming' ? 'bg-forest' : status === 'ongoing' ? 'bg-ocean' : 'bg-sunset'}`}
        ></div>

        {/* Header with background */}
        <div className="relative h-40 w-full overflow-hidden rounded-t-xl">
          {/* Visual background with subtle pattern */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${config.gradientFrom} ${config.gradientTo} pattern-dots pattern-bg-transparent pattern-size-4 pattern-opacity-10`}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent animate-pulse-slow"></div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="outline"
              className={cn(
                'px-3 py-1 text-xs rounded-full font-medium backdrop-blur-md shadow-sm border-white/20 text-white',
                config.badgeBg
              )}
            >
              {status === 'upcoming'
                ? 'Upcoming'
                : status === 'ongoing'
                  ? 'Ongoing'
                  : 'Completed'}
            </Badge>
          </div>

          {/* Actions menu */}
          <div className="absolute top-3 right-3 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white hover:text-white transition-all h-8 w-8"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl border-muted/30 shadow-lg backdrop-blur-sm bg-background/70"
              >
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 focus:bg-primary/10"
                  asChild
                >
                  <Link href={`/itinerary/details?id=${itinerary.id}`}>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>View Details</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 focus:bg-ocean/10"
                  onClick={() => onEdit(itinerary.id)}
                >
                  <Edit className="h-4 w-4 text-ocean" />
                  <span>Edit Itinerary</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 focus:bg-primary/10"
                  onClick={() => setIsShareDialogOpen(true)}
                >
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 text-destructive focus:bg-destructive/10"
                  onClick={() => onDelete(itinerary.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Centered status icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-5 opacity-30">
            <Calendar className={`h-16 w-16 ${config.textColor}`} />
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Title and date range */}
          <Link
            href={`/itinerary/details?id=${itinerary.id}`}
            className="block space-y-1 group"
          >
            <h3
              className={`font-semibold text-lg truncate group-hover:${config.textColor} transition-colors`}
            >
              {itinerary.title}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span>
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
              </span>
            </div>
          </Link>

          {/* Status information */}
          <div className="mt-2 py-2 px-3 rounded-lg bg-muted/5 border border-muted/20">
            {status === 'upcoming' && (
              <div className="flex items-center text-forest font-medium">
                <span>
                  {daysUntil === 0
                    ? 'Starts today!'
                    : daysUntil === 1
                      ? 'Starts tomorrow'
                      : `${daysUntil} days until departure`}
                </span>
              </div>
            )}
            {status === 'ongoing' && (
              <div className="flex items-center text-ocean font-medium">
                <span>
                  {daysSince === 0
                    ? 'Ends today'
                    : daysSince === 1
                      ? 'Ends tomorrow'
                      : `${daysSince} days remaining`}
                </span>
              </div>
            )}
            {status === 'past' && (
              <div className="flex items-center text-sunset font-medium">
                <span>
                  {`Completed ${Math.abs(daysSince)} ${
                    Math.abs(daysSince) === 1 ? 'day' : 'days'
                  } ago`}
                </span>
              </div>
            )}
          </div>

          {/* Trip details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col bg-muted/5 p-2 rounded-lg border border-muted/10">
              <span className="text-xs text-muted-foreground">Duration</span>
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <span className="font-medium">
                  {duration} {duration === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>

            <div className="flex flex-col bg-muted/5 p-2 rounded-lg border border-muted/10">
              <span className="text-xs text-muted-foreground">
                Destinations
              </span>
              <div className="flex items-center">
                <Globe className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <span className="font-medium">
                  {itinerary.locations?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Location info */}
          <div className="flex items-center text-muted-foreground text-xs">
            <div className="flex items-center gap-1.5 bg-muted/5 px-2 py-1.5 rounded-md border border-muted/10 w-full">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate" title={locationText}>
                {locationText}
              </span>
            </div>
          </div>

          {/* Action buttons with animated reveal on hover */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            animate={isHovering ? 'visible' : 'hidden'}
            transition={{ duration: 0.2 }}
            className="flex gap-2 pt-1"
          >
            {/* Using the properly implemented Button component with asChild */}
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/itinerary/details?id=${itinerary.id}`}
                className={`w-full rounded-xl flex items-center justify-center ${config.borderColor} ${config.textColor} ${config.hoverBg} transition-all duration-300 shadow-sm`}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                View Details
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`w-full rounded-xl ${config.borderColor} ${config.textColor} ${config.hoverBg} transition-all duration-300 shadow-sm`}
              onClick={() => onEdit(itinerary.id)}
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
