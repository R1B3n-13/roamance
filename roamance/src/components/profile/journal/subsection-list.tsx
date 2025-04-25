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
  onSelectSubsection?: (subsectionId: string, index: number) => void;
  selectedSubsectionId?: string | null;
  editMode?: boolean;
}

const SubsectionContext = createContext<SubsectionContextType>({
  subsections: [],
});

interface SubsectionListProps {
  subsections: SubsectionRequest[];
  onRemoveSubsection: (index: number) => void;
  onAddSubsectionClick: () => void;
  onReorderSubsections?: (startIndex: number, endIndex: number) => void;
  onSelectSubsection?: (subsectionId: string, index: number) => void;
  selectedSubsectionId?: string | null;
  editMode?: boolean;
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
  const { subsections, onReorderSubsections, onSelectSubsection, selectedSubsectionId, editMode } = React.useContext(SubsectionContext);

  // Check if this item is selected
  const isSelected = id === selectedSubsectionId || subsection.id === selectedSubsectionId;

  // Handle click on the item to select it
  const handleSelectSubsection = (e: React.MouseEvent) => {
    // Don't trigger selection if clicking on buttons
    if (e.target instanceof HTMLButtonElement ||
        (e.target instanceof HTMLElement && e.target.closest('button'))) {
      return;
    }

    if (onSelectSubsection && editMode) {
      onSelectSubsection(subsection.id || id, index);
    }
  };

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

  // Get appropriate icon based on subsection type
  const getIcon = () => {
    switch (subsection.type) {
      case SubsectionType.ACTIVITY:
        return <Activity className={cn("h-5 w-5", colors.icon)} />;
      case SubsectionType.ROUTE:
        return <Route className={cn("h-5 w-5", colors.icon)} />;
      default:
        return <MapPin className={cn("h-5 w-5", colors.icon)} />;
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative mb-2 rounded-lg overflow-hidden transition-all duration-300 group",
        isDragging ? "shadow-lg" : isSelected ? "shadow-md ring-2 ring-blue-500/40 dark:ring-blue-500/30" : "shadow-sm hover:shadow-md",
        editMode && "cursor-pointer"
      )}
      {...attributes}
      onClick={handleSelectSubsection}
    >
      <div className={cn(
        "border rounded-lg p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm",
        colors.border,
        isDragging ? "opacity-90 border-dashed" : "opacity-100",
        isSelected && "bg-blue-50/50 dark:bg-blue-900/10"
      )}>
        <div className="flex items-center space-x-2">
          {/* Drag handle section */}
          {isDraggable && editMode && (
            <div
              {...listeners}
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                colors.bg,
                "hover:opacity-80 cursor-grab active:cursor-grabbing transition-all duration-200"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4 text-foreground/60" />
            </div>
          )}

          {/* Icon and title section */}
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            colors.bg
          )}>
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <h4 className="text-sm font-medium truncate text-foreground">
                {subsection.title || "Untitled Section"}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs px-2 h-5 font-medium",
                    colors.badge
                  )}
                >
                  {subsection.type}
                </Badge>
                {subsection.location && subsection.location.latitude !== 0 && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>Location set</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions section */}
          {editMode && (
            <div className="flex gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                title="Remove subsection"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {onReorderSubsections && (
                <>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      index > 0 && onReorderSubsections(index, index - 1);
                    }}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      index < subsections.length - 1 && onReorderSubsections(index, index + 1);
                    }}
                    disabled={index === subsections.length - 1}
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectSubsection) {
                    onSelectSubsection(subsection.id || id, index);
                  }
                }}
                title="View subsection"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const SubsectionList: React.FC<SubsectionListProps> = ({
  subsections,
  onRemoveSubsection,
  onAddSubsectionClick,
  onReorderSubsections,
  onSelectSubsection,
  selectedSubsectionId,
  editMode = false
}) => {
  // Generate stable ids for drag and drop
  const [items, setItems] = useState<{ id: string; subsection: SubsectionRequest }[]>([]);

  // Update items when subsections change
  useEffect(() => {
    setItems(subsections.map((subsection, index) => ({
      id: subsection.id || `subsection-${index}`,
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
    <SubsectionContext.Provider value={{
      subsections,
      onReorderSubsections,
      onSelectSubsection,
      selectedSubsectionId,
      editMode
    }}>
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
