import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Filter, RotateCcw, Search, X } from 'lucide-react';
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
      transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 20 }}
      className="flex flex-col items-center justify-center py-14 md:py-16 border-2 rounded-xl border-dashed border-slate-200/80 dark:border-slate-800/80 text-center px-8 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-indigo-500/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-purple-500/10 to-transparent" />

        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-40">
          {Array.from({ length: 8 }).map((_, rowIndex) =>
            Array.from({ length: 8 }).map((_, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="flex items-center justify-center"
              >
                {searchTerm ? (
                  <Search className="w-6 h-6 text-slate-800/5 dark:text-slate-200/5" />
                ) : (
                  <Filter className="w-6 h-6 text-slate-800/5 dark:text-slate-200/5" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="relative z-10 max-w-md">
        <div className="mb-6">
          <motion.div
            className="relative w-24 h-24 mx-auto mb-4"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            {/* Animated glowing background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-full animate-pulse"></div>

            {/* Pulsing rings */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-300/60 dark:border-indigo-700/60"
              animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.4, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute inset-0 rounded-full border border-purple-300/40 dark:border-purple-700/40"
              animate={{ scale: [0.8, 1, 0.8], opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />

            {/* Main icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {searchTerm ? (
                <div className="relative">
                  <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: [0, -10, 0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  >
                    <Search className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
                  </motion.div>

                  {/* Small "no results" indicator */}
                  <motion.div
                    className="absolute -right-2 -bottom-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-700"
                    animate={{
                      scale: [1, 1.1, 1],
                      y: [0, -2, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    <X className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  </motion.div>
                </div>
              ) : (
                <div className="relative">
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, 10, 0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  >
                    <Filter className="h-10 w-10 text-purple-500 dark:text-purple-400" />
                  </motion.div>

                  {/* Small reset indicator */}
                  <motion.div
                    className="absolute -right-2 -bottom-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-700"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 180, 360]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  >
                    <RotateCcw className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.h3
            className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            No Matching Journals Found
          </motion.h3>

          <motion.p
            className="text-slate-600 dark:text-slate-300 max-w-sm mx-auto mb-8 text-base leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {searchTerm
              ? `We couldn't find any journals that match "${searchTerm}"`
              : "No journals match the current filters"}
            {hasFilters && searchTerm && " with the applied filters"}
            {hasFilters && !searchTerm && ". Try adjusting or removing some filters to see more results."}
            {!hasFilters && searchTerm && ". Try a different search term or check your spelling."}
          </motion.p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={onClear}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 px-5 py-4 h-auto text-sm font-medium rounded-xl"
          >
            <X className="h-4 w-4" />
            Clear {searchTerm && hasFilters ? "All Filters & Search" : searchTerm ? "Search Term" : "All Filters"}
          </Button>
        </motion.div>

        {/* Suggestion section */}
        {searchTerm && (
          <motion.div
            className="mt-8 pt-8 border-t border-slate-200/50 dark:border-slate-800/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4">
              Try searching for:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Travel", "Vacation", "Adventure", "Trip", "Journey"].map((suggestion, index) => (
                <motion.div
                  key={suggestion}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm hover:shadow px-3 py-1 h-auto"
                    onClick={() => {
                      // This is just a visual suggestion, we'll let the parent component handle the actual logic
                      onClear();
                    }}
                  >
                    {suggestion}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
