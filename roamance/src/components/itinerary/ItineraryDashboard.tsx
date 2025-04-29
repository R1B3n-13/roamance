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
  const [filteredItineraries, setFilteredItineraries] = useState<Itinerary[]>(
    []
  );
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your itineraries...</p>
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
    <div className="space-y-8">
      {/* Decorative background elements */}
      <div className="absolute -top-64 -right-40 w-96 h-96 bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-radial from-forest/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-radial from-ocean/5 to-transparent rounded-full blur-3xl -z-10" />

      {/* Header section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-1"
        >
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
            Your Itineraries
          </h2>
          <p className="text-muted-foreground">
            Manage and organize your travel plans
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Button asChild size={'lg'}>
            <Link
              href="/itinerary/create"
              className={`w-full px-4 py-2 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md
              bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/80
              text-white font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Tabs and filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col space-y-4"
      >
        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-background/70 backdrop-blur-md p-1.5 rounded-2xl border border-muted/10 shadow-sm">
            <TabsTrigger
              value="all"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-primary data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <span>All ({countItinerariesByStatus('all')})</span>
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest data-[state=active]:to-forest-dark data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <span>Upcoming ({countItinerariesByStatus('upcoming')})</span>
            </TabsTrigger>
            <TabsTrigger
              value="ongoing"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-ocean data-[state=active]:to-ocean-dark data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <span>Ongoing ({countItinerariesByStatus('ongoing')})</span>
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="flex gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sunset data-[state=active]:to-sunset-dark data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              <span>Completed ({countItinerariesByStatus('past')})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 pb-2">
          {/* Search */}
          <div className="flex-1 min-w-[180px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search itineraries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-5 rounded-xl bg-muted/50 border-muted/40 focus-visible:ring-primary/30 focus-visible:border-primary/30"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full hover:bg-muted/80"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Sort */}
          <div className="w-40">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="rounded-xl bg-muted/50 border-muted/40 focus:ring-primary/30 focus:border-primary/30">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-muted/30 shadow-lg backdrop-blur-sm">
                <SelectItem value="date-desc">Date (Newest)</SelectItem>
                <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status filter */}
          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-xl bg-muted/50 border-muted/40 focus:ring-primary/30 focus:border-primary/30">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-muted/30 shadow-lg backdrop-blur-sm">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="past">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear filters */}
          {(searchQuery ||
            statusFilter !== 'all' ||
            sortOption !== 'date-desc') && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="rounded-xl border-muted/40 hover:bg-muted/20"
            >
              <X className="h-3.5 w-3.5 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </motion.div>

      {/* Itineraries Grid with improved layout */}
      <AnimatePresence mode="wait">
        {filteredItineraries.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 border border-dashed rounded-xl bg-muted/5"
          >
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-muted/10 mx-auto h-16 w-16 flex items-center justify-center rounded-full">
                {searchQuery ? (
                  <Search className="h-8 w-8 text-muted-foreground/60" />
                ) : (
                  <Plus className="h-8 w-8 text-muted-foreground/60" />
                )}
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchQuery
                  ? 'No matching itineraries found'
                  : 'No itineraries yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? `Try adjusting your search terms or filters to find what you're looking for.`
                  : 'Create your first travel itinerary to get started planning your adventures.'}
              </p>
              {!searchQuery && (
                <Button
                  asChild
                  className="rounded-xl bg-gradient-to-r from-forest to-ocean text-white hover:from-forest-dark hover:to-ocean-dark transition-all duration-300 shadow-md"
                >
                  <Link href="/itinerary/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Itinerary
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredItineraries.map((itinerary) => (
              <motion.div key={itinerary.id} variants={itemVariants}>
                <ItineraryCard
                  itinerary={itinerary}
                  onEdit={handleEditItinerary}
                  onDelete={handleDeleteItinerary}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
