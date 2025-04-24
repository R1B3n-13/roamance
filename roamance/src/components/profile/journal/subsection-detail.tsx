import { LocationMap } from '@/components/maps/LocationViwer';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  ChecklistItem,
  SubsectionDetailResponseDto,
  SubsectionType,
} from '@/types/subsection';
import MDEditor from '@uiw/react-md-editor';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Route,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';
import rehypeSanitize from 'rehype-sanitize';

interface SubsectionDetailProps {
  subsection: SubsectionDetailResponseDto;
  isActive: boolean;
  toggleSubsection: () => void;
  colors: {
    bg: string;
    icon: string;
    border: string;
    badge: string;
    bgSolid: string;
  };
  index: number;
}

export const SubsectionDetail: React.FC<SubsectionDetailProps> = ({
  subsection,
  isActive,
  toggleSubsection,
  colors,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className={cn('mb-4 transition-all relative', isActive ? 'pb-1' : '')}>
      {/* Header button - always visible */}
      <div
        onClick={toggleSubsection}
        className={cn(
          'flex items-center justify-between w-full p-4 rounded-lg cursor-pointer transition-all',
          colors.bg,
          colors.border,
          'border',
          isActive ? 'mb-4' : ''
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              colors.bgSolid
            )}
          >
            {subsection.type === SubsectionType.SIGHTSEEING && (
              <Eye className={cn('w-5 h-5', colors.icon)} />
            )}
            {subsection.type === SubsectionType.ACTIVITY && (
              <Activity className={cn('w-5 h-5', colors.icon)} />
            )}
            {subsection.type === SubsectionType.ROUTE && (
              <Route className={cn('w-5 h-5', colors.icon)} />
            )}
          </div>
          <div>
            <h3 className="font-medium text-lg">{subsection.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className={colors.badge}>
                {subsection.type === SubsectionType.SIGHTSEEING &&
                  'Sightseeing'}
                {subsection.type === SubsectionType.ACTIVITY && 'Activity'}
                {subsection.type === SubsectionType.ROUTE && 'Route'}
              </Badge>

              {subsection.type === SubsectionType.ACTIVITY &&
                subsection.activity_type && (
                  <span className="text-xs text-muted-foreground">
                    {subsection.activity_type}
                  </span>
                )}

              {subsection.type === SubsectionType.ROUTE &&
                subsection.waypoints && (
                  <span className="text-xs text-muted-foreground">
                    {subsection.waypoints.length} waypoints
                  </span>
                )}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <ChevronDown
            className={cn(
              'w-5 h-5 transition-transform text-muted-foreground',
              isActive ? 'rotate-180 transform' : ''
            )}
          />
        </div>
      </div>

      {/* Content - only visible when active */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden px-1"
          >
            <div
              className={cn(
                'rounded-lg p-4 mb-2',
                'bg-muted/20 border border-muted/30'
              )}
            >
              {/* Display location map for SIGHTSEEING type */}
              {subsection.type === SubsectionType.SIGHTSEEING &&
                subsection.location && (
                  <LocationMap
                    location={subsection.location}
                    type="single"
                    height="240px"
                    className="mb-4"
                  />
                )}

              {/* Display route map for ROUTE type */}
              {subsection.type === SubsectionType.ROUTE &&
                subsection.waypoints &&
                subsection.waypoints.length > 0 && (
                  <LocationMap
                    waypoints={subsection.waypoints}
                    type="route"
                    height="240px"
                    className="mb-4"
                  />
                )}

              {/* Notes section */}
              {subsection.note && (
                <div className="prose dark:prose-invert prose-sm max-w-none mb-4">
                  <MDEditor.Markdown
                    source={subsection.note}
                    rehypePlugins={[rehypeSanitize]}
                    className={cn(
                      '!bg-transparent border-none shadow-none p-0',
                      isDarkMode ? 'dark-md-editor' : ''
                    )}
                  />
                </div>
              )}

              {/* Checklist items */}
              {subsection.checklists && subsection.checklists.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    <span>Checklist</span>
                  </h4>

                  <div className="rounded-lg border border-muted/40 divide-y divide-muted/30">
                    {subsection.checklists.map(
                      (item: ChecklistItem, itemIndex: number) => (
                        <div
                          key={itemIndex}
                          className={cn(
                            'flex items-start gap-3 p-3',
                            item.completed ? 'bg-muted/30' : ''
                          )}
                        >
                          <Checkbox
                            checked={item.completed}
                            className="mt-0.5 data-[state=checked]:bg-primary/80 data-[state=checked]:text-primary-foreground"
                            disabled
                          />
                          <span
                            className={cn(
                              'text-sm',
                              item.completed
                                ? 'text-muted-foreground line-through'
                                : ''
                            )}
                          >
                            {item.title}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Display created time */}
              {subsection.audit && subsection.audit.created_at && (
                <div className="mt-4 flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1.5" />
                  <span>
                    Created{' '}
                    {new Date(subsection.audit.created_at).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
