'use client';

import { Bookmark, Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SaveNotificationProps {
  show: boolean;
  isSaved: boolean;
  onHide: () => void;
}

export const SaveNotification = ({ show, isSaved, onHide }: SaveNotificationProps) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onHide();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-xl border border-purple-200/50 dark:border-purple-800/30 flex items-center gap-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative h-12 w-12 flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/60 dark:to-indigo-900/60 rounded-xl shadow-inner"
          >
            {isSaved ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
              >
                <Bookmark className="h-6 w-6 fill-purple-500 text-purple-500 dark:fill-purple-400 dark:text-purple-400" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
              >
                <Check className="h-6 w-6 text-purple-500 dark:text-purple-400" />
              </motion.div>
            )}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
              className="absolute inset-0 bg-gradient-to-br from-purple-200/50 to-indigo-200/50 dark:from-purple-500/30 dark:to-indigo-500/30 rounded-xl blur-md -z-10"
            />
          </motion.div>

          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="font-semibold text-base text-gray-800 dark:text-gray-200"
            >
              {isSaved ? "Saved to your collection" : "Removed from collection"}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {isSaved
                ? "You can find this post in your saved items"
                : "This post has been removed from your saved items"}
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onHide}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
          >
            <X className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
