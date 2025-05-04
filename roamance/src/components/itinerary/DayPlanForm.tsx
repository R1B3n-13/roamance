'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { DayPlanCreateRequest, RoutePlanRequest } from '@/types/itinerary';
import { Location } from '@/types/location';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, MapPin, PlusCircle, Save, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { LocationPickerMap } from '@/components/maps/LocationPickerMap';

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const routePlanSchema = z.object({
  total_distance: z.number().min(0),
  total_time: z.number().min(0),
  description: z.string(),
  locations: z.array(locationSchema).min(1, "At least one location is required"),
});

const dayPlanFormSchema = z.object({
  date: z.date({
    required_error: 'A date is required',
  }),
  notes: z
    .array(z.string())
    .optional()
    .default([])
    .transform((val) => val.filter((note) => note.trim() !== '')),
  route_plan: z.object({
    total_distance: z.number().min(0).default(0),
    total_time: z.number().min(0).default(0),
    description: z.string().default(""),
    locations: z.array(locationSchema).default([]),
  }).optional(),
});

type DayPlanFormValues = z.infer<typeof dayPlanFormSchema>;

interface DayPlanFormProps {
  itineraryId: string;
  dayPlanId?: string;
  defaultValues?: Partial<DayPlanFormValues>;
  onSubmit: (data: DayPlanCreateRequest) => Promise<void>;
  isLoading: boolean;
  startDate?: Date;
  endDate?: Date;
}

export function DayPlanForm({
  itineraryId,
  dayPlanId,
  defaultValues,
  onSubmit,
  isLoading,
  startDate,
  endDate,
}: DayPlanFormProps) {
  const router = useRouter();
  const [newNoteText, setNewNoteText] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const [showRoutePlan, setShowRoutePlan] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocation, setNewLocation] = useState<Location>({
    latitude: 0,
    longitude: 0,
  });
  const [routePlanDescription, setRoutePlanDescription] = useState('');
  const [totalDistance, setTotalDistance] = useState<string>('0');
  const [totalTime, setTotalTime] = useState<string>('0');

  const isEditMode = !!dayPlanId;

  // Initialize form with default values
  const form = useForm<DayPlanFormValues>({
    resolver: zodResolver(dayPlanFormSchema),
    defaultValues: {
      date: defaultValues?.date || new Date(),
      notes: defaultValues?.notes || [],
      route_plan: defaultValues?.route_plan || {
        total_distance: 0,
        total_time: 0,
        description: '',
        locations: [],
      },
    },
  });

  // Update notes state when default values change
  useEffect(() => {
    if (defaultValues?.notes && defaultValues.notes.length > 0) {
      setNotes(defaultValues.notes);
    }

    // Initialize route plan data if available
    if (defaultValues?.route_plan) {
      setShowRoutePlan(true);
      setLocations(defaultValues.route_plan.locations || []);
      setRoutePlanDescription(defaultValues.route_plan.description || '');
      setTotalDistance(defaultValues.route_plan.total_distance.toString() || '0');
      setTotalTime(defaultValues.route_plan.total_time.toString() || '0');
    }
  }, [defaultValues]);

  const addNote = () => {
    if (newNoteText.trim() !== '') {
      const updatedNotes = [...notes, newNoteText];
      setNotes(updatedNotes);
      form.setValue('notes', updatedNotes);
      setNewNoteText('');
    }
  };

  const removeNote = (index: number) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
    form.setValue('notes', updatedNotes);
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setNewLocation({
      latitude: lat,
      longitude: lng,
    });
  };

  const addLocation = () => {
    if (newLocation.latitude !== 0 || newLocation.longitude !== 0) {
      const updatedLocations = [...locations, newLocation];
      setLocations(updatedLocations);
      form.setValue('route_plan.locations', updatedLocations);
      // Reset the location for the next entry
      setNewLocation({ latitude: 0, longitude: 0 });
    }
  };

  const removeLocation = (index: number) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
    form.setValue('route_plan.locations', updatedLocations);
  };

  const updateRoutePlanDescription = (value: string) => {
    setRoutePlanDescription(value);
    form.setValue('route_plan.description', value);
  };

  const updateTotalDistance = (value: string) => {
    setTotalDistance(value);
    const numValue = parseFloat(value) || 0;
    form.setValue('route_plan.total_distance', numValue);
  };

  const updateTotalTime = (value: string) => {
    setTotalTime(value);
    const numValue = parseFloat(value) || 0;
    form.setValue('route_plan.total_time', numValue);
  };

  const handleSubmit = async (values: DayPlanFormValues) => {
    try {
      // Prepare route plan data if enabled
      let routePlan: RoutePlanRequest | undefined = undefined;

      if (showRoutePlan && locations.length > 0) {
        routePlan = {
          total_distance: parseFloat(totalDistance) || 0,
          total_time: parseFloat(totalTime) || 0,
          description: routePlanDescription,
          locations: locations,
        };
      }

      const dayPlanData: DayPlanCreateRequest = {
        itinerary_id: itineraryId,
        date: format(values.date, 'yyyy-MM-dd'),
        notes: values.notes,
        route_plan: routePlan,
      };

      await onSubmit(dayPlanData);
    } catch (error) {
      console.error('Error submitting day plan:', error);
    }
  };

  // Determine if the date is outside the itinerary range
  const isDateOutsideRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return date < startDate || date > endDate;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-muted/20 shadow-md rounded-xl bg-background/80 backdrop-blur-sm">
        <CardHeader className="pb-4 bg-gradient-to-r from-background/80 to-background/40 border-b border-muted/10">
          <CardTitle className="text-xl font-semibold">
            {isEditMode ? 'Edit Day Plan' : 'Create New Day Plan'}
          </CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Update the details for this day plan'
              : 'Add a new day plan to your itinerary'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-4 px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Date Picker */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => isDateOutsideRange(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {startDate && endDate && (
                      <FormDescription>
                        Select a date between{' '}
                        {format(startDate, 'MMM d, yyyy')} and{' '}
                        {format(endDate, 'MMM d, yyyy')}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Route Plan Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Route Plan</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRoutePlan(!showRoutePlan)}
                    className="h-8 px-3"
                  >
                    {showRoutePlan ? 'Hide Route Plan' : 'Add Route Plan'}
                  </Button>
                </div>

                {showRoutePlan && (
                  <div className="space-y-4 rounded-lg border border-border p-4">
                    {/* Route Description */}
                    <div className="space-y-2">
                      <FormLabel>Route Description</FormLabel>
                      <Textarea
                        placeholder="Describe the route for this day"
                        value={routePlanDescription}
                        onChange={(e) => updateRoutePlanDescription(e.target.value)}
                        className="min-h-24"
                      />
                    </div>

                    {/* Distance and Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <FormLabel>Total Distance (km)</FormLabel>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="0.0"
                          value={totalDistance}
                          onChange={(e) => updateTotalDistance(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <FormLabel>Total Time (minutes)</FormLabel>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          value={totalTime}
                          onChange={(e) => updateTotalTime(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Locations with Map Picker */}
                    <div className="space-y-3">
                      <FormLabel>Locations</FormLabel>
                      <div className="rounded-lg border border-muted/40 p-4">
                        <LocationPickerMap
                          initialLocation={newLocation}
                          onLocationChangeAction={handleLocationChange}
                          height="300px"
                        />
                        <div className="mt-3 flex justify-between">
                          <p className="text-sm text-muted-foreground">
                            {newLocation.latitude !== 0 && newLocation.longitude !== 0 ? (
                              <span>Selected: {newLocation.latitude.toFixed(6)}, {newLocation.longitude.toFixed(6)}</span>
                            ) : (
                              <span>Click on the map to select a location</span>
                            )}
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={addLocation}
                            disabled={newLocation.latitude === 0 && newLocation.longitude === 0}
                            className="flex items-center ml-2"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Location
                          </Button>
                        </div>
                      </div>

                      {/* Location List */}
                      {locations.length > 0 ? (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Added Locations</h4>
                          <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {locations.map((location, index) => (
                              <li
                                key={index}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-muted/20"
                              >
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                                  <span className="text-sm">
                                    Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeLocation(index)}
                                  className="h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic mt-2">
                          No locations added yet. Add locations to create a route plan.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="space-y-3">
                <FormLabel>Notes</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a note about this day"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addNote}
                    className="shrink-0"
                  >
                    Add
                  </Button>
                </div>

                {/* Notes List */}
                {notes.length > 0 ? (
                  <ul className="space-y-2 mt-2">
                    {notes.map((note, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted/20"
                      >
                        <span className="text-sm">{note}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNote(index)}
                          className="h-7 w-7 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground italic px-1">
                    No notes added yet. Add notes to help you remember important details.
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-[120px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-[120px] bg-gradient-to-r from-forest to-forest-dark text-white hover:from-forest-dark hover:to-forest"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isEditMode ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
