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
import { motion, AnimatePresence } from 'framer-motion';
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
  Receipt,
  Route,
  Share2,
  Bookmark,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { CostTracker } from './CostTracker';
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

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
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

  // Get status color scheme
  const getStatusColors = () => {
    switch (status) {
      case 'upcoming':
        return {
          light: 'from-forest/20 to-forest/5',
          medium: 'from-forest/40 to-forest/20',
          dark: 'from-forest to-forest-dark',
          text: 'text-forest',
          border: 'border-forest/30',
          hover: 'hover:bg-forest/20',
          solid: 'bg-forest'
        };
      case 'ongoing':
        return {
          light: 'from-ocean/20 to-ocean/5',
          medium: 'from-ocean/40 to-ocean/20',
          dark: 'from-ocean to-ocean-dark',
          text: 'text-ocean',
          border: 'border-ocean/30',
          hover: 'hover:bg-ocean/20',
          solid: 'bg-ocean'
        };
      case 'past':
        return {
          light: 'from-sunset/20 to-sunset/5',
          medium: 'from-sunset/40 to-sunset/20',
          dark: 'from-sunset to-sunset-dark',
          text: 'text-sunset',
          border: 'border-sunset/30',
          hover: 'hover:bg-sunset/20',
          solid: 'bg-sunset'
        };
    }
  };

  const colors = getStatusColors();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 relative pb-12"
    >
      {/* Enhanced decorative background elements with improved gradients */}
      <div className={`absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-radial ${colors.light} rounded-full blur-3xl -z-10 animate-pulse-slow opacity-70`} />
      <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial ${colors.light} rounded-full blur-3xl -z-10 animate-pulse-slow opacity-50`} />
      <div className="absolute top-1/3 left-1/2 w-[300px] h-[300px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse-slow opacity-60" />

      {/* Header with back button and actions */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm bg-background/80 p-5 rounded-2xl shadow-lg border border-muted/20"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl hover:bg-muted/50 transition-all duration-300"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`bg-background/90 ${colors.border} ${colors.hover} transition-all duration-300 rounded-xl shadow-sm`}
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-background/90 border-primary/20 hover:border-primary/40 transition-all duration-300 rounded-xl shadow-sm"
          >
            <Bookmark className="h-3.5 w-3.5 mr-1.5" />
            Save
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="bg-background/90 border-primary/20 hover:border-primary/40 transition-all duration-300 rounded-xl shadow-sm"
          >
            <Link
              href={`/itinerary/edit?id=${itineraryId}`}
              className="flex gap-1.5 items-center"
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className={`bg-background/90 ${colors.border} ${colors.hover} transition-all duration-300 rounded-xl shadow-sm`}
          >
            <Link
              href={`/itinerary/day-plan/create?itineraryId=${itineraryId}`}
              className="flex gap-1.5 items-center"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Day Plan
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Title and Status with enhanced styling */}
      <motion.div
        variants={itemVariants}
        className={`bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-md p-8 rounded-3xl border border-muted/20 shadow-xl relative overflow-hidden`}
      >
        <div className={`absolute top-0 left-0 w-2 h-full ${colors.solid}`} />
        <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${colors.medium} blur-2xl opacity-50`} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 relative">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            {itinerary.title}
          </h1>
          <Badge
            variant="outline"
            className={cn(
              'px-5 py-2 text-sm rounded-full font-medium shadow-md transition-all duration-300',
              status === 'upcoming'
                ? 'bg-forest/15 text-forest border-forest/30 hover:bg-forest/25'
                : status === 'ongoing'
                  ? 'bg-ocean/15 text-ocean border-ocean/30 hover:bg-ocean/25'
                  : 'bg-sunset/15 text-sunset border-sunset/30 hover:bg-sunset/25'
            )}
          >
            {status === 'upcoming'
              ? 'Upcoming Trip'
              : status === 'ongoing'
                ? 'Active Trip'
                : 'Completed Trip'}
          </Badge>
        </div>
        <p className="text-muted-foreground text-base leading-relaxed max-w-3xl">
          {itinerary.description}
        </p>
      </motion.div>

      {/* Quick Info Cards with improved styling */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Date Info */}
          <Card className="border-muted/20 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden group">
            <CardHeader className="pb-2 bg-gradient-to-r from-background/80 to-background/40 border-b border-muted/10">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors duration-300">
                <Calendar className="h-4 w-4 text-primary/80" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-lg font-medium group-hover:text-primary/90 transition-colors duration-300">
                {format(startDate, 'MMM d, yyyy')} -{' '}
                {format(endDate, 'MMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {duration} {duration === 1 ? 'day' : 'days'} adventure
              </p>
            </CardContent>
          </Card>

          {/* Countdown/Status */}
          <Card className={`border-muted/20 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden group`}>
            <CardHeader className="pb-2 bg-gradient-to-r from-background/80 to-background/40 border-b border-muted/10">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors duration-300">
                <Clock className="h-4 w-4 text-primary/80" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {status === 'upcoming' && (
                <>
                  <p className={`text-lg font-medium ${colors.text} group-hover:text-forest-dark transition-colors duration-300`}>
                    {daysUntil === 0
                      ? 'Departing today!'
                      : daysUntil === 1
                        ? 'Departing tomorrow'
                        : `${daysUntil} days until departure`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get ready for your journey
                  </p>
                </>
              )}
              {status === 'ongoing' && (
                <>
                  <p className={`text-lg font-medium ${colors.text} group-hover:text-ocean-dark transition-colors duration-300`}>
                    {daysSince === 0
                      ? 'Final day of trip'
                      : daysSince === 1
                        ? 'One day remaining'
                        : `${daysSince} days remaining`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enjoy your adventure
                  </p>
                </>
              )}
              {status === 'past' && (
                <>
                  <p className={`text-lg font-medium ${colors.text} group-hover:text-sunset-dark transition-colors duration-300`}>
                    Trip Completed
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ended {Math.abs(daysSince)} days ago
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Locations */}
          <Card className="border-muted/20 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden group">
            <CardHeader className="pb-2 bg-gradient-to-r from-background/80 to-background/40 border-b border-muted/10">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors duration-300">
                <MapPin className="h-4 w-4 text-primary/80" />
                Destinations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-lg font-medium group-hover:text-primary/90 transition-colors duration-300">
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
          <Card className="border-muted/20 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-500 rounded-2xl overflow-hidden group">
            <CardHeader className="pb-2 bg-gradient-to-r from-background/80 to-background/40 border-b border-muted/10">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors duration-300">
                <CalendarDays className="h-4 w-4 text-primary/80" />
                Day Plans
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-lg font-medium group-hover:text-primary/90 transition-colors duration-300">
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

      {/* Tabs with enhanced styling */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-background/90 backdrop-blur-md p-1.5 rounded-2xl mb-6 border border-muted/20 shadow-lg overflow-x-auto flex-wrap">
            <TabsTrigger
              value="overview"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary-dark data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <Info className="h-4 w-4" />
              <span className="whitespace-nowrap">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="day-plans"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest/90 data-[state=active]:to-forest-dark data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="whitespace-nowrap">Day Plans</span>
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-ocean/90 data-[state=active]:to-ocean-dark data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <Globe className="h-4 w-4" />
              <span className="whitespace-nowrap">Map</span>
            </TabsTrigger>
            <TabsTrigger
              value="budget"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sunset/90 data-[state=active]:to-sunset-dark data-[state=active]:text-primary-foreground rounded-xl transition-all duration-300"
            >
              <Receipt className="h-4 w-4" />
              <span className="whitespace-nowrap">Budget</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent
              value="overview"
              className="space-y-6"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Overview content - Route visualization */}
                <Card className="border-muted/20 bg-background/80 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-muted/10 bg-gradient-to-r from-background/90 to-background/70 py-6">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Route className="h-5 w-5 text-primary" />
                      Trip Route Overview
                    </CardTitle>
                    <CardDescription className="text-base">
                      Visualization of your complete travel route
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {mapLocations.length > 0 ? (
                      <RouteVisualization
                        locations={mapLocations}
                        locationNames={locationNames}
                        height="450px"
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
                          weight: 5,
                          opacity: 0.85,
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
                <Card className="border-muted/20 bg-background/80 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-muted/10 bg-gradient-to-r from-background/90 to-background/70 py-6">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Info className="h-5 w-5 text-primary" />
                      Trip Notes
                    </CardTitle>
                    <CardDescription className="text-base">
                      Important information about your trip
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {itinerary.notes && itinerary.notes.length > 0 ? (
                      <ul className="space-y-3">
                        {itinerary.notes.map((note, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              transition: { delay: index * 0.1 }
                            }}
                            className="flex items-start gap-3 p-4 rounded-xl bg-background/70 border border-muted/20 shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <div className={`p-2 rounded-full ${colors.light}`}>
                              <Check className={`h-4 w-4 ${colors.text}`} />
                            </div>
                            <span className="text-base">{note}</span>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-muted/30 bg-muted/5">
                        <Info className="h-12 w-12 text-muted-foreground/40 mb-3" />
                        <p className="text-muted-foreground text-center text-lg">
                          No notes have been added for this trip.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 rounded-xl border-primary/30 text-primary hover:bg-primary/10 shadow-sm"
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          Add Notes
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Day Plans Preview (first few) */}
                {dayPlans.length > 0 && (
                  <Card className="border-muted/20 bg-background/80 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-muted/10 bg-gradient-to-r from-background/90 to-background/70 py-6">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Layers className="h-5 w-5 text-primary" />
                          Day Plans Overview
                        </CardTitle>
                        <CardDescription className="text-base">
                          A summary of your planned activities
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary hover:text-primary-dark hover:bg-primary/5 rounded-xl shadow-sm"
                        onClick={() => setActiveTab('day-plans')}
                      >
                        View All
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-5">
                        {dayPlans.slice(0, 3).map((dayPlan, index) => (
                          <motion.div
                            key={dayPlan.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              transition: { delay: index * 0.1 }
                            }}
                          >
                            <DayPlanCard
                              dayPlan={dayPlan}
                              activities={activities[dayPlan.id] || []}
                              isExpanded={expandedDayPlans[dayPlan.id] || false}
                              onToggleExpandAction={() =>
                                handleDayPlanExpand(dayPlan.id)
                              }
                              isDarkMode={isDarkMode}
                            />
                          </motion.div>
                        ))}
                        {dayPlans.length > 3 && (
                          <Button
                            variant="outline"
                            className="w-full mt-6 border-muted bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background transition-all duration-300 shadow-sm rounded-xl"
                            onClick={() => setActiveTab('day-plans')}
                          >
                            Show All {dayPlans.length} Day Plans
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent
              value="day-plans"
              className="space-y-6"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {dayPlans.length > 0 ? (
                  <>
                    {/* Action bar */}
                    <div className="flex justify-between items-center mb-6 p-5 rounded-2xl bg-background/80 backdrop-blur-md border border-muted/20 shadow-lg">
                      <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-forest to-forest-dark">
                        Day Plans
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-ocean/30 text-ocean hover:bg-ocean/10 shadow-sm"
                        asChild
                      >
                        <Link
                          href={`/itinerary/day-plan/create?itineraryId=${itineraryId}`}
                        >
                          <FilePlus className="h-4 w-4 mr-1.5" />
                          Add Day Plan
                        </Link>
                      </Button>
                    </div>

                    {/* Day Plans Accordion */}
                    <div className="space-y-5">
                      {dayPlans.map((dayPlan, index) => (
                        <motion.div
                          key={dayPlan.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: { delay: index * 0.05 }
                          }}
                        >
                          <DayPlanCard
                            dayPlan={dayPlan}
                            activities={activities[dayPlan.id] || []}
                            isExpanded={expandedDayPlans[dayPlan.id] || false}
                            onToggleExpandAction={() =>
                              handleDayPlanExpand(dayPlan.id)
                            }
                            showActions={true}
                            onAddActivity={() =>
                              router.push(
                                `/itinerary/activity/create?dayPlanId=${dayPlan.id}&itineraryId=${itineraryId}`
                              )
                            }
                            onEditDayPlan={() =>
                              router.push(
                                `/itinerary/day-plan/edit?id=${dayPlan.id}&itineraryId=${itineraryId}`
                              )
                            }
                            isDarkMode={isDarkMode}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Card className="border-dashed border-muted/30 bg-background/70 backdrop-blur-md p-12 text-center rounded-3xl shadow-lg">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-muted/10 p-6 rounded-full mb-6">
                        <CalendarDays className="h-16 w-16 text-muted-foreground" />
                      </div>
                      <h3 className="text-2xl font-medium mb-3">No Day Plans Yet</h3>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                        Start planning your trip by creating detailed day plans with
                        activities and itineraries.
                      </p>
                      <Button variant="default" asChild className="rounded-xl px-6 py-6 h-auto text-base">
                        <Link
                          href={`/itinerary/day-plan/create?itineraryId=${itineraryId}`}
                          className="flex gap-1.5 items-center bg-gradient-to-r from-forest to-ocean text-white hover:from-forest-dark hover:to-ocean-dark shadow-lg transition-all duration-300"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Create First Day Plan
                        </Link>
                      </Button>
                    </div>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent
              value="map"
              className="space-y-6"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-muted/20 bg-background/80 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-muted/10 bg-gradient-to-r from-background/90 to-background/70 py-6">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Globe className="h-5 w-5 text-primary" />
                      Travel Route Map
                    </CardTitle>
                    <CardDescription className="text-base">
                      Interactive map of your complete travel itinerary
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
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
                          weight: 5,
                          opacity: 0.85,
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-80 bg-muted/20 rounded-md">
                        <p className="text-muted-foreground">
                          No locations available to display
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Location List */}
                <Card className="border-muted/20 bg-background/80 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-muted/10 bg-gradient-to-r from-background/90 to-background/70 py-6">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <MapPin className="h-5 w-5 text-primary" />
                      Destination Details
                    </CardTitle>
                    <CardDescription className="text-base">
                      Information about each destination in your itinerary
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {itinerary.locations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {itinerary.locations.map((location, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              transition: { delay: index * 0.1 }
                            }}
                          >
                            <LocationCard
                              location={location}
                              index={index}
                              isDarkMode={isDarkMode}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-muted/30 bg-muted/5">
                        <MapPin className="h-12 w-12 text-muted-foreground/40 mb-3" />
                        <p className="text-muted-foreground text-center text-lg">
                          No locations have been added for this trip.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 rounded-xl border-primary/30 text-primary hover:bg-primary/10 shadow-sm"
                          asChild
                        >
                          <Link href={`/itinerary/edit?id=${itineraryId}`}>
                            <Plus className="h-4 w-4 mr-1.5" />
                            Add Locations
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent
              value="budget"
              className="space-y-6"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Get all activities across all day plans */}
                {(() => {
                  // Combine all activities from all day plans
                  const allActivities = Object.values(activities).flat();

                  return (
                    <CostTracker
                      activities={allActivities}
                      dayPlans={dayPlans}
                      isDarkMode={isDarkMode}
                    />
                  );
                })()}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
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
        'p-5 rounded-xl border flex items-start gap-4',
        isDarkMode
          ? 'border-muted/30 bg-muted/10 hover:bg-muted/15'
          : 'border-muted/40 bg-muted/5 hover:bg-muted/10',
        'transition-all duration-300 shadow-sm hover:shadow-md'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center h-10 w-10 rounded-full text-white font-medium text-sm',
          index === 0
            ? 'bg-gradient-to-br from-forest to-forest-dark'
            : index === 1
              ? 'bg-gradient-to-br from-ocean to-ocean-dark'
              : index === 2
                ? 'bg-gradient-to-br from-sunset to-sunset-dark'
                : 'bg-gradient-to-br from-primary to-primary-dark',
          'shadow-md'
        )}
      >
        {index + 1}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-lg">
          {`Location ${index + 1}`}
        </h3>
        <p className="text-muted-foreground">
          {`Latitude: ${location.latitude.toFixed(6)}`}
        </p>
        <p className="text-muted-foreground">
          {`Longitude: ${location.longitude.toFixed(6)}`}
        </p>
      </div>
    </div>
  );
}

function ItineraryDetailSkeleton() {
  return (
    <div className="space-y-8 relative">
      {/* Decorative background elements */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-radial from-ocean/20 to-ocean/5 rounded-full blur-3xl -z-10 animate-pulse-slow opacity-70" />
      <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-gradient-radial from-ocean/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse-slow opacity-50" />

      {/* Header skeleton with glass morphism effect */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-background/60 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-ocean/10 animate-pulse">
        <Skeleton className="h-10 w-28 bg-ocean/10" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 bg-ocean/10 rounded-xl" />
          <Skeleton className="h-10 w-24 bg-ocean/10 rounded-xl" />
          <Skeleton className="h-10 w-24 bg-ocean/10 rounded-xl" />
        </div>
      </div>

      {/* Enhanced title skeleton with glass card */}
      <div className="bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-md p-8 rounded-3xl border border-ocean/10 shadow-xl space-y-4 animate-pulse relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-ocean/40" />
        <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-ocean/40 to-ocean/20 blur-2xl opacity-50" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <Skeleton className="h-12 w-2/3 bg-ocean/10 rounded-lg" />
          <Skeleton className="h-9 w-36 bg-ocean/15 rounded-full" />
        </div>
        <Skeleton className="h-5 w-full max-w-2xl bg-ocean/10 rounded-md" />
        <Skeleton className="h-5 w-3/4 bg-ocean/10 rounded-md" />
      </div>

      {/* Quick info cards skeleton with glass morphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="border border-ocean/10 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden group">
              <div className="border-b border-ocean/5 p-4">
                <Skeleton className="h-5 w-32 bg-ocean/10 rounded-md" />
              </div>
              <div className="p-5 space-y-2">
                <Skeleton className="h-6 w-40 bg-ocean/10 rounded-md" />
                <Skeleton className="h-4 w-28 bg-ocean/10 rounded-md" />
              </div>
            </div>
          ))}
      </div>

      {/* Tabs skeleton with elegant styling */}
      <div className="bg-background/90 backdrop-blur-md p-1.5 rounded-2xl border border-ocean/10 shadow-lg w-full max-w-3xl flex space-x-2 overflow-x-auto">
        {["Overview", "Day Plans", "Map", "Budget"].map((tab, index) => (
          <div key={index} className={`px-5 py-2.5 rounded-xl ${index === 0 ? 'bg-gradient-to-r from-ocean to-ocean-dark text-white' : 'bg-transparent'}`}>
            <Skeleton className={`h-5 w-24 ${index === 0 ? 'bg-white/20' : 'bg-ocean/10'} rounded-md`} />
          </div>
        ))}
      </div>

      {/* Content skeletons with enhanced styling */}
      <div className="border border-ocean/10 bg-background/80 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
        <div className="border-b border-ocean/10 bg-gradient-to-r from-background/90 to-background/70 p-6">
          <Skeleton className="h-7 w-64 bg-ocean/10 rounded-md" />
          <Skeleton className="h-5 w-80 bg-ocean/10 rounded-md mt-2" />
        </div>
        <div className="p-0">
          <Skeleton className="h-[450px] w-full bg-ocean/5" />
        </div>
      </div>

      <div className="border border-ocean/10 bg-background/80 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
        <div className="border-b border-ocean/10 bg-gradient-to-r from-background/90 to-background/70 p-6">
          <Skeleton className="h-7 w-48 bg-ocean/10 rounded-md" />
          <Skeleton className="h-5 w-72 bg-ocean/10 rounded-md mt-2" />
        </div>
        <div className="p-6 grid gap-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full bg-ocean/5 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
