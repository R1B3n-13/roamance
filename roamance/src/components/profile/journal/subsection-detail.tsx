import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Location } from '@/types';
import {
  SubsectionDetailResponseDto,
  SubsectionType,
  ChecklistItem
} from '@/types/subsection';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  MapPin,
  Route,
  Star,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import { useTheme } from 'next-themes';

interface SubsectionDetailProps {
  subsection: SubsectionDetailResponseDto;
  isActive: boolean;
  toggleSubsection: () => void;
  colors: {
    bg: string;
    icon: string;
    border: string;
    badge: string;
  };
  index: number;
}

export const SubsectionDetail: React.FC<SubsectionDetailProps> = ({
  subsection,
  isActive,
  toggleSubsection,
  colors,
  index,
}) => {
  const { theme } = useTheme();
  const [themeState, setThemeState] = useState<'light' | 'dark'>('light');

  // Update the theme state when the theme changes
  useEffect(() => {
    setThemeState(theme === 'dark' ? 'dark' : 'light');
  }, [theme]);

  const getSubsectionIcon = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return <Eye className="w-5 h-5" />;
      case SubsectionType.ACTIVITY:
        return <Activity className="w-5 h-5" />;
      case SubsectionType.ROUTE:
        return <Route className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return 'Sightseeing';
      case SubsectionType.ACTIVITY:
        return 'Activity';
      case SubsectionType.ROUTE:
        return 'Route';
      default:
        return 'Unknown';
    }
  };

  // Format waypoint for display
  const formatCoordinate = (coord: number): string => {
    return coord.toFixed(4);
  };

  // Format location for display
  const formatLocation = (location: Location | undefined): string => {
    if (!location) return 'No location data';
    return `${formatCoordinate(location.latitude)}, ${formatCoordinate(location.longitude)}`;
  };

  // Get the number of checklist items that are checked
  const totalItemsCount = subsection.checklists?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'border rounded-xl overflow-hidden transition-all',
        colors.border,
        isActive ? 'shadow-md' : 'shadow-sm'
      )}
    >
      {/* Header - always visible */}
      <div
        className={cn(
          'p-4 flex items-center justify-between cursor-pointer group',
          colors.bg,
          isActive ? 'border-b border-dashed' : '',
          isActive ? colors.border : ''
        )}
        onClick={toggleSubsection}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isActive ? 'bg-white dark:bg-background' : colors.bg
            )}
          >
            <span className={colors.icon}>
              {getSubsectionIcon(subsection.type)}
            </span>
          </div>

          <div>
            <h4 className="font-medium text-foreground">
              {subsection.title || `Section ${index + 1}`}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={cn('text-xs px-2 py-0', colors.badge)}
              >
                {getTypeLabel(subsection.type)}
              </Badge>

              {/* Show time if it's a route */}
              {subsection.type === SubsectionType.ROUTE &&
                subsection.total_time > 0 && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {subsection.total_time} min
                  </span>
                )}

              {/* Show completion status if there are checklist items */}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
            isActive
              ? 'bg-white/90 dark:bg-muted/90 rotate-180'
              : 'bg-muted/40 group-hover:bg-muted/70'
          )}
        >
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              isActive ? colors.icon : 'text-muted-foreground'
            )}
          />
        </div>
      </div>

      {/* Content - only visible when active */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: { duration: 0.3 },
            }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
            className="overflow-hidden bg-background/80"
          >
            <div className="p-4 space-y-4">
              {/* Location - for sightseeing & activity types */}
              {(subsection.type === SubsectionType.SIGHTSEEING ||
                subsection.type === SubsectionType.ACTIVITY) &&
                subsection.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Location: {formatLocation(subsection.location)}
                    </span>
                  </div>
                )}

              {/* Activity type - for activity type */}
              {subsection.type === SubsectionType.ACTIVITY &&
                subsection.activity_type && (
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Activity: {subsection.activity_type.replace('_', ' ')}
                    </span>
                  </div>
                )}

              {/* Route details - for route type */}
              {subsection.type === SubsectionType.ROUTE && (
                <div className="border rounded-lg p-3 space-y-3 bg-muted/10">
                  <h5 className="font-medium flex items-center gap-2">
                    <Route className="w-4 h-4 text-forest" />
                    <span>Route Details</span>
                  </h5>

                  {/* Route stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        Total Distance
                      </div>
                      <div className="font-medium">
                        {subsection.total_distance
                          ? `${subsection.total_distance} km`
                          : 'Not specified'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        Estimated Time
                      </div>
                      <div className="font-medium">
                        {subsection.total_time
                          ? `${subsection.total_time} minutes`
                          : 'Not specified'}
                      </div>
                    </div>
                  </div>

                  {/* Waypoints */}
                  {subsection.waypoints && subsection.waypoints.length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-xs text-muted-foreground mb-2">
                        Waypoints
                      </h6>
                      <div className="space-y-2">
                        {subsection.waypoints.map((waypoint, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded-md bg-muted/20 text-sm"
                          >
                            <div className="h-5 w-5 rounded-full bg-forest-light/50 dark:bg-forest-dark/30 flex items-center justify-center text-xs font-medium">
                              {i + 1}
                            </div>
                            <span className="text-foreground/80">
                              {formatLocation(waypoint)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes section */}
              {subsection.note && subsection.note.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-muted-foreground"
                    >
                      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
                    </svg>
                    <span>Notes</span>
                  </h5>

                  <div className="p-3 rounded-lg bg-muted/10 border border-muted/30">
                    <div data-color-mode={themeState}>
                      <MDEditor.Markdown
                        source={subsection.note}
                        rehypePlugins={[[rehypeSanitize]]}
                        className="markdown-body text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Checklist section */}
              {subsection.checklists && subsection.checklists.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    <span>Checklist</span>
                  </h5>

                  <div className="space-y-2">
                    {subsection.checklists.map((item, i) => (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center gap-3 p-2 rounded-md text-sm',
                          item.completed
                            ? 'bg-forest-light/20 dark:bg-forest-dark/20'
                            : 'bg-muted/10'
                        )}
                      >
                        <Checkbox
                          checked={item.completed}
                          className={cn(
                            item.completed
                              ? 'border-forest text-forest-foreground'
                              : 'border-muted-foreground/30'
                          )}
                          disabled
                        />
                        <span
                          className={cn(
                            'flex-1',
                            item.completed
                              ? 'text-foreground/70 line-through'
                              : 'text-foreground'
                          )}
                        >
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
