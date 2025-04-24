import { LocationPickerMap } from '@/components/maps/LocationPickerMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ActivityType } from '@/types';
import { SubsectionRequest, SubsectionType } from '@/types/subsection';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Clock,
  Eye,
  ListChecks,
  Loader2,
  Plus,
  Route,
  StickyNote,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { ChecklistInput } from '../../common/checklist-input';
import { NotesInput } from '../../common/notes-input';
import { getSubsectionTypeColors } from './colorscheme';

interface SubsectionFormProps {
  isSubmitting: boolean;
  onAddSubsection: (subsection: SubsectionRequest) => void;
  onCancel: () => void;
  journalId?: string;
}

export const SubsectionForm: React.FC<SubsectionFormProps> = ({
  isSubmitting,
  onAddSubsection,
  onCancel,
  journalId = '',
}) => {
  const [subsectionError, setSubsectionError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const [subsection, setSubsection] = useState<SubsectionRequest>({
    title: '',
    type: SubsectionType.SIGHTSEEING,
    note: '',
    checklists: [],
    journal_id: journalId,
    location: { latitude: 0, longitude: 0 },
  });

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

  const addNote = () => {
    // Just update the subsection with the current note value
    if (newNote.trim()) {
      setSubsection((prev) => ({
        ...prev,
        note: newNote
      }));
    }
  };

  const handleNoteChange = (value: string) => {
    setNewNote(value);
  };

  const removeNote = () => {
    setSubsection((prev) => ({
      ...prev,
      note: ''
    }));
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setSubsection((prev) => ({
        ...prev,
        checklists: [...prev.checklists, { title: newChecklistItem.trim(), completed: false }],
      }));
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (index: number) => {
    setSubsection((prev) => {
      const updatedChecklists = [...prev.checklists];
      updatedChecklists.splice(index, 1);

      return {
        ...prev,
        checklists: updatedChecklists,
      };
    });
  };

  const toggleChecklistItem = (index: number) => {
    setSubsection((prev) => {
      const updatedChecklists = [...prev.checklists];
      updatedChecklists[index] = {
        ...updatedChecklists[index],
        completed: !updatedChecklists[index].completed
      };

      return {
        ...prev,
        checklists: updatedChecklists,
      };
    });
  };

  const handleSubmit = () => {
    setSubsectionError(null);

    if (!subsection.title.trim()) {
      setSubsectionError('Subsection title is required');
      return;
    }

    onAddSubsection(subsection);
  };

  // Get the appropriate color scheme based on subsection type
  const getSightSeeingColors = getSubsectionTypeColors(
    SubsectionType.SIGHTSEEING
  );
  const getActivityColors = getSubsectionTypeColors(SubsectionType.ACTIVITY);
  const getRouteColors = getSubsectionTypeColors(SubsectionType.ROUTE);

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {subsectionError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 flex items-start"
        >
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{subsectionError}</p>
          </div>
        </motion.div>
      )}

      {/* Subsection Type Selection */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => {
            handleSubsectionChange({
              target: { name: 'type', value: SubsectionType.SIGHTSEEING },
            } as React.ChangeEvent<HTMLSelectElement>);
          }}
          className={cn(
            'flex flex-col items-center justify-center p-4 rounded-lg border transition-all',
            subsection.type === SubsectionType.SIGHTSEEING
              ? `${getSightSeeingColors.border} ${getSightSeeingColors.bg} ring-2 ring-violet-500/20`
              : 'border-muted-foreground/20 hover:border-violet-500/30 hover:bg-violet-50/30 dark:hover:bg-violet-900/10'
          )}
        >
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center mb-2',
              subsection.type === SubsectionType.SIGHTSEEING
                ? getSightSeeingColors.bgSolid
                : 'bg-muted/50'
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
        </button>

        <button
          type="button"
          onClick={() => {
            handleSubsectionChange({
              target: { name: 'type', value: SubsectionType.ACTIVITY },
            } as React.ChangeEvent<HTMLSelectElement>);
          }}
          className={cn(
            'flex flex-col items-center justify-center p-4 rounded-lg border transition-all',
            subsection.type === SubsectionType.ACTIVITY
              ? `${getActivityColors.border} ${getActivityColors.bg} ring-2 ring-sunset-500/20`
              : 'border-muted-foreground/20 hover:border-sunset-500/30 hover:bg-sunset-50/30 dark:hover:bg-sunset-900/10'
          )}
        >
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center mb-2',
              subsection.type === SubsectionType.ACTIVITY
                ? getActivityColors.bgSolid
                : 'bg-muted/50'
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
        </button>

        <button
          type="button"
          onClick={() => {
            handleSubsectionChange({
              target: { name: 'type', value: SubsectionType.ROUTE },
            } as React.ChangeEvent<HTMLSelectElement>);
          }}
          className={cn(
            'flex flex-col items-center justify-center p-4 rounded-lg border transition-all',
            subsection.type === SubsectionType.ROUTE
              ? `${getRouteColors.border} ${getRouteColors.bg} ring-2 ring-forest-500/20`
              : 'border-muted-foreground/20 hover:border-forest-500/30 hover:bg-forest-50/30 dark:hover:bg-forest-900/10'
          )}
        >
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center mb-2',
              subsection.type === SubsectionType.ROUTE
                ? getRouteColors.bgSolid
                : 'bg-muted/50'
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
        </button>
      </div>

      {/* Subsection Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-foreground/80 mb-1"
        >
          Title
        </label>
        <Input
          id="title"
          name="title"
          value={subsection.title}
          onChange={handleSubsectionChange}
          placeholder="Enter a title for this section"
          className="w-full"
        />
      </div>

      {/* Location */}
      {(subsection.type === SubsectionType.SIGHTSEEING ||
        subsection.type === SubsectionType.ACTIVITY) && (
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">
            Location
          </label>
          <LocationPickerMap
            initialLocation={subsection.location}
            onLocationChangeAction={(lat, lng) => {
              setSubsection((prev) => ({
                ...prev,
                location: { latitude: lat, longitude: lng },
              }));
            }}
            height="250px"
          />
        </div>
      )}

      {/* Activity Type (only for ACTIVITY type) */}
      {subsection.type === SubsectionType.ACTIVITY && (
        <div>
          <label
            htmlFor="activity_type"
            className="block text-sm font-medium text-foreground/80 mb-1"
          >
            Activity Type
          </label>
          <select
            id="activity_type"
            name="activity_type"
            value={subsection.activity_type}
            onChange={handleSubsectionChange}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
          >
            {Object.values(ActivityType).map((type) => (
              <option key={type} value={type}>
                {type
                  .replace('_', ' ')
                  .split(' ')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ')}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Route Information (only for ROUTE type) */}
      {subsection.type === SubsectionType.ROUTE && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-foreground/80">
              Waypoints
            </label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addRouteLocation}
              className="gap-1"
            >
              <Plus className="w-4 h-4" /> Add Waypoint
            </Button>
          </div>

          {subsection.waypoints && subsection.waypoints.length > 0 ? (
            <div className="space-y-3">
              {subsection.waypoints.map((waypoint, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border border-muted rounded-lg bg-muted/10"
                >
                  <div className="w-6 h-6 rounded-full bg-forest-light/50 dark:bg-forest-dark/30 flex items-center justify-center text-xs text-forest-dark dark:text-forest-light font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor={`waypoint-lat-${index}`}
                        className="text-xs text-muted-foreground mb-1 block"
                      >
                        Latitude
                      </label>
                      <Input
                        id={`waypoint-lat-${index}`}
                        type="number"
                        value={waypoint.latitude}
                        onChange={(e) =>
                          handleRouteLocationChange(
                            index,
                            'latitude',
                            e.target.value
                          )
                        }
                        className="h-8"
                        step="0.000001"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`waypoint-lng-${index}`}
                        className="text-xs text-muted-foreground mb-1 block"
                      >
                        Longitude
                      </label>
                      <Input
                        id={`waypoint-lng-${index}`}
                        type="number"
                        value={waypoint.longitude}
                        onChange={(e) =>
                          handleRouteLocationChange(
                            index,
                            'longitude',
                            e.target.value
                          )
                        }
                        className="h-8"
                        step="0.000001"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRouteLocation(index)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-muted-foreground/20 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                No waypoints added. Add waypoints to create a route.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label
                htmlFor="total_time"
                className="block text-sm font-medium text-foreground/80 mb-1"
              >
                <Clock className="w-4 h-4 inline-block mr-1" /> Total Time (minutes)
              </label>
              <Input
                id="total_time"
                name="total_time"
                type="number"
                min="0"
                value={subsection.total_time || 0}
                onChange={handleSubsectionChange}
                className="w-full"
              />
            </div>
            <div>
              <label
                htmlFor="total_distance"
                className="block text-sm font-medium text-foreground/80 mb-1"
              >
                <Route className="w-4 h-4 inline-block mr-1" /> Total Distance (km)
              </label>
              <Input
                id="total_distance"
                name="total_distance"
                type="number"
                min="0"
                step="0.1"
                value={subsection.total_distance || 0}
                onChange={handleSubsectionChange}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <StickyNote className="w-4 h-4 text-muted-foreground" />
          <label className="block text-sm font-medium text-foreground/80">
            Notes
          </label>
        </div>
        <NotesInput
          notes={[subsection.note]}
          newNote={newNote}
          onNoteChange={handleNoteChange}
          onAddNote={addNote}
          onRemoveNote={removeNote}
        />
      </div>

      {/* Checklist */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ListChecks className="w-4 h-4 text-muted-foreground" />
          <label className="block text-sm font-medium text-foreground/80">
            Checklist
          </label>
        </div>
        <ChecklistInput
          items={subsection.checklists}
          newItem={newChecklistItem}
          onItemChange={(e) => setNewChecklistItem(e.target.value)}
          onAddItem={addChecklistItem}
          onRemoveItem={removeChecklistItem}
          onToggleItem={toggleChecklistItem}
        />
      </div>

      {/* Form actions */}
      <div className="flex justify-end space-x-3 pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-4"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Add Section'
          )}
        </Button>
      </div>
    </div>
  );
};
