'use client';

import { LocationPickerMap } from '@/components/maps/LocationPickerMap';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { ItineraryService } from '@/service/itinerary-service';
import { ActivityCreateRequest, ActivityType } from '@/types/activity';
import { ItineraryWithDetailsRequest } from '@/types/itinerary';
import { Location } from '@/types/location';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, differenceInDays, format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Info,
  Loader2,
  MapPin,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Define a type for the day plan form data
interface DayPlanFormData {
  date: Date;
  notes?: string[];
  activities: Array<{
    location: Location;
    start_time: string;
    end_time: string;
    type: ActivityType;
    note: string;
    cost: number;
  }>;
  route_plan?: {
    total_distance: number;
    total_time: number;
    description: string;
    locations: Location[];
  };
}

// Define validation schema using the standard Location type
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
    .array(z.object({ latitude: z.number(), longitude: z.number() }))
    .min(1, { message: 'At least one location is required' }),
  create_day_plans: z.boolean().optional(),
  day_plans: z
    .array(
      z.object({
        date: z.date(),
        notes: z.array(z.string()).optional(),
        activities: z
          .array(
            z.object({
              location: z.object({
                latitude: z.number(),
                longitude: z.number(),
              }),
              start_time: z.string(),
              end_time: z.string(),
              type: z.nativeEnum(ActivityType),
              note: z.string(),
              cost: z.number(),
            })
          )
          .optional(),
        route_plan: z
          .object({
            total_distance: z.number(),
            total_time: z.number(),
            description: z.string(),
            locations: z.array(
              z.object({ latitude: z.number(), longitude: z.number() })
            ),
          })
          .optional(),
      })
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateItineraryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  // Use the standard Location type with extended properties
  const [locations, setLocations] = useState<Location[]>([]);
  // State for day plans
  const [dayPlans, setDayPlans] = useState<DayPlanFormData[]>([]);

  // Initialize form
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
      day_plans: [],
    },
  });

  console.log(form.getValues());

  // Derive day plans toggle directly from form values
  const withDayPlans = form.watch('create_day_plans');

  // Route plan related state
  const [showRoutePlan, setShowRoutePlan] = useState<{
    [key: number]: boolean;
  }>({});
  const [routePlanDescriptions, setRoutePlanDescriptions] = useState<{
    [key: number]: string;
  }>({});
  const [routePlanTotalDistances, setRoutePlanTotalDistances] = useState<{
    [key: number]: string;
  }>({});
  const [routePlanTotalTimes, setRoutePlanTotalTimes] = useState<{
    [key: number]: string;
  }>({});
  const [routePlanLocations, setRoutePlanLocations] = useState<{
    [key: number]: Location[];
  }>({});
  const [newRouteLocation, setNewRouteLocation] = useState<{
    [key: number]: Location;
  }>({});

  // Add a state array to track note input values for each day plan
  const [dayPlanNoteInputs, setDayPlanNoteInputs] = useState<string[]>([]);

  // Handlers for adding/removing notes on each day plan
  const handleAddDayPlanNote = (dayIndex: number, note: string) => {
    const updated = [...dayPlans];
    updated[dayIndex].notes = [...(updated[dayIndex].notes || []), note];
    setDayPlans(updated);
  };

  const handleRemoveDayPlanNote = (dayIndex: number, noteIndex: number) => {
    const updated = [...dayPlans];
    updated[dayIndex].notes = updated[dayIndex].notes
      ? updated[dayIndex].notes.filter((_, i) => i !== noteIndex)
      : [];
    setDayPlans(updated);
  };

  // AI dialog state and form inputs
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

  // Effect to sync local dayPlans state with form 'day_plans' field
  useEffect(() => {
    form.setValue('day_plans', dayPlans, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  }, [dayPlans, form]);

  // Effect to initialize dayPlanNoteInputs when dayPlans changes
  useEffect(() => {
    if (dayPlans.length > 0) {
      setDayPlanNoteInputs(new Array(dayPlans.length).fill(''));
    }
  }, [dayPlans.length]);

  // Activity state tracking
  const [showActivityForm, setShowActivityForm] = useState<{
    [key: number]: boolean;
  }>({});
  const [currentActivityInputs, setCurrentActivityInputs] = useState<{
    [key: number]: Omit<ActivityCreateRequest, 'day_plan_id'>;
  }>({});

  // Initialize an empty activity form data
  const emptyActivityForm: Omit<ActivityCreateRequest, 'day_plan_id'> = {
    location: { latitude: 0, longitude: 0 },
    start_time: '09:00',
    end_time: '10:00',
    type: ActivityType.SIGHTSEEING,
    note: '',
    cost: 0,
  };

  // Update activity input field
  const updateActivityField = (
    dayIndex: number,
    field: keyof ActivityCreateRequest,
    value: string | number
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
    if (!currentActivityInputs[dayIndex]) return;

    const activity = currentActivityInputs[dayIndex];
    const updatedDayPlans = [...dayPlans];
    updatedDayPlans[dayIndex].activities = [
      ...(updatedDayPlans[dayIndex].activities || []),
      { ...activity, type: activity.type as ActivityType },
    ];

    setDayPlans(updatedDayPlans);
    // Reset form after adding
    setCurrentActivityInputs((prev) => ({
      ...prev,
      [dayIndex]: { ...emptyActivityForm },
    }));
  };

  // Toggle activity form visibility
  const toggleActivityForm = (dayIndex: number) => {
    setShowActivityForm((prev) => ({
      ...prev,
      [dayIndex]: !prev[dayIndex],
    }));

    // Initialize activity input if not already set
    if (!currentActivityInputs[dayIndex]) {
      setCurrentActivityInputs((prev) => ({
        ...prev,
        [dayIndex]: { ...emptyActivityForm },
      }));
    }
  };

  // Remove activity from a day plan
  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
    const updatedDayPlans = [...dayPlans];
    updatedDayPlans[dayIndex].activities = updatedDayPlans[
      dayIndex
    ].activities.filter((_, i) => i !== activityIndex);
    setDayPlans(updatedDayPlans);
  };

  // Toggle route plan visibility for a day
  const toggleRoutePlan = (dayIndex: number) => {
    setShowRoutePlan((prev) => ({
      ...prev,
      [dayIndex]: !prev[dayIndex],
    }));

    // Initialize route plan data if not already set
    if (!routePlanLocations[dayIndex]) {
      setRoutePlanLocations((prev) => ({ ...prev, [dayIndex]: [] }));
    }
    if (!routePlanDescriptions[dayIndex]) {
      setRoutePlanDescriptions((prev) => ({ ...prev, [dayIndex]: '' }));
    }
    if (!routePlanTotalDistances[dayIndex]) {
      setRoutePlanTotalDistances((prev) => ({ ...prev, [dayIndex]: '0' }));
    }
    if (!routePlanTotalTimes[dayIndex]) {
      setRoutePlanTotalTimes((prev) => ({ ...prev, [dayIndex]: '0' }));
    }
    if (!newRouteLocation[dayIndex]) {
      setNewRouteLocation((prev) => ({
        ...prev,
        [dayIndex]: { latitude: 0, longitude: 0 },
      }));
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
    if (
      !newRouteLocation[dayIndex] ||
      (newRouteLocation[dayIndex].latitude === 0 &&
        newRouteLocation[dayIndex].longitude === 0)
    ) {
      return;
    }

    const updatedLocations = [
      ...(routePlanLocations[dayIndex] || []),
      newRouteLocation[dayIndex],
    ];
    setRoutePlanLocations((prev) => ({
      ...prev,
      [dayIndex]: updatedLocations,
    }));

    // Update the day plan's route plan
    updateDayPlanRoutePlan(dayIndex);

    // Reset the location picker
    setNewRouteLocation((prev) => ({
      ...prev,
      [dayIndex]: { latitude: 0, longitude: 0 },
    }));
  };

  // Remove location from route plan
  const removeRouteLocation = (dayIndex: number, locationIndex: number) => {
    const updatedLocations = (routePlanLocations[dayIndex] || []).filter(
      (_, i) => i !== locationIndex
    );

    setRoutePlanLocations((prev) => ({
      ...prev,
      [dayIndex]: updatedLocations,
    }));

    // Update the day plan's route plan
    updateDayPlanRoutePlan(dayIndex);
  };

  // Update route plan description
  const updateRoutePlanDescription = (dayIndex: number, value: string) => {
    setRoutePlanDescriptions((prev) => ({
      ...prev,
      [dayIndex]: value,
    }));
    updateDayPlanRoutePlan(dayIndex);
  };

  // Update total distance
  const updateTotalDistance = (dayIndex: number, value: string) => {
    setRoutePlanTotalDistances((prev) => ({
      ...prev,
      [dayIndex]: value,
    }));
    updateDayPlanRoutePlan(dayIndex);
  };

  // Update total time
  const updateTotalTime = (dayIndex: number, value: string) => {
    setRoutePlanTotalTimes((prev) => ({
      ...prev,
      [dayIndex]: value,
    }));
    updateDayPlanRoutePlan(dayIndex);
  };

  // Update the day plan's route plan data
  const updateDayPlanRoutePlan = (dayIndex: number) => {
    const updatedDayPlans = [...dayPlans];
    updatedDayPlans[dayIndex].route_plan = {
      total_distance: parseFloat(routePlanTotalDistances[dayIndex] || '0') || 0,
      total_time: parseFloat(routePlanTotalTimes[dayIndex] || '0') || 0,
      description: routePlanDescriptions[dayIndex] || '',
      locations: routePlanLocations[dayIndex] || [],
    };
    setDayPlans(updatedDayPlans);

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

  // Update form when notes or locations change
  useEffect(() => {
    form.setValue('notes', notes);
  }, [notes, form]);

  useEffect(() => {
    form.setValue('locations', locations);
  }, [locations, form]);

  // Effect to watch for date changes and auto-generate day plans
  useEffect(() => {
    if (form.getValues('create_day_plans') && startDate && endDate) {
      const duration = differenceInDays(endDate, startDate) + 1;

      // Generate empty day plans for each day in the date range
      const newDayPlans: DayPlanFormData[] = [];
      for (let i = 0; i < duration; i++) {
        const date = addDays(startDate, i);
        newDayPlans.push({
          date,
          notes: [],
          activities: [],
        });
      }
      setDayPlans(newDayPlans);
      form.setValue('day_plans', newDayPlans, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }
  }, [startDate, endDate, withDayPlans, form]);

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote.trim()]);
      setNewNote('');
    }
  };

  const handleRemoveNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  // Update handler to accept ExtendedLocation
  const handleAddLocation = (location: Location) => {
    setLocations([...locations, location]);
  };

  const handleRemoveLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      // Map FormLocation[] to Location[] before sending
      const mappedLocations = data.locations.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
      }));

      // Prepare the base itinerary data
      const itineraryData = {
        title: data.title,
        description: data.description,
        start_date: format(data.start_date, 'yyyy-MM-dd'),
        end_date: format(data.end_date, 'yyyy-MM-dd'),
        notes: data.notes || [],
        locations: mappedLocations,
      };

      let response;

      // If day plans should be created along with the itinerary, use createItineraryWithDetails
      if (withDayPlans && dayPlans.length > 0) {
        // Map the day plans to the format expected by the API
        const formattedDayPlans = dayPlans.map((dayPlan) => ({
          date: format(dayPlan.date, 'yyyy-MM-dd'),
          notes: dayPlan.notes,
          activities: dayPlan.activities,
          // Use the actual route_plan from state, if set
          route_plan: dayPlan.route_plan,
        }));

        // Create the itinerary with day plans using the new method
        const itineraryWithDetails: ItineraryWithDetailsRequest = {
          ...itineraryData,
          day_plans: formattedDayPlans,
        };

        response =
          await ItineraryService.createItineraryWithDetails(
            itineraryWithDetails
          );

        toast.success('Itinerary Created with Day Plans', {
          description: `Your itinerary with ${dayPlans.length} day plans has been successfully created.`,
        });
      } else {
        // Create a basic itinerary without day plans
        response = await ItineraryService.createItinerary(itineraryData);

        toast.success('Itinerary Created', {
          description: 'Your itinerary has been successfully created.',
        });
      }

      // Redirect to the new itinerary using query parameters
      router.push(`/itinerary/details?id=${response.data.id}`);
    } catch (error) {
      console.error('Failed to create itinerary:', error);
      toast.error('Failed to create itinerary', {
        // Provide more specific error message if available from error object
        description:
          error instanceof Error ? error.message : 'Please try again.',
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

  // AI form submit handler
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const response = await ItineraryService.generateItinerary({
        location: aiLocation,
        start_date: aiStartDate,
        number_of_days: aiNumberOfDays,
        budget_level: aiBudgetLevel,
        number_of_people: aiNumberOfPeople,
      });
      const data = response.data;
      const hasDayPlans = Array.isArray(data.day_plans) && data.day_plans.length > 0;

      // Set form base fields first
      form.setValue('title', data.title);
      form.setValue('description', data.description);
      form.setValue('start_date', new Date(data.start_date));
      form.setValue('end_date', new Date(data.end_date));
      form.setValue('notes', data.notes ?? []);
      form.setValue('locations', data.locations);
      form.setValue('create_day_plans', hasDayPlans);

      // Update local state
      setNotes(data.notes ?? []);
      setLocations(data.locations);

      // Process day plans if they exist
      if (hasDayPlans) {
        // Initialize all the state objects for UI interactions
        const locState: Record<number, Location[]> = {};
        const descState: Record<number, string> = {};
        const distState: Record<number, string> = {};
        const timeState: Record<number, string> = {};
        const showState: Record<number, boolean> = {};
        const activityFormState: Record<number, boolean> = {};

        // Map AI response day plans to form data
        const mappedDayPlans = data.day_plans.map((pl, idx) => {
          // Initialize state for each day plan's route plan
          if (pl.route_plan) {
            locState[idx] = pl.route_plan.locations || [];
            descState[idx] = pl.route_plan.description || '';
            distState[idx] = String(pl.route_plan.total_distance || 0);
            timeState[idx] = String(pl.route_plan.total_time || 0);
            showState[idx] = true; // Auto-show route plans that exist
          }

          // Initialize state for activities if they exist
          if (pl.activities && pl.activities.length > 0) {
            activityFormState[idx] = true; // Auto-show activity section
          }

          // Return the mapped day plan
          return {
            date: new Date(pl.date),
            notes: pl.notes ?? [],
            activities: (pl.activities ?? []).map((activity) => ({
              ...activity,
              type: activity.type as ActivityType,
            })),
            route_plan: pl.route_plan,
          };
        });

        // Set all the state variables
        setDayPlans(mappedDayPlans);
        setRoutePlanLocations(locState);
        setRoutePlanDescriptions(descState);
        setRoutePlanTotalDistances(distState);
        setRoutePlanTotalTimes(timeState);
        setShowRoutePlan(showState);
        setShowActivityForm(activityFormState);

        // Make sure dayPlanNoteInputs is initialized
        setDayPlanNoteInputs(new Array(mappedDayPlans.length).fill(''));

        // Update the form with the mapped day plans
        form.setValue('day_plans', mappedDayPlans, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true
        });
      }

      toast.success('AI itinerary generated and populated');
      setAiDialogOpen(false);
    } catch (error) {
      console.log('AI itinerary generation failed:', error);
      toast.error('Failed to generate AI itinerary');
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
        {/* AI Generate Button and Dialog */}
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

        {/* Back button */}
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

        {/* Form header */}
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Card */}
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

              {/* Date Range Card */}
              <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary/80" />
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
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
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
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => {
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

              {/* Locations Card */}
              <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary/80" />
                    Locations
                  </CardTitle>
                  <CardDescription>
                    Add destinations you plan to visit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Location Picker Map */}
                  <div className="mt-6 space-y-2">
                    <Label>Map Selection</Label>
                    <LocationPickerMap
                      initialLocation={{
                        latitude:
                          locations.length > 0
                            ? locations[locations.length - 1].latitude
                            : 0,
                        longitude:
                          locations.length > 0
                            ? locations[locations.length - 1].longitude
                            : 0,
                      }}
                      onLocationChangeAction={(lat, lng) => {
                        // When a location is selected on map, add it to locations
                        handleAddLocation({
                          latitude: lat,
                          longitude: lng,
                        });
                      }}
                      height="300px"
                    />
                    <p className="text-xs text-muted-foreground">
                      Click on the map to add a location, or use the search
                      above
                    </p>
                  </div>

                  {/* Locations List */}
                  <div className="space-y-3 mt-4">
                    <p className="text-sm font-medium">
                      Added Locations ({locations.length})
                    </p>

                    {locations.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                        No locations added yet. Search and add destinations
                        above.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Render using fields from FormLocation */}
                        {locations.map((location, index) => (
                          <div
                            key={index}
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
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleRemoveLocation(index)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}

                        {form.formState.errors.locations && (
                          <p className="text-xs font-medium text-destructive">
                            {form.formState.errors.locations.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Day Plans Option */}
              <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary/80" />
                    Day Plans
                  </CardTitle>
                  <CardDescription>
                    Optionally create day plans along with your itinerary
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Replace manual checkbox for create_day_plans with FormField binding */}
                  <FormField
                    control={form.control}
                    name="create_day_plans"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <input
                            type="checkbox"
                            id="create-day-plans"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={field.value || false}
                            onChange={(e) => field.onChange(e.target.checked)}
                            onBlur={field.onBlur}
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor="create-day-plans"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Create day plans for each day of the trip
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  {withDayPlans && dayPlans.length > 0 && (
                    <div className="mt-4 space-y-6">
                      <p className="text-sm text-muted-foreground">
                        You&apos;re creating {dayPlans.length} day plans, one
                        for each day of your trip. You can add specific notes
                        for each day.
                      </p>

                      {dayPlans.map((dayPlan, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="p-4 border border-muted rounded-lg space-y-3"
                        >
                          <h3 className="text-sm font-medium">
                            Day {dayIndex + 1}:{' '}
                            {format(dayPlan.date, 'EEEE, MMMM d, yyyy')}
                          </h3>

                          {/* Day Plan Notes */}
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder={`Add a note for day ${dayIndex + 1}`}
                                className="bg-muted/50 text-xs"
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
                                  if (
                                    e.key === 'Enter' &&
                                    dayPlanNoteInputs[dayIndex]?.trim()
                                  ) {
                                    handleAddDayPlanNote(
                                      dayIndex,
                                      dayPlanNoteInputs[dayIndex]
                                    );
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
                                    handleAddDayPlanNote(
                                      dayIndex,
                                      dayPlanNoteInputs[dayIndex]
                                    );
                                    setDayPlanNoteInputs((prev) => {
                                      const next = [...prev];
                                      next[dayIndex] = '';
                                      return next;
                                    });
                                  }
                                }}
                                className="whitespace-nowrap"
                              >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add
                              </Button>
                            </div>

                            {/* Day Plan Notes List */}
                            {(dayPlan.notes || []).length > 0 ? (
                              <div className="space-y-1.5">
                                {(dayPlan.notes || []).map((note, noteIndex) => (
                                  <div key={noteIndex}>
                                    <div className="flex items-start justify-between p-2 rounded-lg border border-muted/40 bg-muted/10">
                                      <div className="flex items-start gap-2">
                                        <div className="bg-primary/10 text-primary p-0.5 rounded-full mt-0.5">
                                          <Info className="h-3 w-3" />
                                        </div>
                                        <span className="text-xs">{note}</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() =>
                                          handleRemoveDayPlanNote(
                                            dayIndex,
                                            noteIndex
                                          )
                                        }
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div>No notes added for this day yet.</div>
                            )}
                          </div>

                          {/* Activity Form Toggle and List */}
                          <div className="mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => toggleActivityForm(dayIndex)}
                            >
                              {showActivityForm[dayIndex]
                                ? 'Hide Activities'
                                : 'Add Activity'}
                            </Button>

                            {showActivityForm[dayIndex] && (
                              <div className="mt-2 p-3 border border-muted/30 rounded-lg space-y-4">
                                <h4 className="text-sm font-medium mb-2">
                                  Add New Activity
                                </h4>

                                {/* Activity Type */}
                                <div className="space-y-1">
                                  <label className="text-xs font-medium">
                                    Activity Type
                                  </label>
                                  <select
                                    className="w-full p-2 text-xs rounded-md border border-muted bg-muted/20"
                                    value={
                                      currentActivityInputs[dayIndex]?.type ||
                                      ActivityType.SIGHTSEEING
                                    }
                                    onChange={(e) =>
                                      updateActivityField(
                                        dayIndex,
                                        'type',
                                        e.target.value as ActivityType
                                      )
                                    }
                                  >
                                    {Object.values(ActivityType).map((type) => (
                                      <option key={type} value={type}>
                                        {type
                                          .split('_')
                                          .map(
                                            (word) =>
                                              word.charAt(0) +
                                              word.slice(1).toLowerCase()
                                          )
                                          .join(' ')}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Time fields in a row */}
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium">
                                      Start Time
                                    </label>
                                    <Input
                                      type="time"
                                      className="bg-muted/50 text-xs"
                                      value={
                                        currentActivityInputs[dayIndex]
                                          ?.start_time || '09:00'
                                      }
                                      onChange={(e) =>
                                        updateActivityField(
                                          dayIndex,
                                          'start_time',
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium">
                                      End Time
                                    </label>
                                    <Input
                                      type="time"
                                      className="bg-muted/50 text-xs"
                                      value={
                                        currentActivityInputs[dayIndex]
                                          ?.end_time || '10:00'
                                      }
                                      onChange={(e) =>
                                        updateActivityField(
                                          dayIndex,
                                          'end_time',
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-1">
                                  <label className="text-xs font-medium">
                                    Location
                                  </label>
                                  <div className="h-48 border border-muted/30 rounded-lg overflow-hidden">
                                    <LocationPickerMap
                                      initialLocation={
                                        currentActivityInputs[dayIndex]
                                          ?.location || {
                                          latitude: 0,
                                          longitude: 0,
                                        }
                                      }
                                      onLocationChangeAction={(lat, lng) => {
                                        const updated = {
                                          ...currentActivityInputs[dayIndex],
                                        };
                                        updated.location = {
                                          latitude: lat,
                                          longitude: lng,
                                        };
                                        setCurrentActivityInputs((prev) => ({
                                          ...prev,
                                          [dayIndex]: updated,
                                        }));
                                      }}
                                      height="100%"
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Click on the map to select a location for
                                    this activity
                                  </p>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-xs font-medium">
                                    Notes
                                  </label>
                                  <Textarea
                                    placeholder="Add details about this activity"
                                    className="bg-muted/50 text-xs min-h-20"
                                    value={
                                      currentActivityInputs[dayIndex]?.note ||
                                      ''
                                    }
                                    onChange={(e) =>
                                      updateActivityField(
                                        dayIndex,
                                        'note',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-xs font-medium">
                                    Cost
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                      $
                                    </span>
                                    <Input
                                      type="number"
                                      placeholder="0.00"
                                      className="bg-muted/50 text-xs pl-8"
                                      min="0"
                                      step="0.01"
                                      value={
                                        currentActivityInputs[dayIndex]?.cost ||
                                        0
                                      }
                                      onChange={(e) =>
                                        updateActivityField(
                                          dayIndex,
                                          'cost',
                                          Number(e.target.value)
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddActivity(dayIndex)}
                                  className="w-full mt-2"
                                >
                                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                                  Add Activity to Day Plan
                                </Button>
                              </div>
                            )}

                            {dayPlan.activities.length > 0 && (
                              <div className="mt-4 space-y-1.5">
                                <h4 className="text-xs font-medium">
                                  Activities ({dayPlan.activities.length})
                                </h4>
                                {dayPlan.activities.map(
                                  (activity, activityIndex) => (
                                    <div
                                      key={activityIndex}
                                      className="flex items-start justify-between p-2 rounded-lg border border-muted/40 bg-muted/10"
                                    >
                                      <div className="flex-1 flex items-start gap-2">
                                        <div className="bg-primary/10 text-primary p-0.5 rounded-full mt-0.5 flex-shrink-0">
                                          <Calendar className="h-3 w-3" />
                                        </div>
                                        <div className="space-y-0.5 overflow-hidden">
                                          <span className="text-xs font-medium block truncate">
                                            {activity.type
                                              .split('_')
                                              .map(
                                                (w) =>
                                                  w.charAt(0) +
                                                  w.slice(1).toLowerCase()
                                              )
                                              .join(' ')}
                                          </span>
                                          <span className="text-xs text-muted-foreground block">
                                            {activity.start_time} -{' '}
                                            {activity.end_time}
                                            {activity.cost > 0 &&
                                              ` • $${activity.cost.toFixed(2)}`}
                                          </span>
                                          {activity.note && (
                                            <span className="text-xs text-muted-foreground block truncate">
                                              {activity.note}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 rounded-full hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                                        onClick={() =>
                                          handleRemoveActivity(
                                            dayIndex,
                                            activityIndex
                                          )
                                        }
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>

                          {/* Route Plan Toggle and Content */}
                          <div className="mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => toggleRoutePlan(dayIndex)}
                            >
                              {showRoutePlan[dayIndex]
                                ? 'Hide Route Plan'
                                : 'Add Route Plan'}
                            </Button>

                            {showRoutePlan[dayIndex] && (
                              <div className="mt-2 space-y-4 rounded-lg border border-border p-4">
                                {/* Route Description */}
                                <div className="space-y-2">
                                  <label className="text-xs font-medium">
                                    Route Description
                                  </label>
                                  <Textarea
                                    placeholder="Describe the route for this day"
                                    value={
                                      routePlanDescriptions[dayIndex] || ''
                                    }
                                    onChange={(e) =>
                                      updateRoutePlanDescription(
                                        dayIndex,
                                        e.target.value
                                      )
                                    }
                                    className="min-h-20 bg-muted/50 text-xs"
                                  />
                                </div>

                                {/* Distance and Time */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-xs font-medium">
                                      Total Distance (km)
                                    </label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="0.1"
                                      placeholder="0.0"
                                      value={
                                        routePlanTotalDistances[dayIndex] || '0'
                                      }
                                      onChange={(e) =>
                                        updateTotalDistance(
                                          dayIndex,
                                          e.target.value
                                        )
                                      }
                                      className="bg-muted/50 text-xs"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-medium">
                                      Total Time (minutes)
                                    </label>
                                    <Input
                                      type="number"
                                      min="0"
                                      step="1"
                                      placeholder="0"
                                      value={
                                        routePlanTotalTimes[dayIndex] || '0'
                                      }
                                      onChange={(e) =>
                                        updateTotalTime(
                                          dayIndex,
                                          e.target.value
                                        )
                                      }
                                      className="bg-muted/50 text-xs"
                                    />
                                  </div>
                                </div>

                                {/* Locations with Map Picker */}
                                <div className="space-y-3">
                                  <label className="text-xs font-medium">
                                    Route Locations
                                  </label>
                                  <div className="rounded-lg border border-muted/40 p-4">
                                    <LocationPickerMap
                                      initialLocation={
                                        newRouteLocation[dayIndex] || {
                                          latitude: 0,
                                          longitude: 0,
                                        }
                                      }
                                      onLocationChangeAction={(lat, lng) =>
                                        handleRouteLocationChange(
                                          dayIndex,
                                          lat,
                                          lng
                                        )
                                      }
                                      height="250px"
                                    />
                                    <div className="mt-3 flex justify-between">
                                      <p className="text-xs text-muted-foreground">
                                        {newRouteLocation[dayIndex] &&
                                        (newRouteLocation[dayIndex].latitude !==
                                          0 ||
                                          newRouteLocation[dayIndex]
                                            .longitude !== 0) ? (
                                          <span>
                                            Selected:{' '}
                                            {newRouteLocation[
                                              dayIndex
                                            ].latitude.toFixed(6)}
                                            ,{' '}
                                            {newRouteLocation[
                                              dayIndex
                                            ].longitude.toFixed(6)}
                                          </span>
                                        ) : (
                                          <span>
                                            Click on the map to select a
                                            location
                                          </span>
                                        )}
                                      </p>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          addRouteLocation(dayIndex)
                                        }
                                        disabled={
                                          !newRouteLocation[dayIndex] ||
                                          (newRouteLocation[dayIndex]
                                            .latitude === 0 &&
                                            newRouteLocation[dayIndex]
                                              .longitude === 0)
                                        }
                                        className="flex items-center ml-2"
                                      >
                                        <Plus className="mr-2 h-3.5 w-3.5" />
                                        Add Location
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Location List */}
                                  {routePlanLocations[dayIndex]?.length > 0 ? (
                                    <div className="mt-2">
                                      <h4 className="text-xs font-medium mb-2">
                                        Added Locations (
                                        {routePlanLocations[dayIndex].length})
                                      </h4>
                                      <ul className="space-y-2 max-h-48 overflow-y-auto">
                                        {routePlanLocations[dayIndex].map(
                                          (location, locationIndex) => (
                                            <li
                                              key={locationIndex}
                                              className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-muted/20"
                                            >
                                              <div className="flex items-center">
                                                <MapPin className="h-3.5 w-3.5 mr-2 text-primary" />
                                                <span className="text-xs">
                                                  Lat:{' '}
                                                  {location.latitude.toFixed(4)}
                                                  , Lng:{' '}
                                                  {location.longitude.toFixed(
                                                    4
                                                  )}
                                                </span>
                                              </div>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  removeRouteLocation(
                                                    dayIndex,
                                                    locationIndex
                                                  )
                                                }
                                                className="h-6 w-6 p-0 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                              >
                                                <Trash2 className="h-3.5 w-3.5" />
                                              </Button>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-muted-foreground italic mt-2">
                                      No locations added yet. Add locations to
                                      create a route plan.
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes Card */}
              <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary/80" />
                    Notes
                  </CardTitle>
                  <CardDescription>
                    Add important notes about your trip
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Note */}
                  <div className="flex gap-2">
                    <Input
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note (e.g., Remember passport, Book tours in advance, etc.)"
                      className="bg-muted/50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-2 mt-2">
                    {notes.length === 0 ? (
                      <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                        No notes added yet. Add important reminders above.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notes.map((note, index) => (
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
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleRemoveNote(index)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-forest to-ocean text-white hover:from-forest-dark hover:to-ocean-dark transition-all duration-300 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Itinerary
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Helper label component
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </div>
  );
}
