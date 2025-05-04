'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItineraryService } from '@/service/itinerary-service';
import { Itinerary } from '@/types/itinerary';
import { parseISO } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Loader2, Plus, Search, X } from 'lucide-react';
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
  const [filteredItineraries, setFilteredItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('date-desc');
  const [activeTab, setActiveTab] = useState('all');

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
        setFilteredItineraries(response.data || []);
      } catch (error) {
        console.error('Failed to fetch itineraries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItineraries();
  }, [userId]);

  // Filter and sort itineraries based on search query, status filter, and sort option
  useEffect(() => {
    // Start with all itineraries
    let filtered = [...itineraries];

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (itinerary) =>
          itinerary.title.toLowerCase().includes(query) ||
          itinerary.description.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter((itinerary) => {
        const startDate = parseISO(itinerary.start_date);
        const endDate = parseISO(itinerary.end_date);

        if (statusFilter === 'upcoming') {
          return startDate > now;
        } else if (statusFilter === 'ongoing') {
          return startDate <= now && endDate >= now;
        } else if (statusFilter === 'past') {
          return endDate < now;
        }
        return true;
      });
    }

    // Apply tab filter (if not 'all')
    if (activeTab !== 'all') {
      const now = new Date();
      filtered = filtered.filter((itinerary) => {
        const startDate = parseISO(itinerary.start_date);
        const endDate = parseISO(itinerary.end_date);

        if (activeTab === 'upcoming') {
          return startDate > now;
        } else if (activeTab === 'ongoing') {
          return startDate <= now && endDate >= now;
        } else if (activeTab === 'past') {
          return endDate < now;
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const startDateA = parseISO(a.start_date);
      const startDateB = parseISO(b.start_date);

      if (sortOption === 'date-asc') {
        return startDateA.getTime() - startDateB.getTime();
      } else if (sortOption === 'date-desc') {
        return startDateB.getTime() - startDateA.getTime();
      } else if (sortOption === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else if (sortOption === 'title-desc') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    setFilteredItineraries(filtered);
  }, [itineraries, searchQuery, statusFilter, sortOption, activeTab]);

  const handleEditItinerary = (id: string) => {
    router.push(`/itinerary/edit?id=${id}`);
  };

  const handleDeleteItinerary = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this itinerary?')) {
      try {
        await ItineraryService.deleteItinerary(id);
        setItineraries(itineraries.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Failed to delete itinerary:', error);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSortOption('date-desc');
    setSearchQuery('');
  };

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.02
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="relative w-16 h-16 mb-6">
          <Loader2 className="h-16 w-16 animate-spin text-primary absolute" />
          <div className="absolute inset-0 rounded-full border-t-2 border-primary/20 border-dotted animate-ping"></div>
        </div>
        <h3 className="text-xl font-medium mb-2">Loading your journeys</h3>
        <p className="text-muted-foreground text-center max-w-md">
          We&apos;re fetching your travel plans. This will only take a moment...
        </p>
      </div>
    );
  }

  // Function to count itineraries by status
  const countItinerariesByStatus = (
    status: 'upcoming' | 'ongoing' | 'past' | 'all'
  ) => {
    if (status === 'all') return itineraries.length;

    const now = new Date();
    return itineraries.filter((itinerary) => {
      const startDate = parseISO(itinerary.start_date);
      const endDate = parseISO(itinerary.end_date);

      if (status === 'upcoming') {
        return startDate > now;
      } else if (status === 'ongoing') {
        return startDate <= now && endDate >= now;
      } else if (status === 'past') {
        return endDate < now;
      }
      return false;
    }).length;
  };

  return (
    <div className="space-y-10 relative">
      {/* Enhanced decorative background elements */}
      <div className="absolute -top-64 -right-40 w-[500px] h-[500px] bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-gradient-radial from-forest/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse-slower" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-ocean/10 to-transparent rounded-full blur-3xl -z-10 animate-pulse-slow" />

      {/* Enhanced Header section */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-background/40 backdrop-blur-md p-6 rounded-2xl border border-muted/15 shadow-md">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="space-y-2"
        >
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Your Adventures
          </h2>
          <p className="text-muted-foreground text-lg">
            Manage and explore your travel plans
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button asChild size={'lg'} className="shadow-lg">
            <Link
              href="/itinerary/create"
              className={`w-full px-5 py-2.5 rounded-xl flex items-center justify-center transition-all duration-300
              bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/80
              text-white font-medium hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]`}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Journey
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Enhanced Tabs and filters */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
        className="space-y-5"
      >
        {/* Enhanced Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-background/70 backdrop-blur-md p-2 rounded-2xl border border-muted/15 shadow-md">
            <TabsTrigger
              value="all"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-primary data-[state=active]:text-white rounded-xl transition-all duration-300 px-4 py-2.5"
            >
              <span>All Trips ({countItinerariesByStatus('all')})</span>
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest data-[state=active]:to-forest-dark data-[state=active]:text-white rounded-xl transition-all duration-300 px-4 py-2.5"
            >
              <span>Upcoming ({countItinerariesByStatus('upcoming')})</span>
            </TabsTrigger>
            <TabsTrigger
              value="ongoing"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-ocean data-[state=active]:to-ocean-dark data-[state=active]:text-white rounded-xl transition-all duration-300 px-4 py-2.5"
            >
              <span>Ongoing ({countItinerariesByStatus('ongoing')})</span>
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sunset data-[state=active]:to-sunset-dark data-[state=active]:text-white rounded-xl transition-all duration-300 px-4 py-2.5"
            >
              <span>Completed ({countItinerariesByStatus('past')})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Enhanced Filters bar */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-muted/15 shadow-sm">
          {/* Enhanced Search */}
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your itineraries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 rounded-xl bg-background/80 border-muted/30 focus-visible:ring-primary/40 focus-visible:border-primary/40 text-base shadow-sm"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted/80"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Enhanced Sort */}
          <div className="w-44">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="rounded-xl bg-background/80 border-muted/30 focus:ring-primary/40 focus:border-primary/40 py-6 text-base shadow-sm">
                <SelectValue placeholder="Sort your trips" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-muted/20 shadow-lg backdrop-blur-sm">
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">A to Z</SelectItem>
                <SelectItem value="title-desc">Z to A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Status filter */}
          <div className="w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-xl bg-background/80 border-muted/30 focus:ring-primary/40 focus:border-primary/40 py-6 text-base shadow-sm">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-muted/20 shadow-lg backdrop-blur-sm">
                <SelectItem value="all">All Trips</SelectItem>
                <SelectItem value="upcoming">Upcoming Only</SelectItem>
                <SelectItem value="ongoing">Ongoing Only</SelectItem>
                <SelectItem value="past">Completed Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Clear filters */}
          {(searchQuery ||
            statusFilter !== 'all' ||
            sortOption !== 'date-desc') && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="rounded-xl border-muted/30 hover:bg-muted/20 py-6 px-4 shadow-sm"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </motion.div>

      {/* Enhanced Itineraries Grid */}
      <AnimatePresence mode="wait">
        {filteredItineraries.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="text-center py-20 border border-dashed rounded-2xl bg-muted/5 shadow-inner"
          >
            <div className="max-w-md mx-auto space-y-6">
              <div className="bg-muted/20 mx-auto h-20 w-20 flex items-center justify-center rounded-full shadow-inner">
                {searchQuery ? (
                  <Search className="h-10 w-10 text-muted-foreground/60" />
                ) : (
                  <Plus className="h-10 w-10 text-muted-foreground/60" />
                )}
              </div>
              <h3 className="text-xl font-medium mb-2">
                {searchQuery
                  ? 'No matching journeys found'
                  : 'No journeys planned yet'}
              </h3>
              <p className="text-muted-foreground text-lg mb-6 px-4">
                {searchQuery
                  ? `Try adjusting your search terms or filters to find what you're looking for.`
                  : 'Create your first travel itinerary to start planning your adventures.'}
              </p>
              {!searchQuery && (
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl bg-gradient-to-r from-forest to-ocean text-white hover:from-forest-dark hover:to-ocean-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  <Link href="/itinerary/create">
                    <Plus className="h-5 w-5 mr-2" />
                    Start Your First Journey
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredItineraries.map((itinerary) => (
              <motion.div key={itinerary.id} variants={itemVariants}>
                <ItineraryCard
                  itinerary={itinerary}
                  onEditAction={handleEditItinerary}
                  onDeleteAction={handleDeleteItinerary}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
