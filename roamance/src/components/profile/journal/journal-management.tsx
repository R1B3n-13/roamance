import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { journalService } from '@/service/journal-service';
import {
  JournalBrief,
  JournalCreateRequest,
  JournalDetail,
} from '@/types/journal';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Archive,
  BookHeart,
  BookOpen,
  Hourglass,
  Pencil,
  PlusCircle,
  Search,
  Share2,
  Star,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../../common/confirm-dialog';
import { EmptyState } from './empty-state';
import { JournalCard } from './journal-card';
import { JournalCardSkeleton } from './journal-card-skeleton';
import { JournalDetailView } from './journal-detail-view';
import { JournalForm } from './journal-form';
import { JournalSkeleton } from './journal-skeleton';
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
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Animation variants
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

  // Filters options
  const filters = [
    { id: 'all', label: 'All Journals', icon: BookOpen },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'archived', label: 'Archived', icon: Archive },
    { id: 'shared', label: 'Public', icon: Share2 },
  ];

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

  const handleFilterToggle = (filterId: string) => {
    setActiveFilter(activeFilter === filterId ? null : filterId);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setActiveFilter(null);
  };

  const handleViewJournal = async (journal: JournalBrief) => {
    // Open the dialog immediately
    setSelectedJournal(null);
    setIsDetailViewOpen(true);

    // Then fetch the data
    setIsDetailLoading(true);
    try {
      const journalDetails = await journalService.getJournalById(journal.id);
      setSelectedJournal(journalDetails);
    } catch (err: unknown) {
      console.error('Error fetching journal details:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load journal details. Please try again.';
      toast.error(errorMessage);
      // Close the dialog on error
      setIsDetailViewOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCreateJournal = () => {
    setJournalToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditJournal = async (journal: JournalBrief) => {
    // Open dialog immediately
    setJournalToEdit(null);
    setIsFormOpen(true);

    // Then fetch data
    setIsDetailLoading(true);
    try {
      const journalDetails = await journalService.getJournalById(journal.id);
      setJournalToEdit(journalDetails);
    } catch (err: unknown) {
      console.error('Error fetching journal details for edit:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load journal details for editing. Please try again.';
      toast.error(errorMessage);
      // Close form on error
      setIsFormOpen(false);
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
          j.id === journal.id ? { ...j, is_favorite: !journal.is_favorite } : j
        )
      );
      toast.success(
        journal.is_favorite ? 'Removed from favorites' : 'Added to favorites'
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
          j.id === journal.id ? { ...j, is_archived: !journal.is_archived } : j
        )
      );
      toast.success(
        journal.is_archived ? 'Journal unarchived' : 'Journal archived'
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
      const matchesSearch =
        !searchQuery ||
        journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Hide archived journals by default, but show them when 'All Journals' filter is selected
      if (journal.is_archived && activeFilter !== 'archived' && activeFilter !== 'all') {
        return false;
      }

      // Apply filter based on activeFilter
      if (!activeFilter || activeFilter === 'all') {
        return matchesSearch;
      } else if (activeFilter === 'favorites') {
        return matchesSearch && journal.is_favorite;
      } else if (activeFilter === 'archived') {
        return matchesSearch && journal.is_archived;
      } else if (activeFilter === 'shared') {
        return matchesSearch && journal.is_shared;
      }
      return matchesSearch;
    });
  }, [journals, searchQuery, activeFilter]);

  if (isLoading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md overflow-hidden pt-0">
            <div className="relative px-6 py-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet via-sunset to-forest opacity-80" />
              <div className="flex flex-col md:flex-row gap-4 items-stretch">
                <div className="relative flex-grow">
                  <Hourglass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-pulse" />
                  <div className="w-full h-10 bg-muted/20 animate-pulse rounded-md"></div>
                </div>

                <div className="flex gap-2 overflow-x-auto overflow-y-visible pb-3 pt-1 px-1 flex-wrap md:justify-end">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-28 bg-muted/20 animate-pulse rounded-full"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div key={i} variants={itemVariants}>
              <JournalCardSkeleton />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 relative"
    >
      {/* Decorative background elements */}
      <div className="absolute top-10 right-0 w-72 h-72 bg-gradient-radial from-indigo-500/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-gradient-radial from-purple-500/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute top-40 -left-20 w-64 h-64 bg-gradient-radial from-amber-500/5 to-transparent rounded-full blur-3xl -z-10" />

      {/* Search and Filters */}
      <motion.div variants={itemVariants}>
        <Card className="border-muted/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm shadow-md overflow-hidden py-0">
          <div className="relative px-6 py-6">
            {/* Decorative accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-light via-violet to-lavender opacity-80" />

            <div className="flex flex-col md:flex-row gap-4 items-stretch mb-4">
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
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-indigo-50/20 hover:text-indigo-500 rounded-full transition-colors duration-300"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto overflow-y-visible pb-1 pt-0.5 px-1 flex-wrap md:justify-end">
                {filters.map((filter) => {
                  // Determine color based on filter id
                  const getColorClass = () => {
                    if (filter.id === 'favorites')
                      return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium';
                    if (filter.id === 'archived')
                      return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white font-medium';
                    if (filter.id === 'shared')
                      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium';
                    return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium';
                  };

                  const getBorderColor = () => {
                    if (filter.id === 'favorites')
                      return 'border-amber-200 hover:bg-amber-50/30 text-amber-700 hover:text-amber-600 dark:border-amber-800 dark:hover:bg-amber-900/10 dark:text-amber-400 dark:hover:text-amber-300 font-medium';
                    if (filter.id === 'archived')
                      return 'border-slate-200 hover:bg-slate-50/30 text-slate-700 hover:text-slate-600 dark:border-slate-800 dark:hover:bg-slate-900/10 dark:text-slate-400 dark:hover:text-slate-300 font-medium';
                    if (filter.id === 'shared')
                      return 'border-blue-200 hover:bg-blue-50/30 text-blue-700 hover:text-blue-600 dark:border-blue-800 dark:hover:bg-blue-900/10 dark:text-blue-400 dark:hover:text-blue-300 font-medium';
                    return 'border-indigo-200 hover:bg-indigo-50/30 text-indigo-700 hover:text-indigo-600 dark:border-indigo-800 dark:hover:bg-indigo-900/10 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium';
                  };

                  return (
                    <motion.div
                      key={filter.id}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="z-10"
                    >
                      <Button
                        variant={
                          activeFilter === filter.id ? 'default' : 'outline'
                        }
                        size="sm"
                        className={cn(
                          'rounded-full flex items-center gap-1.5 transition-all duration-300 shadow-sm',
                          activeFilter === filter.id
                            ? getColorClass()
                            : getBorderColor()
                        )}
                        onClick={() => handleFilterToggle(filter.id)}
                      >
                        <filter.icon className="h-3.5 w-3.5" />
                        <span>{filter.label}</span>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Showing {filteredJournals.length} journals</span>
                </p>

                {activeFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-indigo-500 ml-3 h-7"
                    onClick={clearAllFilters}
                  >
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Clear filters
                  </Button>
                )}
              </div>

              <Button
                variant="default"
                size="sm"
                className="text-sm flex gap-1.5 items-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                onClick={handleCreateJournal}
              >
                <PlusCircle className="h-3.5 w-3.5 relative z-10" />
                <span className="relative z-10">New Journal</span>
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl bg-destructive/10 border border-destructive/30 p-5 flex gap-4 items-start"
        >
          <div className="bg-destructive/20 p-2 rounded-full">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          </div>
          <div>
            <h3 className="font-medium text-destructive mb-1">
              Error loading journals
            </h3>
            <p className="text-sm text-destructive/90 mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJournals}
              className="text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-full"
            >
              <Hourglass className="w-3.5 h-3.5 mr-1.5" />
              Try Again
            </Button>
          </div>
        </motion.div>
      )}

      {/* Journals Grid or Empty State */}
      {journals.length === 0 ? (
        <motion.div variants={itemVariants}>
          <EmptyState
            title="Your Journal Collection Awaits"
            description="Capture the magic of your adventures with beautifully crafted travel journals. Every journey deserves to be remembered."
            actionText="Create Your First Journal"
            onAction={handleCreateJournal}
            type="journal"
            icon="journal"
          />
        </motion.div>
      ) : filteredJournals.length === 0 ? (
        <motion.div variants={itemVariants}>
          <NoResultsState
            searchTerm={searchQuery}
            hasFilters={activeFilter !== null}
            onClear={clearAllFilters}
          />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJournals.map((journal, index) => (
            <motion.div
              key={journal.id}
              variants={itemVariants}
              custom={index}
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
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

      {/* Journal Creation/Edit Form */}
      {isDetailLoading ? (
        <JournalSkeleton
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
        />
      ) : (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-3xl p-0 rounded-xl overflow-hidden border-muted/30 shadow-xl bg-gradient-to-br from-background via-background/95 to-background/90">
            <div className="relative">
              <div className="absolute -left-20 -top-20 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -right-20 -bottom-10 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl"></div>

              <div className="px-6 py-4 border-b border-muted/20 backdrop-blur-md relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                  {journalToEdit ? (
                    <Pencil className="h-5 w-5 text-white" />
                  ) : (
                    <BookHeart className="h-5 w-5 text-white" />
                  )}
                </div>

                <DialogTitle className="flex flex-col gap-0.5 m-0 p-0">
                  <span className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {journalToEdit ? 'Edit Journal' : 'Create New Journal'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {journalToEdit
                      ? 'Update your travel memories'
                      : 'Document your adventures'}
                  </span>
                </DialogTitle>
              </div>
            </div>

            <JournalForm
              journal={journalToEdit || undefined}
              isOpen={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              onSubmit={handleFormSubmit}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      )}

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
        message={
          journalToDelete
            ? `Are you sure you want to delete "${journalToDelete.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={isDeleting}
        onConfirm={confirmDeleteJournal}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </motion.div>
  );
};
