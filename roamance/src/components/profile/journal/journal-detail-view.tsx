import React, { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Route, Activity, Eye, X, ChevronDown, ChevronUp, Clock, Map, CheckCircle2, Circle } from 'lucide-react';
import { JournalDetail } from '@/types/journal';
import { SubsectionType } from '@/types/subsection';
import { formatDate } from '@/utils/format';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [activeSubsection, setActiveSubsection] = useState<string | null>(
    journal.subsections.length > 0 ? journal.subsections[0].id : null
  );
  const [showMap, setShowMap] = useState(false);

  if (!isOpen) return null;

  // Extract destination name, travel dates, and cover image from description (if available)
  let destinationName = '';
  let travelDates = '';
  let coverImage = '';

  const descriptionLines = journal.description.split('\n');
  for (const line of descriptionLines) {
    if (line.startsWith('Destination:')) {
      destinationName = line.replace('Destination:', '').trim();
    } else if (line.startsWith('Travel Dates:')) {
      travelDates = line.replace('Travel Dates:', '').trim();
    } else if (line.startsWith('Cover Image:')) {
      coverImage = line.replace('Cover Image:', '').trim();
    }
  }

  // Clean description (remove metadata lines)
  const cleanDescription = descriptionLines
    .filter(line => !line.startsWith('Destination:') && !line.startsWith('Travel Dates:') && !line.startsWith('Cover Image:'))
    .join('\n');

  const getSubsectionIcon = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return <Eye className="w-5 h-5" />;
      case SubsectionType.ACTIVITY:
        return <Activity className="w-5 h-5" />;
      case SubsectionType.ROUTE:
        return <Route className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return 'from-blue-500 to-indigo-600 text-white';
      case SubsectionType.ACTIVITY:
        return 'from-amber-500 to-orange-600 text-white';
      case SubsectionType.ROUTE:
        return 'from-emerald-500 to-green-600 text-white';
      default:
        return 'from-gray-500 to-gray-600 text-white';
    }
  };

  const toggleSubsection = (id: string) => {
    setActiveSubsection(currentId => (currentId === id ? null : id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Journal Header with Cover Image */}
        <div className="relative">
          {coverImage ? (
            <div className="relative h-48 md:h-64 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
              <img
                src={coverImage}
                alt={journal.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/roamance-logo-bg.png';
                }}
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 z-20 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-bold text-white leading-tight"
                >
                  {journal.title}
                </motion.h2>
                {destinationName && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center mt-2 text-white/90"
                  >
                    <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="text-sm md:text-base">{destinationName}</span>
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-bold text-white"
              >
                {journal.title}
              </motion.h2>
              {destinationName && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center mt-2 text-white/90"
                >
                  <MapPin className="w-4 h-4 mr-1.5" />
                  <span>{destinationName}</span>
                </motion.div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Journal Info */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                  <Map className="w-4 h-4 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                  <span>
                    {journal.destination
                      ? `${journal.destination.latitude.toFixed(4)}, ${journal.destination.longitude.toFixed(4)}`
                      : 'No location'}
                  </span>
                </div>
                <div className="flex items-center bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Created {formatDate(journal.audit.created_at)}</span>
                </div>
                {travelDates && (
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4 mr-1.5 text-indigo-500 dark:text-indigo-400" />
                    <span>{travelDates}</span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-100 dark:border-gray-700 prose prose-sm dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300">
                  {cleanDescription}
                </p>
              </div>
            </div>

            {/* Interactive Map Toggle */}
            {journal.destination && (
              <div className="mb-6">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center justify-between w-full px-4 py-2 text-left text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors duration-200"
                >
                  <span className="flex items-center">
                    <Map className="w-4 h-4 mr-2" />
                    {showMap ? 'Hide Map' : 'Show Map Location'}
                  </span>
                  {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {showMap && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                        <iframe
                          title="Journal Location"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBIwzALxUPNbatRBj3Xi1Uhp0fFzwWNBkE&q=${journal.destination.latitude},${journal.destination.longitude}&zoom=12`}
                          allowFullScreen
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Subsections */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Journal Sections</span>
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {journal.subsections.length} {journal.subsections.length === 1 ? 'Section' : 'Sections'}
                </span>
              </h3>

              {journal.subsections && journal.subsections.length > 0 ? (
                <div className="space-y-3">
                  {journal.subsections.map((subsection) => {
                    const isActive = activeSubsection === subsection.id;
                    return (
                      <motion.div
                        key={subsection.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`rounded-lg border overflow-hidden ${isActive ? 'border-indigo-300 dark:border-indigo-700' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        <button
                          onClick={() => toggleSubsection(subsection.id)}
                          className="flex items-center justify-between w-full p-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors duration-200"
                        >
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r ${getTypeColor(subsection.type)}`}>
                              {getSubsectionIcon(subsection.type)}
                            </div>
                            <div className="ml-3">
                              <h4 className="font-medium text-gray-900 dark:text-white">{subsection.title}</h4>
                              <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                                {subsection.type} {subsection.notes.length > 0 && `• ${subsection.notes.length} notes`} {subsection.checklists.length > 0 && `• ${subsection.checklists.length} checklist items`}
                              </span>
                            </div>
                          </div>
                          <div className="text-gray-400">
                            {isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </button>

                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                {/* Subsection content differs based on type */}
                                {subsection.type === SubsectionType.SIGHTSEEING && (
                                  <div className="mb-4">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-md p-2 mb-4">
                                      <MapPin className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                                      <span>
                                        Location: {(subsection as any).location
                                          ? `${(subsection as any).location.latitude.toFixed(4)}, ${(subsection as any).location.longitude.toFixed(4)}`
                                          : 'No location'}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {subsection.type === SubsectionType.ACTIVITY && (
                                  <div className="mb-4">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-amber-50 dark:bg-amber-900/20 rounded-md p-2 mb-2">
                                      <Activity className="w-4 h-4 mr-2 text-amber-500 dark:text-amber-400" />
                                      <span>
                                        Activity: {(subsection as any).activity_name || 'Unnamed activity'}
                                      </span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-md p-2 mb-2">
                                      <MapPin className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                                      <span>
                                        Location: {(subsection as any).location
                                          ? `${(subsection as any).location.latitude.toFixed(4)}, ${(subsection as any).location.longitude.toFixed(4)}`
                                          : 'No location'}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {subsection.type === SubsectionType.ROUTE && (
                                  <div className="mb-4">
                                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-emerald-50 dark:bg-emerald-900/20 rounded-md p-2 flex-1">
                                        <Route className="w-4 h-4 mr-2 text-emerald-500 dark:text-emerald-400" />
                                        <span>
                                          Distance: {(subsection as any).total_distance || 0} km
                                        </span>
                                      </div>
                                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-emerald-50 dark:bg-emerald-900/20 rounded-md p-2 flex-1">
                                        <Clock className="w-4 h-4 mr-2 text-emerald-500 dark:text-emerald-400" />
                                        <span>
                                          Time: {(subsection as any).total_time || 0} min
                                        </span>
                                      </div>
                                    </div>

                                    {(subsection as any).locations && (subsection as any).locations.length > 0 && (
                                      <div className="mb-4">
                                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Route Stops:</h5>
                                        <div className="space-y-2 pl-4 border-l-2 border-emerald-300 dark:border-emerald-700">
                                          {(subsection as any).locations.map((location: any, index: number) => (
                                            <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                              <div className="absolute -ml-6 bg-emerald-500 dark:bg-emerald-400 text-white h-5 w-5 rounded-full flex items-center justify-center text-xs">
                                                {index + 1}
                                              </div>
                                              <span>Stop {index + 1}: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Notes */}
                                {subsection.notes && subsection.notes.length > 0 && (
                                  <div className="mb-4">
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                      <span className="mr-2">Notes</span>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {subsection.notes.length}
                                      </span>
                                    </h5>
                                    <ul className="space-y-2">
                                      {subsection.notes.map((note, index) => (
                                        <li key={index} className="flex items-start p-2 bg-gray-100 dark:bg-gray-700/30 rounded-md text-sm text-gray-700 dark:text-gray-300">
                                          <span className="bg-blue-100 dark:bg-blue-900/30 rounded-full h-5 w-5 flex items-center justify-center text-xs font-medium text-blue-800 dark:text-blue-300 mr-2 mt-0.5">
                                            {index + 1}
                                          </span>
                                          <span className="flex-1">{note}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Checklists */}
                                {subsection.checklists && subsection.checklists.length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                                      <span className="mr-2">Checklist</span>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        {subsection.checklists.length}
                                      </span>
                                    </h5>
                                    <ul className="space-y-1.5">
                                      {subsection.checklists.map((item, index) => (
                                        <li key={index} className="flex items-center p-2 bg-gray-100 dark:bg-gray-700/30 rounded-md text-sm text-gray-700 dark:text-gray-300">
                                          <Circle className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" />
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center border border-dashed border-gray-300 dark:border-gray-700">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">No sections yet</h4>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
                    This journal doesn't have any sections added to it yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with back button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journals
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
