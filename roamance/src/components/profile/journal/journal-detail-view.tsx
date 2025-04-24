import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { journalService } from '@/service/journal-service';
import { JournalCreateRequest, JournalDetail } from '@/types/journal';
import { SubsectionRequest, SubsectionType } from '@/types/subsection';
import { formatRelativeTime } from '@/utils/format';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  ChevronDown,
  Edit2,
  Eye,
  Loader2,
  Map,
  MapPin,
  PlusCircle,
  Save,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../common/confirm-dialog';
import { JournalMetadataForm } from './journal-metadata-form';
import { SubsectionDetail } from './subsection-detail';
import { SubsectionForm } from './subsection-form';
import { SubsectionList } from './subsection-list';
import { CloudinaryUploadResult } from '@/service/cloudinary-service';

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
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [subsectionFormVisible, setSubsectionFormVisible] = useState(false);
  const [isSubmittingSubsection, setIsSubmittingSubsection] = useState(false);
  const [deleteSubsectionDialogOpen, setDeleteSubsectionDialogOpen] = useState(false);
  const [subsectionToDelete, setSubsectionToDelete] = useState<number>(-1);

  // For editing the journal
  const [editableJournal, setEditableJournal] = useState<JournalCreateRequest>({
    title: '',
    description: '',
    destination: { latitude: 0, longitude: 0 },
    subsections: [],
    is_favorite: false,
    is_archived: false,
    is_shared: false,
    date: new Date().toISOString().split('T')[0],
    cover_image: '',
  });

  // Update editable journal when journal changes
  useEffect(() => {
    if (journal) {
      setEditableJournal({
        title: journal.title,
        description: journal.description,
        destination: journal.destination,
        subsections: journal.subsections.map((sub) => ({
          ...sub,
          journal_id: journal.id,
        })),
        is_favorite: journal.is_favorite,
        is_archived: journal.is_archived,
        is_shared: journal.is_shared,
        date: journal.date || new Date().toISOString().split('T')[0],
        cover_image: journal.cover_image || '',
      });
    }
  }, [journal]);

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for checkbox fields
    if (name === 'is_favorite' || name === 'is_archived' || name === 'is_shared') {
      setEditableJournal((prev) => ({
        ...prev,
        [name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : value === 'true',
      }));
    } else {
      setEditableJournal((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);

    setEditableJournal((prev) => ({
      ...prev,
      destination: {
        ...prev.destination,
        [name === 'latitude' ? 'latitude' : 'longitude']: isNaN(numValue)
          ? 0
          : numValue,
      },
    }));
  };

  const handleCoverImageUpload = (result: CloudinaryUploadResult) => {
    // Update the form data with the uploaded image URL
    setEditableJournal((prev) => ({
      ...prev,
      cover_image: result.url,
    }));
  };

  const handleAddSubsection = (subsection: SubsectionRequest) => {
    setIsSubmittingSubsection(true);

    try {
      // Add to form data
      setEditableJournal((prev) => ({
        ...prev,
        subsections: [...prev.subsections, subsection],
      }));

      setSubsectionFormVisible(false);
    } catch (error) {
      console.error('Error adding subsection:', error);
    } finally {
      setIsSubmittingSubsection(false);
    }
  };

  const confirmDeleteSubsection = () => {
    if (subsectionToDelete >= 0) {
      setEditableJournal((prev) => {
        const updatedSubsections = [...prev.subsections];
        updatedSubsections.splice(subsectionToDelete, 1);

        return {
          ...prev,
          subsections: updatedSubsections,
        };
      });

      setDeleteSubsectionDialogOpen(false);
      setSubsectionToDelete(-1);
    }
  };

  const handleRemoveSubsection = (index: number) => {
    setSubsectionToDelete(index);
    setDeleteSubsectionDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!journal) return;

    setIsSaving(true);
    setEditError(null);

    try {
      // Update the journal
      await journalService.updateJournal(journal.id, editableJournal);

      setEditMode(false);
      toast.success("Journal updated successfully");

      // Refresh the journal data (ideally this would update through a callback to the parent)
      // In a real app, we would probably use a state management solution like Redux
      // For now, just close and let the parent refresh
      onClose();
    } catch (err: unknown) {
      console.error('Error updating journal:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setEditError(errorMessage || 'Failed to update journal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSubsection = (id: string) => {
    setActiveSubsection((currentId) => (currentId === id ? null : id));
  };

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
  let coverImage = editableJournal.cover_image;

  const descriptionLines = journal.description.split('\n');
  for (const line of descriptionLines) {
    if (line.startsWith('Destination:')) {
      destinationName = line.replace('Destination:', '').trim();
    } else if (line.startsWith('Travel Dates:')) {
      travelDates = line.replace('Travel Dates:', '').trim();
    } else if (line.startsWith('Cover Image:') && !coverImage) {
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
                          <Calendar className="w-4 h-4" />
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
                        <Calendar className="w-4 h-4" />
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
            {/* Error banner if there's an error during editing */}
            {editError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4"
              >
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-destructive">{editError}</p>
                  </div>
                  <button
                    onClick={() => setEditError(null)}
                    className="ml-auto flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <span className="sr-only">Dismiss</span>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Edit or View Content */}
            {editMode ? (
              <div className="space-y-6">
                {/* Journal Metadata Form for editing */}
                <div className="bg-muted/5 rounded-xl border border-muted/20 p-6 shadow-sm">
                  <JournalMetadataForm
                    formData={editableJournal}
                    onChange={handleChange}
                    onLocationChange={handleLocationChange}
                    onCoverImageUpload={handleCoverImageUpload}
                  />
                </div>

                {/* Sections header with decorative element */}
                <div className="relative mb-6 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="absolute left-0 top-1/2 w-1 h-6 bg-purple-500 rounded-r-full transform -translate-y-1/2"></div>
                    <h3 className="text-lg font-medium pl-3 text-foreground">Journal Sections</h3>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setSubsectionFormVisible(true)}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-sm hover:shadow-md transition-all duration-200 gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Section
                  </Button>
                </div>

                {/* Sections list with improved styling */}
                <div className="bg-muted/5 rounded-xl border border-muted/20 p-2 shadow-sm mb-6 min-h-[150px]">
                  <SubsectionList
                    subsections={editableJournal.subsections}
                    onRemoveSubsection={handleRemoveSubsection}
                    onAddSubsectionClick={() => setSubsectionFormVisible(true)}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Journal description - View mode */}
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
                          <SubsectionDetail
                            key={subsection.id}
                            subsection={subsection}
                            isActive={isActive}
                            toggleSubsection={() => toggleSubsection(subsection.id)}
                            colors={colors}
                            index={index}
                          />
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
              </>
            )}
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="p-4 px-6 md:px-8 border-t border-muted/30 bg-muted/5 backdrop-blur-sm sticky bottom-0 flex justify-between items-center">
          <Button
            onClick={onClose}
            variant="outline"
            className="gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journals
          </Button>

          {/* Edit/Save Button */}
          {editMode ? (
            <Button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Edit2 className="w-4 h-4" />
              Edit Journal
            </Button>
          )}
        </div>
      </DialogContent>

      {/* Subsection Form Modal */}
      {subsectionFormVisible && (
        <Dialog
          open={subsectionFormVisible}
          onOpenChange={setSubsectionFormVisible}
        >
          <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[70vh] overflow-hidden p-0 rounded-xl border border-muted/30 shadow-xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-600/10 z-0"></div>
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
              <div className="absolute -left-20 -top-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl"></div>

              <div className="relative p-6 pb-4 border-b border-muted/20 bg-background/80 backdrop-blur-md z-10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-foreground m-0 p-0">
                    Add New Journal Section
                  </DialogTitle>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    Document a specific part of your journey
                  </p>
                </div>
                <DialogClose
                  onClick={() => setSubsectionFormVisible(false)}
                  className="ml-auto hover:bg-muted/80 transition-colors rounded-full p-2 absolute right-4 top-4"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </DialogClose>
              </div>
            </div>

            <div className="max-h-[calc(70vh-140px)] overflow-y-auto">
              <div className="p-6">
                <SubsectionForm
                  isSubmitting={isSubmittingSubsection}
                  onAddSubsection={handleAddSubsection}
                  onCancel={() => setSubsectionFormVisible(false)}
                  journalId={journal?.id}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm Delete Subsection Dialog */}
      <ConfirmDialog
        isOpen={deleteSubsectionDialogOpen}
        title="Delete Section"
        message="Are you sure you want to delete this section? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={false}
        onConfirm={confirmDeleteSubsection}
        onCancel={() => setDeleteSubsectionDialogOpen(false)}
      />
    </Dialog>
  );
};
