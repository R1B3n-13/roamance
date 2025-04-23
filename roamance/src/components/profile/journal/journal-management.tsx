import { Button } from '@/components/ui/button';
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
import { journalService } from '@/service/journal-service';
import {
  JournalBrief,
  JournalCreateRequest,
  JournalDetail,
} from '@/types/journal';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Archive, BookOpen, Filter, PlusCircle, Search, Share2, Star, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ConfirmDialog } from '../../common/confirm-dialog';
import { JournalCard } from './journal-card';
import { JournalDetailView } from './journal-detail-view';
import { JournalForm } from './journal-form';

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
  const [isDetailLoading, setIsDetailLoading] = useState(false); // New state for journal detail loading
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
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage || 'Failed to load journals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJournal = () => {
    setJournalToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditJournal = async (journal: JournalBrief) => {
    try {
      setIsLoading(true);
      const journalDetail = await journalService.getJournalById(journal.id);
      setJournalToEdit(journalDetail);
      setIsFormOpen(true);
    } catch (err: unknown) {
      console.error('Error fetching journal details:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(
        errorMessage || 'Failed to load journal details. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewJournal = async (journal: JournalBrief) => {
    try {
      setIsDetailLoading(true); // Use separate loading state for detail view
      // Open the detail view immediately with loading state
      setIsDetailViewOpen(true);

      const journalDetail = await journalService.getJournalById(journal.id);
      setSelectedJournal(journalDetail);
    } catch (err: unknown) {
      console.error('Error fetching journal details:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(
        errorMessage || 'Failed to load journal details. Please try again.'
      );
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

      // Update the local state
      setJournals(journals.filter((j) => j.id !== journalToDelete.id));

      // Close the dialog
      setIsConfirmDeleteOpen(false);
      setJournalToDelete(null);
    } catch (err: unknown) {
      console.error('Error deleting journal:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage || 'Failed to delete journal. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitJournal = async (journalData: JournalCreateRequest) => {
    setIsSubmitting(true);

    try {
      let updatedJournal: JournalBrief;

      if (journalToEdit) {
        // Update existing journal
        updatedJournal = await journalService.updateJournal(
          journalToEdit.id,
          journalData
        );

        // Update journals list
        setJournals((prevJournals) =>
          prevJournals.map((j) =>
            j.id === updatedJournal.id ? updatedJournal : j
          )
        );
      } else {
        // Create new journal
        const newJournal = await journalService.createJournal(journalData);

        // Add to journals list
        setJournals((prevJournals) => [...prevJournals, newJournal]);
      }
      // Close the form
      setIsFormOpen(false);
      setJournalToEdit(null);
    } catch (err: unknown) {
      console.error('Error saving journal:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage || 'Failed to save journal. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = async (journal: JournalBrief) => {
    try {
      const updatedJournal = await journalService.updateJournal(journal.id, {
        ...journal,
        is_favorite: !journal.is_favorite,
      });

      // Update journals list
      setJournals((prevJournals) =>
        prevJournals.map((j) =>
          j.id === updatedJournal.id ? updatedJournal : j
        )
      );
    } catch (err: unknown) {
      console.error('Error updating favorite status:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage || 'Failed to update journal. Please try again.');
    }
  };

  const handleToggleArchive = async (journal: JournalBrief) => {
    try {
      const updatedJournal = await journalService.updateJournal(journal.id, {
        ...journal,
        is_archived: !journal.is_archived,
      });

      // Update journals list
      setJournals((prevJournals) =>
        prevJournals.map((j) =>
          j.id === updatedJournal.id ? updatedJournal : j
        )
      );
    } catch (err: unknown) {
      console.error('Error updating archive status:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage || 'Failed to update journal. Please try again.');
    }
  };

  // Filter journals based on search query and filter options
  const filteredJournals = journals
    .filter((journal) => {
      // Apply filter options
      if (filters.favorites && !journal.is_favorite) return false;
      if (filters.archived && !journal.is_archived) return false;
      if (filters.shared && !journal.is_shared) return false;

      // Apply search query
      if (searchQuery.trim() === '') return true;

      return (
        journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  return (
    <div className="space-y-8">
      {/* Header section with subtle background glow */}
      <div className="relative rounded-2xl p-6 bg-gradient-to-r from-background/80 via-background/60 to-background/80 backdrop-blur-sm border border-muted/30 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-blue-500/5 rounded-2xl -z-10"></div>
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

        {/* Gradient line consistent with other tabs */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 opacity-80" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              My Travel Journals
            </h2>
            <p className="text-muted-foreground mt-1.5">
              Document and revisit your memorable travel experiences
            </p>
          </div>

          <Button
            onClick={handleCreateJournal}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 border-none"
            size="sm"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Journal
          </Button>
        </div>

        {/* Search section with filter button */}
        <div className="relative mt-6 flex items-center max-w-xl">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              placeholder="Search your journals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/60 backdrop-blur-sm border-muted/40 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all duration-300 pr-4"
            />
          </div>

          {/* Filter dropdown using Shadcn's DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`ml-2 h-10 w-10 border-muted/40 ${
                  (filters.favorites || filters.archived || filters.shared)
                    ? 'text-indigo-600 border-indigo-300 dark:border-indigo-700'
                    : ''
                }`}
                aria-label="Filter journals"
              >
                <Filter className="h-4 w-4" />
                {(filters.favorites || filters.archived || filters.shared) && (
                  <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Filter Journals</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters.favorites}
                onCheckedChange={(checked) =>
                  setFilters({...filters, favorites: checked})
                }
              >
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>Favorites</span>
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.archived}
                onCheckedChange={(checked) =>
                  setFilters({...filters, archived: checked})
                }
              >
                <div className="flex items-center">
                  <Archive className="h-4 w-4 text-blue-500 mr-2" />
                  <span>Archived</span>
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.shared}
                onCheckedChange={(checked) =>
                  setFilters({...filters, shared: checked})
                }
              >
                <div className="flex items-center">
                  <Share2 className="h-4 w-4 text-green-500 mr-2" />
                  <span>Shared</span>
                </div>
              </DropdownMenuCheckboxItem>
              {(filters.favorites || filters.archived || filters.shared) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setFilters({favorites: false, archived: false, shared: false})}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    <span>Clear all filters</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-lg bg-destructive/10 border border-destructive/20 p-4"
          >
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journals grid with staggered animations */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-muted/20 border-t-indigo-600 animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600/10"></div>
          </div>
          <span className="mt-4 text-muted-foreground font-medium">
            Loading your journals...
          </span>
        </div>
      ) : filteredJournals.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredJournals.map((journal) => (
            <motion.div key={journal.id} variants={fadeInUp}>
              <JournalCard
                journal={journal}
                onEdit={handleEditJournal}
                onDelete={handleDeleteJournal}
                onView={handleViewJournal}
                onToggleFavorite={handleToggleFavorite}
                onToggleArchive={handleToggleArchive}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="rounded-2xl bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm border border-muted/30 p-12 text-center"
        >
          <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-indigo-500/70" />
          </div>

          {searchQuery.trim() !== '' ? (
            <>
              <h3 className="text-xl font-medium text-foreground mb-2">
                No matching journals
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We couldn&apos;t find any journals matching your search criteria. Try
                a different search term or clear your search.
              </p>
              <Button
                onClick={() => setSearchQuery('')}
                variant="outline"
                className="mt-6 border-indigo-500/30 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              >
                Clear search
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium text-foreground mb-2">
                Your journal collection is empty
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start documenting your travel experiences by creating your first
                journal.
              </p>
              <Button
                onClick={handleCreateJournal}
                className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 border-none"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create your first journal
              </Button>
            </>
          )}
        </motion.div>
      )}

      {/* Journal Form Modal */}
      <JournalForm
        journal={journalToEdit || undefined}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitJournal}
        isLoading={isSubmitting}
      />

      {/* Journal Detail View */}
      {(isDetailLoading || selectedJournal) && (
        <JournalDetailView
          journal={selectedJournal}
          isOpen={isDetailViewOpen}
          onClose={() => setIsDetailViewOpen(false)}
          isLoading={isDetailLoading}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Delete Journal"
        message={`Are you sure you want to delete "${journalToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={isDeleting}
        onConfirm={confirmDeleteJournal}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </div>
  );
};
