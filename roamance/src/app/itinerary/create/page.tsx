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

// Define a local type for the location data used in the form
interface FormLocation {
  latitude: number;
  longitude: number;
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  description?: string;
}

// Define validation schema using the local FormLocation type
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
    .array(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .min(1, { message: 'At least one location is required' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateItineraryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  // Use the local FormLocation type for state
  const [locations, setLocations] = useState<FormLocation[]>([]);

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
    },
  });

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

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, newNote.trim()]);
      setNewNote('');
    }
  };

  const handleRemoveNote = (index: number) => {
    setNotes(notes.filter((_, i) => i !== index));
  };

  // Update handler to accept FormLocation
  const handleAddLocation = (location: FormLocation) => {
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

      // Prepare the request
      const itineraryData = {
        title: data.title,
        description: data.description,
        start_date: format(data.start_date, 'yyyy-MM-dd'),
        end_date: format(data.end_date, 'yyyy-MM-dd'),
        notes: data.notes || [],
        locations: mappedLocations, // Use the mapped locations
      };

      // Create the itinerary
      const response = await ItineraryService.createItinerary(itineraryData);

      toast.success('Itinerary Created', {
        description: 'Your itinerary has been successfully created.',
      });

      // Redirect to the new itinerary
      // Access the id from response.data as ItineraryDetailResponse is BaseResponse<ItineraryDetail>
      router.push(`/itinerary/${response.data.id}`);
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

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto space-y-8"
      >
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
                          name: `Location ${locations.length + 1}`,
                          description: 'Selected from map',
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
                                  {/* Safely access optional fields */}
                                  {location.name ||
                                    (location.city && location.country
                                      ? `${location.city}, ${location.country}`
                                      : `Location ${index + 1}`)}
                                </p>
                                {location.street && (
                                  <p className="text-xs text-muted-foreground">
                                    {location.street}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {[
                                    location.city,
                                    location.state,
                                    location.country,
                                  ]
                                    .filter(Boolean)
                                    .join(', ')}
                                </p>
                                {/* Optionally display description if needed */}
                                {/* {location.description && <p className="text-xs text-muted-foreground mt-1">{location.description}</p>} */}
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
