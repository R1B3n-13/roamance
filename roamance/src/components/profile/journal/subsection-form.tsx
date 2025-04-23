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
    notes: [],
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
    if (newNote.trim()) {
      setSubsection((prev) => ({
        ...prev,
        notes: [...prev.notes, newNote.trim()],
      }));
      setNewNote('');
    }
  };

  const removeNote = (index: number) => {
    setSubsection((prev) => {
      const updatedNotes = [...prev.notes];
      updatedNotes.splice(index, 1);

      return {
        ...prev,
        notes: updatedNotes,
      };
    });
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setSubsection((prev) => ({
        ...prev,
        checklists: [...prev.checklists, newChecklistItem.trim()],
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

  // Helper function to get colors for current type
  const getTypeColors = () => {
    return getSubsectionTypeColors(subsection.type);
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      {subsectionError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3 bg-destructive/10 dark:bg-destructive/20 rounded-lg text-destructive text-sm flex items-start border border-destructive/20"
        >
          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{subsectionError}</span>
        </motion.div>
      )}

      <div>
        <label
          htmlFor="subsectionTitle"
          className="text-sm font-medium text-foreground/80 mb-1.5 block"
        >
          Section Title
        </label>
        <Input
          type="text"
          id="subsectionTitle"
          name="title"
          value={subsection.title}
          onChange={handleSubsectionChange}
          placeholder="e.g., Visit to Eiffel Tower"
          className="h-11"
          required
        />
      </div>

      <div>
        <label
          htmlFor="subsectionType"
          className="text-sm font-medium text-foreground/80 mb-1.5 block"
        >
          Section Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() =>
              handleSubsectionChange({
                target: {
                  name: 'type',
                  value: SubsectionType.SIGHTSEEING,
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 h-[90px]',
              subsection.type === SubsectionType.SIGHTSEEING
                ? cn(getSightSeeingColors.bg, getSightSeeingColors.border)
                : 'bg-muted/10 border-muted/30 hover:bg-muted/20'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                subsection.type === SubsectionType.SIGHTSEEING
                  ? cn(getSightSeeingColors.bgSolid, getSightSeeingColors.icon)
                  : 'bg-muted/50 text-muted-foreground'
              )}
            >
              <Eye className="w-5 h-5" />
            </div>
            <span
              className={cn(
                'text-sm',
                subsection.type === SubsectionType.SIGHTSEEING
                  ? getSightSeeingColors.icon
                  : 'text-muted-foreground'
              )}
            >
              Sightseeing
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleSubsectionChange({
                target: {
                  name: 'type',
                  value: SubsectionType.ACTIVITY,
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 h-[90px]',
              subsection.type === SubsectionType.ACTIVITY
                ? cn(getActivityColors.bg, getActivityColors.border)
                : 'bg-muted/10 border-muted/30 hover:bg-muted/20'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                subsection.type === SubsectionType.ACTIVITY
                  ? cn(getActivityColors.bgSolid, getActivityColors.icon)
                  : 'bg-muted/50 text-muted-foreground'
              )}
            >
              <Activity className="w-5 h-5" />
            </div>
            <span
              className={cn(
                'text-sm',
                subsection.type === SubsectionType.ACTIVITY
                  ? getActivityColors.icon
                  : 'text-muted-foreground'
              )}
            >
              Activity
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleSubsectionChange({
                target: {
                  name: 'type',
                  value: SubsectionType.ROUTE,
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 h-[90px]',
              subsection.type === SubsectionType.ROUTE
                ? cn(getRouteColors.bg, getRouteColors.border)
                : 'bg-muted/10 border-muted/30 hover:bg-muted/20'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                subsection.type === SubsectionType.ROUTE
                  ? cn(getRouteColors.bgSolid, getRouteColors.icon)
                  : 'bg-muted/50 text-muted-foreground'
              )}
            >
              <Route className="w-5 h-5" />
            </div>
            <span
              className={cn(
                'text-sm',
                subsection.type === SubsectionType.ROUTE
                  ? getRouteColors.icon
                  : 'text-muted-foreground'
              )}
            >
              Route
            </span>
          </button>
        </div>
      </div>

      {/* Type-specific fields */}
      {(subsection.type === SubsectionType.SIGHTSEEING ||
        subsection.type === SubsectionType.ACTIVITY) && (
        <div
          className={cn(
            'space-y-4 p-4 rounded-xl border',
            getTypeColors().bg,
            getTypeColors().border
          )}
        >
          <div>
            <label className="text-sm font-medium text-foreground/80 mb-1.5 block">
              Location
            </label>
            <LocationPickerMap
              initialLocation={
                subsection.location || { latitude: 0, longitude: 0 }
              }
              onLocationChangeAction={(lat, lng) => {
                setSubsection((prev) => ({
                  ...prev,
                  location: {
                    latitude: lat,
                    longitude: lng,
                  },
                }));
              }}
              height="250px"
            />
          </div>

          {subsection.type === SubsectionType.ACTIVITY && (
            <div>
              <label
                htmlFor="activityType"
                className="text-sm font-medium text-foreground/80 mb-1.5 block"
              >
                Activity Type
              </label>
              <div className="relative">
                <Activity className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <select
                  id="activityType"
                  name="activity_type"
                  value={subsection.activity_type || ActivityType.OTHER}
                  onChange={handleSubsectionChange}
                  className="pl-10 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {Object.values(ActivityType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {subsection.type === SubsectionType.ROUTE && (
        <div
          className={cn(
            'space-y-4 p-4 rounded-xl border',
            getRouteColors.bg,
            getRouteColors.border
          )}
        >
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-foreground/80">
                Route Locations
              </label>
              <Button
                type="button"
                onClick={addRouteLocation}
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-2 text-xs gap-1 hover:bg-forest-light/20 dark:hover:bg-forest-dark/30',
                  getRouteColors.icon
                )}
              >
                <Plus className="w-3 h-3" />
                Add Stop
              </Button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
              {(subsection.waypoints || []).length > 0 ? (
                (subsection.waypoints || []).map((location, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0',
                        getRouteColors.bgSolid,
                        getRouteColors.icon
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        step="0.000001"
                        value={location.latitude}
                        onChange={(e) =>
                          handleRouteLocationChange(
                            index,
                            'latitude',
                            e.target.value
                          )
                        }
                        className="h-9 text-sm"
                        placeholder="Latitude"
                      />
                      <Input
                        type="number"
                        step="0.000001"
                        value={location.longitude}
                        onChange={(e) =>
                          handleRouteLocationChange(
                            index,
                            'longitude',
                            e.target.value
                          )
                        }
                        className="h-9 text-sm"
                        placeholder="Longitude"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRouteLocation(index)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground py-3 text-center bg-background/50 rounded-lg border border-muted/30">
                  No route locations added yet
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="totalDistance"
                className="text-sm font-medium text-foreground/80 mb-1.5 block"
              >
                Total Distance (km)
              </label>
              <div className="relative">
                <Route className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.1"
                  id="totalDistance"
                  name="total_distance"
                  value={subsection.total_distance || 0}
                  onChange={handleSubsectionChange}
                  placeholder="0.0"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="totalTime"
                className="text-sm font-medium text-foreground/80 mb-1.5 block"
              >
                Total Time (min)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  id="totalTime"
                  name="total_time"
                  value={subsection.total_time || 0}
                  onChange={handleSubsectionChange}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes and Checklists (shared across all types) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground/80">
              <span className="flex items-center">
                <StickyNote className="w-4 h-4 mr-1.5 text-violet" />
                Notes
              </span>
            </label>
          </div>

          <NotesInput
            notes={subsection.notes}
            newNote={newNote}
            onNoteChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewNote(e.target.value)
            }
            onAddNote={addNote}
            onRemoveNote={removeNote}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground/80">
              <span className="flex items-center">
                <ListChecks className="w-4 h-4 mr-1.5 text-forest" />
                Checklist
              </span>
            </label>
          </div>

          <ChecklistInput
            checklist={subsection.checklists}
            newItem={newChecklistItem}
            onItemChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewChecklistItem(e.target.value)
            }
            onAddItem={addChecklistItem}
            onRemoveItem={removeChecklistItem}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="px-6 py-2 rounded-full"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 rounded-full bg-gradient-to-r from-violet to-lavender hover:from-violet hover:to-lavender/90 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Section'
          )}
        </Button>
      </div>
    </div>
  );
};
