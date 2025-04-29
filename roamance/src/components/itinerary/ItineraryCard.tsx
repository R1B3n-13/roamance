'use client';

import { getImagePath } from '@/components';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Itinerary } from '@/types/itinerary';
import { differenceInDays, format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Clock,
  Edit,
  Eye,
  Globe,
  MapPin,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

// Create a motion-enabled Card component
const MotionCard = motion(Card);

interface ItineraryCardProps {
  itinerary: Itinerary;
  onEditAction: (id: string) => void;
  onDeleteAction: (id: string) => void;
}

export function ItineraryCard({
  itinerary,
  onEditAction,
  onDeleteAction,
}: ItineraryCardProps) {
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
    ? `${`${primaryLocation.latitude.toFixed(2)}, ${primaryLocation.longitude.toFixed(2)}`}`
    : 'Multiple Destinations';

  // Get locations count text
  const locationsCountText =
    itinerary.locations?.length === 1
      ? '1 destination'
      : `${itinerary.locations?.length || 0} destinations`;

  // Get shimmer delay based on itinerary ID for staggered effect
  const getShimmerDelay = () => {
    // Create a hash from the itinerary id
    const hash = itinerary.id
      .split('')
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return `${hash % 5}s`; // 0-4 second delay
  };

  // Enhanced status-based styling with more refined color choices
  const colorScheme = {
    upcoming: {
      name: 'forest',
      gradient:
        'bg-gradient-to-tr from-emerald-500/90 via-green-500/90 to-teal-500/90',
      pattern: 'opacity-15',
      badge: 'bg-emerald-500 border-emerald-400/20 text-white',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      accentHoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/10',
      accentBorder: 'border-emerald-200 dark:border-emerald-800/40',
      starBg: 'bg-white/15 hover:bg-white/30 border-white/20',
      shimmerColor: 'via-white/20',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      dotColor: 'bg-emerald-500 dark:bg-emerald-400',
      statusBgLight: 'from-emerald-50/70 to-emerald-50/30',
      statusBgDark: 'from-emerald-900/30 to-emerald-900/10',
    },
    ongoing: {
      name: 'ocean',
      gradient:
        'bg-gradient-to-tr from-blue-500/90 via-cyan-500/90 to-sky-500/90',
      pattern: 'opacity-15',
      badge: 'bg-blue-500 border-blue-400/20 text-white',
      accentColor: 'text-blue-600 dark:text-blue-400',
      accentHoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/10',
      accentBorder: 'border-blue-200 dark:border-blue-800/40',
      starBg: 'bg-white/15 hover:bg-white/30 border-white/20',
      shimmerColor: 'via-white/20',
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      dotColor: 'bg-blue-500 dark:bg-blue-400',
      statusBgLight: 'from-blue-50/70 to-blue-50/30',
      statusBgDark: 'from-blue-900/30 to-blue-900/10',
    },
    past: {
      name: 'sunset',
      gradient:
        'bg-gradient-to-tr from-amber-500/90 via-orange-500/90 to-yellow-500/90',
      pattern: 'opacity-10',
      badge: 'bg-amber-500 border-amber-400/20 text-white',
      accentColor: 'text-amber-600 dark:text-amber-400',
      accentHoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-900/10',
      accentBorder: 'border-amber-200 dark:border-amber-800/40',
      starBg: 'bg-white/15 hover:bg-white/30 border-white/20',
      shimmerColor: 'via-white/15',
      iconBg: 'bg-amber-50 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      dotColor: 'bg-amber-500 dark:bg-amber-400',
      statusBgLight: 'from-amber-50/70 to-amber-50/30',
      statusBgDark: 'from-amber-900/30 to-amber-900/10',
    },
  };

  const scheme = colorScheme[status];

  // Card animations
  const cardVariants = {
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: '0 20px 40px -20px rgba(0, 0, 0, 0.15)',
      transition: { type: 'spring', stiffness: 300, damping: 15 },
    },
  };

  // Button animations
  const buttonVariants = {
    hover: {
      scale: 1.08,
      transition: { type: 'spring', stiffness: 400, damping: 15 },
    },
    tap: {
      scale: 0.92,
    },
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  return (
    <motion.div
      whileHover="hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <MotionCard
        variants={cardVariants}
        className="overflow-hidden group h-full flex flex-col border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300 rounded-xl py-0"
      >
        {/* Header with gradient background */}
        <div className="h-52 relative overflow-hidden flex-shrink-0">
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              scheme.gradient
            )}
          >
            {/* Decorative pattern overlay */}
            <div
              className={cn('absolute inset-0', scheme.pattern)}
              style={{
                backgroundImage: `url('${getImagePath('roamance-logo-no-text.png')}')`,
                backgroundRepeat: 'repeat-space',
                backgroundSize: 'contain',
                mixBlendMode: 'overlay',
              }}
            />

            {/* Enhanced shimmer effect */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className={cn(
                  'absolute -inset-x-full top-0 bottom-0 bg-gradient-to-r from-transparent',
                  scheme.shimmerColor,
                  'to-transparent animate-[shimmer_3s_infinite]'
                )}
                style={{
                  transform: 'translateX(-10%) skewX(-15deg)',
                  animationDelay: getShimmerDelay(),
                  animationDuration: '3s',
                }}
              />
            </div>
          </div>

          {/* Centered title for gradient backgrounds */}
          <div className="relative z-10 text-center px-6 h-full flex items-center justify-center">
            <p className="text-white text-2xl font-bold drop-shadow-md leading-tight tracking-tight">
              {itinerary.title}
            </p>
          </div>

          {/* Top badges row */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-20">
            <Badge
              className={cn(
                'capitalize rounded-full px-3 py-1 font-medium backdrop-blur-sm shadow-md',
                scheme.badge
              )}
            >
              {status === 'upcoming'
                ? 'Upcoming'
                : status === 'ongoing'
                  ? 'Ongoing'
                  : 'Completed'}
            </Badge>

            {/* Duration badge - replacing date badge */}
            <Badge className="bg-black/50 text-white border-white/30 flex items-center gap-1.5 rounded-full backdrop-blur-sm px-3.5 py-1 shadow-md">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {duration} {duration === 1 ? 'day' : 'days'} trip
              </span>
            </Badge>
          </div>

          {/* Bottom badges row */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-20">
            {/* Locations badge */}
            <Badge
              variant="outline"
              className="bg-black/50 text-white border-white/30 flex items-center gap-1.5 rounded-full backdrop-blur-sm px-3 py-1 shadow-md"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{locationsCountText}</span>
            </Badge>
          </div>
        </div>

        <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
          {/* Trip details bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate max-w-[180px]" title={locationText}>
                {locationText}
              </span>
            </div>
            {/* <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {duration} {duration === 1 ? 'day' : 'days'}
              </span>
            </div> */}
          </div>

          {/* Status information with enhanced styling */}
          <div
            className={cn(
              `py-3 px-4 rounded-xl bg-gradient-to-br dark:${scheme.statusBgDark} ${scheme.statusBgLight} flex items-center backdrop-blur-sm`
            )}
          >
            <div
              className={cn(
                `h-2.5 w-2.5 rounded-full ${scheme.dotColor} mr-3 animate-pulse`
              )}
            ></div>
            <div
              className={cn(
                `flex items-center ${scheme.accentColor} text-sm font-medium`
              )}
            >
              {status === 'upcoming' && (
                <span>
                  {daysUntil === 0
                    ? 'Starts today!'
                    : daysUntil === 1
                      ? 'Starts tomorrow'
                      : `${daysUntil} days until departure`}
                </span>
              )}
              {status === 'ongoing' && (
                <span>
                  {daysSince === 0
                    ? 'Ends today'
                    : daysSince === 1
                      ? 'Ends tomorrow'
                      : `${daysSince} days remaining`}
                </span>
              )}
              {status === 'past' && (
                <span>
                  {`Completed ${Math.abs(daysSince)} ${
                    Math.abs(daysSince) === 1 ? 'day' : 'days'
                  } ago`}
                </span>
              )}
            </div>
          </div>

          {/* Duration and destinations with enhanced visualization */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col p-4 rounded-xl bg-muted/10 backdrop-blur-sm border border-muted/30">
              <span className="text-xs text-muted-foreground mb-1.5 font-medium">
                Trip Overview
              </span>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Clock className={`h-4 w-4 mr-2 ${scheme.iconColor}`} />
                  <span className="font-medium">
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons with enhanced styling - updated to match journal card */}
          <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-800/70 flex justify-between items-center">
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-1.5">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/itinerary/details?id=${itinerary.id}`}>
                      <motion.button
                        variants={buttonVariants}
                        whileTap="tap"
                        className="flex items-center justify-center h-8 w-8 rounded-full text-slate-500 dark:text-slate-400 transition-colors duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      variants={buttonVariants}
                      whileTap="tap"
                      onClick={() => onEditAction(itinerary.id)}
                      className={cn(
                        'flex items-center justify-center h-8 w-8 rounded-full text-slate-500 dark:text-slate-400 transition-colors duration-200',
                        `hover:bg-${scheme.name}-50 dark:hover:bg-${scheme.name}-900/10 hover:${scheme.accentColor}`
                      )}
                    >
                      <Edit className="h-4 w-4" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Itinerary</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      variants={buttonVariants}
                      whileTap="tap"
                      onClick={() => onDeleteAction(itinerary.id)}
                      className="flex items-center justify-center h-8 w-8 rounded-full text-slate-500 dark:text-slate-400 transition-colors duration-200 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Itinerary</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </MotionCard>
    </motion.div>
  );
}
