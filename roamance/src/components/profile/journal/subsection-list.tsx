import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SubsectionRequest, SubsectionType } from '@/types/subsection';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Eye,
  GripVertical,
  MapPin,
  PlusCircle,
  Route,
  Trash2
} from 'lucide-react';
import React, { useState, useEffect, createContext } from 'react';
import { getSubsectionTypeColors } from './colorscheme';
import { LocationMap } from '@/components/maps/LocationViwer';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Create a context for subsection data
interface SubsectionContextType {
  subsections: SubsectionRequest[];
  onReorderSubsections?: (startIndex: number, endIndex: number) => void;
}

const SubsectionContext = createContext<SubsectionContextType>({
  subsections: [],
});

interface SubsectionListProps {
  subsections: SubsectionRequest[];
  onRemoveSubsection: (index: number) => void;
  onAddSubsectionClick: () => void;
  onReorderSubsections?: (startIndex: number, endIndex: number) => void;
}

// Sortable item component using dnd-kit
interface SortableSubsectionItemProps {
  subsection: SubsectionRequest;
  index: number;
  id: string;
  onRemove: () => void;
  isDraggable: boolean;
}

const SortableSubsectionItem: React.FC<SortableSubsectionItemProps> = ({
  subsection,
  index,
  id,
  onRemove,
  isDraggable
}) => {
  const colors = getSubsectionTypeColors(subsection.type);
  const { subsections, onReorderSubsections } = React.useContext(SubsectionContext);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as const,
  };

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
    <div ref={setNodeRef} style={style} className="touch-manipulation">
      <Card
        className={cn(
          'border relative overflow-hidden transition-all duration-200',
          'backdrop-blur-sm',
          isDragging ? [
            'ring-2 ring-offset-2 dark:ring-offset-slate-900',
            colors.border,
            'shadow-lg scale-[1.02] rotate-1 opacity-90 z-50'
          ] : [
            'hover:ring-1 hover:ring-offset-1 dark:hover:ring-offset-slate-900',
            colors.border,
            'shadow-sm hover:shadow-md'
          ],
          'bg-white/70 dark:bg-slate-800/70',
          'border-slate-200/80 dark:border-slate-700/80',
          isDraggable && !isDragging && 'hover:translate-y-[-2px]'
        )}
      >
        {/* Enhanced background gradient for dragging state */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br",
          colors.gradient,
          isDragging ? "opacity-20 animate-pulse" : "opacity-5"
        )} />

        {/* Frost effect overlay */}
        <div className="absolute inset-0 bg-white/20 dark:bg-slate-900/20 backdrop-blur-[1px]" />

        {/* Visual drag indicator - more prominent when draggable */}
        {isDraggable && (
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-1.5",
            colors.bgSolid,
            isDragging ? "opacity-100" : "opacity-40 group-hover:opacity-100 transition-opacity"
          )} />
        )}

        {/* Drop highlight overlay for when dragging */}
        {isDragging && (
          <div className={cn(
            "absolute inset-0 border-2 border-dashed z-10 rounded-lg",
            colors.border,
            "animate-pulse"
          )} />
        )}

        <div className={cn(
          "flex items-start justify-between relative z-10",
          "p-3",
          isDragging && "p-4" // Slightly larger padding when dragging to show animation
        )}>
          {/* Enhanced drag handle with improved visual feedback */}
          {isDraggable && (
            <div className="flex h-full self-stretch -ml-1 mr-2">
              <button
                type="button"
                {...attributes}
                {...listeners}
                className={cn(
                  "flex h-full self-stretch px-2 py-1 justify-center items-center",
                  "rounded group/handle transition-all duration-200",
                  isDragging ? [
                    "cursor-grabbing bg-opacity-100",
                    colors.bgSolid,
                    "text-white scale-110"
                  ] : [
                    "cursor-grab",
                    "hover:bg-muted/50 active:bg-muted",
                    "text-muted-foreground"
                  ],
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                aria-label={isDragging ? "Dragging section. Release to drop." : "Drag to reorder section"}
                title="Drag to reorder"
              >
                <span className={cn(
                  "transition-transform",
                  isDragging ? "scale-110" : "group-hover/handle:scale-110"
                )}>
                  <GripVertical className="w-5 h-5" />
                </span>
              </button>
            </div>
          )}

          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={cn(
                `w-10 h-10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0`,
                colors.bgSolid,
                'shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/5',
                isDragging ? "scale-110 shadow-md" : "transition-transform group-hover:scale-105"
              )}
            >
              <span className={cn('transition-transform', colors.icon)}>
                {getSubsectionIcon(subsection.type)}
              </span>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className={cn(
                "font-medium text-foreground line-clamp-1 tracking-tight",
                isDragging && "font-semibold"
              )}>
                {subsection.title || 'Untitled Section'}
              </h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn(
                    'px-1.5 py-0 h-5 text-[0.65rem] font-medium',
                    colors.badge,
                    isDragging && "ring-1 ring-offset-1 ring-white/20 dark:ring-black/20"
                  )}
                >
                  {getSubsectionTypeLabel(subsection.type)}
                </Badge>

                {/* Show additional metadata based on type */}
                {subsection.type === SubsectionType.ACTIVITY && (
                  <span className="text-xs text-muted-foreground/80 tracking-tight">
                    {subsection.activity_type || 'General Activity'}
                  </span>
                )}

                {subsection.type === SubsectionType.ROUTE && (
                  <span className="text-xs text-muted-foreground/80 tracking-tight">
                    {subsection.waypoints?.length || 0} waypoints
                  </span>
                )}
              </div>

              {/* Display location map for sightseeing */}
              {subsection.type === SubsectionType.SIGHTSEEING && subsection.location && (
                <div className={cn(
                  "mt-3 overflow-hidden rounded-md shadow-sm border border-slate-200/80 dark:border-slate-700/80",
                  isDragging && "shadow-md brightness-105"
                )}>
                  <LocationMap
                    location={subsection.location}
                    type="single"
                    height="120px"
                    className="w-full"
                    zoomControl={false}
                    attributionControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                  />
                </div>
              )}

              {/* Display route map for routes */}
              {subsection.type === SubsectionType.ROUTE && subsection.waypoints && subsection.waypoints.length > 0 && (
                <div className={cn(
                  "mt-3 overflow-hidden rounded-md shadow-sm border border-slate-200/80 dark:border-slate-700/80",
                  isDragging && "shadow-md brightness-105"
                )}>
                  <LocationMap
                    waypoints={subsection.waypoints}
                    type="route"
                    height="120px"
                    className="w-full"
                    zoomControl={false}
                    attributionControl={false}
                    dragging={false}
                    scrollWheelZoom={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action buttons with improved hover states */}
          <div className="flex flex-col gap-1 ml-2 mt-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-full",
                "text-muted-foreground/60 hover:text-destructive",
                "hover:bg-destructive/10 focus:bg-destructive/10",
                "transition-colors"
              )}
              onClick={onRemove}
              aria-label="Remove section"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>

            {!isDraggable && (
              <>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7 rounded-full",
                      "text-muted-foreground/60 hover:text-sky-600",
                      "hover:bg-sky-50 dark:hover:bg-sky-900/20",
                      "transition-colors"
                    )}
                    onClick={() => onReorderSubsections?.(index, index - 1)}
                    aria-label="Move section up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                )}

                {index < subsections.length - 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7 rounded-full",
                      "text-muted-foreground/60 hover:text-sky-600",
                      "hover:bg-sky-50 dark:hover:bg-sky-900/20",
                      "transition-colors"
                    )}
                    onClick={() => onReorderSubsections?.(index, index + 1)}
                    aria-label="Move section down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export const SubsectionList: React.FC<SubsectionListProps> = ({
  subsections,
  onRemoveSubsection,
  onAddSubsectionClick,
  onReorderSubsections,
}) => {
  // Generate stable ids for drag and drop
  const [items, setItems] = useState<{ id: string; subsection: SubsectionRequest }[]>([]);

  // Update items when subsections change
  useEffect(() => {
    setItems(subsections.map((subsection, index) => ({
      id: `subsection-${index}`,
      subsection
    })));
  }, [subsections]);

  // Set up dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      if (onReorderSubsections) {
        onReorderSubsections(oldIndex, newIndex);
      }
    }
  };

  // Check if drag and drop is enabled
  const isDragAndDropEnabled = Boolean(onReorderSubsections) && subsections.length > 1;

  return (
    <SubsectionContext.Provider value={{ subsections, onReorderSubsections }}>
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {subsections.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-10 px-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center bg-slate-50/50 dark:bg-slate-900/30"
            >
              <div className="relative w-20 h-20 mb-5">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 animate-spin-slow"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-9 h-9 text-indigo-500 dark:text-indigo-400" />
                </div>
              </div>

              <h4 className="font-medium text-lg text-foreground mb-2">No sections yet</h4>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
                Add sections to your journal to document different aspects of your journey
              </p>
              <Button
                onClick={onAddSubsectionClick}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 px-5 py-2 h-10 gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add First Section
              </Button>
            </motion.div>
          ) : isDragAndDropEnabled ? (
            <div className="relative rounded-lg border border-indigo-200/40 dark:border-indigo-800/30 bg-indigo-50/30 dark:bg-indigo-900/10 p-4 mb-2">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400/70 to-purple-500/70 rounded-t-lg" />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mr-2">
                    <GripVertical className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-400">
                    Drag sections to reorder
                  </span>
                </div>

                <Badge variant="outline" className="bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40">
                  {subsections.length} {subsections.length === 1 ? 'Section' : 'Sections'}
                </Badge>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <SortableSubsectionItem
                        key={item.id}
                        id={item.id}
                        subsection={item.subsection}
                        index={index}
                        onRemove={() => onRemoveSubsection(index)}
                        isDraggable={true}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <div className="space-y-3">
              {subsections.map((subsection, index) => (
                <motion.div
                  key={`subsection-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  layout
                  transition={{
                    type: 'spring',
                    damping: 30,
                    stiffness: 400,
                  }}
                >
                  <SortableSubsectionItem
                    id={`subsection-${index}`}
                    subsection={subsection}
                    index={index}
                    onRemove={() => onRemoveSubsection(index)}
                    isDraggable={false}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {subsections.length > 0 && (
          <div className="pt-3">
            <Button
              onClick={onAddSubsectionClick}
              variant="outline"
              className="w-full rounded-lg h-auto py-3 border-dashed border-slate-300/80 dark:border-slate-700/80 hover:border-indigo-400/60 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-300 group"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Add Another Section
              </span>
            </Button>
          </div>
        )}
      </div>
    </SubsectionContext.Provider>
  );
};
