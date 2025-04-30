'use client';

import { useSearchParams } from 'next/navigation';
import { ActivityForm } from '@/components/itinerary/ActivityForm';

export default function EditActivityPage() {
  const searchParams = useSearchParams();
  const activityId = searchParams.get('id');
  const dayPlanId = searchParams.get('dayPlanId');
  const itineraryId = searchParams.get('itineraryId');

  if (!activityId || !dayPlanId || !itineraryId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/30">
          <h2 className="text-lg font-semibold mb-2">Missing Required Parameters</h2>
          <p>The id, dayPlanId, and itineraryId query parameters are all required to edit an activity.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <ActivityForm
        activityId={activityId}
        dayPlanId={dayPlanId}
        itineraryId={itineraryId}
      />
    </div>
  );
}
