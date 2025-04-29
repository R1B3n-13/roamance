'use client';

import { Button } from '@/components/ui/button';
import { ItineraryService } from '@/service/itinerary-service';
import { Itinerary } from '@/types/itinerary';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ItineraryCard } from './ItineraryCard';

interface ItineraryDashboardProps {
  userId?: string;
}

export function ItineraryDashboard({ userId }: ItineraryDashboardProps) {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        setIsLoading(true);
        let response;

        if (userId) {
          response = await ItineraryService.getItinerariesByUserId(userId);
        } else {
          response = await ItineraryService.getAllItineraries();
        }

        setItineraries(response.data || []);
      } catch (error) {
        console.error('Failed to fetch itineraries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItineraries();
  }, [userId]);

  const handleEditItinerary = (id: string) => {
    router.push(`/itinerary/${id}/edit`);
  };

  const handleDeleteItinerary = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this itinerary?')) {
      try {
        await ItineraryService.deleteItinerary(id);
        setItineraries(itineraries.filter(item => item.id !== id));
      } catch (error) {
        console.error('Failed to delete itinerary:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your itineraries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Itineraries</h2>
        <Button asChild>
          <Link href="/itinerary/create">
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Link>
        </Button>
      </div>

      {itineraries.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <h3 className="text-lg font-medium mb-2">No itineraries yet</h3>
          <p className="text-muted-foreground mb-6">Create your first travel itinerary to get started</p>
          <Button asChild>
            <Link href="/itinerary/create">
              <Plus className="h-4 w-4 mr-2" />
              Create New Itinerary
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((itinerary) => (
            <ItineraryCard
              key={itinerary.id}
              itinerary={itinerary}
              onEdit={handleEditItinerary}
              onDelete={handleDeleteItinerary}
            />
          ))}
        </div>
      )}
    </div>
  );
}
