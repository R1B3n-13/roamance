import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SubsectionRequest, SubsectionType } from '@/types/subsection';
import { motion } from 'framer-motion';
import { Activity, Eye, Plus, Route, Trash2 } from 'lucide-react';
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

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <span className="mr-2">Journal Sections</span>
          {subsections?.length > 0 && (
            <Badge
              variant="outline"
              className="bg-violet-light/20 text-violet-dark dark:bg-violet-dark/20 dark:text-violet-light border-violet-light/50 dark:border-violet-dark/50"
            >
              {subsections?.length}
            </Badge>
          )}
        </h3>

        <Button
          type="button"
          onClick={onAddSubsectionClick}
          className="bg-gradient-to-r from-violet to-lavender hover:from-violet hover:to-lavender/90 text-white shadow-sm gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </Button>
      </div>

      {subsections?.length > 0 ? (
        <div className="space-y-3 mb-6">
          {subsections.map((subsection, index) => {
            const colors = getSubsectionTypeColors(subsection.type);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-muted/10 rounded-xl p-4 border border-muted/30 hover:border-violet-light/50 dark:hover:border-violet-dark/50 shadow-sm flex items-start justify-between group transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={cn('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center', colors.bgSolid)}
                  >
                    <span className={colors.icon}>{getSubsectionIcon(subsection.type)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground leading-tight">
                      {subsection.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className={cn('text-xs', colors.badge)}
                      >
                        {subsection.type}
                      </Badge>

                      {subsection.notes?.length > 0 && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Eye className="w-3 h-3 mr-1" />
                          {subsection.notes?.length} notes
                        </div>
                      )}

                      {subsection.checklists?.length > 0 && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Route className="w-3 h-3 mr-1" />
                          {subsection.checklists?.length} items
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
                  className="text-muted-foreground hover:text-destructive transition-colors duration-200 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-muted/5 rounded-xl p-8 text-center border border-dashed border-muted/30 mb-6">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-violet-light/20 dark:bg-violet-dark/20 text-violet dark:text-violet-light mb-4">
            <Plus className="h-7 w-7" />
          </div>
          <h3 className="text-base font-medium text-foreground">
            No sections added
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">
            Add sections to organize your journal entries by sightseeing
            locations, activities, or travel routes
          </p>
          <Button
            type="button"
            onClick={onAddSubsectionClick}
            variant="outline"
            className="mt-5 border-violet-light/50 dark:border-violet-dark/50 text-violet dark:text-violet-light hover:bg-violet-light/10 dark:hover:bg-violet-dark/20 gap-1"
          >
            <Plus className="w-4 h-4" />
            Add your first section
          </Button>
        </div>
      )}
    </div>
  );
};
