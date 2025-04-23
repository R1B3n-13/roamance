import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Location } from '@/types';
import { JournalDetail } from '@/types/journal';
import { SubsectionType } from '@/types/subsection';
import { formatRelativeTime } from '@/utils/format';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  Calendar,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Map,
  MapPin,
  Route,
  Star,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const DestinationMarker = dynamic(
  () =>
    import('@/components/maps/MapMarkers').then((mod) => mod.DestinationMarker),
  { ssr: false }
);

interface JournalDetailViewProps {
  journal: JournalDetail | null; // Made optional to handle loading state
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean; // Added loading state prop
}

export const JournalDetailView: React.FC<JournalDetailViewProps> = ({
  journal,
  isOpen,
  onClose,
  isLoading = false, // Default to false
}) => {
  const [activeSubsection, setActiveSubsection] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Update active subsection when journal changes
  useEffect(() => {
    if (journal?.subsections && journal.subsections?.length > 0) {
      setActiveSubsection(journal.subsections[0].id);
    } else {
      setActiveSubsection(null);
    }
  }, [journal]);

  // Check if dark mode is enabled
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDarkMode(document.documentElement.classList.contains('dark'));

      // Listen for theme changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
          }
        });
      });

      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    }
  }, []);

  if (!isOpen) return null;

  // Show loading UI while journal data is being fetched
  if (isLoading || !journal) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-muted/30 p-0">
          <DialogTitle className="sr-only">Loading Journal Details</DialogTitle>
          {/* Simple loading header */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 p-8 relative">
            <div className="h-16"></div>
          </div>

          {/* Loading spinner */}
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-muted/20 border-t-indigo-600 animate-spin"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600/10"></div>
            </div>
            <span className="mt-6 text-muted-foreground font-medium">
              Loading journal details...
            </span>
          </div>

          {/* Footer with back button */}
          <div className="p-4 px-6 md:px-8 border-t border-muted/30 bg-muted/5 backdrop-blur-sm">
            <Button
              onClick={onClose}
              variant="outline"
              className="gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Journals
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Extract destination name, travel dates, and cover image from description (if available)
  let destinationName = '';
  let travelDates = '';
  let coverImage = '';

  const descriptionLines = journal.description.split('\n');
  for (const line of descriptionLines) {
    if (line.startsWith('Destination:')) {
      destinationName = line.replace('Destination:', '').trim();
    } else if (line.startsWith('Travel Dates:')) {
      travelDates = line.replace('Travel Dates:', '').trim();
    } else if (line.startsWith('Cover Image:')) {
      coverImage = line.replace('Cover Image:', '').trim();
    }
  }

  // Clean description (remove metadata lines)
  const cleanDescription = descriptionLines
    .filter(
      (line) =>
        !line.startsWith('Destination:') &&
        !line.startsWith('Travel Dates:') &&
        !line.startsWith('Cover Image:')
    )
    .join('\n');

  const getSubsectionIcon = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return <Eye className="w-5 h-5" />;
      case SubsectionType.ACTIVITY:
        return <Activity className="w-5 h-5" />;
      case SubsectionType.ROUTE:
        return <Route className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return 'from-indigo-500 to-purple-600 text-white';
      case SubsectionType.ACTIVITY:
        return 'from-amber-500 to-yellow-600 text-white';
      case SubsectionType.ROUTE:
        return 'from-emerald-500 to-teal-600 text-white';
      default:
        return 'from-gray-500 to-gray-600 text-white';
    }
  };

  const getTypeColors = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-900/20',
          icon: 'text-indigo-500 dark:text-indigo-400',
          border: 'border-indigo-200 dark:border-indigo-800/50',
          badge:
            'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
        };
      case SubsectionType.ACTIVITY:
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          icon: 'text-amber-500 dark:text-amber-400',
          border: 'border-amber-200 dark:border-amber-800/50',
          badge:
            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        };
      case SubsectionType.ROUTE:
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          icon: 'text-emerald-500 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-800/50',
          badge:
            'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          icon: 'text-gray-500 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-700',
          badge:
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        };
    }
  };

  const toggleSubsection = (id: string) => {
    setActiveSubsection((currentId) => (currentId === id ? null : id));
  };

  // Get the count of subsections
  const subsectionCount = journal.subsections?.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-muted/30 p-0 sm:max-w-4xl">
        <DialogTitle className="sr-only">{journal.title}</DialogTitle>
        {/* Journal Header with Cover Image */}
        <div className="relative">
          {coverImage ? (
            <div className="relative h-56 md:h-72 lg:h-80 overflow-hidden">
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-10" />

              {/* Cover image */}
              <Image
                src={coverImage}
                alt={journal.title}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    '/images/roamance-logo-bg.png';
                }}
              />

              {/* Close button */}
              <DialogClose className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 z-20 transition-all duration-300 backdrop-blur-sm hover:rotate-90">
                <X className="w-5 h-5" />
              </DialogClose>

              {/* Journal title and location */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="space-y-2"
                >
                  <Badge className="bg-white/20 text-white backdrop-blur-sm border-none px-3 py-1">
                    {subsectionCount}{' '}
                    {subsectionCount === 1 ? 'Section' : 'Sections'}
                  </Badge>

                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight drop-shadow-sm">
                    {journal.title}
                  </h2>

                  <div className="flex flex-wrap gap-4 mt-2">
                    {destinationName && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="flex items-center text-white/90"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-2">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{destinationName}</span>
                      </motion.div>
                    )}

                    {travelDates && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="flex items-center text-white/90"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-2">
                          <CalendarIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{travelDates}</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 p-8 relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-4"
              >
                <Badge className="bg-white/20 text-white backdrop-blur-sm border-none px-3 py-1">
                  {subsectionCount}{' '}
                  {subsectionCount === 1 ? 'Section' : 'Sections'}
                </Badge>

                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
                  {journal.title}
                </h2>

                <div className="flex flex-wrap gap-4 mt-2">
                  {destinationName && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="flex items-center text-white/90"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-2">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{destinationName}</span>
                    </motion.div>
                  )}

                  {travelDates && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="flex items-center text-white/90"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mr-2">
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{travelDates}</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Body content with scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-8 py-6">
            {/* Journal description */}
            {cleanDescription && (
              <div className="mb-6">
                <div className="py-5 px-6 rounded-xl bg-muted/20 border border-muted/30 backdrop-blur-sm prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-foreground/90">{cleanDescription}</p>
                </div>
              </div>
            )}

            {/* Journal metadata */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/20">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-800/30 flex items-center justify-center mr-3 flex-shrink-0">
                  <Map className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs text-indigo-500 dark:text-indigo-400 font-medium uppercase tracking-wider mb-1">
                    Location
                  </div>
                  <div className="text-sm text-foreground">
                    {journal.destination
                      ? `${journal.destination.latitude.toFixed(4)}, ${journal.destination.longitude.toFixed(4)}`
                      : 'No location data'}
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/20">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800/30 flex items-center justify-center mr-3 flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-xs text-purple-500 dark:text-purple-400 font-medium uppercase tracking-wider mb-1">
                    Created
                  </div>
                  <div className="text-sm text-foreground">
                    {formatRelativeTime(new Date(journal.audit.created_at))}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Map Toggle */}
            {journal.destination && (
              <div className="mb-8">
                <Button
                  onClick={() => setShowMap(!showMap)}
                  variant="outline"
                  className={cn(
                    'w-full justify-between group p-4 h-auto border-muted/50 hover:border-indigo-400/50',
                    showMap &&
                      'border-indigo-400/50 bg-indigo-50/50 dark:bg-indigo-900/10'
                  )}
                >
                  <span className="flex items-center text-foreground">
                    <Map className="w-5 h-5 mr-2 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-200" />
                    <span className="font-medium">
                      {showMap ? 'Hide Map Location' : 'Show Map Location'}
                    </span>
                  </span>
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300',
                      showMap
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 rotate-180'
                        : 'bg-muted/50'
                    )}
                  >
                    <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </Button>

                <AnimatePresence>
                  {showMap && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 h-72 rounded-xl border border-muted/50 overflow-hidden shadow-sm bg-muted/20">
                        {typeof window !== 'undefined' && (
                          <div className="h-full w-full relative">
                            <link
                              rel="stylesheet"
                              href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                            />

                            <MapContainer
                              center={[
                                journal.destination.latitude,
                                journal.destination.longitude,
                              ]}
                              zoom={12}
                              style={{ height: '100%', width: '100%' }}
                              zoomControl={true}
                              className={cn({ 'dark-map': isDarkMode })}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url={
                                  isDarkMode
                                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                                    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                }
                              />

                              <DestinationMarker
                                position={{
                                  lat: journal.destination.latitude,
                                  lng: journal.destination.longitude,
                                }}
                                locationName={journal.title}
                                isDarkMode={isDarkMode}
                              />
                            </MapContainer>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Journal Sections */}
            <div>
              <div className="flex items-center mb-6">
                <h3 className="text-xl font-semibold text-foreground mr-3">
                  Journal Sections
                </h3>
                <Badge
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30"
                >
                  {subsectionCount}{' '}
                  {subsectionCount === 1 ? 'Section' : 'Sections'}
                </Badge>
              </div>

              {journal.subsections && journal?.subsections?.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  {journal.subsections.map((subsection, index) => {
                    const isActive = activeSubsection === subsection.id;
                    const colors = getTypeColors(subsection.type);

                    return (
                      <motion.div
                        key={subsection.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.1 }}
                        className={cn(
                          'rounded-xl overflow-hidden border shadow-sm transition-all duration-300',
                          isActive
                            ? cn('border-muted/70 shadow-md', colors.border)
                            : 'border-muted/30 hover:border-muted/50'
                        )}
                      >
                        <button
                          onClick={() => toggleSubsection(subsection.id)}
                          className={cn(
                            'flex items-center justify-between w-full p-4 text-left bg-background hover:bg-muted/20 transition-colors duration-200',
                            isActive && cn('bg-muted/10', colors.bg)
                          )}
                        >
                          <div className="flex items-center">
                            <div
                              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${getTypeColor(subsection.type)} shadow-sm`}
                            >
                              {getSubsectionIcon(subsection.type)}
                            </div>
                            <div className="ml-4">
                              <h4 className="font-medium text-foreground">
                                {subsection.title}
                              </h4>
                              <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                                <Badge
                                  variant="secondary"
                                  className={colors.badge}
                                >
                                  {subsection.type}
                                </Badge>

                                {subsection.notes?.length > 0 && (
                                  <span className="flex items-center">
                                    <Star className="w-3 h-3 mr-1" />
                                    {subsection.notes?.length} notes
                                  </span>
                                )}

                                {subsection.checklists?.length > 0 && (
                                  <span className="flex items-center">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    {subsection.checklists?.length} checklist
                                    items
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300',
                              colors.bg,
                              isActive && 'rotate-180'
                            )}
                          >
                            <ChevronDown
                              className={cn('w-5 h-5', colors.icon)}
                            />
                          </div>
                        </button>

                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden border-t border-muted/30"
                            >
                              <div className={cn('p-5', colors.bg)}>
                                {/* Type-specific content */}
                                {subsection.type ===
                                  SubsectionType.SIGHTSEEING && (
                                  <div className="mb-5">
                                    <div className="flex items-center text-sm text-foreground bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-muted/30">
                                      <MapPin
                                        className={cn(
                                          'w-5 h-5 mr-3',
                                          colors.icon
                                        )}
                                      />
                                      <span>
                                        Location:{' '}
                                        {subsection.location
                                          ? `${subsection.location.latitude.toFixed(4)}, ${subsection.location.longitude.toFixed(4)}`
                                          : 'No location data available'}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {subsection.type ===
                                  SubsectionType.ACTIVITY && (
                                  <div className="mb-5 space-y-3">
                                    <div className="flex items-center text-sm text-foreground bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-muted/30">
                                      <Activity
                                        className={cn(
                                          'w-5 h-5 mr-3',
                                          colors.icon
                                        )}
                                      />
                                      <span>
                                        Activity:{' '}
                                        {subsection.activity_type ||
                                          'Unnamed activity'}
                                      </span>
                                    </div>

                                    <div className="flex items-center text-sm text-foreground bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-muted/30">
                                      <MapPin
                                        className={cn(
                                          'w-5 h-5 mr-3',
                                          colors.icon
                                        )}
                                      />
                                      <span>
                                        Location:{' '}
                                        {subsection.location
                                          ? `${subsection.location.latitude.toFixed(4)}, ${subsection.location.longitude.toFixed(4)}`
                                          : 'No location data available'}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {subsection.type === SubsectionType.ROUTE && (
                                  <div className="mb-5 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div className="flex items-center text-sm text-foreground bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-muted/30">
                                        <Route
                                          className={cn(
                                            'w-5 h-5 mr-3',
                                            colors.icon
                                          )}
                                        />
                                        <span>
                                          Distance:{' '}
                                          {subsection.total_distance || 0} km
                                        </span>
                                      </div>

                                      <div className="flex items-center text-sm text-foreground bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-muted/30">
                                        <Clock
                                          className={cn(
                                            'w-5 h-5 mr-3',
                                            colors.icon
                                          )}
                                        />
                                        <span>
                                          Time: {subsection.total_time || 0} min
                                        </span>
                                      </div>
                                    </div>

                                    {subsection.waypoints &&
                                      subsection.waypoints.length > 0 && (
                                        <div>
                                          <h5 className="text-sm font-medium mb-3 flex items-center">
                                            <Route
                                              className={cn(
                                                'w-4 h-4 mr-2',
                                                colors.icon
                                              )}
                                            />
                                            Route Stops
                                          </h5>

                                          <div
                                            className={cn(
                                              'space-y-2 pl-4 border-l-2',
                                              colors.border
                                            )}
                                          >
                                            {subsection.waypoints.map(
                                              (
                                                location: Location,
                                                index: number
                                              ) => (
                                                <div
                                                  key={index}
                                                  className="flex items-center text-sm relative pl-6"
                                                >
                                                  <div
                                                    className={cn(
                                                      'absolute -left-[17px] w-8 h-8 rounded-full flex items-center justify-center text-white z-10',
                                                      index === 0
                                                        ? 'bg-green-500'
                                                        : index ===
                                                            subsection.waypoints
                                                              .length -
                                                              1
                                                          ? 'bg-red-500'
                                                          : colors.icon.replace(
                                                              'text-',
                                                              'bg-'
                                                            )
                                                    )}
                                                  >
                                                    {index + 1}
                                                  </div>
                                                  <div className="bg-background/80 backdrop-blur-sm rounded-lg py-2 px-3 border border-muted/30 w-full">
                                                    Stop {index + 1}:{' '}
                                                    {location.latitude.toFixed(
                                                      4
                                                    )}
                                                    ,{' '}
                                                    {location.longitude.toFixed(
                                                      4
                                                    )}
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  {/* Notes section */}
                                  {subsection.notes &&
                                    subsection.notes?.length > 0 && (
                                      <div>
                                        <h5 className="text-sm font-medium mb-3 flex items-center">
                                          <Star
                                            className={cn(
                                              'w-4 h-4 mr-2',
                                              colors.icon
                                            )}
                                          />
                                          Notes
                                          <Badge
                                            className={cn(
                                              'ml-2 text-xs',
                                              colors.badge
                                            )}
                                          >
                                            {subsection.notes?.length}
                                          </Badge>
                                        </h5>

                                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                          {subsection.notes.map((note, i) => (
                                            <div
                                              key={i}
                                              className="group relative"
                                            >
                                              <div className="absolute -left-2 top-3 w-4 h-4 rounded-full bg-background border-2 border-muted z-10 group-hover:border-indigo-400 transition-colors duration-300"></div>
                                              <div className="pl-6 py-2 pr-3 rounded-lg bg-background/80 backdrop-blur-sm border border-muted/30 group-hover:border-muted transition-colors duration-300">
                                                <p className="text-sm text-foreground/90">
                                                  {note}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                  {/* Checklists section */}
                                  {subsection.checklists &&
                                    subsection.checklists?.length > 0 && (
                                      <div>
                                        <h5 className="text-sm font-medium mb-3 flex items-center">
                                          <CheckCircle2
                                            className={cn(
                                              'w-4 h-4 mr-2',
                                              colors.icon
                                            )}
                                          />
                                          Checklist
                                          <Badge
                                            className={cn(
                                              'ml-2 text-xs',
                                              colors.badge
                                            )}
                                          >
                                            {subsection.checklists?.length}
                                          </Badge>
                                        </h5>

                                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                          {subsection.checklists.map(
                                            (item, i) => (
                                              <div
                                                key={i}
                                                className="flex items-center p-3 rounded-lg bg-background/80 backdrop-blur-sm border border-muted/30 text-sm text-foreground"
                                              >
                                                <div
                                                  className={cn(
                                                    'w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0',
                                                    colors.bg
                                                  )}
                                                >
                                                  <CheckCircle2
                                                    className={cn(
                                                      'w-4 h-4',
                                                      colors.icon
                                                    )}
                                                  />
                                                </div>
                                                <span>{item}</span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-muted/10 border border-dashed border-muted/50 p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <h4 className="text-lg font-medium text-foreground mb-2">
                    No sections yet
                  </h4>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This journal doesn&apos;t have any sections added to it yet.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with back button */}
        <div className="p-4 px-6 md:px-8 border-t border-muted/30 bg-muted/5 backdrop-blur-sm sticky bottom-0">
          <Button
            onClick={onClose}
            variant="outline"
            className="gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journals
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
