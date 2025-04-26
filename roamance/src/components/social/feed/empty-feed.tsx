'use client';

import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmptyFeed = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-20 px-6 rounded-3xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border border-purple-100 dark:border-purple-800/30 shadow-sm"
    >
      <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-white dark:bg-gray-800 shadow-md mb-6">
        <Sparkles className="h-10 w-10 text-purple-500 dark:text-purple-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">Share Your Journey</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
        Be the first to share your travel moments and inspire fellow adventurers around the world.
      </p>
      <button className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all">
        Create Your First Post
      </button>
    </motion.div>
  );
};
