import React, { useState, useEffect } from 'react';
import {
  MapPin,
  X,
  Plus,
  Save,
  Loader2,
  Activity,
  Eye,
  Route,
  Clock,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  JournalBrief,
  JournalCreateRequest,
  JournalDetail,
} from '@/types/journal';
import { Location } from '@/types/location';
import {
  ActivitySubsectionCreateRequest,
  RouteSubsectionCreateRequest,
  SightseeingSubsectionCreateRequest,
  SubsectionCreateRequest,
  SubsectionType,
} from '@/types/subsection';
import { motion, AnimatePresence } from 'framer-motion';

interface JournalFormProps {
  journal?: JournalDetail;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (journalData: JournalCreateRequest) => Promise<void>;
  isLoading: boolean;
}

interface SubsectionFormState {
  title: string;
  type: SubsectionType;
  notes: string[];
  checklists: string[];
  journal_id: string;
  // For SIGHTSEEING and ACTIVITY
  location?: Location;
  // For ACTIVITY only
  activity_name?: string;
  // For ROUTE only
  locations?: Location[];
  total_time?: number;
  total_distance?: number;
}

export const JournalForm: React.FC<JournalFormProps> = ({
  journal,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<JournalCreateRequest>({
    title: '',
    description: '',
    destination: { latitude: 0, longitude: 0 },
    subsections: [],
  });

  const [subsectionFormVisible, setSubsectionFormVisible] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isSubmittingSubsection, setIsSubmittingSubsection] = useState(false);
  const [subsectionError, setSubsectionError] = useState<string | null>(null);

  const [newSubsection, setNewSubsection] = useState<SubsectionFormState>({
    title: '',
    type: SubsectionType.SIGHTSEEING,
    notes: [],
    checklists: [],
    journal_id: '',
    location: { latitude: 0, longitude: 0 },
  });

  const [destinationName, setDestinationName] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [travelDates, setTravelDates] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    if (journal) {
      setFormData({
        title: journal.title,
        description: journal.description,
        destination: journal.destination,
        subsections: journal.subsections,
      });
    } else {
      // Reset form when creating a new journal
      setFormData({
        title: '',
        description: '',
        destination: { latitude: 0, longitude: 0 },
        subsections: [],
      });
      setDestinationName('');
      setCoverImage('');
      setTravelDates({ startDate: '', endDate: '' });
    }
  }, [journal]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);

    setFormData((prev) => ({
      ...prev,
      destination: {
        ...prev.destination,
        [name === 'latitude' ? 'latitude' : 'longitude']: isNaN(numValue)
          ? 0
          : numValue,
      },
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTravelDates((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubsectionChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'type') {
      // Reset type-specific fields when changing subsection type
      const newType = value as SubsectionType;
      let updatedSubsection: SubsectionFormState = {
        ...newSubsection,
        type: newType,
      };

      // Set default fields based on type
      if (
        newType === SubsectionType.SIGHTSEEING ||
        newType === SubsectionType.ACTIVITY
      ) {
        updatedSubsection.location = { latitude: 0, longitude: 0 };
        if (newType === SubsectionType.ACTIVITY) {
          updatedSubsection.activity_name = '';
        }
      } else if (newType === SubsectionType.ROUTE) {
        updatedSubsection.locations = [{ latitude: 0, longitude: 0 }];
        updatedSubsection.total_time = 0;
        updatedSubsection.total_distance = 0;
      }

      setNewSubsection(updatedSubsection);
    } else {
      setNewSubsection((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubsectionLocationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);

    setNewSubsection((prev) => ({
      ...prev,
      location: {
        ...prev.location!,
        [name === 'subsectionLatitude' ? 'latitude' : 'longitude']: isNaN(
          numValue
        )
          ? 0
          : numValue,
      },
    }));
  };

  const handleRouteLocationChange = (
    index: number,
    coord: 'latitude' | 'longitude',
    value: string
  ) => {
    const numValue = parseFloat(value);

    setNewSubsection((prev) => {
      const updatedLocations = [...(prev.locations || [])];
      if (!updatedLocations[index]) {
        updatedLocations[index] = { latitude: 0, longitude: 0 };
      }

      updatedLocations[index] = {
        ...updatedLocations[index],
        [coord]: isNaN(numValue) ? 0 : numValue,
      };

      return {
        ...prev,
        locations: updatedLocations,
      };
    });
  };

  const addRouteLocation = () => {
    setNewSubsection((prev) => ({
      ...prev,
      locations: [...(prev.locations || []), { latitude: 0, longitude: 0 }],
    }));
  };

  const removeRouteLocation = (index: number) => {
    setNewSubsection((prev) => {
      const updatedLocations = [...(prev.locations || [])];
      updatedLocations.splice(index, 1);

      return {
        ...prev,
        locations: updatedLocations,
      };
    });
  };

  const addNote = () => {
    if (newNote.trim()) {
      setNewSubsection((prev) => ({
        ...prev,
        notes: [...prev.notes, newNote.trim()],
      }));
      setNewNote('');
    }
  };

  const removeNote = (index: number) => {
    setNewSubsection((prev) => {
      const updatedNotes = [...prev.notes];
      updatedNotes.splice(index, 1);

      return {
        ...prev,
        notes: updatedNotes,
      };
    });
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setNewSubsection((prev) => ({
        ...prev,
        checklists: [...prev.checklists, newChecklistItem.trim()],
      }));
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (index: number) => {
    setNewSubsection((prev) => {
      const updatedChecklists = [...prev.checklists];
      updatedChecklists.splice(index, 1);

      return {
        ...prev,
        checklists: updatedChecklists,
      };
    });
  };

  const addSubsection = () => {
    setSubsectionError(null);

    if (!newSubsection.title.trim()) {
      setSubsectionError('Subsection title is required');
      return;
    }

    setIsSubmittingSubsection(true);

    try {
      // Create subsection based on type
      let subsectionToAdd:
        | ActivitySubsectionCreateRequest
        | RouteSubsectionCreateRequest
        | SightseeingSubsectionCreateRequest = {
        title: newSubsection.title,
        journal_id: journal?.id || '',
        notes: newSubsection.notes,
        checklists: newSubsection.checklists,
      };

      // Add type-specific properties
      if (newSubsection.type === SubsectionType.SIGHTSEEING) {
        subsectionToAdd = {
          ...subsectionToAdd,
          location: newSubsection.location!,
        };
      } else if (newSubsection.type === SubsectionType.ACTIVITY) {
        subsectionToAdd = {
          ...subsectionToAdd,
          location: newSubsection.location!,
          activity_name: newSubsection.activity_name || 'Unnamed Activity',
        };
      } else if (newSubsection.type === SubsectionType.ROUTE) {
        subsectionToAdd = {
          ...subsectionToAdd,
          locations: newSubsection.locations || [],
          total_time: newSubsection.total_time || 0,
          total_distance: newSubsection.total_distance || 0,
        };
      }

      // Add to form data
      setFormData((prev) => ({
        ...prev,
        subsections: [...prev.subsections, subsectionToAdd],
      }));

      // Reset subsection form
      setNewSubsection({
        title: '',
        type: SubsectionType.SIGHTSEEING,
        notes: [],
        checklists: [],
        journal_id: journal?.id || '',
        location: { latitude: 0, longitude: 0 },
      });

      setSubsectionFormVisible(false);
    } catch (error) {
      console.error('Error adding subsection:', error);
      setSubsectionError('Failed to add subsection');
    } finally {
      setIsSubmittingSubsection(false);
    }
  };

  const removeSubsection = (index: number) => {
    setFormData((prev) => {
      const updatedSubsections = [...prev.subsections];
      updatedSubsections.splice(index, 1);

      return {
        ...prev,
        subsections: updatedSubsections,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enhancedFormData = {
      ...formData,
      // We can add the additional metadata to description until backend supports it
      description: `${formData.description}\n\nDestination: ${destinationName}\nTravel Dates: ${travelDates.startDate} to ${travelDates.endDate}\nCover Image: ${coverImage}`,
    };
    await onSubmit(enhancedFormData);
  };

  const getSubsectionIcon = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return <Eye className="w-4 h-4" />;
      case SubsectionType.ACTIVITY:
        return <Activity className="w-4 h-4" />;
      case SubsectionType.ROUTE:
        return <Route className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {journal ? 'Edit Journal' : 'Create New Journal'}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Journal Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                  placeholder="My Amazing Journey"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="destinationName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Destination Name
                </label>
                <input
                  type="text"
                  id="destinationName"
                  name="destinationName"
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                  className="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                  placeholder="Paris, France"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={travelDates.startDate}
                    onChange={handleDateChange}
                    className="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={travelDates.endDate}
                    onChange={handleDateChange}
                    className="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="coverImage"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Cover Image URL
                </label>
                <input
                  type="text"
                  id="coverImage"
                  name="coverImage"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="latitude"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Latitude
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                    <input
                      type="number"
                      step="0.000001"
                      id="latitude"
                      name="latitude"
                      value={formData.destination.latitude}
                      onChange={handleLocationChange}
                      className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="longitude"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Longitude
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                    <input
                      type="number"
                      step="0.000001"
                      id="longitude"
                      name="longitude"
                      value={formData.destination.longitude}
                      onChange={handleLocationChange}
                      className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="block w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200 resize-none"
                  placeholder="Describe your journey experience..."
                  required
                />
              </div>

              {/* Preview cover image if URL is provided */}
              {coverImage && (
                <div className="mt-4 relative rounded-lg overflow-hidden h-40 bg-gray-100 dark:bg-gray-700">
                  <img
                    src={coverImage}
                    alt="Journal cover"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/images/roamance-logo-bg.png';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Subsections */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Journal Sections
              </h3>
              <button
                type="button"
                onClick={() => setSubsectionFormVisible(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Section
              </button>
            </div>

            {formData.subsections.length > 0 ? (
              <div className="space-y-3 mb-6">
                {formData.subsections.map((subsection, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex items-start justify-between group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-md text-indigo-600 dark:text-indigo-400">
                        {getSubsectionIcon(subsection.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {subsection.title}
                        </h4>
                        <div className="flex items-center mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                            {subsection.type}
                          </span>
                          {subsection.notes.length > 0 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                              {subsection.notes.length} Notes
                            </span>
                          )}
                          {subsection.checklists.length > 0 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                              {subsection.checklists.length} Checklist Items
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSubsection(index)}
                      className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 mb-6">
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  No sections added
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add sections to organize your journal entries
                </p>
                <button
                  type="button"
                  onClick={() => setSubsectionFormVisible(true)}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add your first section
                </button>
              </div>
            )}

            {/* Subsection Form Modal */}
            <AnimatePresence>
              {subsectionFormVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center"
                  onClick={(e) => {
                    if (e.target === e.currentTarget)
                      setSubsectionFormVisible(false);
                  }}
                >
                  <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                    aria-hidden="true"
                  />

                  <motion.div
                    className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                  >
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Add New Section
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSubsectionFormVisible(false)}
                        className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {subsectionError && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-md text-red-600 dark:text-red-400 text-sm flex items-start">
                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{subsectionError}</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="subsectionTitle"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Section Title
                        </label>
                        <input
                          type="text"
                          id="subsectionTitle"
                          name="title"
                          value={newSubsection.title}
                          onChange={handleSubsectionChange}
                          className="block w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                          placeholder="e.g., Visit to Eiffel Tower"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="subsectionType"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Section Type
                        </label>
                        <div className="relative">
                          <select
                            id="subsectionType"
                            name="type"
                            value={newSubsection.type}
                            onChange={handleSubsectionChange}
                            className="block w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200 appearance-none pr-10"
                          >
                            <option value={SubsectionType.SIGHTSEEING}>
                              Sightseeing
                            </option>
                            <option value={SubsectionType.ACTIVITY}>
                              Activity
                            </option>
                            <option value={SubsectionType.ROUTE}>Route</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            {getSubsectionIcon(newSubsection.type)}
                          </div>
                        </div>
                      </div>

                      {/* Type-specific fields */}
                      {(newSubsection.type === SubsectionType.SIGHTSEEING ||
                        newSubsection.type === SubsectionType.ACTIVITY) && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label
                                htmlFor="subsectionLatitude"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                              >
                                Latitude
                              </label>
                              <input
                                type="number"
                                step="0.000001"
                                id="subsectionLatitude"
                                name="subsectionLatitude"
                                value={newSubsection.location?.latitude || 0}
                                onChange={handleSubsectionLocationChange}
                                className="block w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="subsectionLongitude"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                              >
                                Longitude
                              </label>
                              <input
                                type="number"
                                step="0.000001"
                                id="subsectionLongitude"
                                name="subsectionLongitude"
                                value={newSubsection.location?.longitude || 0}
                                onChange={handleSubsectionLocationChange}
                                className="block w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          {newSubsection.type === SubsectionType.ACTIVITY && (
                            <div>
                              <label
                                htmlFor="activityName"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                              >
                                Activity Name
                              </label>
                              <input
                                type="text"
                                id="activityName"
                                name="activity_name"
                                value={newSubsection.activity_name || ''}
                                onChange={handleSubsectionChange}
                                className="block w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                                placeholder="e.g., Wine Tasting"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {newSubsection.type === SubsectionType.ROUTE && (
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Route Locations
                              </label>
                              <button
                                type="button"
                                onClick={addRouteLocation}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:outline-none transition-colors duration-200"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Stop
                              </button>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                              {(newSubsection.locations || []).map(
                                (location, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-2"
                                  >
                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                      <input
                                        type="number"
                                        step="0.000001"
                                        value={location.latitude}
                                        onChange={(e) =>
                                          handleRouteLocationChange(
                                            index,
                                            'latitude',
                                            e.target.value
                                          )
                                        }
                                        className="block w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                                        placeholder="Latitude"
                                      />
                                      <input
                                        type="number"
                                        step="0.000001"
                                        value={location.longitude}
                                        onChange={(e) =>
                                          handleRouteLocationChange(
                                            index,
                                            'longitude',
                                            e.target.value
                                          )
                                        }
                                        className="block w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                                        placeholder="Longitude"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeRouteLocation(index)}
                                      className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )
                              )}

                              {(newSubsection.locations || []).length === 0 && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">
                                  No route locations added yet
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label
                                htmlFor="totalDistance"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                              >
                                Total Distance (km)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                id="totalDistance"
                                name="total_distance"
                                value={newSubsection.total_distance || 0}
                                onChange={handleSubsectionChange}
                                className="block w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                                placeholder="0.0"
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="totalTime"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                              >
                                Total Time (min)
                              </label>
                              <div className="relative">
                                <Clock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                <input
                                  type="number"
                                  id="totalTime"
                                  name="total_time"
                                  value={newSubsection.total_time || 0}
                                  onChange={handleSubsectionChange}
                                  className="block w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notes and Checklists (shared across all types) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Notes
                            </label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {newSubsection.notes.length} items
                            </span>
                          </div>

                          <div className="flex space-x-2 mb-2">
                            <input
                              type="text"
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              className="block flex-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                              placeholder="Add a note..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addNote();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={addNote}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                            >
                              Add
                            </button>
                          </div>

                          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                            {newSubsection.notes.map((note, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 group py-1 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                              >
                                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 line-clamp-1">
                                  {note}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeNote(index)}
                                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}

                            {newSubsection.notes.length === 0 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">
                                No notes added yet
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Checklist
                            </label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {newSubsection.checklists.length} items
                            </span>
                          </div>

                          <div className="flex space-x-2 mb-2">
                            <input
                              type="text"
                              value={newChecklistItem}
                              onChange={(e) =>
                                setNewChecklistItem(e.target.value)
                              }
                              className="block flex-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-colors duration-200"
                              placeholder="Add checklist item..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addChecklistItem();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={addChecklistItem}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                            >
                              Add
                            </button>
                          </div>

                          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                            {newSubsection.checklists.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 group py-1 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 line-clamp-1">
                                  {item}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeChecklistItem(index)}
                                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}

                            {newSubsection.checklists.length === 0 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">
                                No checklist items added yet
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setSubsectionFormVisible(false)}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addSubsection}
                        disabled={isSubmittingSubsection}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmittingSubsection ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          'Add Section'
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-gray-700 mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg shadow-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Journal...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Journal
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
