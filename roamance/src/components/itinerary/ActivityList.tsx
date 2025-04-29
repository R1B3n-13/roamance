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

  return (
    <div className="space-y-4">
      {sortedActivities.map((activity) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
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
        'p-4 rounded-xl border flex items-start gap-3',
        isDarkMode
          ? 'border-muted/30 bg-muted/10'
          : 'border-muted/40 bg-muted/5'
      )}
    >
      {/* Time indicator */}
      {startTime && (
        <div className="min-w-20 text-center">
          <div
            className={cn('rounded-lg p-2', colorClasses.bg, colorClasses.text)}
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

      {/* Activity content */}
      <div className="flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex-1">
            {/* Use activity.note as the title since Activity type has no title field */}
            <h4 className="font-medium">{activity.note}</h4>

            {/* Type and cost */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {activity.type && (
                <Badge
                  variant="outline"
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-normal',
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
                <span className="text-xs text-muted-foreground inline-flex items-center">
                  <DollarSign className="h-3 w-3 mr-0.5" />
                  {activity.cost.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Actions menu */}
          {showActions && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(activity.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(activity.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Location info */}
        {activity.location && (
          <div className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
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
