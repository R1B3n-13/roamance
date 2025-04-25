import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Filter, Search, X } from 'lucide-react';
import React from 'react';

interface NoResultsStateProps {
  searchTerm: string;
  hasFilters: boolean;
  onClear: () => void;
}

export const NoResultsState: React.FC<NoResultsStateProps> = ({
  searchTerm,
  hasFilters,
  onClear,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-14 border rounded-xl border-dashed border-muted/50 text-center px-4 bg-muted/5 backdrop-blur-sm"
    >
      <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
        {searchTerm ? (
          <Search className="h-8 w-8 text-indigo-500 text-opacity-60" />
        ) : (
          <Filter className="h-8 w-8 text-indigo-500 text-opacity-60" />
        )}
      </div>

      <h3 className="text-xl font-medium mb-2">No matching journals found</h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        {searchTerm
          ? `No journals match your search "${searchTerm}"`
          : "No journals match the current filters"}
        {hasFilters && searchTerm && " and the selected filters"}
        {hasFilters && !searchTerm && ". Try removing some filters to see more results."}
        {!hasFilters && searchTerm && ". Try a different search term."}
      </p>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={onClear}
          variant="outline"
          className="flex items-center gap-2 border-indigo-200 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-300"
        >
          <X className="h-4 w-4" />
          Clear {searchTerm && hasFilters ? "search and filters" : searchTerm ? "search" : "filters"}
        </Button>
      </motion.div>
    </motion.div>
  );
};
