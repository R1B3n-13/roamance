import React from 'react';
import { PlusCircle, BookOpen, Calendar, MapPin, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { JournalBrief } from '@/types/journal';
import { formatDate } from '@/utils/format';

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
  const [showOptions, setShowOptions] = React.useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{journal.title}</h3>
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onView(journal);
                      setShowOptions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      onEdit(journal);
                      setShowOptions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(journal);
                      setShowOptions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
          {journal.description}
        </p>

        <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center mr-4">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{journal.destination ? `${journal.destination.latitude.toFixed(2)}, ${journal.destination.longitude.toFixed(2)}` : 'No location'}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatDate(journal.audit.created_at)}</span>
          </div>
        </div>

        <div className="mt-2 flex items-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {journal.total_subsections} sections
          </span>
        </div>
      </div>
    </motion.div>
  );
};
