import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import React from 'react';
import { JourneyPathAnimation } from './journey-path-animation';

interface EmptyStateProps {
  onCreateNew: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateNew }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 border rounded-xl border-dashed border-muted/50 text-center px-4 bg-muted/5 backdrop-blur-sm relative overflow-hidden"
    >
      {/* Decorative gradient background */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-radial from-indigo-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-radial from-purple-500/5 via-indigo-500/5 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="absolute top-0 left-1/4 -translate-x-2/4 -translate-2/4">
          <JourneyPathAnimation color="indigo" size="lg" />
        </div>

        <div className="relative z-10 flex flex-col gap-2">
          <h3 className="text-xl font-medium mb-3">No Journals Yet</h3>
          <p className="text-muted-foreground max-w-sm mb-8 text-[13px]">
            Start documenting your travel experiences by creating your first
            journal. Add places, notes, photos, and more to remember every
            detail of your adventures.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center"
          >
            <Button
              onClick={onCreateNew}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4" />
              Create Your First Journal
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
