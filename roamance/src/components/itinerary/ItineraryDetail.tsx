'use client';

import { RouteVisualization } from '@/components/maps/RouteVisualization';
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
import { ActivityService } from '@/service/activity-service';
import { DayPlanService } from '@/service/dayplan-service';
import { ItineraryService } from '@/service/itinerary-service';
import { Activity, DayPlanBrief, Itinerary, Location } from '@/types';
import { differenceInDays, format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  Check,
  Clock,
  FilePlus,
  Globe,
  Info,
  Layers,
  MapPin,
  Pencil,
  Plus,
  Route,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { DayPlanCard } from './DayPlanCard';

export function ItineraryDetail() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const itineraryId = searchParams.get('id');
  const isDarkMode = resolvedTheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlanBrief[]>([]);
  const [expandedDayPlans, setExpandedDayPlans] = useState<{
    [key: string]: boolean;
  }>({});
  const [activities, setActivities] = useState<{ [key: string]: Activity[] }>(
    {}
  );
  const [activeTab, setActiveTab] = useState('overview');

  const fetchActivitiesForDayPlan = useCallback(
    async (dayPlanId: string) => {
      if (activities[dayPlanId]) return; // Already fetched

      try {
        const response =
          await ActivityService.getActivitiesByDayPlanId(dayPlanId);
        setActivities((prev) => ({
          ...prev,
          [dayPlanId]: response.data || [],
        }));
      } catch (error) {
        console.error(
          `Failed to fetch activities for day plan ${dayPlanId}:`,
          error
        );
      }
    },
    [activities]
  );

  useEffect(() => {
    const fetchItineraryData = async (id: string) => {
      try {
        setLoading(true);
        const itineraryResponse = await ItineraryService.getItinerary(id);
        setItinerary(itineraryResponse.data);

        const dayPlansResponse =
          await DayPlanService.getDayPlansByItineraryId(id);
        const sortedDayPlans = [...(dayPlansResponse.data || [])].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setDayPlans(sortedDayPlans);

        const initialExpandedState: { [key: string]: boolean } = {};
        sortedDayPlans.forEach((plan, index) => {
          initialExpandedState[plan.id] = index === 0;
        });
        setExpandedDayPlans(initialExpandedState);

        if (sortedDayPlans.length > 0) {
          await fetchActivitiesForDayPlan(sortedDayPlans[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch itinerary data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (itineraryId) {
      fetchItineraryData(itineraryId);
    } else {
      router.push('/itinerary'); // Redirect to itinerary list if no ID provided
    }
  }, [itineraryId, fetchActivitiesForDayPlan, router]);

  const handleDayPlanExpand = async (dayPlanId: string) => {
    const newExpandedState = { ...expandedDayPlans };
    newExpandedState[dayPlanId] = !newExpandedState[dayPlanId];
    setExpandedDayPlans(newExpandedState);

    // Fetch activities if expanding and not already fetched
    if (newExpandedState[dayPlanId] && !activities[dayPlanId]) {
      await fetchActivitiesForDayPlan(dayPlanId);
    }
  };

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

  if (loading || !itinerary) {
    return <ItineraryDetailSkeleton />;
  }

  // Calculate status
  const now = new Date();
  const startDate = parseISO(itinerary.start_date);
  const endDate = parseISO(itinerary.end_date);

  let status: 'upcoming' | 'ongoing' | 'past';
  if (startDate > now) {
    status = 'upcoming';
  } else if (endDate < now) {
    status = 'past';
  } else {
    status = 'ongoing';
  }

  // Calculate days until or days since
  const daysUntil = differenceInDays(startDate, now);
  const daysSince = differenceInDays(now, endDate);

  // Calculate trip duration
  const duration = differenceInDays(endDate, startDate) + 1;

  // Prepare locations for route visualization
  const mapLocations = itinerary.locations.map((loc) => ({
    latitude: loc.latitude,
    longitude: loc.longitude,
  }));

  const locationNames = itinerary.locations.map(
    (loc) => `${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)}`
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 relative"
    >
      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-radial from-ocean/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-40 left-10 w-72 h-72 bg-gradient-radial from-forest/5 to-transparent rounded-full blur-3xl -z-10" />

      {/* Header with back button and actions */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-primary/30 text-primary hover:bg-primary/10"
            asChild
          >
            <Link href={`/itinerary/edit?id=${itineraryId}`}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit Itinerary
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-ocean/30 text-ocean hover:bg-ocean/10"
            asChild
          >
            <Link href={`/itinerary/day-plan/create?itineraryId=${itineraryId}`}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Day Plan
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Title and Status */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold">{itinerary.title}</h1>
          <Badge
            variant="outline"
            className={cn(
              'px-3 py-1 text-sm rounded-full font-medium',
              status === 'upcoming'
                ? 'bg-forest/10 text-forest border-forest/30'
                : status === 'ongoing'
                  ? 'bg-ocean/10 text-ocean border-ocean/30'
                  : 'bg-sunset/10 text-sunset border-sunset/30'
            )}
          >
            {status === 'upcoming'
              ? 'Upcoming'
              : status === 'ongoing'
                ? 'Ongoing'
                : 'Completed'}
          </Badge>
        </div>
        <p className="text-muted-foreground">{itinerary.description}</p>
      </motion.div>

      {/* Quick Info Cards */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Date Info */}
          <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-medium">
                {format(startDate, 'MMM d, yyyy')} -{' '}
                {format(endDate, 'MMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {duration} {duration === 1 ? 'day' : 'days'}
              </p>
            </CardContent>
          </Card>

          {/* Countdown/Status */}
          <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {status === 'upcoming' && (
                <>
                  <p className="text-base font-medium text-forest">
                    {daysUntil === 0
                      ? 'Starts today!'
                      : daysUntil === 1
                        ? 'Starts tomorrow'
                        : `${daysUntil} days until departure`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get ready for your trip!
                  </p>
                </>
              )}
              {status === 'ongoing' && (
                <>
                  <p className="text-base font-medium text-ocean">
                    {daysSince === 0
                      ? 'Ends today!'
                      : daysSince === 1
                        ? 'Ends tomorrow'
                        : `${daysSince} days remaining`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enjoy your journey!
                  </p>
                </>
              )}
              {status === 'past' && (
                <>
                  <p className="text-base font-medium text-sunset">
                    Completed Trip
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Trip finished {Math.abs(daysSince)} days ago
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Locations */}
          <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Destinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-medium">
                {itinerary.locations.length}{' '}
                {itinerary.locations.length === 1 ? 'Location' : 'Locations'}
              </p>
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {itinerary.locations
                  .map(
                    (l) => `${l.latitude.toFixed(2)}, ${l.longitude.toFixed(2)}`
                  )
                  .join('; ')}
              </p>
            </CardContent>
          </Card>

          {/* Day Plans */}
          <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                Day Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-medium">
                {dayPlans.length}{' '}
                {dayPlans.length === 1 ? 'Day Plan' : 'Day Plans'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {dayPlans.length > 0
                  ? `${dayPlans.length} of ${duration} days planned`
                  : 'No day plans created yet'}
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/50 backdrop-blur-sm p-1 rounded-xl mb-6">
            <TabsTrigger
              value="overview"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-dark data-[state=active]:text-white rounded-lg"
            >
              <Info className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="day-plans"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest data-[state=active]:to-forest-dark data-[state=active]:text-white rounded-lg"
            >
              <CalendarDays className="h-4 w-4" />
              <span>Day Plans</span>
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-ocean data-[state=active]:to-ocean-dark data-[state=active]:text-white rounded-lg"
            >
              <Globe className="h-4 w-4" />
              <span>Map</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview content - Route visualization */}
            <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-primary/80" />
                  Trip Route Overview
                </CardTitle>
                <CardDescription>
                  Visualization of your complete travel route
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mapLocations.length > 0 ? (
                  <RouteVisualization
                    locations={mapLocations}
                    locationNames={locationNames}
                    height="400px"
                    showDistance={true}
                    showTravelTime={true}
                    travelMode="driving"
                    routeStyle={{
                      color:
                        status === 'upcoming'
                          ? '#2e7d32' // forest
                          : status === 'ongoing'
                            ? '#0277bd' // ocean
                            : '#ff6d00', // sunset
                      weight: 4,
                      opacity: 0.8,
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-60 bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">
                      No locations available to display
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes section */}
            <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary/80" />
                  Trip Notes
                </CardTitle>
                <CardDescription>
                  Important information about your trip
                </CardDescription>
              </CardHeader>
              <CardContent>
                {itinerary.notes && itinerary.notes.length > 0 ? (
                  <ul className="space-y-2">
                    {itinerary.notes.map((note, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    No notes have been added for this trip.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Day Plans Preview (first few) */}
            {dayPlans.length > 0 && (
              <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary/80" />
                      Day Plans Overview
                    </CardTitle>
                    <CardDescription>
                      A summary of your planned activities
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary-dark hover:bg-primary/5"
                    onClick={() => setActiveTab('day-plans')}
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dayPlans.slice(0, 3).map((dayPlan) => (
                      <DayPlanCard
                        key={dayPlan.id}
                        dayPlan={dayPlan}
                        activities={activities[dayPlan.id] || []}
                        isExpanded={expandedDayPlans[dayPlan.id] || false}
                        onToggleExpandAction={() =>
                          handleDayPlanExpand(dayPlan.id)
                        }
                        isDarkMode={isDarkMode}
                      />
                    ))}
                    {dayPlans.length > 3 && (
                      <Button
                        variant="outline"
                        className="w-full mt-4 border-muted text-muted-foreground hover:text-foreground"
                        onClick={() => setActiveTab('day-plans')}
                      >
                        Show All {dayPlans.length} Day Plans
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="day-plans" className="space-y-6">
            {dayPlans.length > 0 ? (
              <>
                {/* Action bar */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Day Plans</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-ocean/30 text-ocean hover:bg-ocean/10"
                    asChild
                  >
                    <Link href={`/itinerary/day-plan/create?itineraryId=${itineraryId}`}>
                      <FilePlus className="h-4 w-4 mr-1.5" />
                      Add Day Plan
                    </Link>
                  </Button>
                </div>

                {/* Day Plans Accordion */}
                <div className="space-y-4">
                  {dayPlans.map((dayPlan) => (
                    <DayPlanCard
                      key={dayPlan.id}
                      dayPlan={dayPlan}
                      activities={activities[dayPlan.id] || []}
                      isExpanded={expandedDayPlans[dayPlan.id] || false}
                      onToggleExpandAction={() =>
                        handleDayPlanExpand(dayPlan.id)
                      }
                      showActions={true}
                      onAddActivity={() =>
                        router.push(
                          `/itinerary/day-plan/${dayPlan.id}/activity/create?itineraryId=${itineraryId}`
                        )
                      }
                      onEditDayPlan={() =>
                        router.push(
                          `/itinerary/day-plan/${dayPlan.id}/edit?itineraryId=${itineraryId}`
                        )
                      }
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-dashed border-muted/50 bg-muted/5 p-8 text-center">
                <div className="flex flex-col items-center justify-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Day Plans Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start planning your trip by creating detailed day plans with
                    activities and itineraries.
                  </p>
                  <Button
                    variant="default"
                    className="bg-gradient-to-r from-forest to-ocean text-white hover:from-forest-dark hover:to-ocean-dark"
                    asChild
                  >
                    <Link href={`/itinerary/day-plan/create?itineraryId=${itineraryId}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Day Plan
                    </Link>
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary/80" />
                  Travel Route Map
                </CardTitle>
                <CardDescription>
                  Interactive map of your complete travel itinerary
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mapLocations.length > 0 ? (
                  <RouteVisualization
                    locations={mapLocations}
                    locationNames={locationNames}
                    height="600px"
                    showDistance={true}
                    showTravelTime={true}
                    travelMode="driving"
                    routeStyle={{
                      color:
                        status === 'upcoming'
                          ? '#2e7d32' // forest
                          : status === 'ongoing'
                            ? '#0277bd' // ocean
                            : '#ff6d00', // sunset
                      weight: 4,
                      opacity: 0.8,
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-60 bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">
                      No locations available to display
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location List */}
            <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary/80" />
                  Destination Details
                </CardTitle>
                <CardDescription>
                  Information about each destination in your itinerary
                </CardDescription>
              </CardHeader>
              <CardContent>
                {itinerary.locations.length > 0 ? (
                  <div className="space-y-4">
                    {itinerary.locations.map((location, index) => (
                      <LocationCard
                        key={index}
                        location={location}
                        index={index}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No locations have been added for this trip.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

interface LocationCardProps {
  location: Location;
  index: number;
  isDarkMode: boolean;
}

function LocationCard({ location, index, isDarkMode }: LocationCardProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl border flex items-start gap-3',
        isDarkMode
          ? 'border-muted/30 bg-muted/10'
          : 'border-muted/40 bg-muted/5'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center h-8 w-8 rounded-full text-white font-medium text-sm',
          index === 0
            ? 'bg-forest'
            : index === 1
              ? 'bg-ocean'
              : index === 2
                ? 'bg-sunset'
                : 'bg-primary'
        )}
      >
        {index + 1}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">
          {`Location: ${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
        </h3>
        <p className="text-sm text-muted-foreground">
          {`Latitude: ${location.latitude}, Longitude: ${location.longitude}`}
        </p>
      </div>
    </div>
  );
}

function ItineraryDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-10 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Title skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <Skeleton className="h-5 w-1/2" />

      {/* Quick info cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-12 w-full max-w-md rounded-xl mb-6" />

      {/* Content skeleton */}
      <Skeleton className="h-96 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}
