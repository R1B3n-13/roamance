'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Activity, ActivityType } from '@/types';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Calendar,
  Coffee,
  Compass,
  DollarSign,
  Edit,
  Hotel,
  MapPin,
  MoreHorizontal,
  Music,
  Plane,
  Ticket,
  Train,
  Trash2,
  Utensils,
} from 'lucide-react';

interface ActivityListProps {
  activities: Activity[];
  onEdit?: (activityId: string) => void;
  onDelete?: (activityId: string) => void;
  showActions?: boolean;
  isDarkMode: boolean;
}

export function ActivityList({
  activities,
  onEdit,
  onDelete,
  showActions = false,
  isDarkMode,
}: ActivityListProps) {
  // Sort activities by start time
  const sortedActivities = [...activities].sort((a, b) => {
    const timeA = a.start_time
      ? new Date(`2000-01-01T${a.start_time}`).getTime()
      : 0;
    const timeB = b.start_time
      ? new Date(`2000-01-01T${b.start_time}`).getTime()
      : 0;
    return timeA - timeB;
  });

  // Animation variants for list items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
  };

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {sortedActivities.map((activity) => (
        <motion.div key={activity.id} variants={itemVariants}>
          <ActivityItem
            activity={activity}
            onEdit={onEdit}
            onDelete={onDelete}
            showActions={showActions}
            isDarkMode={isDarkMode}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

interface ActivityItemProps {
  activity: Activity;
  onEdit?: (activityId: string) => void;
  onDelete?: (activityId: string) => void;
  showActions?: boolean;
  isDarkMode: boolean;
}

function ActivityItem({
  activity,
  onEdit,
  onDelete,
  showActions,
  isDarkMode,
}: ActivityItemProps) {
  // Format times
  const startTime = activity.start_time
    ? format(parseISO(`2000-01-01T${activity.start_time}`), 'h:mm a')
    : null;

  const endTime = activity.end_time
    ? format(parseISO(`2000-01-01T${activity.end_time}`), 'h:mm a')
    : null;

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    const typeLower = type?.toLowerCase();

    switch (typeLower) {
      case 'transport':
      case 'transportation':
      case ActivityType.NATURE_AND_OUTDOORS.toLowerCase():
        return <Plane className="h-4 w-4" />;
      case 'flight':
        return <Plane className="h-4 w-4" />;
      case 'train':
        return <Train className="h-4 w-4" />;
      case 'food':
      case 'restaurant':
      case 'dining':
      case ActivityType.FOOD_AND_DINING.toLowerCase():
        return <Utensils className="h-4 w-4" />;
      case 'hotel':
      case 'accommodation':
      case 'lodging':
        return <Hotel className="h-4 w-4" />;
      case 'sightseeing':
      case 'tour':
      case 'attraction':
      case ActivityType.SIGHTSEEING.toLowerCase():
        return <Compass className="h-4 w-4" />;
      case 'event':
      case 'show':
      case 'concert':
      case ActivityType.ENTERTAINMENT.toLowerCase():
        return <Music className="h-4 w-4" />;
      case 'ticket':
        return <Ticket className="h-4 w-4" />;
      case 'break':
      case 'rest':
        return <Coffee className="h-4 w-4" />;
      case ActivityType.CULTURAL_EXPERIENCE.toLowerCase():
        return <Ticket className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  // Color scheme based on activity type
  const getActivityColor = (
    type: string
  ): 'forest' | 'ocean' | 'sunset' | 'sand' | 'primary' => {
    const typeLower = type?.toLowerCase();

    switch (typeLower) {
      case 'transport':
      case 'transportation':
      case 'flight':
      case 'train':
      case ActivityType.NATURE_AND_OUTDOORS.toLowerCase():
        return 'ocean';
      case 'food':
      case 'restaurant':
      case 'dining':
      case ActivityType.FOOD_AND_DINING.toLowerCase():
        return 'sunset';
      case 'hotel':
      case 'accommodation':
      case 'lodging':
        return 'forest';
      case 'sightseeing':
      case 'tour':
      case 'attraction':
      case ActivityType.SIGHTSEEING.toLowerCase():
      case ActivityType.CULTURAL_EXPERIENCE.toLowerCase():
        return 'sand';
      case 'event':
      case 'show':
      case 'concert':
      case ActivityType.ENTERTAINMENT.toLowerCase():
        return 'primary';
      default:
        return 'primary';
    }
  };

  // Handle the activity type representation - convert enum to display string
  const getDisplayType = (type: string): string => {
    // If it's an enum value, format it for display
    if (Object.values(ActivityType).includes(type as ActivityType)) {
      // Convert SNAKE_CASE to Title Case (e.g., FOOD_AND_DINING → Food and Dining)
      return type
        .split('_')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' ');
    }

    // Otherwise use the provided type string
    return type;
  };

  const displayType = activity.type ? getDisplayType(activity.type) : '';
  const color = getActivityColor(activity.type || '');
  const colorClasses = {
    bg: `bg-${color}/10`,
    text: `text-${color}`,
    border: `border-${color}/30`,
  };

  return (
    <div
      className={cn(
        'p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 hover:shadow-md',
        isDarkMode
          ? 'border-muted/30 bg-muted/10 hover:border-muted/40 hover:bg-muted/15'
          : 'border-muted/40 bg-muted/5 hover:border-muted/50 hover:bg-muted/10'
      )}
    >
      {/* Time indicator with enhanced styling */}
      {startTime && (
        <div className="min-w-20 text-center">
          <div
            className={cn(
              'rounded-xl p-2 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md',
              colorClasses.bg,
              colorClasses.text
            )}
          >
            <p className="font-semibold text-sm">{startTime}</p>
            {endTime && (
              <>
                <div className="h-4 w-px mx-auto bg-current opacity-30"></div>
                <p className="text-xs">{endTime}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Activity content with improved typographic hierarchy */}
      <div className="flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex-1">
            {/* Use activity.note as the title with enhanced typography */}
            <h4 className="font-medium text-foreground">{activity.note}</h4>

            {/* Type and cost badges with improved styling */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {activity.type && (
                <Badge
                  variant="outline"
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-normal shadow-sm',
                    colorClasses.bg,
                    colorClasses.text,
                    colorClasses.border
                  )}
                >
                  <div className="flex items-center gap-1">
                    {getActivityIcon(activity.type)}
                    <span>{displayType}</span>
                  </div>
                </Badge>
              )}

              {activity.cost > 0 && (
                <span className="text-xs text-muted-foreground inline-flex items-center px-2 py-0.5 rounded-full bg-muted/30 shadow-sm">
                  <DollarSign className="h-3 w-3 mr-0.5" />
                  {activity.cost.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Actions menu with improved button styling */}
          {showActions && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted/20 transition-all duration-300"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl border-muted/30 shadow-lg backdrop-blur-sm bg-background/70"
              >
                {onEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit(activity.id)}
                    className="flex items-center gap-2 cursor-pointer focus:bg-ocean/10"
                  >
                    <Edit className="h-4 w-4 text-ocean" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(activity.id)}
                      className="text-destructive flex items-center gap-2 cursor-pointer focus:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Location info with improved visual alignment */}
        {activity.location && (
          <div className="mt-2.5 flex items-start gap-1.5 text-sm text-muted-foreground bg-muted/10 px-2.5 py-1.5 rounded-lg shadow-sm">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            {/* Display location name if available, otherwise coordinates */}
            <span>
              {`${activity.location.latitude.toFixed(2)}, ${activity.location.longitude.toFixed(2)}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
