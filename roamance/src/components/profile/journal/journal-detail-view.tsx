import React from 'react';
import { ArrowLeft, Calendar, MapPin, Route, Activity, Eye, X } from 'lucide-react';
import { JournalDetail } from '@/types/journal';
import { SubsectionType } from '@/types/subsection';
import { formatDate } from '@/utils/format';

interface JournalDetailViewProps {
  journal: JournalDetail;
  isOpen: boolean;
  onClose: () => void;
}

export const JournalDetailView: React.FC<JournalDetailViewProps> = ({
  journal,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const getSubsectionIcon = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return <Eye className="w-4 h-4 mr-2" />;
      case SubsectionType.ACTIVITY:
        return <Activity className="w-4 h-4 mr-2" />;
      case SubsectionType.ROUTE:
        return <Route className="w-4 h-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {journal.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Journal Info */}
          <div className="mb-6">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>
                {journal.destination
                  ? `${journal.destination.latitude.toFixed(4)}, ${journal.destination.longitude.toFixed(4)}`
                  : 'No location'}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Created on {formatDate(journal.audit.created_at)}</span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mt-2">
              {journal.description}
            </p>
          </div>

          {/* Subsections */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Journal Sections
            </h3>

            {journal.subsections && journal.subsections.length > 0 ? (
              <div className="space-y-4">
                {journal.subsections.map((subsection) => (
                  <div
                    key={subsection.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center mb-2">
                      {getSubsectionIcon(subsection.type)}
                      <h4 className="font-medium text-gray-900 dark:text-white">{subsection.title}</h4>
                      <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {subsection.type}
                      </span>
                    </div>

                    {/* Subsection content differs based on type */}
                    {subsection.type === SubsectionType.SIGHTSEEING && (
                      <div className="mt-2">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>
                            Location: {(subsection as any).location
                              ? `${(subsection as any).location.latitude.toFixed(4)}, ${(subsection as any).location.longitude.toFixed(4)}`
                              : 'No location'}
                          </span>
                        </div>
                      </div>
                    )}

                    {subsection.type === SubsectionType.ACTIVITY && (
                      <div className="mt-2">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <Activity className="w-3 h-3 mr-1" />
                          <span>
                            Activity: {(subsection as any).activity_name || 'Unnamed activity'}
                          </span>
                        </div>
                      </div>
                    )}

                    {subsection.type === SubsectionType.ROUTE && (
                      <div className="mt-2">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <Route className="w-3 h-3 mr-1" />
                          <span>
                            Distance: {(subsection as any).total_distance || 0} km |
                            Time: {(subsection as any).total_time || 0} min
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {subsection.notes && subsection.notes.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes:</h5>
                        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {subsection.notes.map((note, index) => (
                            <li key={index}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Checklists */}
                    {subsection.checklists && subsection.checklists.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Checklist:</h5>
                        <ul className="space-y-1">
                          {subsection.checklists.map((item, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                              <input
                                type="checkbox"
                                className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                readOnly
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No sections added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
