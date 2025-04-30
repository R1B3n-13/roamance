'use client';

import { DayPlanForm } from '@/components/itinerary/DayPlanForm';
import { DayPlanService } from '@/service/dayplan-service';
import { ItineraryService } from '@/service/itinerary-service';
import { DayPlanCreateRequest, DayPlanUpdateRequest } from '@/types/itinerary';
import { parseISO } from 'date-fns';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditDayPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dayPlanId = searchParams.get('id');
  const itineraryId = searchParams.get('itineraryId');

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [defaultValues, setDefaultValues] = useState({
    date: new Date(),
    notes: [] as string[],
  });

  useEffect(() => {
    // Fetch day plan and itinerary data
    const fetchData = async () => {
      if (!dayPlanId || !itineraryId) {
        setError('Day Plan ID and Itinerary ID are required');
        setIsFetching(false);
        return;
      }

      try {
        // Fetch itinerary for date range
        const itineraryResponse = await ItineraryService.getItinerary(itineraryId);
        const itinerary = itineraryResponse.data;

        // Set start and end dates for validation
        setStartDate(parseISO(itinerary.start_date));
        setEndDate(parseISO(itinerary.end_date));

        // Fetch day plan details
        const dayPlanResponse = await DayPlanService.getDayPlan(dayPlanId);
        const dayPlan = dayPlanResponse.data;

        // Set default values for form
        setDefaultValues({
          date: parseISO(dayPlan.date),
          notes: dayPlan.notes || [],
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to fetch day plan or itinerary details');
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [dayPlanId, itineraryId]);

  const onSubmit = async (data: DayPlanCreateRequest) => {
    if (!dayPlanId || !itineraryId) {
      setError('Day Plan ID and Itinerary ID are required');
      return;
    }

    setIsLoading(true);
    try {
      // Convert to update request by removing itinerary_id
      const { itinerary_id, ...updateData } = data;

      const response = await DayPlanService.updateDayPlan(
        dayPlanId,
        updateData as DayPlanUpdateRequest
      );

      // Navigate back to itinerary details page
      router.push(`/itinerary/details?id=${itineraryId}`);
    } catch (error) {
      console.error('Failed to update day plan:', error);
      setError('Failed to update day plan');
    } finally {
      setIsLoading(false);
    }
  };

  if (!dayPlanId || !itineraryId) {
    return (
      <div className="container mx-auto p-6">
        <div className="p-6 bg-background/80 backdrop-blur-sm rounded-xl border border-destructive/20 shadow-sm">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="mb-4">Day Plan ID and Itinerary ID are required to edit a day plan.</p>
          <Link
            href="/itinerary"
            className="inline-flex items-center text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Itineraries
          </Link>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading day plan details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Decorative background elements */}
      <div className="absolute -top-64 -right-40 w-96 h-96 bg-gradient-radial from-ocean/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-radial from-forest/5 to-transparent rounded-full blur-3xl -z-10" />

      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link href="/itinerary" className="hover:text-primary">
          Itineraries
        </Link>
        <span>/</span>
        <Link
          href={`/itinerary/details?id=${itineraryId}`}
          className="hover:text-primary"
        >
          Itinerary Details
        </Link>
        <span>/</span>
        <span className="text-foreground">Edit Day Plan</span>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <DayPlanForm
        itineraryId={itineraryId}
        dayPlanId={dayPlanId}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        isLoading={isLoading}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}
