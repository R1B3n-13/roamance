import { cn } from '@/lib/utils';
import { JournalBrief } from '@/types/journal';
import { formatRelativeTime } from '@/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Edit,
  MapPin,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { getJournalColorScheme } from './colorscheme';

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
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
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

  // Get consistent color scheme based on journal title
  const colorScheme = getJournalColorScheme(journal.title);

  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow:
          '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }}
      transition={{ duration: 0.3 }}
      className="group relative h-full flex flex-col rounded-xl overflow-hidden bg-background/80 backdrop-blur-sm border border-muted/30 shadow-sm hover:shadow-lg hover:border-muted/50 transition-all duration-300"
    >
      {/* Card header with gradient */}
      <div
        className={cn('h-24 relative bg-gradient-to-r', colorScheme.gradient)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>

        {/* Options button */}
        <div
          className="absolute top-3 right-3 z-20 journal-options"
          ref={optionsRef}
        >
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
                    <BookOpen className="w-4 h-4 mr-2 text-violet" />
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
                    <Edit className="w-4 h-4 mr-2 text-sunset" />
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
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0',
                  colorScheme.bg,
                  colorScheme.bgDark
                )}
              >
                <MapPin
                  className={cn(
                    'w-3 h-3',
                    colorScheme.icon,
                    colorScheme.iconDark
                  )}
                />
              </div>
              <span className="truncate">
                {journal.destination
                  ? `${journal.destination.latitude.toFixed(2)}, ${journal.destination.longitude.toFixed(2)}`
                  : 'No location'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0',
                  'bg-sunset-light/20 dark:bg-sunset-dark/20'
                )}
              >
                <Clock className="w-3 h-3 text-sunset dark:text-sunset-light" />
              </div>
              <span>
                {formatRelativeTime(new Date(journal.audit.created_at))}
              </span>
            </div>

            <div className="ml-auto">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                  colorScheme.badge,
                  colorScheme.badgeDark
                )}
              >
                {journal.total_subsections}{' '}
                {journal.total_subsections === 1 ? 'section' : 'sections'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
