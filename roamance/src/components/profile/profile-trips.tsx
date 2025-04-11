'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { User } from '@/types/auth';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  CalendarRange,
  Clock,
  Plane,
  Plus,
} from 'lucide-react';

interface ProfileTripsProps {
  user: User | null;
  loading: boolean;
}

// Mock trip data
const upcomingTrips = [
  {
    id: '1',
    destination: 'Bali, Indonesia',
    image: '/images/bali.jpg',
    startDate: '2025-05-10',
    endDate: '2025-05-20',
    status: 'confirmed',
  },
  {
    id: '2',
    destination: 'Paris, France',
    image: '/images/paris.jpg',
    startDate: '2025-08-15',
    endDate: '2025-08-25',
    status: 'planning',
  },
];

const pastTrips = [
  {
    id: '3',
    destination: 'Tokyo, Japan',
    image: '/images/tokyo.jpg',
    startDate: '2024-11-05',
    endDate: '2024-11-15',
    status: 'completed',
  },
  {
    id: '4',
    destination: 'New York, USA',
    image: '/images/newyork.jpg',
    startDate: '2024-07-20',
    endDate: '2024-07-30',
    status: 'completed',
  },
  {
    id: '5',
    destination: 'Cairo, Egypt',
    image: '/images/cairo.jpg',
    startDate: '2023-12-10',
    endDate: '2023-12-20',
    status: 'completed',
  },
];

export function ProfileTrips({ loading }: ProfileTripsProps) {
  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days until trip
  const daysUntil = (dateString: string) => {
    const today = new Date();
    const tripDate = new Date(dateString);
    const diffTime = tripDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate trip duration
  const tripDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge
            variant="outline"
            className="bg-forest/10 text-forest border-forest/30"
          >
            Confirmed
          </Badge>
        );
      case 'planning':
        return (
          <Badge
            variant="outline"
            className="bg-ocean/10 text-ocean border-ocean/30"
          >
            Planning
          </Badge>
        );
      case 'completed':
        return (
          <Badge
            variant="outline"
            className="bg-sunset/10 text-sunset border-sunset/30"
          >
            Completed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full max-w-xs" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming" className="flex gap-2">
              <Plane className="h-4 w-4" />
              <span>Upcoming Trips</span>
            </TabsTrigger>
            <TabsTrigger value="past" className="flex gap-2">
              <Clock className="h-4 w-4" />
              <span>Past Travels</span>
            </TabsTrigger>
          </TabsList>

          <Button
            variant="outline"
            className="flex items-center gap-2 border-ocean text-ocean hover:bg-ocean/10"
          >
            <Plus className="h-4 w-4" />
            <span>Plan New Trip</span>
          </Button>
        </div>

        <TabsContent value="upcoming" className="pt-4">
          {upcomingTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  formatDate={formatDate}
                  daysUntil={daysUntil}
                  tripDuration={tripDuration}
                  getStatusBadge={getStatusBadge}
                  isUpcoming
                />
              ))}
            </div>
          ) : (
            <EmptyTripsState
              title="No upcoming trips"
              description="You don't have any upcoming trips planned yet. Start planning your next adventure!"
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="pt-4">
          {pastTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  formatDate={formatDate}
                  tripDuration={tripDuration}
                  getStatusBadge={getStatusBadge}
                  isUpcoming={false}
                />
              ))}
            </div>
          ) : (
            <EmptyTripsState
              title="No travel history"
              description="You haven't recorded any past trips yet. Once you complete a trip, it will appear here."
            />
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-5 w-5 text-ocean" />
            Travel Stats
          </CardTitle>
          <CardDescription>
            Your travel statistics and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-ocean/10 rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-sm">Countries</p>
              <p className="text-3xl font-bold text-ocean">
                {pastTrips.length}
              </p>
            </div>
            <div className="bg-sunset/10 rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-sm">Total Trips</p>
              <p className="text-3xl font-bold text-sunset">
                {pastTrips.length +
                  upcomingTrips.filter((t) => t.status === 'confirmed').length}
              </p>
            </div>
            <div className="bg-forest/10 rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-sm">Days Traveled</p>
              <p className="text-3xl font-bold text-forest">
                {pastTrips.reduce(
                  (acc, trip) =>
                    acc + tripDuration(trip.startDate, trip.endDate),
                  0
                )}
              </p>
            </div>
            <div className="bg-sand/10 rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-sm">Bucket List</p>
              <p className="text-3xl font-bold text-sand">2</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TripCard({
  trip,
  formatDate,
  daysUntil,
  tripDuration,
  getStatusBadge,
  isUpcoming,
}: {
  trip: any;
  formatDate: (date: string) => string;
  daysUntil?: (date: string) => number;
  tripDuration: (start: string, end: string) => number;
  getStatusBadge: (status: string) => React.ReactNode;
  isUpcoming: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 w-full bg-muted">
        {/* In a real app, you'd have actual trip images */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-gradient-to-r',
            isUpcoming
              ? 'from-ocean/50 to-forest/50'
              : 'from-sunset/50 to-sand/50'
          )}
        >
          <p className="text-white text-xl font-bold">{trip.destination}</p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{trip.destination}</h3>
          {getStatusBadge(trip.status)}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{tripDuration(trip.startDate, trip.endDate)} days</span>
          </div>

          {isUpcoming && daysUntil && daysUntil(trip.startDate) > 0 && (
            <div className="mt-3 text-forest font-medium">
              {daysUntil(trip.startDate)} days until your trip
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t flex justify-end">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <span>View Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function EmptyTripsState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed text-center px-4">
      <Plane className="h-12 w-12 text-muted-foreground mb-3 opacity-30" />
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-muted-foreground max-w-sm">{description}</p>

      <Button className="mt-6 bg-gradient-to-r from-ocean to-ocean-dark">
        Plan a Trip
      </Button>
    </div>
  );
}
