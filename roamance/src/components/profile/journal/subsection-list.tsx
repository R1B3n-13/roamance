import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SubsectionRequest, SubsectionType } from '@/types/subsection';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle2, Eye, ListChecks, MapPin, Plus, Route, Trash2 } from 'lucide-react';
import React from 'react';
import { getSubsectionTypeColors } from './colorscheme';

interface SubsectionListProps {
  subsections: SubsectionRequest[];
  onRemoveSubsection: (index: number) => void;
  onAddSubsectionClick: () => void;
}

export const SubsectionList: React.FC<SubsectionListProps> = ({
  subsections,
  onRemoveSubsection,
  onAddSubsectionClick,
}) => {
  const getSubsectionIcon = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return <Eye className="w-4 h-4" />;
      case SubsectionType.ACTIVITY:
        return <Activity className="w-4 h-4" />;
      case SubsectionType.ROUTE:
        return <Route className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Animations for container and items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <>
      {subsections?.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          <AnimatePresence>
            {subsections.map((subsection, index) => {
              const colors = getSubsectionTypeColors(subsection.type);

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, x: -50 }}
                  className={cn(
                    "p-4 rounded-xl shadow-sm flex items-start justify-between group transition-all duration-200",
                    "bg-muted/10 hover:bg-muted/20 border border-muted/30 hover:border-indigo-300/50 dark:hover:border-indigo-700/50"
                  )}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={cn(
                        'flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center',
                        colors.bgSolid,
                        "shadow-sm"
                      )}
                    >
                      <span className={cn(colors.icon, "drop-shadow-sm")}>
                        {getSubsectionIcon(subsection.type)}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground leading-tight">
                        {subsection.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'px-2.5 py-0.5 text-xs font-medium rounded-full',
                            colors.badge
                          )}
                        >
                          {subsection.type.replace('_', ' ')}
                        </Badge>

                        {subsection.type === SubsectionType.SIGHTSEEING && subsection.location && (
                          <div className="flex items-center text-xs text-muted-foreground gap-1 bg-background/50 px-2 py-0.5 rounded-full border border-muted/20">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">
                              {subsection.location.latitude.toFixed(2)}, {subsection.location.longitude.toFixed(2)}
                            </span>
                          </div>
                        )}

                        {subsection.notes?.length > 0 && (
                          <div className="flex items-center text-xs text-muted-foreground gap-1 bg-background/50 px-2 py-0.5 rounded-full border border-muted/20">
                            <Eye className="w-3 h-3" />
                            <span>{subsection.notes?.length} note{subsection.notes?.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}

                        {subsection.checklists?.length > 0 && (
                          <div className="flex items-center text-xs text-muted-foreground gap-1 bg-background/50 px-2 py-0.5 rounded-full border border-muted/20">
                            <ListChecks className="w-3 h-3" />
                            <span>{subsection.checklists?.length} item{subsection.checklists?.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveSubsection(index)}
                    className={cn(
                      "text-muted-foreground hover:text-destructive transition-colors duration-200",
                      "opacity-0 group-hover:opacity-100 h-8 w-8 rounded-full"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex flex-col items-center justify-center py-10 text-center"
        >
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-xl"></div>
              <div className="relative z-10">
                <CheckCircle2 className="h-8 w-8 text-indigo-500" />
              </div>
            </div>
          </div>

          <h3 className="text-lg font-medium text-foreground mt-5">
            Ready to build your journal
          </h3>

          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Add sections to organize your travel experiences by locations, activities or routes you&apos;ve taken
          </p>

          <Button
            type="button"
            onClick={onAddSubsectionClick}
            className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-200 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Section
          </Button>
        </motion.div>
      )}
    </>
  );
};
