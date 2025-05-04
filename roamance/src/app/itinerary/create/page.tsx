'use client';

import { LocationPickerMap } from '@/components/maps/LocationPickerMap';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ItineraryService } from '@/service/itinerary-service';
import { ActivityCreateRequest, ActivityType } from '@/types/activity';
// Use ItineraryWithDetailsRequest for the form structure
import { ItineraryWithDetailsRequest, RoutePlanRequest } from '@/types/itinerary';
import { Location } from '@/types/location';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, differenceInDays, format } from 'date-fns';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    CalendarDays,
    Calendar as CalendarIcon,
    Info,
    Loader2,
    MapPin,
    Plus,
    Save,
    Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Define a type for the day plan form data, aligning with ItineraryWithDetailsRequest structure
interface DayPlanFormData {
  date: Date; // Use Date object for form state
  notes?: string[];
  activities: Array<Omit<ActivityCreateRequest, 'day_plan_id'>>; // Use ActivityCreateRequest structure
  route_plan?: RoutePlanRequest; // Use RoutePlanRequest structure
}

// Define validation schema based on ItineraryWithDetailsRequest
const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const routePlanSchema = z.object({
  total_distance: z.number().min(0),
  total_time: z.number().min(0),
  description: z.string().optional(), // Allow optional description
  locations: z.array(locationSchema),
}).optional(); // Route plan is optional per day

const activitySchema = z.object({
  location: locationSchema,
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format HH:MM"), // Validate time format
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format HH:MM"),
  type: z.nativeEnum(ActivityType),
  note: z.string().optional(), // Allow optional note
  cost: z.number().min(0).optional().default(0), // Cost is optional, defaults to 0
});

const dayPlanSchema = z.object({
  date: z.date(),
  notes: z.array(z.string()).optional(),
  activities: z.array(activitySchema).optional(),
  route_plan: routePlanSchema, // Use the defined routePlanSchema
});

const formSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Title must be at least 3 characters' })
    .max(100),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(500),
  start_date: z.date({ required_error: 'Start date is required' }),
  end_date: z.date({ required_error: 'End date is required' }),
  notes: z.array(z.string()).optional(),
  locations: z
    .array(locationSchema) // Use locationSchema
    .min(1, { message: 'At least one location is required' }),
  create_day_plans: z.boolean().optional(), // Keep this toggle
  day_plans: z
    .array(dayPlanSchema) // Use dayPlanSchema
    .optional(), // Day plans array is optional overall
}).refine(data => {
    // Ensure end_date is not before start_date
    if (data.start_date && data.end_date) {
        return data.end_date >= data.start_date;
    }
    return true;
}, {
    message: "End date cannot be before start date",
    path: ["end_date"], // Attach error to end_date field
});


type FormValues = z.infer<typeof formSchema>;

export default function CreateItineraryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed separate notes and locations state, manage through form
  // const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  // const [locations, setLocations] = useState<Location[]>([]);a

  // State for day plans - still useful for intermediate UI updates before form sync
  const [dayPlans, setDayPlans] = useState<DayPlanFormData[]>([]);

  // Initialize form with default values matching the schema
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      start_date: new Date(),
      end_date: addDays(new Date(), 7),
      notes: [],
      locations: [],
      create_day_plans: false,
      day_plans: [], // Initialize as empty array
    },
  });

  console.log("Form default values:", form.getValues()); // Log initial form values

  // Get form values for locations and notes directly
  const formLocations = form.watch('locations');
  const formNotes = form.watch('notes');

  // Derive day plans toggle directly from form values
  const withDayPlans = form.watch('create_day_plans');

  // Route plan related state (remains useful for UI interaction before form sync)
  const [showRoutePlan, setShowRoutePlan] = useState<{ [key: number]: boolean }>({});
  const [routePlanDescriptions, setRoutePlanDescriptions] = useState<{ [key: number]: string }>({});
  const [routePlanTotalDistances, setRoutePlanTotalDistances] = useState<{ [key: number]: string }>({});
  const [routePlanTotalTimes, setRoutePlanTotalTimes] = useState<{ [key: number]: string }>({});
  const [routePlanLocations, setRoutePlanLocations] = useState<{ [key: number]: Location[] }>({});
  const [newRouteLocation, setNewRouteLocation] = useState<{ [key: number]: Location | null }>({}); // Allow null

  // State array to track note input values for each day plan
  const [dayPlanNoteInputs, setDayPlanNoteInputs] = useState<string[]>([]);

  // Handlers for adding/removing notes on each day plan
  const handleAddDayPlanNote = (dayIndex: number, note: string) => {
    const updatedDayPlans = [...dayPlans];
    if (!updatedDayPlans[dayIndex]) return; // Safety check
    updatedDayPlans[dayIndex].notes = [...(updatedDayPlans[dayIndex].notes || []), note];
    setDayPlans(updatedDayPlans);
    // Sync with form state
    form.setValue('day_plans', updatedDayPlans, { shouldValidate: true, shouldDirty: true });
  };

  const handleRemoveDayPlanNote = (dayIndex: number, noteIndex: number) => {
    const updatedDayPlans = [...dayPlans];
    if (!updatedDayPlans[dayIndex]?.notes) return; // Safety check
    updatedDayPlans[dayIndex].notes = updatedDayPlans[dayIndex].notes?.filter((_, i) => i !== noteIndex);
    setDayPlans(updatedDayPlans);
    // Sync with form state
    form.setValue('day_plans', updatedDayPlans, { shouldValidate: true, shouldDirty: true });
  };

  // AI dialog state and form inputs (remains the same)
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLocation, setAiLocation] = useState('');
  const [aiStartDate, setAiStartDate] = useState('');
  const [aiNumberOfDays, setAiNumberOfDays] = useState(1);
  const [aiBudgetLevel, setAiBudgetLevel] = useState('');
  const [aiNumberOfPeople, setAiNumberOfPeople] = useState(1);
  const [aiLoading, setAiLoading] = useState(false);

  // Get form values for dependencies
  const startDate = form.watch('start_date');
  const endDate = form.watch('end_date');

  // Effect to sync local dayPlans state with form 'day_plans' field (important)
  useEffect(() => {
    // Only update form if local state differs significantly (optional optimization)
    // This sync ensures the form always has the latest day plan data from UI interactions
    form.setValue('day_plans', dayPlans, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  }, [dayPlans, form]);

  // Effect to initialize dayPlanNoteInputs when dayPlans changes
  useEffect(() => {
    setDayPlanNoteInputs(new Array(dayPlans.length).fill(''));
    // Initialize route plan UI states as well
    const initialShowRoute: Record<number, boolean> = {};
    const initialDesc: Record<number, string> = {};
    const initialDist: Record<number, string> = {};
    const initialTime: Record<number, string> = {};
    const initialLocs: Record<number, Location[]> = {};
    const initialNewLoc: Record<number, Location | null> = {};

    dayPlans.forEach((dp, index) => {
        initialShowRoute[index] = !!dp.route_plan; // Show if route plan exists
        initialDesc[index] = dp.route_plan?.description || '';
        initialDist[index] = String(dp.route_plan?.total_distance || 0);
        initialTime[index] = String(dp.route_plan?.total_time || 0);
        initialLocs[index] = dp.route_plan?.locations || [];
        initialNewLoc[index] = null; // Reset new location picker
    });

    setShowRoutePlan(initialShowRoute);
    setRoutePlanDescriptions(initialDesc);
    setRoutePlanTotalDistances(initialDist);
    setRoutePlanTotalTimes(initialTime);
    setRoutePlanLocations(initialLocs);
    setNewRouteLocation(initialNewLoc);

  }, [dayPlans]); // Rerun when dayPlans array itself changes

  // Activity state tracking (remains useful for UI interaction)
  const [showActivityForm, setShowActivityForm] = useState<{ [key: number]: boolean }>({});
  const [currentActivityInputs, setCurrentActivityInputs] = useState<{ [key: number]: Omit<ActivityCreateRequest, 'day_plan_id'> }>({});

  // Initialize an empty activity form data matching the schema
  const emptyActivityForm: Omit<ActivityCreateRequest, 'day_plan_id'> = {
    location: { latitude: 0, longitude: 0 }, // Default location
    start_time: '09:00',
    end_time: '10:00',
    type: ActivityType.SIGHTSEEING, // Default type
    note: '',
    cost: 0,
  };

  // Update activity input field
  const updateActivityField = (
    dayIndex: number,
    field: keyof Omit<ActivityCreateRequest, 'day_plan_id'>, // Use correct keys
    value: string | number | Location | ActivityType // Handle different value types
  ) => {
    setCurrentActivityInputs((prev) => ({
      ...prev,
      [dayIndex]: {
        ...(prev[dayIndex] || emptyActivityForm),
        [field]: value,
      },
    }));
  };

  // Add activity to a day plan
  const handleAddActivity = (dayIndex: number) => {
    const activityInput = currentActivityInputs[dayIndex];
    if (!activityInput) return;

    // Basic validation (can be enhanced)
    if (!activityInput.start_time || !activityInput.end_time || !activityInput.type) {
        toast.warning("Please fill in required activity fields (Type, Start Time, End Time).");
        return;
    }
     if (activityInput.location.latitude === 0 && activityInput.location.longitude === 0) {
        toast.warning("Please select a location for the activity on the map.");
        return;
    }


    const updatedDayPlans = [...dayPlans];
    if (!updatedDayPlans[dayIndex]) return;

    // Ensure activities array exists
    if (!updatedDayPlans[dayIndex].activities) {
        updatedDayPlans[dayIndex].activities = [];
    }

    updatedDayPlans[dayIndex].activities.push({ ...activityInput }); // Add the validated activity

    setDayPlans(updatedDayPlans); // Update local state

    // Reset the input form for that day index
    setCurrentActivityInputs((prev) => ({
      ...prev,
      [dayIndex]: { ...emptyActivityForm }, // Reset to empty form
    }));

    // Sync with form state
    form.setValue('day_plans', updatedDayPlans, { shouldValidate: true, shouldDirty: true });
  };


  // Toggle activity form visibility (remains the same logic)
  const toggleActivityForm = (dayIndex: number) => {
    setShowActivityForm((prev) => ({
      ...prev,
      [dayIndex]: !prev[dayIndex],
    }));

    // Initialize activity input if opening and not already set
    if (!showActivityForm[dayIndex] && !currentActivityInputs[dayIndex]) {
      setCurrentActivityInputs((prev) => ({
        ...prev,
        [dayIndex]: { ...emptyActivityForm },
      }));
    }
  };

  // Remove activity from a day plan
  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
    const updatedDayPlans = [...dayPlans];
    if (!updatedDayPlans[dayIndex]?.activities) return; // Safety check

    updatedDayPlans[dayIndex].activities = updatedDayPlans[dayIndex].activities.filter(
      (_, i) => i !== activityIndex
    );
    setDayPlans(updatedDayPlans);
    // Sync with form state
    form.setValue('day_plans', updatedDayPlans, { shouldValidate: true, shouldDirty: true });
  };

  // Toggle route plan visibility for a day (remains the same logic)
  const toggleRoutePlan = (dayIndex: number) => {
    setShowRoutePlan((prev) => ({
      ...prev,
      [dayIndex]: !prev[dayIndex],
    }));

    // Initialize route plan data if opening and not already set
    if (!showRoutePlan[dayIndex]) {
        if (!routePlanLocations[dayIndex]) {
            setRoutePlanLocations((prev) => ({ ...prev, [dayIndex]: [] }));
        }
        if (routePlanDescriptions[dayIndex] === undefined) { // Check for undefined instead of falsy
            setRoutePlanDescriptions((prev) => ({ ...prev, [dayIndex]: '' }));
        }
        if (routePlanTotalDistances[dayIndex] === undefined) {
            setRoutePlanTotalDistances((prev) => ({ ...prev, [dayIndex]: '0' }));
        }
        if (routePlanTotalTimes[dayIndex] === undefined) {
            setRoutePlanTotalTimes((prev) => ({ ...prev, [dayIndex]: '0' }));
        }
        if (!newRouteLocation[dayIndex]) {
            setNewRouteLocation((prev) => ({
                ...prev,
                [dayIndex]: null, // Initialize as null
            }));
        }
    }
  };

  // Handle route location change from map
  const handleRouteLocationChange = (
    dayIndex: number,
    lat: number,
    lng: number
  ) => {
    setNewRouteLocation((prev) => ({
      ...prev,
      [dayIndex]: { latitude: lat, longitude: lng },
    }));
  };

  // Add location to route plan
  const addRouteLocation = (dayIndex: number) => {
    const locationToAdd = newRouteLocation[dayIndex];
    if (!locationToAdd) return; // Check if a location is selected

    const currentLocations = routePlanLocations[dayIndex] || [];
    const updatedLocations = [...currentLocations, locationToAdd];

    setRoutePlanLocations((prev) => ({
      ...prev,
      [dayIndex]: updatedLocations,
    }));

    // Update the day plan's route plan in local state and form state
    updateDayPlanRoutePlan(dayIndex, { locations: updatedLocations });

    // Reset the location picker for that day index
    setNewRouteLocation((prev) => ({
      ...prev,
      [dayIndex]: null, // Reset to null
    }));
  };


  // Remove location from route plan
  const removeRouteLocation = (dayIndex: number, locationIndex: number) => {
    const currentLocations = routePlanLocations[dayIndex] || [];
    const updatedLocations = currentLocations.filter((_, i) => i !== locationIndex);

    setRoutePlanLocations((prev) => ({
      ...prev,
      [dayIndex]: updatedLocations,
    }));

    // Update the day plan's route plan in local state and form state
    updateDayPlanRoutePlan(dayIndex, { locations: updatedLocations });
  };

  // Update route plan description
  const updateRoutePlanDescription = (dayIndex: number, value: string) => {
    setRoutePlanDescriptions((prev) => ({
      ...prev,
      [dayIndex]: value,
    }));
    updateDayPlanRoutePlan(dayIndex, { description: value });
  };

  // Update total distance
  const updateTotalDistance = (dayIndex: number, value: string) => {
    setRoutePlanTotalDistances((prev) => ({
      ...prev,
      [dayIndex]: value,
    }));
    // Parse value before updating state
    const distance = parseFloat(value) || 0;
    updateDayPlanRoutePlan(dayIndex, { total_distance: distance });
  };

  // Update total time
  const updateTotalTime = (dayIndex: number, value: string) => {
    setRoutePlanTotalTimes((prev) => ({
      ...prev,
      [dayIndex]: value,
    }));
     // Parse value before updating state
    const time = parseFloat(value) || 0;
    updateDayPlanRoutePlan(dayIndex, { total_time: time });
  };

  // Update the day plan's route plan data (modified to accept partial updates)
  const updateDayPlanRoutePlan = (dayIndex: number, updates: Partial<RoutePlanRequest>) => {
    const updatedDayPlans = [...dayPlans];
    if (!updatedDayPlans[dayIndex]) return; // Safety check

    // Ensure route_plan object exists
    if (!updatedDayPlans[dayIndex].route_plan) {
        updatedDayPlans[dayIndex].route_plan = {
            total_distance: 0,
            total_time: 0,
            description: '',
            locations: [],
        };
    }

    // Merge updates into the existing route plan
    updatedDayPlans[dayIndex].route_plan = {
        ...updatedDayPlans[dayIndex].route_plan!, // Assert non-null after check
        ...updates,
         // Ensure locations are always updated if provided in updates
        locations: updates.locations !== undefined ? updates.locations : updatedDayPlans[dayIndex].route_plan!.locations,
    };


    setDayPlans(updatedDayPlans); // Update local state

    // Explicitly update the form values after updating the local state
    form.setValue('day_plans', updatedDayPlans, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };


  useEffect(() => {
    // Simple loading simulation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Remove effects for separate notes/locations state
  // useEffect(() => {
  //   form.setValue('notes', notes);
  // }, [notes, form]);
  // useEffect(() => {
  //   form.setValue('locations', locations);
  // }, [locations, form]);

  // Effect to watch for date changes and auto-generate day plans
  useEffect(() => {
    // Only generate if create_day_plans is true and dates are valid
    if (form.getValues('create_day_plans') && startDate && endDate && endDate >= startDate) {
      const duration = differenceInDays(endDate, startDate) + 1;
      const currentDayPlans = form.getValues('day_plans') || [];
      const newDayPlans: DayPlanFormData[] = [];

      for (let i = 0; i < duration; i++) {
        const date = addDays(startDate, i);
        // Try to find an existing day plan for this date to preserve data
        const existingPlan = currentDayPlans.find(dp => dp.date && format(dp.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));

        if (existingPlan) {
            newDayPlans.push(existingPlan); // Keep existing data
        } else {
            // Create a new empty plan matching the schema structure
            newDayPlans.push({
                date,
                notes: [],
                activities: [],
                route_plan: undefined, // Explicitly undefined or match schema default
            });
        }
      }
      setDayPlans(newDayPlans); // Update local state first
      // Form state will be updated by the useEffect watching dayPlans
    } else if (!form.getValues('create_day_plans')) {
        // If checkbox is unchecked, clear day plans
        setDayPlans([]);
        form.setValue('day_plans', [], { shouldValidate: true, shouldDirty: true });
    }
  }, [startDate, endDate, withDayPlans, form]); // Rerun when dates or toggle change


  const handleAddNote = () => {
    if (newNote.trim()) {
      const currentNotes = form.getValues('notes') || [];
      form.setValue('notes', [...currentNotes, newNote.trim()], { shouldValidate: true, shouldDirty: true });
      setNewNote('');
    }
  };

  const handleRemoveNote = (index: number) => {
    const currentNotes = form.getValues('notes') || [];
    form.setValue('notes', currentNotes.filter((_, i) => i !== index), { shouldValidate: true, shouldDirty: true });
  };

  // Update handler to add location directly to form state
  const handleAddLocation = (location: Location) => {
    const currentLocations = form.getValues('locations') || [];
    // Avoid adding duplicate locations (optional check)
    if (!currentLocations.some(loc => loc.latitude === location.latitude && loc.longitude === location.longitude)) {
        form.setValue('locations', [...currentLocations, location], { shouldValidate: true, shouldDirty: true });
    }
  };

  // Update handler to remove location directly from form state
  const handleRemoveLocation = (index: number) => {
    const currentLocations = form.getValues('locations') || [];
    form.setValue('locations', currentLocations.filter((_, i) => i !== index), { shouldValidate: true, shouldDirty: true });
  };


  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
        // Prepare the data structure matching ItineraryWithDetailsRequest
        const requestData: ItineraryWithDetailsRequest = {
            title: data.title,
            description: data.description,
            start_date: format(data.start_date, 'yyyy-MM-dd'),
            end_date: format(data.end_date, 'yyyy-MM-dd'),
            notes: data.notes || [],
            locations: data.locations, // Already in the correct format
            // Include day_plans only if the toggle is checked and plans exist
            day_plans: (data.create_day_plans && data.day_plans && data.day_plans.length > 0)
                ? data.day_plans.map(dp => ({
                    date: format(dp.date, 'yyyy-MM-dd'),
                    notes: dp.notes || [],
                    // Ensure activities and route_plan are included correctly, handling optionality
                    activities: dp.activities?.map(act => ({
                        ...act,
                        cost: act.cost ?? 0, // Ensure cost has a default if undefined
                        note: act.note ?? '', // Ensure note has a default if undefined
                    })) || [], // Default to empty array if undefined
                    // Include route_plan only if it exists and has locations or description
                    route_plan: dp.route_plan && (dp.route_plan.locations.length > 0 || dp.route_plan.description)
                        ? {
                            total_distance: dp.route_plan.total_distance ?? 0,
                            total_time: dp.route_plan.total_time ?? 0,
                            description: dp.route_plan.description ?? '',
                            locations: dp.route_plan.locations || [],
                          }
                        : undefined, // Send undefined if route plan is empty/not present
                }))
                : [], // Send empty array if not creating day plans
        };

        console.log("Submitting data:", JSON.stringify(requestData, null, 2)); // Log the final payload

        // Always use createItineraryWithDetails, the backend can handle empty day_plans
        const response = await ItineraryService.createItineraryWithDetails(requestData);

        toast.success('Itinerary Created Successfully', {
            description: `Itinerary "${response.data.title}" has been created.`,
        });

        router.push(`/itinerary/details?id=${response.data.id}`);

    } catch (error) {
        console.error('Failed to create itinerary:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        // Check for specific validation errors if the API returns them
        // Example: if (error.response?.data?.errors) { ... }
        toast.error('Failed to create itinerary', {
            description: `Error: ${errorMessage}. Please check your input and try again.`,
        });
    } finally {
        setIsSubmitting(false);
    }
};


  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-8 max-w-3xl mx-auto">
          <div className="h-10 w-24 bg-muted rounded-lg"></div>
          <div className="h-10 w-full max-w-lg bg-muted rounded-lg"></div>
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded-lg"></div>
              ))}
            <div className="h-32 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  };

  // AI form submit handler - Updated to match new form structure
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const response = await ItineraryService.generateItinerary({
        location: aiLocation,
        start_date: aiStartDate, // Keep as string for API
        number_of_days: aiNumberOfDays,
        budget_level: aiBudgetLevel,
        number_of_people: aiNumberOfPeople,
      });

      // Response data structure matches ItineraryWithDetailsRequest
      const data = response.data;
      const hasDayPlans = Array.isArray(data.day_plans) && data.day_plans.length > 0;

      // --- Update Form Values ---
      form.reset({ // Use reset to update multiple fields and clear previous errors/state
        title: data.title,
        description: data.description,
        start_date: new Date(data.start_date + 'T00:00:00'), // Ensure correct Date object parsing
        end_date: new Date(data.end_date + 'T00:00:00'),   // Ensure correct Date object parsing
        notes: data.notes ?? [],
        locations: data.locations ?? [], // Ensure locations is an array
        create_day_plans: hasDayPlans, // Set toggle based on response
        day_plans: [], // Initialize day_plans in form, will be populated below
      });


      // --- Process and Set Day Plans (if any) ---
      if (hasDayPlans) {
        const mappedDayPlans: DayPlanFormData[] = data.day_plans.map((pl) => ({
          date: new Date(pl.date + 'T00:00:00'), // Convert string date to Date object
          notes: pl.notes ?? [],
          // Map activities, ensuring defaults for optional fields if needed by UI/form
          activities: (pl.activities ?? []).map((activity) => ({
            ...activity,
            type: activity.type as ActivityType, // Cast type
            cost: activity.cost ?? 0, // Default cost if missing
            note: activity.note ?? '', // Default note if missing
          })),
          // Map route plan, ensuring it matches RoutePlanRequest structure
          route_plan: pl.route_plan
            ? {
                total_distance: pl.route_plan.total_distance ?? 0,
                total_time: pl.route_plan.total_time ?? 0,
                description: pl.route_plan.description ?? '',
                locations: pl.route_plan.locations ?? [],
              }
            : undefined, // Set to undefined if not present in response
        }));

        // Update the local state first (triggers useEffect to update UI states)
        setDayPlans(mappedDayPlans);

        // Then update the form field directly (redundant due to useEffect, but safe)
        form.setValue('day_plans', mappedDayPlans, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });

        // Initialize UI states based on the populated day plans (handled by useEffect on dayPlans)

      } else {
        // Ensure local day plan state is cleared if AI response has none
        setDayPlans([]);
      }


      toast.success('AI itinerary generated and populated');
      setAiDialogOpen(false); // Close dialog on success

    } catch (error) {
      console.error('AI itinerary generation failed:', error); // Use console.error
      toast.error('Failed to generate AI itinerary', {
          description: error instanceof Error ? error.message : 'Please try again.'
      });
    } finally {
      setAiLoading(false);
    }
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto space-y-8"
      >
        {/* AI Generate Button and Dialog (remains the same) */}
        <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary">Generate with AI</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>AI Itinerary Generator</DialogTitle>
              <DialogDescription>
                Fill the details to generate an itinerary with AI
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAiSubmit} className="space-y-4">
              <Input
                placeholder="Location"
                value={aiLocation}
                onChange={(e) => setAiLocation(e.target.value)}
                required
                className="bg-muted/50"
              />
              <Input
                type="date"
                value={aiStartDate}
                onChange={(e) => setAiStartDate(e.target.value)}
                required
                className="bg-muted/50"
              />
              <Input
                type="number"
                placeholder="Number of Days"
                value={aiNumberOfDays}
                onChange={(e) => setAiNumberOfDays(Number(e.target.value))}
                required
                min={1}
                className="bg-muted/50"
              />
              <Input
                placeholder="Budget Level"
                value={aiBudgetLevel}
                onChange={(e) => setAiBudgetLevel(e.target.value)}
                required
                className="bg-muted/50"
              />
              <Input
                type="number"
                placeholder="Number of People"
                value={aiNumberOfPeople}
                onChange={(e) => setAiNumberOfPeople(Number(e.target.value))}
                required
                min={1}
                className="bg-muted/50"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAiDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={aiLoading}>
                  {aiLoading ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </form>
            <DialogFooter>
              <DialogClose />
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Back button (remains the same) */}
        <motion.div variants={itemVariants}>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </motion.div>

        {/* Form header (remains the same) */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">
            Create New Itinerary
          </h1>
          <p className="text-muted-foreground">
            Plan your next adventure by creating a new travel itinerary.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div variants={itemVariants}>
          <Form {...form}>
            {/* Pass form instance */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Card (remains the same) */}
              <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary/80" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    General details about your travel itinerary
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="European Adventure"
                            {...field}
                            className="bg-muted/50"
                          />
                        </FormControl>
                        <FormDescription>
                          Give your itinerary a memorable name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Exploring the beautiful cities of Europe, including Paris, Rome, and Barcelona."
                            {...field}
                            className="bg-muted/50 min-h-24"
                          />
                        </FormControl>
                        <FormDescription>
                          Briefly describe your travel plans
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Date Range Card (remains the same) */}
              <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary/80" />
                    Date Range
                  </CardTitle>
                  <CardDescription>
                    When your trip will begin and end
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date: Date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* End Date */}
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date: Date) => {
                                  // Cannot select dates before the start date
                                  const startDate =
                                    form.getValues('start_date');
                                  return startDate
                                    ? date < startDate
                                    : date < new Date();
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Display trip duration */}
                  {form.watch('start_date') && form.watch('end_date') && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Trip Duration:{' '}
                      {differenceInDays(
                        form.watch('end_date'),
                        form.watch('start_date')
                      ) + 1}{' '}
                      days
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Locations Card - Updated to use form state */}
              <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary/80" />
                    Locations
                  </CardTitle>
                  <CardDescription>
                    Add main destinations for your trip
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Location Picker Map */}
                  <div className="mt-6 space-y-2">
                    <Label>Map Selection</Label>
                    <LocationPickerMap
                      // Center map based on the last added location or default
                      initialLocation={
                        formLocations.length > 0
                          ? formLocations[formLocations.length - 1]
                          : { latitude: 0, longitude: 0 } // Default center if no locations
                      }
                      onLocationChangeAction={(lat, lng) => {
                        // Add location directly using the handler
                        handleAddLocation({ latitude: lat, longitude: lng });
                      }}
                      height="300px"
                    />
                    <p className="text-xs text-muted-foreground">
                      Click on the map or search to add a location to the list below.
                    </p>
                  </div>

                  {/* Locations List - Reads from formLocations */}
                  <div className="space-y-3 mt-4">
                    <p className="text-sm font-medium">
                      Added Locations ({formLocations.length})
                    </p>

                    {formLocations.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                        No locations added yet. Use the map above to add destinations.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Render locations from form state */}
                        {formLocations.map((location, index) => (
                          <div
                            key={index} // Consider a more stable key if locations can be reordered
                            className="flex items-start justify-between p-3 rounded-lg border border-muted/40 bg-muted/10"
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full h-6 w-6 text-xs font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {`Location ${index + 1}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {`Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button" // Ensure it doesn't submit the form
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleRemoveLocation(index)} // Use updated handler
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                        {/* Display validation error for locations field */}
                        {form.formState.errors.locations?.message && (
                          <p className="text-xs font-medium text-destructive">
                            {form.formState.errors.locations.message}
                          </p>
                        )}
                         {/* Root error for array itself (e.g., min length) */}
                         {form.formState.errors.locations?.root?.message && (
                          <p className="text-xs font-medium text-destructive">
                            {form.formState.errors.locations.root.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>


              {/* Day Plans Option Card - Updated */}
              <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary/80" />
                    Day Plans
                  </CardTitle>
                  <CardDescription>
                    Optionally add detailed daily activities and routes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* FormField for create_day_plans toggle */}
                  <FormField
                    control={form.control}
                    name="create_day_plans"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                         <FormControl>
                           {/* Use a proper checkbox input */}
                           <input
                            type="checkbox"
                            id="create-day-plans-checkbox" // Unique ID
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            checked={field.value ?? false} // Handle potential undefined value
                            onChange={(e) => field.onChange(e.target.checked)}
                            onBlur={field.onBlur} // Important for validation trigger
                           />
                         </FormControl>
                         <FormLabel
                           htmlFor="create-day-plans-checkbox" // Match checkbox ID
                           className="text-sm font-medium leading-none cursor-pointer"
                         >
                           Create detailed day plans for this trip
                         </FormLabel>
                         <FormMessage />
                      </FormItem>
                    )}
                  />


                  {/* Render day plans based on local 'dayPlans' state which mirrors form state */}
                  {withDayPlans && dayPlans.length > 0 && (
                    <div className="mt-4 space-y-6">
                      <p className="text-sm text-muted-foreground">
                        Editing {dayPlans.length} day plan{dayPlans.length > 1 ? 's' : ''}. Add notes, activities, and route details for each day.
                      </p>

                      {/* Map over the local dayPlans state */}
                      {dayPlans.map((dayPlan, dayIndex) => (
                        <div
                          key={dayPlan.date.toISOString()} // Use date as key (ensure uniqueness)
                          className="p-4 border border-muted rounded-lg space-y-4 bg-background/50" // Slightly different background
                        >
                          <h3 className="text-lg font-semibold border-b pb-2 mb-3"> {/* Enhanced styling */}
                            Day {dayIndex + 1}:{' '}
                            <span className="text-primary font-medium">
                                {format(dayPlan.date, 'EEEE, MMMM d, yyyy')}
                            </span>
                          </h3>

                          {/* Day Plan Notes Section */}
                          <div className="space-y-2">
                             <Label>Notes for Day {dayIndex + 1}</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder={`Add a note (e.g., Check museum hours)`}
                                className="bg-muted/50 text-sm" // Consistent text size
                                value={dayPlanNoteInputs[dayIndex] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setDayPlanNoteInputs((prev) => {
                                    const next = [...prev];
                                    next[dayIndex] = value;
                                    return next;
                                  });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && dayPlanNoteInputs[dayIndex]?.trim()) {
                                    e.preventDefault(); // Prevent form submission on Enter
                                    handleAddDayPlanNote(dayIndex, dayPlanNoteInputs[dayIndex]);
                                    // Clear input after adding
                                    setDayPlanNoteInputs((prev) => {
                                        const next = [...prev];
                                        next[dayIndex] = '';
                                        return next;
                                    });
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (dayPlanNoteInputs[dayIndex]?.trim()) {
                                    handleAddDayPlanNote(dayIndex, dayPlanNoteInputs[dayIndex]);
                                     // Clear input after adding
                                    setDayPlanNoteInputs((prev) => {
                                        const next = [...prev];
                                        next[dayIndex] = '';
                                        return next;
                                    });
                                  }
                                }}
                                disabled={!dayPlanNoteInputs[dayIndex]?.trim()} // Disable if input is empty
                                className="whitespace-nowrap"
                              >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add Note
                              </Button>
                            </div>

                            {/* Day Plan Notes List - Renders notes from dayPlan object */}
                            {(dayPlan.notes || []).length > 0 ? (
                              <div className="space-y-1.5 pt-2">
                                {(dayPlan.notes || []).map((note, noteIndex) => (
                                  <div key={noteIndex} className="flex items-start justify-between p-2 rounded-lg border border-muted/40 bg-muted/10 text-sm">
                                    <div className="flex items-start gap-2">
                                      <div className="bg-primary/10 text-primary p-0.5 rounded-full mt-0.5 flex-shrink-0">
                                        <Info className="h-3 w-3" />
                                      </div>
                                      <span>{note}</span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive flex-shrink-0 ml-2"
                                      onClick={() => handleRemoveDayPlanNote(dayIndex, noteIndex)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic pt-1">No notes added for this day yet.</p>
                            )}
                            {/* Display validation errors for day plan notes if needed */}
                            {form.formState.errors.day_plans?.[dayIndex]?.notes?.message && (
                                <p className="text-xs font-medium text-destructive mt-1">
                                    {form.formState.errors.day_plans?.[dayIndex]?.notes?.message}
                                </p>
                            )}
                          </div>


                          {/* Activity Section */}
                          <div className="mt-4 border-t pt-4">
                             <div className="flex justify-between items-center mb-2">
                                <Label>Activities for Day {dayIndex + 1}</Label>
                                <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => toggleActivityForm(dayIndex)}
                                >
                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                {showActivityForm[dayIndex] ? 'Hide Form' : 'Add Activity'}
                                </Button>
                             </div>

                            {/* Activity Add Form */}
                            {showActivityForm[dayIndex] && (
                              <div className="mt-2 p-4 border border-muted/30 rounded-lg space-y-4 bg-muted/5">
                                <h4 className="text-base font-medium mb-3 border-b pb-1"> {/* Slightly larger heading */}
                                  Add New Activity
                                </h4>

                                {/* Activity Type Select */}
                                <div className="space-y-1">
                                  <Label>Activity Type*</Label>
                                  <select
                                    className="w-full p-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" // Match input styling
                                    value={currentActivityInputs[dayIndex]?.type || ''} // Default to empty if not set
                                    onChange={(e) =>
                                      updateActivityField(dayIndex, 'type', e.target.value as ActivityType)
                                    }
                                    required // Mark as required visually/semantically
                                  >
                                    <option value="" disabled>Select type...</option>
                                    {Object.values(ActivityType).map((type) => (
                                      <option key={type} value={type}>
                                        {type.replace(/_/g, ' ')} {/* Simple formatting */}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Time Inputs */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label>Start Time*</Label>
                                    <Input
                                      type="time"
                                      className="bg-background text-sm" // Use background, consistent size
                                      value={currentActivityInputs[dayIndex]?.start_time || ''}
                                      onChange={(e) => updateActivityField(dayIndex, 'start_time', e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label>End Time*</Label>
                                    <Input
                                      type="time"
                                      className="bg-background text-sm"
                                      value={currentActivityInputs[dayIndex]?.end_time || ''}
                                      onChange={(e) => updateActivityField(dayIndex, 'end_time', e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>

                                {/* Activity Location Picker */}
                                <div className="space-y-1">
                                  <Label>Location*</Label>
                                  <div className="h-48 border border-input rounded-lg overflow-hidden">
                                    <LocationPickerMap
                                      initialLocation={currentActivityInputs[dayIndex]?.location || { latitude: 0, longitude: 0 }}
                                      onLocationChangeAction={(lat, lng) => {
                                        updateActivityField(dayIndex, 'location', { latitude: lat, longitude: lng });
                                      }}
                                      height="100%"
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Click map or search to set the activity location.
                                  </p>
                                </div>

                                {/* Activity Notes */}
                                <div className="space-y-1">
                                  <Label>Notes (Optional)</Label>
                                  <Textarea
                                    placeholder="Details, booking info, reminders..."
                                    className="bg-background text-sm min-h-20" // Use background, consistent size
                                    value={currentActivityInputs[dayIndex]?.note || ''}
                                    onChange={(e) => updateActivityField(dayIndex, 'note', e.target.value)}
                                  />
                                </div>

                                {/* Activity Cost */}
                                <div className="space-y-1">
                                  <Label>Estimated Cost (Optional)</Label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                      $
                                    </span>
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      className="bg-background text-sm pl-7" // Use background, consistent size, adjust padding
                                      min="0"
                                      step="0.01"
                                      value={currentActivityInputs[dayIndex]?.cost ?? ''} // Use empty string if 0 or undefined for placeholder
                                      onChange={(e) => updateActivityField(dayIndex, 'cost', Number(e.target.value))}
                                    />
                                  </div>
                                </div>

                                {/* Add Activity Button */}
                                <Button
                                  type="button"
                                  variant="default" // Use default variant
                                  size="sm"
                                  onClick={() => handleAddActivity(dayIndex)}
                                  className="w-full mt-3" // Add margin top
                                >
                                  <Plus className="h-4 w-4 mr-1.5" /> {/* Slightly larger icon */}
                                  Add This Activity
                                </Button>
                              </div>
                            )}

                            {/* Activity List - Renders activities from dayPlan object */}
                            {(dayPlan.activities || []).length > 0 ? (
                              <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">
                                  Scheduled Activities ({dayPlan.activities.length})
                                </h4>
                                {(dayPlan.activities || []).map((activity, activityIndex) => (
                                  <div
                                    key={activityIndex} // Consider a more stable key if needed
                                    className="flex items-start justify-between p-3 rounded-lg border border-muted/40 bg-muted/10"
                                  >
                                    <div className="flex-1 flex items-start gap-3"> {/* Increased gap */}
                                      <div className="bg-primary/10 text-primary p-1 rounded-full mt-0.5 flex-shrink-0">
                                        {/* Choose icon based on type? (Optional enhancement) */}
                                        <CalendarIcon className="h-3.5 w-3.5" />
                                      </div>
                                      <div className="space-y-0.5 overflow-hidden text-sm"> {/* Consistent text size */}
                                        <span className="font-medium block truncate">
                                          {activity.type.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-xs text-muted-foreground block">
                                          <span className="font-mono">{activity.start_time} - {activity.end_time}</span>
                                          {activity.cost != null && activity.cost > 0 && ( // Check cost explicitly
                                            <span className="ml-2 font-medium text-emerald-600 dark:text-emerald-400">
                                                • ${activity.cost.toFixed(2)}
                                            </span>
                                          )}
                                        </span>
                                        {activity.note && (
                                          <p className="text-xs text-muted-foreground/80 block truncate pt-0.5">
                                            {activity.note}
                                          </p>
                                        )}
                                         <p className="text-xs text-muted-foreground/70 block truncate pt-0.5 font-mono">
                                            📍 {activity.location.latitude.toFixed(4)}, {activity.location.longitude.toFixed(4)}
                                          </p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive flex-shrink-0 ml-2"
                                      onClick={() => handleRemoveActivity(dayIndex, activityIndex)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                ))}
                                {/* Display validation errors for activities array if needed */}
                                {form.formState.errors.day_plans?.[dayIndex]?.activities?.message && (
                                    <p className="text-xs font-medium text-destructive mt-1">
                                        {form.formState.errors.day_plans?.[dayIndex]?.activities?.message}
                                    </p>
                                )}
                              </div>
                            ) : (
                                !showActivityForm[dayIndex] && // Only show if form isn't open
                                <p className="text-xs text-muted-foreground italic mt-2">No activities added for this day yet.</p>
                            )}
                          </div>


                          {/* Route Plan Section */}
                          <div className="mt-4 border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <Label>Route Plan for Day {dayIndex + 1}</Label>
                                <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => toggleRoutePlan(dayIndex)}
                                >
                                {showRoutePlan[dayIndex] ? 'Hide Route Plan' : 'Add/Edit Route Plan'}
                                </Button>
                            </div>

                            {showRoutePlan[dayIndex] && (
                              <div className="mt-2 space-y-4 rounded-lg border border-border p-4 bg-muted/5">
                                <h4 className="text-base font-medium mb-3 border-b pb-1">
                                    Edit Route Details
                                </h4>
                                {/* Route Description */}
                                <div className="space-y-1">
                                  <Label>Route Description (Optional)</Label>
                                  <Textarea
                                    placeholder="e.g., Scenic drive via coastal road, public transport plan..."
                                    value={routePlanDescriptions[dayIndex] || ''}
                                    onChange={(e) => updateRoutePlanDescription(dayIndex, e.target.value)}
                                    className="min-h-20 bg-background text-sm" // Use background, consistent size
                                  />
                                </div>

                                {/* Distance and Time */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <Label>Total Distance (km)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.1"
                                      placeholder="0.0"
                                      value={routePlanTotalDistances[dayIndex] ?? ''} // Use empty string if 0 or undefined
                                      onChange={(e) => updateTotalDistance(dayIndex, e.target.value)}
                                      className="bg-background text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label>Total Time (minutes)</Label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1"
                                      placeholder="0"
                                      value={routePlanTotalTimes[dayIndex] ?? ''} // Use empty string if 0 or undefined
                                      onChange={(e) => updateTotalTime(dayIndex, e.target.value)}
                                      className="bg-background text-sm"
                                    />
                                  </div>
                                </div>

                                {/* Route Locations */}
                                <div className="space-y-3 pt-2">
                                  <Label>Route Waypoints/Locations</Label>
                                  <div className="rounded-lg border border-input p-3"> {/* Use input border */}
                                    <LocationPickerMap
                                      // Use the specific state for the new route location picker
                                      initialLocation={newRouteLocation[dayIndex] || { latitude: 0, longitude: 0 }}
                                      onLocationChangeAction={(lat, lng) => handleRouteLocationChange(dayIndex, lat, lng)}
                                      height="200px" // Slightly smaller map for waypoints
                                    />
                                    <div className="mt-3 flex flex-col sm:flex-row justify-between items-center gap-2">
                                      <p className="text-xs text-muted-foreground flex-1 text-center sm:text-left">
                                        {newRouteLocation[dayIndex] ? (
                                          <span>
                                            Selected:{' '}
                                            <span className="font-mono">{newRouteLocation[dayIndex]?.latitude.toFixed(5)}, {newRouteLocation[dayIndex]?.longitude.toFixed(5)}</span>
                                          </span>
                                        ) : (
                                          <span>Click map or search to select a waypoint</span>
                                        )}
                                      </p>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => addRouteLocation(dayIndex)}
                                        disabled={!newRouteLocation[dayIndex]} // Disable if no location selected
                                        className="flex items-center w-full sm:w-auto"
                                      >
                                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                                        Add Waypoint
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Route Location List - Renders locations from routePlanLocations state */}
                                  {(routePlanLocations[dayIndex] || []).length > 0 ? (
                                    <div className="mt-3">
                                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                                        Added Waypoints ({routePlanLocations[dayIndex].length})
                                      </h4>
                                      <ul className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-background">
                                        {routePlanLocations[dayIndex].map((location, locationIndex) => (
                                          <li
                                            key={locationIndex} // Consider more stable key
                                            className="flex items-center justify-between p-2 rounded-md bg-muted/30 "
                                          >
                                            <div className="flex items-center text-sm">
                                              <MapPin className="h-3.5 w-3.5 mr-2 text-primary flex-shrink-0" />
                                              <span className="text-xs font-mono">
                                                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                              </span>
                                            </div>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeRouteLocation(dayIndex, locationIndex)}
                                              className="h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic mt-2">
                                      No waypoints added yet. Add locations to define the route.
                                    </p>
                                  )}
                                   {/* Display validation errors for route plan if needed */}
                                    {form.formState.errors.day_plans?.[dayIndex]?.route_plan?.message && (
                                        <p className="text-xs font-medium text-destructive mt-1">
                                            {form.formState.errors.day_plans?.[dayIndex]?.route_plan?.message}
                                        </p>
                                    )}
                                    {form.formState.errors.day_plans?.[dayIndex]?.route_plan?.locations?.message && (
                                        <p className="text-xs font-medium text-destructive mt-1">
                                            {form.formState.errors.day_plans?.[dayIndex]?.route_plan?.locations?.message}
                                        </p>
                                    )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                       {/* Display validation error for the day_plans array itself */}
                       {form.formState.errors.day_plans?.message && (
                          <p className="text-sm font-medium text-destructive mt-2">
                            {form.formState.errors.day_plans.message}
                          </p>
                        )}
                         {form.formState.errors.day_plans?.root?.message && (
                          <p className="text-sm font-medium text-destructive mt-2">
                            {form.formState.errors.day_plans.root.message}
                          </p>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>


              {/* Notes Card - Updated to use form state */}
              <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary/80" />
                    General Notes
                  </CardTitle>
                  <CardDescription>
                    Add overall important notes for your trip (e.g., visa info, packing lists).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Note Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a general note..."
                      className="bg-muted/50"
                       onKeyDown={(e) => {
                          if (e.key === 'Enter' && newNote.trim()) {
                            e.preventDefault(); // Prevent form submission
                            handleAddNote();
                          }
                        }}
                    />
                    <Button
                      type="button" // Prevent form submission
                      variant="outline"
                      onClick={handleAddNote} // Use updated handler
                      disabled={!newNote.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Note
                    </Button>
                  </div>

                  {/* Notes List - Reads from formNotes */}
                  <div className="space-y-2 mt-2">
                    {formNotes.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                        No general notes added yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formNotes.map((note, index) => (
                          <div
                            key={index}
                            className="flex items-start justify-between p-3 rounded-lg border border-muted/40 bg-muted/10"
                          >
                            <div className="flex items-start gap-2">
                              <div className="bg-primary/10 text-primary p-1 rounded-full mt-0.5">
                                <Info className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-sm">{note}</span>
                            </div>
                            <Button
                              type="button" // Prevent form submission
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleRemoveNote(index)} // Use updated handler
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                     {/* Display validation error for notes field */}
                     {form.formState.errors.notes?.message && (
                        <p className="text-xs font-medium text-destructive mt-1">
                            {form.formState.errors.notes.message}
                        </p>
                    )}
                  </div>
                </CardContent>
              </Card>


              {/* Submit Button (remains the same) */}
              <div className="flex justify-end pt-4"> {/* Added padding top */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid} // Disable if submitting or form is invalid
                  className="bg-gradient-to-r from-forest to-ocean text-white hover:from-forest-dark hover:to-ocean-dark transition-all duration-300 shadow-lg px-6 py-3 text-base font-semibold rounded-lg" // Enhanced styling
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {/* Larger spinner */}
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> {/* Larger icon */}
                      Create Itinerary
                    </>
                  )}
                </Button>
              </div>
               {/* Display general form errors */}
                {form.formState.errors.root?.message && (
                    <p className="text-sm font-medium text-destructive text-center mt-4">
                        {form.formState.errors.root.message}
                    </p>
                )}
            </form>
          </Form>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Helper label component (remains the same)
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </div>
  );
}
