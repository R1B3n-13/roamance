'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Activity, DayPlanBrief } from '@/types';
import { format, parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
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
  const dayMonth = format(date, 'MMM');
  const dayName = format(date, 'EEEE');

  // Calculate total cost
  const activitiesCost = activities.reduce((sum, activity) => sum + activity.cost, 0);
  const totalCost = dayPlan.total_cost || activitiesCost;

  // Animation variants
  const cardVariants = {
    hover: {
      boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
      borderColor: isExpanded ? "rgba(var(--primary), 0.5)" : "rgba(var(--muted-foreground), 0.2)"
    },
    initial: {
      boxShadow: "0 2px 10px -5px rgba(0, 0, 0, 0.1)",
      borderColor: isExpanded ? "rgba(var(--primary), 0.3)" : "rgba(var(--muted-foreground), 0.1)"
    }
  };

  return (
    <motion.div
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      initial="initial"
      whileHover="hover"
      animate={{ opacity: 1 }}
      variants={cardVariants}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-2xl overflow-hidden border transition-all duration-300',
        isExpanded
          ? isDarkMode
            ? 'border-primary/30 bg-gradient-to-b from-primary/10 to-primary/5'
            : 'border-primary/20 bg-gradient-to-b from-primary/10 to-primary/5'
          : isDarkMode
          ? 'border-muted/40 bg-gradient-to-b from-background/95 to-background/90'
          : 'border-muted/30 bg-gradient-to-b from-background/80 to-background/95',
        hovering && !isExpanded && 'border-muted/60',
        isExpanded && 'shadow-md'
      )}
    >
      <div
        onClick={onToggleExpandAction}
        className={cn(
          'cursor-pointer transition-colors',
          isExpanded ? 'border-b border-muted/20' : ''
        )}
      >
        <div className="flex items-start p-4">
          {/* Date indicator with enhanced styling */}
          <div className="mr-4">
            <div className="flex flex-col items-center justify-center w-18 h-18 rounded-xl overflow-hidden shadow-sm">
              <div className="w-full bg-primary text-primary-foreground text-center py-1 text-xs font-medium uppercase tracking-wider">
                {dayMonth}
              </div>
              <div className="flex flex-col items-center justify-center w-full h-16 bg-primary/10 text-primary border-x border-b border-primary/20">
                <span className="text-2xl font-bold leading-none mt-1">{dayNumber}</span>
                <span className="text-xs font-medium mt-1">{format(date, 'EEE')}</span>
              </div>
            </div>
          </div>

          {/* Day plan details with improved typography */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">{dayName}</h3>
            <p className="text-muted-foreground text-sm">{formattedDate}</p>

            {activities.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                  <span className="font-medium">{activities.length}</span>
                  <span>{activities.length === 1 ? 'Activity' : 'Activities'}</span>
                </div>

                {totalCost > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-forest/10 text-forest text-xs">
                    <span className="font-medium">${totalCost.toFixed(2)}</span>
                    <span>total</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Toggle button with animation */}
          <div className="flex items-center">
            <Button
              variant={isExpanded ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full transition-all duration-300 shadow-sm",
                isExpanded ? "bg-primary/15 text-primary hover:bg-primary/20" : "hover:bg-muted/80"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpandAction();
              }}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
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
            {/* Activities list with improved spacing */}
            <div className="p-5">
              {activities.length > 0 ? (
                <ActivityList
                  activities={activities}
                  isDarkMode={isDarkMode}
                  showActions={showActions}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-muted/30 bg-muted/5">
                  <p className="text-muted-foreground text-center mb-3">No activities planned for this day.</p>
                  {showActions && onAddActivity && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddActivity}
                      className="border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add First Activity
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Footer with actions - Enhanced with better button styling */}
            {showActions && (
              <div className="px-5 pb-5 flex justify-end gap-2 pt-2 border-t border-muted/10">
                {onAddActivity && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddActivity}
                    className="rounded-xl border-forest/30 text-forest hover:bg-forest/10 transition-all duration-300 shadow-sm"
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
                    className="rounded-xl border-ocean/30 text-ocean hover:bg-ocean/10 transition-all duration-300 shadow-sm"
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
                    className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 transition-all duration-300 shadow-sm"
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
