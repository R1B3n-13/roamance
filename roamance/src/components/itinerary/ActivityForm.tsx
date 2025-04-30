'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useTheme } from 'next-themes';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  Save,
  Tag
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocationPickerMap } from '@/components/maps/LocationPickerMap';
import { ActivityService } from '@/service/activity-service';
import { ActivityType, Activity } from '@/types/activity';
import { Location } from '@/types/location';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Validation schema for the activity form
const activityFormSchema = z.object({
  day_plan_id: z.string(),
  note: z.string().min(3, 'Note must be at least 3 characters'),
  type: z.string(),
  start_time: z.string(),
  end_time: z.string().optional(),
  cost: z.coerce.number().min(0, 'Cost cannot be negative'),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

interface ActivityFormProps {
  activityId?: string; // If provided, we're editing an existing activity
  dayPlanId: string; // Required for creating a new activity
  itineraryId: string; // To navigate back to the itinerary details
  onSuccess?: () => void;
}

export function ActivityForm({
  activityId,
  dayPlanId,
  itineraryId,
  onSuccess
}: ActivityFormProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [existingActivity, setExistingActivity] = useState<Activity | null>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(!!activityId);

  // Set up the form with default values
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      day_plan_id: dayPlanId,
      note: '',
      type: ActivityType.OTHER,
      start_time: format(new Date(), 'HH:mm'),
      end_time: '',
      cost: 0,
      location: {
        latitude: 0,
        longitude: 0,
      },
    },
  });

  // Fetch existing activity data if we're editing
  useEffect(() => {
    if (activityId) {
      const fetchActivity = async () => {
        try {
          setIsLoadingActivity(true);
          const response = await ActivityService.getActivity(activityId);
          const activity = response.data;

          setExistingActivity(activity);

          // Update form values with existing activity data
          form.reset({
            day_plan_id: dayPlanId,
            note: activity.note,
            type: activity.type,
            start_time: activity.start_time,
            end_time: activity.end_time || '',
            cost: activity.cost,
            location: {
              latitude: activity.location.latitude,
              longitude: activity.location.longitude,
            },
          });
        } catch (error) {
          console.error('Failed to fetch activity:', error);
        } finally {
          setIsLoadingActivity(false);
        }
      };

      fetchActivity();
    }
  }, [activityId, dayPlanId, form]);

  // Handle form submission
  const onSubmit = async (values: ActivityFormValues) => {
    setIsLoading(true);
    try {
      if (activityId) {
        // Update existing activity
        await ActivityService.updateActivity(activityId, {
          note: values.note,
          type: values.type,
          start_time: values.start_time,
          end_time: values.end_time || null,
          cost: values.cost,
          location: values.location,
        });
      } else {
        // Create new activity
        await ActivityService.createActivity({
          day_plan_id: values.day_plan_id,
          note: values.note,
          type: values.type,
          start_time: values.start_time,
          end_time: values.end_time || null,
          cost: values.cost,
          location: values.location,
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate back to itinerary details
        router.push(`/itinerary/details?id=${itineraryId}`);
      }
    } catch (error) {
      console.error('Failed to save activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    form.setValue('location', {
      latitude: lat,
      longitude: lng
    }, { shouldValidate: true });
  };

  if (isLoadingActivity) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading activity data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-xl hover:bg-muted/50"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">
          {activityId ? 'Edit Activity' : 'Add New Activity'}
        </h2>
        <div className="w-[70px]"></div> {/* Spacer for centering title */}
      </div>

      {/* Form */}
      <Card className={cn(
        "border-muted/20 bg-background/70 backdrop-blur-sm shadow-md rounded-2xl overflow-hidden",
        isDarkMode ? "border-muted/30" : "border-muted/20"
      )}>
        <CardHeader className="border-b border-muted/10 bg-gradient-to-r from-background/80 to-background/40">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary/80" />
            Activity Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Activity Note */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What's this activity about?"
                        className="min-h-24 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the activity you're planning
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Activity Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select activity type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ActivityType).map((type) => (
                          <SelectItem key={type} value={type} className="cursor-pointer">
                            {type
                              .split('_')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                              .join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      <div className="flex items-center">
                        <Tag className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <span>Select the type that best describes this activity</span>
                      </div>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Time */}
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="time"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Time */}
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="time"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cost */}
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Estimated cost for this activity (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location Picker */}
              <FormField
                control={form.control}
                name="location"
                render={() => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="mt-2">
                        <LocationPickerMap
                          initialLocation={form.getValues().location}
                          onLocationChangeAction={handleLocationChange}
                          height="300px"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="flex items-center mt-2">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <span>Select the location for this activity</span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-end gap-3 px-0 border-t pt-4 border-muted/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="rounded-xl border-muted/40 text-muted-foreground hover:bg-muted/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary hover:to-primary-dark/90 shadow-md text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {activityId ? 'Update Activity' : 'Save Activity'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
