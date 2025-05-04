'use client';

import { DayPlanForm } from '@/components/itinerary/DayPlanForm';
import { DayPlanService } from '@/service/dayplan-service';
import { ItineraryService } from '@/service/itinerary-service';
import { DayPlanCreateRequest } from '@/types/itinerary';
import { parseISO } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CreateDayPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itineraryId = searchParams.get('itineraryId');

  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch itinerary to get date range
    const fetchItinerary = async () => {
      if (!itineraryId) {
        setError('Itinerary ID is required');
        return;
      }

      try {
        const response = await ItineraryService.getItinerary(itineraryId);
        const itinerary = response.data;

        // Set start and end dates for validation
        setStartDate(parseISO(itinerary.start_date));
        setEndDate(parseISO(itinerary.end_date));
      } catch (error) {
        console.error('Failed to fetch itinerary:', error);
        setError('Failed to fetch itinerary details');
      }
    };

    fetchItinerary();
  }, [itineraryId]);

  const onSubmit = async (data: DayPlanCreateRequest) => {
    if (!itineraryId) {
      setError('Itinerary ID is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await DayPlanService.createDayPlan(data);
      // Navigate back to itinerary details page
      router.push(`/itinerary/details?id=${itineraryId}`);
    } catch (error) {
      console.error('Failed to create day plan:', error);
      setError('Failed to create day plan');
    } finally {
      setIsLoading(false);
    }
  };

  if (!itineraryId) {
    return (
      <div className="container mx-auto p-6">
        <div className="p-6 bg-background/80 backdrop-blur-sm rounded-xl border border-destructive/20 shadow-sm">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="mb-4">Itinerary ID is required to create a day plan.</p>
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Decorative background elements */}
      <div className="absolute -top-64 -right-40 w-96 h-96 bg-gradient-radial from-forest/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-radial from-ocean/5 to-transparent rounded-full blur-3xl -z-10" />

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
        <span className="text-foreground">Create Day Plan</span>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          {error}
        </div>
      )}

      <DayPlanForm
        itineraryId={itineraryId}
        onSubmit={onSubmit}
        isLoading={isLoading}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}
