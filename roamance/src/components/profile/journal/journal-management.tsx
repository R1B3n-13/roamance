import React, { useState, useEffect } from 'react';
import { PlusCircle, BookOpen, Search, Loader2 } from 'lucide-react';
import { JournalBrief, JournalCreateRequest, JournalDetail } from '@/types/journal';
import { journalService } from '@/service/journal-service';
import { JournalCard } from './journal-card';
import { JournalForm } from './journal-form';
import { JournalDetailView } from './journal-detail-view';
import { ConfirmDialog } from '../../common/confirm-dialog';
import { motion } from 'framer-motion';

export const JournalManagement: React.FC = () => {
  const [journals, setJournals] = useState<JournalBrief[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<JournalDetail | null>(null);
  const [journalToDelete, setJournalToDelete] = useState<JournalBrief | null>(null);
  const [journalToEdit, setJournalToEdit] = useState<JournalDetail | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      console.error('Error fetching journals:', err);
      setError(err.message || 'Failed to load journals. Please try again.');
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
    } catch (err: any) {
      console.error('Error fetching journal details:', err);
      setError(err.message || 'Failed to load journal details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewJournal = async (journal: JournalBrief) => {
    try {
      setIsLoading(true);
      const journalDetail = await journalService.getJournalById(journal.id);
      setSelectedJournal(journalDetail);
      setIsDetailViewOpen(true);
    } catch (err: any) {
      console.error('Error fetching journal details:', err);
      setError(err.message || 'Failed to load journal details. Please try again.');
    } finally {
      setIsLoading(false);
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
      setJournals(journals.filter(j => j.id !== journalToDelete.id));

      // Close the dialog
      setIsConfirmDeleteOpen(false);
      setJournalToDelete(null);
    } catch (err: any) {
      console.error('Error deleting journal:', err);
      setError(err.message || 'Failed to delete journal. Please try again.');
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
        updatedJournal = await journalService.updateJournal(journalToEdit.id, journalData);

        // Update journals list
        setJournals(prevJournals =>
          prevJournals.map(j => j.id === updatedJournal.id ? updatedJournal : j)
        );
      } else {
        // Create new journal
        const newJournal = await journalService.createJournal(journalData);

        // Add to journals list
        setJournals(prevJournals => [...prevJournals, newJournal]);
      }

      // Close the form
      setIsFormOpen(false);
      setJournalToEdit(null);
    } catch (err: any) {
      console.error('Error saving journal:', err);
      setError(err.message || 'Failed to save journal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter journals based on search query
  const filteredJournals = searchQuery.trim() === ''
    ? journals
    : journals.filter(journal =>
        journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Travel Journals
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and manage your travel experiences
          </p>
        </div>

        <button
          onClick={handleCreateJournal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          New Journal
        </button>
      </div>

      {/* Search section */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search journals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-800/50"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Journals grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading journals...</span>
        </div>
      ) : filteredJournals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJournals.map((journal) => (
            <JournalCard
              key={journal.id}
              journal={journal}
              onEdit={handleEditJournal}
              onDelete={handleDeleteJournal}
              onView={handleViewJournal}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-12 text-center"
        >
          {searchQuery.trim() !== '' ? (
            <>
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No matching journals</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                We couldn't find any journals matching your search. Try a different search term.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No journals yet</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Get started by creating your first travel journal.
              </p>
              <button
                onClick={handleCreateJournal}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Journal
              </button>
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
      {selectedJournal && (
        <JournalDetailView
          journal={selectedJournal}
          isOpen={isDetailViewOpen}
          onClose={() => setIsDetailViewOpen(false)}
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
