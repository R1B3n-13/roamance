import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalBrief } from '@/types/journal';
import { JournalCard } from './journal-card';
import { EmptyState } from './empty-state';
import { Button } from '@/components/ui/button';
import { Archive, ArchiveX, Hourglass, Laptop, Plus, Search, Star, StarOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface JournalGridProps {
  journals: JournalBrief[];
  onCreateNew: () => void;
  onEdit: (journal: JournalBrief) => void;
  onDelete: (journal: JournalBrief) => void;
  onView: (journal: JournalBrief) => void;
  onToggleFavorite: (journal: JournalBrief) => void;
  onToggleArchive: (journal: JournalBrief) => void;
}

type FilterView = 'all' | 'favorites' | 'archived';

export const JournalGrid: React.FC<JournalGridProps> = ({
  journals,
  onCreateNew,
  onEdit,
  onDelete,
  onView,
  onToggleFavorite,
  onToggleArchive,
}) => {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<FilterView>('all');
  const [currentSort, setCurrentSort] = useState<'recent' | 'oldest' | 'alphabetical'>('recent');

  // Sort function for journals
  const sortJournals = (a: JournalBrief, b: JournalBrief) => {
    switch (currentSort) {
      case 'oldest':
        return new Date(a.audit.created_at).getTime() - new Date(b.audit.created_at).getTime();
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default: // recent
        return new Date(b.audit.created_at).getTime() - new Date(a.audit.created_at).getTime();
    }
  };

  // Filter function for journals
  const filteredJournals = journals.filter((journal) => {
    const matchesSearch = journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (journal.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    switch (currentView) {
      case 'favorites':
        return matchesSearch && journal.is_favorite;
      case 'archived':
        return matchesSearch && journal.is_archived;
      default: // all
        return matchesSearch && !journal.is_archived;
    }
  }).sort(sortJournals);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  // Get appropriate empty state type based on current view
  const getEmptyStateType = (): 'journal' | 'archived' | 'favorite' => {
    switch (currentView) {
      case 'favorites':
        return 'favorite';
      case 'archived':
        return 'archived';
      default:
        return 'journal';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            type="text"
            placeholder="Search journals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-64 lg:w-80 bg-white dark:bg-slate-950 rounded-lg border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="flex items-center gap-x-4 flex-wrap gap-y-2">
          {/* View Filter */}
          <Tabs
            defaultValue="all"
            value={currentView}
            onValueChange={(value) => setCurrentView(value as FilterView)}
            className="w-fit"
          >
            <TabsList className="grid grid-cols-3 w-fit">
              <TabsTrigger value="all" className="flex items-center gap-x-1.5">
                <Laptop className="h-3.5 w-3.5" />
                <span>All</span>
                {currentView === 'all' && journals.filter(j => !j.is_archived).length > 0 && (
                  <Badge variant="outline" className="ml-1 px-1.5 h-5 bg-slate-100 dark:bg-slate-800 border-none">
                    {journals.filter(j => !j.is_archived).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-x-1.5">
                <Star className="h-3.5 w-3.5" />
                <span>Favorites</span>
                {currentView === 'favorites' && journals.filter(j => j.is_favorite).length > 0 && (
                  <Badge variant="outline" className="ml-1 px-1.5 h-5 bg-slate-100 dark:bg-slate-800 border-none">
                    {journals.filter(j => j.is_favorite).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex items-center gap-x-1.5">
                <Archive className="h-3.5 w-3.5" />
                <span>Archived</span>
                {currentView === 'archived' && journals.filter(j => j.is_archived).length > 0 && (
                  <Badge variant="outline" className="ml-1 px-1.5 h-5 bg-slate-100 dark:bg-slate-800 border-none">
                    {journals.filter(j => j.is_archived).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sort Controls */}
          <ToggleGroup
            type="single"
            value={currentSort}
            onValueChange={(value) => value && setCurrentSort(value as 'recent' | 'oldest' | 'alphabetical')}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5"
          >
            <ToggleGroupItem value="recent" className="text-xs px-2.5 py-1 h-8 data-[state=on]:bg-slate-100 dark:data-[state=on]:bg-slate-800 rounded">Recent</ToggleGroupItem>
            <ToggleGroupItem value="oldest" className="text-xs px-2.5 py-1 h-8 data-[state=on]:bg-slate-100 dark:data-[state=on]:bg-slate-800 rounded">Oldest</ToggleGroupItem>
            <ToggleGroupItem value="alphabetical" className="text-xs px-2.5 py-1 h-8 data-[state=on]:bg-slate-100 dark:data-[state=on]:bg-slate-800 rounded">A-Z</ToggleGroupItem>
          </ToggleGroup>

          {/* Add New Button */}
          <Button
            onClick={onCreateNew}
            className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Journal
          </Button>
        </div>
      </div>

      {/* Results summary */}
      {filteredJournals.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredJournals.length} {filteredJournals.length === 1 ? 'journal' : 'journals'}
            {searchTerm && ` matching "${searchTerm}"`}
            {currentView !== 'all' && ` in ${currentView}`}
          </p>

          {/* Current view actions */}
          {currentView === 'favorites' && filteredJournals.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-1.5"
              onClick={() => {
                filteredJournals.forEach(journal => {
                  onToggleFavorite(journal);
                });
              }}
            >
              <StarOff className="h-3.5 w-3.5" />
              <span>Unfavorite All</span>
            </Button>
          )}

          {currentView === 'archived' && filteredJournals.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-1.5"
              onClick={() => {
                filteredJournals.forEach(journal => {
                  onToggleArchive(journal);
                });
              }}
            >
              <ArchiveX className="h-3.5 w-3.5" />
              <span>Unarchive All</span>
            </Button>
          )}
        </div>
      )}

      {/* Journals Grid with Empty State */}
      {filteredJournals.length === 0 ? (
        <EmptyState
          onCreateNew={onCreateNew}
          type={getEmptyStateType()}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10"
        >
          <AnimatePresence>
            {filteredJournals.map((journal) => (
              <motion.div
                key={journal.id}
                variants={itemVariants}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <JournalCard
                  journal={journal}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                  onToggleFavorite={onToggleFavorite}
                  onToggleArchive={onToggleArchive}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty search results but has journals */}
      {filteredJournals.length === 0 && journals.length > 0 && searchTerm && (
        <div className="text-center py-10">
          <Hourglass className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">No journals found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            We couldn't find any journals matching "{searchTerm}". Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
};
