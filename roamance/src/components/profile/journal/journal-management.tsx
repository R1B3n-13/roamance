import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { journalService } from '@/service/journal-service';
import {
  JournalBrief,
  JournalCreateRequest,
  JournalDetail,
} from '@/types/journal';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Archive,
  BookOpen,
  Edit2,
  Filter,
  PlusCircle,
  Search,
  Share2,
  Star,
  X
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../common/confirm-dialog';
import { JournalCard } from './journal-card';
import { JournalCardSkeleton } from './journal-card-skeleton';
import { JournalDetailView } from './journal-detail-view';
import { JournalForm } from './journal-form';
import { JourneyPathAnimation } from './journey-path-animation';
import { EmptyState } from './empty-state';
import { NoResultsState } from './no-results-state';

export const JournalManagement: React.FC = () => {
  const [journals, setJournals] = useState<JournalBrief[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<JournalDetail | null>(
    null
  );
  const [journalToDelete, setJournalToDelete] = useState<JournalBrief | null>(
    null
  );
  const [journalToEdit, setJournalToEdit] = useState<JournalDetail | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    favorites: false,
    archived: false,
    shared: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      },
    },
  };

  // Load journals on component mount
  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const journalList = await journalService.getAllJournals();
      setJournals(journalList);
    } catch (err: unknown) {
      console.error('Error fetching journals:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch journals. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterToggle = (filterName: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      favorites: false,
      archived: false,
      shared: false,
    });
  };

  const handleViewJournal = async (journal: JournalBrief) => {
    setIsDetailLoading(true);
    try {
      const journalDetails = await journalService.getJournalById(journal.id);
      setSelectedJournal(journalDetails);
      setIsDetailViewOpen(true);
    } catch (err: unknown) {
      console.error('Error fetching journal details:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load journal details. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCreateJournal = () => {
    setJournalToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditJournal = async (journal: JournalBrief) => {
    setIsDetailLoading(true);
    try {
      const journalDetails = await journalService.getJournalById(journal.id);
      setJournalToEdit(journalDetails);
      setIsFormOpen(true);
    } catch (err: unknown) {
      console.error('Error fetching journal details for edit:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load journal details for editing. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDeleteJournal = (journal: JournalBrief) => {
    setJournalToDelete(journal);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteJournal = async () => {
    if (!journalToDelete) return;

    setIsDeleting(true);
    try {
      await journalService.deleteJournal(journalToDelete.id);
      setJournals((prevJournals) =>
        prevJournals.filter((j) => j.id !== journalToDelete.id)
      );
      toast.success('Journal deleted successfully');
    } catch (err: unknown) {
      console.error('Error deleting journal:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to delete journal. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setJournalToDelete(null);
      setIsConfirmDeleteOpen(false);
    }
  };

  const handleFormSubmit = async (journalData: JournalCreateRequest) => {
    setIsSubmitting(true);
    try {
      if (journalToEdit) {
        // Update existing journal
        await journalService.updateJournal(journalToEdit.id, journalData);
        toast.success('Journal updated successfully');
      } else {
        // Create new journal
        await journalService.createJournal(journalData);
        toast.success('Journal created successfully');
      }
      // Refresh journal list
      fetchJournals();
      // Close form
      setIsFormOpen(false);
      setJournalToEdit(null);
    } catch (err: unknown) {
      console.error('Error saving journal:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to save journal. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = async (journal: JournalBrief) => {
    try {
      await journalService.updateJournal(journal.id, {
        ...journal,
        is_favorite: !journal.is_favorite,
      });
      setJournals((prevJournals) =>
        prevJournals.map((j) =>
          j.id === journal.id
            ? { ...j, is_favorite: !journal.is_favorite }
            : j
        )
      );
      toast.success(
        journal.is_favorite
          ? 'Removed from favorites'
          : 'Added to favorites'
      );
    } catch (err: unknown) {
      console.error('Error updating favorite status:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to update favorite status. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleToggleArchive = async (journal: JournalBrief) => {
    try {
      await journalService.updateJournal(journal.id, {
        ...journal,
        is_archived: !journal.is_archived,
      });
      setJournals((prevJournals) =>
        prevJournals.map((j) =>
          j.id === journal.id
            ? { ...j, is_archived: !journal.is_archived }
            : j
        )
      );
      toast.success(
        journal.is_archived
          ? 'Journal unarchived'
          : 'Journal archived'
      );
    } catch (err: unknown) {
      console.error('Error updating archive status:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to update archive status. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Apply filters and search to journals
  const filteredJournals = useMemo(() => {
    return journals.filter((journal) => {
      // Apply text search
      const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
      const matchesSearch =
        !searchQuery ||
        searchTerms.every(
          (term) =>
            journal.title.toLowerCase().includes(term) ||
            journal.description.toLowerCase().includes(term)
        );

      // Apply filters
      const matchesFavorite = !filters.favorites || journal.is_favorite;
      const matchesArchived = !filters.archived || journal.is_archived;
      const matchesShared = !filters.shared || journal.is_shared;

      return matchesSearch && matchesFavorite && matchesArchived && matchesShared;
    });
  }, [journals, searchQuery, filters]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8 relative"
    >
      {/* Decorative background elements */}
      <div className="absolute top-10 right-0 w-72 h-72 bg-gradient-radial from-indigo-500/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-gradient-radial from-purple-500/5 to-transparent rounded-full blur-3xl -z-10" />

      {/* Search and Filters */}
      <motion.div variants={fadeInUp}>
        <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md overflow-hidden">
          <div className="relative px-6">
            {/* Decorative accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 opacity-80" />

            <div className="flex flex-col md:flex-row gap-4 items-stretch my-6">
              <div className="relative flex-grow">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Search className="h-4 w-4 text-indigo-500" />
                </div>
                <Input
                  placeholder="Search your journals..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-9 border-muted/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 bg-background/80 backdrop-blur-sm transition-colors"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-indigo-50/10 hover:text-indigo-500"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap md:justify-end">
                <Button
                  variant={filters.favorites ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full flex items-center gap-1.5 transition-all duration-300 shadow-sm",
                    filters.favorites
                      ? "bg-amber-500 text-white font-medium"
                      : "border-amber-200 hover:bg-amber-50/30 text-amber-700 hover:text-amber-800 dark:border-amber-800 dark:hover:bg-amber-900/10 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
                  )}
                  onClick={() => handleFilterToggle('favorites')}
                >
                  <Star className="h-3.5 w-3.5" />
                  <span>Favorites</span>
                </Button>

                <Button
                  variant={filters.archived ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full flex items-center gap-1.5 transition-all duration-300 shadow-sm",
                    filters.archived
                      ? "bg-slate-500 text-white font-medium"
                      : "border-slate-200 hover:bg-slate-50/30 text-slate-700 hover:text-slate-800 dark:border-slate-800 dark:hover:bg-slate-900/10 dark:text-slate-400 dark:hover:text-slate-300 font-medium"
                  )}
                  onClick={() => handleFilterToggle('archived')}
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Archived</span>
                </Button>

                <Button
                  variant={filters.shared ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full flex items-center gap-1.5 transition-all duration-300 shadow-sm",
                    filters.shared
                      ? "bg-blue-500 text-white font-medium"
                      : "border-blue-200 hover:bg-blue-50/30 text-blue-700 hover:text-blue-800 dark:border-blue-800 dark:hover:bg-blue-900/10 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  )}
                  onClick={() => handleFilterToggle('shared')}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Public</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={clearAllFilters}
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                <span>Showing {filteredJournals.length} journals</span>
              </p>

              <Button
                variant="default"
                size="sm"
                className="text-sm flex gap-1.5 items-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-300"
                onClick={handleCreateJournal}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>New Journal</span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          variants={fadeInUp}
          className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 flex gap-3 items-start"
        >
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-destructive mb-1">Error loading journals</h3>
            <p className="text-sm text-destructive/90">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJournals}
              className="mt-2 text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              Try Again
            </Button>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <motion.div variants={staggerContainer} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div key={i} variants={fadeInUp}>
                <JournalCardSkeleton />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : (
        <>
          {/* Empty State */}
          {journals.length === 0 ? (
            <motion.div variants={fadeInUp}>
              <EmptyState onCreateNew={handleCreateJournal} />
            </motion.div>
          ) : filteredJournals.length === 0 ? (
            <motion.div variants={fadeInUp}>
              <NoResultsState
                searchTerm={searchQuery}
                hasFilters={Object.values(filters).some(Boolean)}
                onClear={clearAllFilters}
              />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJournals.map((journal) => (
                <motion.div key={journal.id} variants={fadeInUp}>
                  <JournalCard
                    journal={journal}
                    onEdit={() => handleEditJournal(journal)}
                    onDelete={() => handleDeleteJournal(journal)}
                    onView={() => handleViewJournal(journal)}
                    onToggleFavorite={() => handleToggleFavorite(journal)}
                    onToggleArchive={() => handleToggleArchive(journal)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Journal Creation/Edit Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {journalToEdit ? (
              <>
                <Edit2 className="h-5 w-5 text-indigo-500" />
                Edit Journal
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5 text-indigo-500" />
                Create New Journal
              </>
            )}
          </DialogTitle>

          <JournalForm
            journal={journalToEdit || undefined}
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Journal Detail View */}
      <JournalDetailView
        journal={selectedJournal}
        isOpen={isDetailViewOpen}
        onClose={() => {
          setIsDetailViewOpen(false);
          setSelectedJournal(null);
          // Refresh journals list in case any changes were made
          fetchJournals();
        }}
        isLoading={isDetailLoading}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Delete Journal"
        message={journalToDelete ? `Are you sure you want to delete "${journalToDelete.title}"? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={isDeleting}
        onConfirm={confirmDeleteJournal}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </motion.div>
  );
};
