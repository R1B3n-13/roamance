import { LocationPickerMap } from '@/components/maps/LocationPickerMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ActivityType } from '@/types';
import { SubsectionRequest, SubsectionType } from '@/types/subsection';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  GripVertical,
  ListChecks,
  Loader2,
  MapPin,
  Plus,
  Route,
  Save,
  StickyNote,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getSubsectionTypeColors } from './colorscheme';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import MDEditor from '@uiw/react-md-editor';
import { useTheme } from 'next-themes';

interface SubsectionFormProps {
  isSubmitting: boolean;
  onAddSubsection: (subsection: SubsectionRequest) => void;
  onCancel: () => void;
  journalId?: string;
  existingSubsection?: SubsectionRequest; // Optional prop for editing existing subsection
}

// Sortable checklist item component
interface SortableChecklistItemProps {
  id: string;
  title: string;
  completed: boolean;
  index: number;
  onToggleCompleted: () => void;
  onRemove: () => void;
  onTitleChange: (title: string) => void;
}

const SortableChecklistItem: React.FC<SortableChecklistItemProps> = ({
  id,
  title,
  completed,
  onToggleCompleted,
  onRemove,
  onTitleChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

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
  };

  const handleSubmit = () => {
    if (editedTitle.trim()) {
      onTitleChange(editedTitle.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 p-3 rounded-lg border",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
        "transition-all duration-200",
        "border-slate-200 dark:border-slate-800",
        isDragging
          ? "shadow-md ring-2 ring-indigo-500/30 dark:ring-indigo-500/20"
          : "shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/70"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none mr-1 text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="flex-shrink-0">
        <Checkbox
          checked={completed}
          onCheckedChange={onToggleCompleted}
          className={cn(
            "h-5 w-5 rounded-md data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white",
            "border-slate-300 dark:border-slate-700"
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            autoFocus
            className={cn(
              "h-8 px-2 text-sm focus-visible:ring-1 focus-visible:ring-indigo-500",
              "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            )}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className={cn(
              "px-1.5 py-1 -mx-1.5 rounded text-sm cursor-text transition-colors",
              "hover:bg-slate-100 dark:hover:bg-slate-800/80",
              completed && "line-through text-slate-500 dark:text-slate-400"
            )}
          >
            {title}
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export const SubsectionForm: React.FC<SubsectionFormProps> = ({
  isSubmitting,
  onAddSubsection,
  onCancel,
  journalId = '',
  existingSubsection,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Color schemes for subsection types
  const getSightSeeingColors = getSubsectionTypeColors(SubsectionType.SIGHTSEEING);
  const getActivityColors = getSubsectionTypeColors(SubsectionType.ACTIVITY);
  const getRouteColors = getSubsectionTypeColors(SubsectionType.ROUTE);

  const [subsectionError, setSubsectionError] = useState<string | null>(null);
  const [checklistItems, setChecklistItems] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [nextItemId, setNextItemId] = useState(1);

  const [subsection, setSubsection] = useState<SubsectionRequest>(() => {
    // Initialize with existingSubsection if provided, otherwise create a new one
    if (existingSubsection) {
      return { ...existingSubsection };
    }

    return {
      title: '',
      type: SubsectionType.SIGHTSEEING,
      note: '',
      checklists: [],
      journal_id: journalId,
      location: { latitude: 0, longitude: 0 },
    };
  });

  // Set up checklist items when subsection changes
  useEffect(() => {
    if (subsection.checklists && subsection.checklists.length > 0) {
      setChecklistItems(
        subsection.checklists.map((item, index) => ({
          id: `checklist-${index + 1}`,
          title: item.title,
          completed: item.completed,
        }))
      );
      setNextItemId(subsection.checklists.length + 1);
    } else {
      setChecklistItems([]);
      setNextItemId(1);
    }
  }, [subsection.checklists]);

  const handleSubsectionChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'type') {
      // Reset type-specific fields when changing subsection type
      const typeValue = value as SubsectionType;
      // build a new subsection and then cast to SubsectionRequest to satisfy the discriminated union
      const updatedSubsection = {
        ...subsection,
        type: typeValue,
        journal_id: journalId || '',
      } as SubsectionRequest;

      // Set default fields based on type
      if (
        updatedSubsection.type === SubsectionType.SIGHTSEEING ||
        updatedSubsection.type === SubsectionType.ACTIVITY
      ) {
        updatedSubsection.location = { latitude: 0, longitude: 0 };
        if (updatedSubsection.type === SubsectionType.ACTIVITY) {
          updatedSubsection.activity_type = ActivityType.OTHER;
        }
      } else if (updatedSubsection.type === SubsectionType.ROUTE) {
        updatedSubsection.waypoints = [];
        updatedSubsection.total_time = 0;
        updatedSubsection.total_distance = 0;
      }

      setSubsection(updatedSubsection);
    } else {
      setSubsection((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'type') {
      handleSubsectionChange({
        target: { name, value },
      } as React.ChangeEvent<HTMLSelectElement>);
    } else if (name === 'activity_type') {
      setSubsection((prev) => ({
        ...prev,
        activity_type: value as ActivityType,
      }));
    }
  };

  const handleRouteLocationChange = (
    index: number,
    coord: 'latitude' | 'longitude',
    value: string
  ) => {
    const numValue = parseFloat(value);

    setSubsection((prev) => {
      // Only update waypoints if the type is ROUTE
      if (prev.type === SubsectionType.ROUTE) {
        const updatedWaypoints = [...(prev.waypoints || [])];
        if (!updatedWaypoints[index]) {
          updatedWaypoints[index] = { latitude: 0, longitude: 0 };
        }

        updatedWaypoints[index] = {
          ...updatedWaypoints[index],
          [coord]: isNaN(numValue) ? 0 : numValue,
        };

        return {
          ...prev,
          waypoints: updatedWaypoints,
        };
      }
      // Return previous state if the type doesn't have waypoints
      return prev;
    });
  };

  const addRouteLocation = () => {
    setSubsection((prev) => {
      if (prev.type === SubsectionType.ROUTE) {
        return {
          ...prev,
          waypoints: [...(prev.waypoints || []), { latitude: 0, longitude: 0 }],
        };
      }
      return prev;
    });
  };

  const removeRouteLocation = (index: number) => {
    setSubsection((prev) => {
      if (prev.type === SubsectionType.ROUTE) {
        const updatedWaypoints = [...(prev.waypoints || [])];
        updatedWaypoints.splice(index, 1);

        return {
          ...prev,
          waypoints: updatedWaypoints,
        };
      }
      return prev;
    });
  };

  const handleNoteChange = (value: string | undefined) => {
    setSubsection(prev => ({
      ...prev,
      note: value || ''
    }));
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem = {
        id: `checklist-${nextItemId}`,
        title: newChecklistItem.trim(),
        completed: false
      };

      setChecklistItems(prev => [...prev, newItem]);
      setNextItemId(prev => prev + 1);
      setNewChecklistItem('');

      // Update subsection
      setSubsection(prev => ({
        ...prev,
        checklists: [
          ...prev.checklists,
          { title: newItem.title, completed: newItem.completed }
        ]
      }));
    }
  };

  const toggleChecklistItem = (index: number) => {
    setChecklistItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        completed: !updated[index].completed
      };

      // Update subsection
      setSubsection(prevSubsection => ({
        ...prevSubsection,
        checklists: updated.map(item => ({
          title: item.title,
          completed: item.completed
        }))
      }));

      return updated;
    });
  };

  const updateChecklistItemTitle = (index: number, newTitle: string) => {
    setChecklistItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        title: newTitle
      };

      // Update subsection
      setSubsection(prevSubsection => ({
        ...prevSubsection,
        checklists: updated.map(item => ({
          title: item.title,
          completed: item.completed
        }))
      }));

      return updated;
    });
  };

  const removeChecklistItem = (index: number) => {
    setChecklistItems(prev => {
      const updated = prev.filter((_, i) => i !== index);

      // Update subsection
      setSubsection(prevSubsection => ({
        ...prevSubsection,
        checklists: updated.map(item => ({
          title: item.title,
          completed: item.completed
        }))
      }));

      return updated;
    });
  };

  // Handle checklist reordering
  const handleChecklistDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setChecklistItems(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        const updatedItems = [...items];
        const [movedItem] = updatedItems.splice(oldIndex, 1);
        updatedItems.splice(newIndex, 0, movedItem);

        // Update subsection
        setSubsection(prevSubsection => ({
          ...prevSubsection,
          checklists: updatedItems.map(item => ({
            title: item.title,
            completed: item.completed
          }))
        }));

        return updatedItems;
      });
    }
  };

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

  const handleSubmit = () => {
    // Reset all errors
    setSubsectionError(null);

    // Field-level validation errors
    const validationErrors: Record<string, string> = {};

    // Validate title
    if (!subsection.title.trim()) {
      validationErrors.title = 'Title is required';
    }

    // Type-specific validations
    if (subsection.type === SubsectionType.SIGHTSEEING || subsection.type === SubsectionType.ACTIVITY) {
      // Validate location
      if (!subsection.location || (subsection.location.latitude === 0 && subsection.location.longitude === 0)) {
        validationErrors.location = 'Please select a location on the map';
      }

      // Activity type validation
      if (subsection.type === SubsectionType.ACTIVITY && !subsection.activity_type) {
        validationErrors.activity_type = 'Please select an activity type';
      }
    } else if (subsection.type === SubsectionType.ROUTE) {
      // Validate routes have at least 2 waypoints
      if (!subsection.waypoints || subsection.waypoints.length < 2) {
        validationErrors.waypoints = 'Routes should have at least 2 waypoints';
      }

      // Check for valid coordinates in waypoints
      const invalidWaypoints = subsection.waypoints?.findIndex(
        wp => Math.abs(wp.latitude) < 0.00001 && Math.abs(wp.longitude) < 0.00001
      );

      if (invalidWaypoints !== -1 && invalidWaypoints !== undefined) {
        validationErrors.waypoint = `Waypoint ${invalidWaypoints + 1} has invalid coordinates`;
      }
    }

    // If there are validation errors, set the main error message and return
    if (Object.keys(validationErrors).length > 0) {
      // Set main error message to first error
      const firstError = Object.values(validationErrors)[0];
      setSubsectionError(firstError);

      // Add field-specific error classes (handled in render)
      setFieldErrors(validationErrors);
      return;
    }

    // If validation passes, submit the subsection
    onAddSubsection(subsection);
  };

  // Add state for field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Helper function to determine if a field has an error
  const hasFieldError = (fieldName: string): boolean => {
    return fieldName in fieldErrors;
  };

  // Helper function to get field error message
  const getFieldErrorMessage = (fieldName: string): string => {
    return fieldErrors[fieldName] || '';
  };

  // Clear field error when user edits a field
  const clearFieldError = (fieldName: string) => {
    if (hasFieldError(fieldName)) {
      setFieldErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Error Banner */}
      <AnimatePresence>
        {subsectionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 flex items-start"
          >
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">{subsectionError}</p>
              <p className="text-sm text-destructive/90">Please review the form and fix any errors highlighted below.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        {/* Section Type Selection */}
        <div className="mb-6">
          <Label className="block text-sm font-medium text-foreground/80 mb-3">
            Section Type
          </Label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                handleSelectChange('type', SubsectionType.SIGHTSEEING);
                clearFieldError('type');
              }}
              className={cn(
                'relative flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200',
                subsection.type === SubsectionType.SIGHTSEEING
                  ? `${getSightSeeingColors.border} ${getSightSeeingColors.bg} ring-2 ring-violet-500/20`
                  : 'border-slate-200 dark:border-slate-800 hover:border-violet-500/30 hover:bg-violet-50/30 dark:hover:bg-violet-900/10'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center mb-2',
                  subsection.type === SubsectionType.SIGHTSEEING
                    ? getSightSeeingColors.bgSolid
                    : 'bg-slate-100 dark:bg-slate-800'
                )}
              >
                <Eye
                  className={cn(
                    'w-6 h-6',
                    subsection.type === SubsectionType.SIGHTSEEING
                      ? getSightSeeingColors.icon
                      : 'text-muted-foreground'
                  )}
                />
              </div>
              <span
                className={cn(
                  'font-medium',
                  subsection.type === SubsectionType.SIGHTSEEING
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                Sightseeing
              </span>

              {subsection.type === SubsectionType.SIGHTSEEING && (
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-violet-300/5 to-purple-500/5" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                handleSelectChange('type', SubsectionType.ACTIVITY);
                clearFieldError('type');
              }}
              className={cn(
                'relative flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200',
                subsection.type === SubsectionType.ACTIVITY
                  ? `${getActivityColors.border} ${getActivityColors.bg} ring-2 ring-sunset-500/20`
                  : 'border-slate-200 dark:border-slate-800 hover:border-sunset-500/30 hover:bg-sunset-50/30 dark:hover:bg-sunset-900/10'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center mb-2',
                  subsection.type === SubsectionType.ACTIVITY
                    ? getActivityColors.bgSolid
                    : 'bg-slate-100 dark:bg-slate-800'
                )}
              >
                <Activity
                  className={cn(
                    'w-6 h-6',
                    subsection.type === SubsectionType.ACTIVITY
                      ? getActivityColors.icon
                      : 'text-muted-foreground'
                  )}
                />
              </div>
              <span
                className={cn(
                  'font-medium',
                  subsection.type === SubsectionType.ACTIVITY
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                Activity
              </span>

              {subsection.type === SubsectionType.ACTIVITY && (
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-sunset-500/5 via-sunset-300/5 to-orange-500/5" />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                handleSelectChange('type', SubsectionType.ROUTE);
                clearFieldError('type');
              }}
              className={cn(
                'relative flex flex-col items-center justify-center p-4 rounded-lg border transition-all duration-200',
                subsection.type === SubsectionType.ROUTE
                  ? `${getRouteColors.border} ${getRouteColors.bg} ring-2 ring-forest-500/20`
                  : 'border-slate-200 dark:border-slate-800 hover:border-forest-500/30 hover:bg-forest-50/30 dark:hover:bg-forest-900/10'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center mb-2',
                  subsection.type === SubsectionType.ROUTE
                    ? getRouteColors.bgSolid
                    : 'bg-slate-100 dark:bg-slate-800'
                )}
              >
                <Route
                  className={cn(
                    'w-6 h-6',
                    subsection.type === SubsectionType.ROUTE
                      ? getRouteColors.icon
                      : 'text-muted-foreground'
                  )}
                />
              </div>
              <span
                className={cn(
                  'font-medium',
                  subsection.type === SubsectionType.ROUTE
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                Route
              </span>

              {subsection.type === SubsectionType.ROUTE && (
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-forest-500/5 via-forest-300/5 to-green-500/5" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Subsection Title */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Label
              htmlFor="title"
              className={cn(
                "block text-sm font-medium",
                hasFieldError('title') ? "text-destructive" : "text-foreground/80"
              )}
            >
              Title {hasFieldError('title') && <span className="text-destructive">*</span>}
            </Label>
            {hasFieldError('title') && (
              <span className="text-xs text-destructive">{getFieldErrorMessage('title')}</span>
            )}
          </div>
          <Input
            id="title"
            name="title"
            value={subsection.title}
            onChange={(e) => {
              handleSubsectionChange(e);
              clearFieldError('title');
            }}
            placeholder="Enter a title for this section"
            className={cn(
              "w-full",
              hasFieldError('title')
                ? "border-destructive focus:ring-destructive/30"
                : "border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-sky-500/20"
            )}
          />
        </div>

        {/* Location Map */}
        {(subsection.type === SubsectionType.SIGHTSEEING ||
          subsection.type === SubsectionType.ACTIVITY) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label
                className={cn(
                  "block text-sm font-medium",
                  hasFieldError('location') ? "text-destructive" : "text-foreground/80"
                )}
              >
                Location {hasFieldError('location') && <span className="text-destructive">*</span>}
              </Label>
              {hasFieldError('location') && (
                <span className="text-xs text-destructive">{getFieldErrorMessage('location')}</span>
              )}
            </div>
            <div className={cn(
              "border rounded-lg overflow-hidden",
              hasFieldError('location')
                ? "border-destructive"
                : "border-slate-200 dark:border-slate-800"
            )}>
              <LocationPickerMap
                initialLocation={subsection.location}
                onLocationChangeAction={(lat, lng) => {
                  setSubsection((prev) => ({
                    ...prev,
                    location: { latitude: lat, longitude: lng },
                  }));
                  clearFieldError('location');
                }}
                height="300px"
              />
              {hasFieldError('location') && (
                <div className="bg-destructive/5 px-3 py-2 text-sm text-destructive/90 border-t border-destructive/20">
                  Please click on the map to select a location
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Type (only for ACTIVITY type) */}
        {subsection.type === SubsectionType.ACTIVITY && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Label
                htmlFor="activity_type"
                className={cn(
                  "block text-sm font-medium",
                  hasFieldError('activity_type') ? "text-destructive" : "text-foreground/80"
                )}
              >
                Activity Type {hasFieldError('activity_type') && <span className="text-destructive">*</span>}
              </Label>
              {hasFieldError('activity_type') && (
                <span className="text-xs text-destructive">{getFieldErrorMessage('activity_type')}</span>
              )}
            </div>
            <Select
              value={subsection.activity_type}
              onValueChange={(value) => {
                handleSelectChange('activity_type', value);
                clearFieldError('activity_type');
              }}
            >
              <SelectTrigger
                className={cn(
                  "w-full",
                  hasFieldError('activity_type')
                    ? "border-destructive ring-destructive/20"
                    : "border-slate-200 dark:border-slate-800"
                )}
              >
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ActivityType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type
                      .replace('_', ' ')
                      .split(' ')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Route Information (only for ROUTE type) */}
        {subsection.type === SubsectionType.ROUTE && (
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Label
                  className={cn(
                    "block text-sm font-medium",
                    hasFieldError('waypoints') || hasFieldError('waypoint') ? "text-destructive" : "text-foreground/80"
                  )}
                >
                  Waypoints
                  {(hasFieldError('waypoints') || hasFieldError('waypoint')) && <span className="text-destructive">*</span>}
                </Label>
                {(hasFieldError('waypoints') || hasFieldError('waypoint')) && (
                  <span className="ml-2 text-xs text-destructive">
                    {getFieldErrorMessage('waypoints') || getFieldErrorMessage('waypoint')}
                  </span>
                )}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  addRouteLocation();
                  clearFieldError('waypoints');
                }}
                className="gap-1 border-slate-200 dark:border-slate-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400"
              >
                <Plus className="w-4 h-4" /> Add Waypoint
              </Button>
            </div>

            <div
              className={cn(
                "rounded-lg border p-3",
                hasFieldError('waypoints') || hasFieldError('waypoint')
                  ? "border-destructive/50 bg-destructive/5"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
              )}
            >
              {subsection.waypoints && subsection.waypoints.length > 0 ? (
                <div className="space-y-3">
                  {subsection.waypoints.map((waypoint, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-slate-800 border shadow-sm",
                        hasFieldError('waypoint') && index === parseInt(getFieldErrorMessage('waypoint').split(' ')[1]) - 1
                          ? "border-destructive/50"
                          : "border-slate-200 dark:border-slate-700"
                      )}
                    >
                      <div className="w-6 h-6 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center text-xs text-forest-600 dark:text-forest-400 font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <Label
                            htmlFor={`waypoint-lat-${index}`}
                            className="text-xs text-muted-foreground mb-1 block"
                          >
                            Latitude
                          </Label>
                          <Input
                            id={`waypoint-lat-${index}`}
                            type="number"
                            value={waypoint.latitude}
                            onChange={(e) => {
                              handleRouteLocationChange(
                                index,
                                'latitude',
                                e.target.value
                              );
                              clearFieldError('waypoint');
                            }}
                            className={cn(
                              "h-8",
                              hasFieldError('waypoint') && index === parseInt(getFieldErrorMessage('waypoint').split(' ')[1]) - 1
                                ? "border-destructive/50"
                                : "border-slate-200 dark:border-slate-700"
                            )}
                            step="0.000001"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor={`waypoint-lng-${index}`}
                            className="text-xs text-muted-foreground mb-1 block"
                          >
                            Longitude
                          </Label>
                          <Input
                            id={`waypoint-lng-${index}`}
                            type="number"
                            value={waypoint.longitude}
                            onChange={(e) => {
                              handleRouteLocationChange(
                                index,
                                'longitude',
                                e.target.value
                              );
                              clearFieldError('waypoint');
                            }}
                            className={cn(
                              "h-8",
                              hasFieldError('waypoint') && index === parseInt(getFieldErrorMessage('waypoint').split(' ')[1]) - 1
                                ? "border-destructive/50"
                                : "border-slate-200 dark:border-slate-700"
                            )}
                            step="0.000001"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeRouteLocation(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-5 text-center bg-white/80 dark:bg-slate-800/80">
                  <MapPin className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No waypoints added. Add waypoints to create a route.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      addRouteLocation();
                      clearFieldError('waypoints');
                    }}
                    className="mt-3 gap-1.5 border-slate-300 dark:border-slate-700 hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Waypoint
                  </Button>
                </div>
              )}

              {hasFieldError('waypoints') && (
                <p className="mt-2 text-xs text-destructive bg-white/80 dark:bg-slate-900/80 p-2 rounded border border-destructive/20">
                  {getFieldErrorMessage('waypoints')}. Routes need at least two connected points.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <Label
                  htmlFor="total_time"
                  className="block text-sm font-medium text-foreground/80 mb-2"
                >
                  <Clock className="w-4 h-4 inline-block mr-1 opacity-70" /> Total Time (minutes)
                </Label>
                <Input
                  id="total_time"
                  name="total_time"
                  type="number"
                  min="0"
                  value={subsection.total_time || 0}
                  onChange={handleSubsectionChange}
                  className="w-full border-slate-200 dark:border-slate-800"
                />
              </div>
              <div>
                <Label
                  htmlFor="total_distance"
                  className="block text-sm font-medium text-foreground/80 mb-2"
                >
                  <Route className="w-4 h-4 inline-block mr-1 opacity-70" /> Total Distance (km)
                </Label>
                <Input
                  id="total_distance"
                  name="total_distance"
                  type="number"
                  min="0"
                  step="0.1"
                  value={subsection.total_distance || 0}
                  onChange={handleSubsectionChange}
                  className="w-full border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notes with Rich Text Editor */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="w-4 h-4 text-muted-foreground" />
            <Label className="block text-sm font-medium text-foreground/80">
              Notes (Markdown Supported)
            </Label>
          </div>
          <div data-color-mode={isDarkMode ? "dark" : "light"}>
            <MDEditor
              value={subsection.note}
              onChange={handleNoteChange}
              preview="edit"
              height={200}
              className={cn(
                "w-full border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden",
                isDarkMode ? "dark-md-editor" : ""
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Tip: Use markdown for formatting. *italic*, **bold**, # Heading, - List, [Link](url), etc.
          </p>
        </div>

        {/* Checklist with Drag and Drop */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="w-4 h-4 text-muted-foreground" />
            <Label className="block text-sm font-medium text-foreground/80">
              Checklist
            </Label>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            {checklistItems.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleChecklistDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={checklistItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                  <div className="bg-white dark:bg-slate-800 rounded-t-lg">
                    {checklistItems.map((item, index) => (
                      <SortableChecklistItem
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        completed={item.completed}
                        index={index}
                        onToggleCompleted={() => toggleChecklistItem(index)}
                        onRemove={() => removeChecklistItem(index)}
                        onTitleChange={(title) => updateChecklistItemTitle(index, title)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-4 text-center text-muted-foreground text-sm">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p>No checklist items added yet</p>
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new checklist item"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addChecklistItem();
                    }
                  }}
                  className="flex-1 border-slate-200 dark:border-slate-700 h-9"
                />
                <Button
                  type="button"
                  onClick={addChecklistItem}
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-muted-foreground">
            <span className="text-destructive">*</span> Required fields
          </div>
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-4 border-slate-200 dark:border-slate-800"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border-none shadow-sm hover:shadow-md transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {existingSubsection ? 'Update Section' : 'Add Section'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
