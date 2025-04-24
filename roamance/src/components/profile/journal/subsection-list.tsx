import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SubsectionRequest, SubsectionType } from '@/types/subsection';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Eye, MapPin, PlusCircle, Route, Trash2 } from 'lucide-react';
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
  // Get subsection icon based on type
  const getSubsectionIcon = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return <Eye className="w-4 h-4" />;
      case SubsectionType.ACTIVITY:
        return <Activity className="w-4 h-4" />;
      case SubsectionType.ROUTE:
        return <Route className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  // Get badge text based on type
  const getSubsectionTypeLabel = (type: SubsectionType) => {
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

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {subsections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-8 px-4 rounded-lg border border-dashed border-muted-foreground/20 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-3">
              <MapPin className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h4 className="font-medium text-foreground mb-1">No sections yet</h4>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Add sections to your journal to document different aspects of your journey
            </p>
            <Button
              onClick={onAddSubsectionClick}
              size="sm"
              variant="outline"
              className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Add First Section
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {subsections.map((subsection, index) => {
              const colors = getSubsectionTypeColors(subsection.type);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  layout
                  transition={{
                    type: 'spring',
                    damping: 25,
                    stiffness: 350,
                  }}
                >
                  <Card className={`border ${colors.border} ${colors.bg} p-3 relative overflow-hidden group`}>
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} opacity-10`} />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${colors.bgSolid} flex items-center justify-center shadow-sm`}>
                          {getSubsectionIcon(subsection.type)}
                        </div>

                        <div>
                          <h4 className="font-medium text-foreground line-clamp-1">
                            {subsection.title || 'Untitled Section'}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-flex items-center text-xs px-1.5 py-0.5 rounded-sm ${colors.badge}`}>
                              {getSubsectionTypeLabel(subsection.type)}
                            </span>

                            {/* Show additional metadata based on type */}
                            {subsection.type === SubsectionType.SIGHTSEEING && subsection.location && (
                              <span className="text-xs text-muted-foreground">
                                Lat: {subsection.location.latitude.toFixed(2)}, Lng: {subsection.location.longitude.toFixed(2)}
                              </span>
                            )}

                            {subsection.type === SubsectionType.ACTIVITY && (
                              <span className="text-xs text-muted-foreground">
                                {subsection.activity_type || 'General Activity'}
                              </span>
                            )}

                            {subsection.type === SubsectionType.ROUTE && (
                              <span className="text-xs text-muted-foreground">
                                {subsection.waypoints?.length || 0} waypoints
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => onRemoveSubsection(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {subsections.length > 0 && (
        <div className="pt-2">
          <Button
            onClick={onAddSubsectionClick}
            size="sm"
            variant="outline"
            className="w-full border-dashed border-muted-foreground/30 hover:border-indigo-400/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2 text-muted-foreground" />
            Add Another Section
          </Button>
        </div>
      )}
    </div>
  );
};
