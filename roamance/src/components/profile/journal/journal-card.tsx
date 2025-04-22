import { cn } from '@/lib/utils';
import { JournalBrief } from '@/types/journal';
import { formatRelativeTime } from '@/utils/format';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Clock, Edit, MapPin, MoreVertical, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface JournalCardProps {
  journal: JournalBrief;
  onEdit: (journal: JournalBrief) => void;
  onDelete: (journal: JournalBrief) => void;
  onView: (journal: JournalBrief) => void;
}

export const JournalCard: React.FC<JournalCardProps> = ({
  journal,
  onEdit,
  onDelete,
  onView,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click when clicking on the options menu
    if (!(e.target as Element).closest('.journal-options')) {
      onView(journal);
    }
  };

  // Determine a visually appealing background gradient based on journal title
  const getGradient = () => {
    // Simple hash function to generate consistent color based on journal title
    const hash = journal.title.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const gradients = [
      'from-indigo-500/80 to-purple-500/80',
      'from-blue-500/80 to-indigo-500/80',
      'from-sky-500/80 to-blue-500/80',
      'from-cyan-500/80 to-sky-500/80',
      'from-teal-500/80 to-cyan-500/80',
      'from-emerald-500/80 to-teal-500/80',
      'from-purple-500/80 to-pink-500/80',
      'from-violet-500/80 to-purple-500/80',
    ];

    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      transition={{ duration: 0.3 }}
      className="group relative h-full flex flex-col rounded-xl overflow-hidden bg-background/80 backdrop-blur-sm border border-muted/30 shadow-sm hover:shadow-lg hover:border-muted/50 transition-all duration-300"
    >
      {/* Card header with gradient */}
      <div className={cn("h-24 relative", getGradient())}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>

        {/* Options button */}
        <div className="absolute top-3 right-3 z-20 journal-options" ref={optionsRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions(!showOptions);
            }}
            className="p-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
            aria-label="Journal options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg z-30 border border-muted/40 overflow-hidden"
              >
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(journal);
                      setShowOptions(false);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(journal);
                      setShowOptions(false);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2 text-amber-500" />
                    Edit Journal
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(journal);
                      setShowOptions(false);
                    }}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Journal
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Journal title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10 flex items-end">
          <h3 className="text-lg font-semibold text-white truncate drop-shadow-sm">
            {journal.title}
          </h3>
        </div>
      </div>

      {/* Card content */}
      <div
        onClick={handleCardClick}
        className="flex-1 p-4 flex flex-col cursor-pointer"
      >
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {journal.description}
        </p>

        <div className="mt-4 pt-3 border-t border-muted/20 flex flex-col gap-2">
          {journal.destination && (
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center mr-2 flex-shrink-0">
                <MapPin className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="truncate">
                {journal.destination ? `${journal.destination.latitude.toFixed(2)}, ${journal.destination.longitude.toFixed(2)}` : 'No location'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mr-2 flex-shrink-0">
                <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              </div>
              <span>{formatRelativeTime(new Date(journal.audit.created_at))}</span>
            </div>

            <div className="ml-auto">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                {journal.total_subsections} {journal.total_subsections === 1 ? 'section' : 'sections'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
