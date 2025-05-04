'use client';

import { useSearchParams } from 'next/navigation';
import { ActivityForm } from '@/components/itinerary/ActivityForm';

export default function CreateActivityPage() {
  const searchParams = useSearchParams();
  const dayPlanId = searchParams.get('dayPlanId');
  const itineraryId = searchParams.get('itineraryId');

  if (!dayPlanId || !itineraryId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/30">
          <h2 className="text-lg font-semibold mb-2">Missing Required Parameters</h2>
          <p>Both dayPlanId and itineraryId query parameters are required to create an activity.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <ActivityForm
        dayPlanId={dayPlanId}
        itineraryId={itineraryId}
      />
    </div>
  );
}
