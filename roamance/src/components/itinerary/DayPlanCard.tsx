'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Activity, DayPlanBrief } from '@/types';
import { format, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    ChevronUp,
    Edit,
    Plus,
    Trash2
} from 'lucide-react';
import { useState } from 'react';
import { ActivityList } from './ActivityList';

interface DayPlanCardProps {
  dayPlan: DayPlanBrief;
  activities: Activity[];
  isExpanded: boolean;
  onToggleExpandAction: () => void;
  showActions?: boolean;
  onAddActivity?: () => void;
  onEditDayPlan?: () => void;
  onDeleteDayPlan?: () => void;
  isDarkMode: boolean;
}

export function DayPlanCard({
  dayPlan,
  activities,
  isExpanded,
  onToggleExpandAction,
  showActions = false,
  onAddActivity,
  onEditDayPlan,
  onDeleteDayPlan,
  isDarkMode,
}: DayPlanCardProps) {
  const [hovering, setHovering] = useState(false);

  // Format date
  const date = parseISO(dayPlan.date);
  const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
  const dayNumber = format(date, 'd');
  const dayName = format(date, 'EEEE');

  // Calculate total cost
  const activitiesCost = activities.reduce((sum, activity) => sum + activity.cost, 0);
  const totalCost = dayPlan.total_cost || activitiesCost;

  return (
    <motion.div
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      className={cn(
        'rounded-xl overflow-hidden border transition-colors duration-300',
        isExpanded
          ? isDarkMode
            ? 'border-primary/30 bg-primary/5'
            : 'border-primary/20 bg-primary/5'
          : isDarkMode
          ? 'border-muted/40 bg-gradient-to-b from-background to-background/95'
          : 'border-muted/30 bg-gradient-to-b from-background to-background/95',
        hovering && !isExpanded && 'border-muted/60'
      )}
    >
      <div
        onClick={onToggleExpandAction}
        className={cn(
          'cursor-pointer',
          isExpanded ? 'border-b border-muted/20' : ''
        )}
      >
        <div className="flex items-start p-4">
          {/* Date indicator */}
          <div className="flex flex-col items-center justify-center w-16 h-16 mr-4 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <span className="text-2xl font-bold leading-none mt-1">{dayNumber}</span>
            <span className="text-xs uppercase tracking-wider">{format(date, 'MMM')}</span>
            <span className="text-xs font-medium">{format(date, 'EEE')}</span>
          </div>

          {/* Day plan details */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{dayName}</h3>
            <p className="text-muted-foreground text-sm">{formattedDate}</p>

            {activities.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {activities.length} {activities.length === 1 ? 'Activity' : 'Activities'}
                </span>
                {totalCost > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      ${totalCost.toFixed(2)} total
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Toggle icon */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpandAction();
              }}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Activities list */}
            <div className="p-4">
              {activities.length > 0 ? (
                <ActivityList
                  activities={activities}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No activities planned for this day.</p>
                  {showActions && onAddActivity && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddActivity}
                      className="mt-2 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Activity
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Footer with actions */}
            {showActions && (
              <div className="px-4 pb-4 flex justify-end gap-2 pt-2 border-t border-muted/10">
                {onAddActivity && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddActivity}
                    className="border-forest/30 text-forest hover:bg-forest/10"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Activity
                  </Button>
                )}

                {onEditDayPlan && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEditDayPlan}
                    className="border-ocean/30 text-ocean hover:bg-ocean/10"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit Day Plan
                  </Button>
                )}

                {onDeleteDayPlan && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDeleteDayPlan}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
