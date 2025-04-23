import { DialogXButton } from '@/components/common/button/dialog-x-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ActivityType } from '@/types';
import { JournalCreateRequest, JournalDetail } from '@/types/journal';
import type { Location as GeoLocation } from '@/types/location';
import { SubsectionRequest, SubsectionType } from '@/types/subsection';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CalendarRange,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  Globe,
  ListChecks,
  Loader2,
  MapPin,
  Navigation,
  Plus,
  Route,
  Save,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

interface JournalFormProps {
  journal?: JournalDetail;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (journalData: JournalCreateRequest) => Promise<void>;
  isLoading: boolean;
}

type SubsectionFormState = SubsectionRequest;

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
        subsections: journal.subsections.map((sub) => ({
          ...sub,
          journal_id: journal.id,
        })),
      });

      // Extract metadata from description
      const descriptionLines = journal.description.split('\n');
      for (const line of descriptionLines) {
        if (line.startsWith('Destination:')) {
          setDestinationName(line.replace('Destination:', '').trim());
        } else if (line.startsWith('Travel Dates:')) {
          const datesStr = line.replace('Travel Dates:', '').trim();
          const [startDate = '', endDate = ''] = datesStr.split(' to ');
          setTravelDates({ startDate, endDate });
        } else if (line.startsWith('Cover Image:')) {
          setCoverImage(line.replace('Cover Image:', '').trim());
        }
      }
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
      const typeValue = value as SubsectionType;
      // build a new subsection and then cast to SubsectionFormState to satisfy the discriminated union
      const updatedSubsection = {
        ...newSubsection,
        type: typeValue,
        journal_id: journal?.id || '',
      } as SubsectionFormState;

      // Set default fields based on type
      if (
        updatedSubsection.type === SubsectionType.SIGHTSEEING ||
        updatedSubsection.type === SubsectionType.ACTIVITY
      ) {
        updatedSubsection.location = { latitude: 0, longitude: 0 };
        if (updatedSubsection.type === SubsectionType.ACTIVITY) {
          updatedSubsection.activity_type = ActivityType.OTHER;
        }
      } else if (updatedSubsection.type === SubsectionType.ROUTE) {
        updatedSubsection.waypoints = [];
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

    setNewSubsection((prev) => {
      // Ensure we only update location for types that have it
      if (
        prev.type === SubsectionType.SIGHTSEEING ||
        prev.type === SubsectionType.ACTIVITY
      ) {
        return {
          ...prev,
          location: {
            ...prev.location, // No need for non-null assertion here due to the type check
            [name === 'subsectionLatitude' ? 'latitude' : 'longitude']: isNaN(
              numValue
            )
              ? 0
              : numValue,
          },
        };
      }
      // Return previous state if the type doesn't have a location property
      return prev;
    });
  };

  const handleRouteLocationChange = (
    index: number,
    coord: 'latitude' | 'longitude',
    value: string
  ) => {
    const numValue = parseFloat(value);

    setNewSubsection((prev) => {
      // Only update waypoints if the type is ROUTE
      if (prev.type === SubsectionType.ROUTE) {
        const updatedWaypoints = [...(prev.waypoints || [])];
        if (!updatedWaypoints[index]) {
          updatedWaypoints[index] = { latitude: 0, longitude: 0 };
        }

        updatedWaypoints[index] = {
          ...updatedWaypoints[index],
          [coord]: isNaN(numValue) ? 0 : numValue,
        };

        return {
          ...prev,
          waypoints: updatedWaypoints,
        };
      }
      // Return previous state if the type doesn't have waypoints
      return prev;
    });
  };

  const addRouteLocation = () => {
    setNewSubsection((prev) => {
      if (prev.type === SubsectionType.ROUTE) {
        return {
          ...prev,
          waypoints: [...(prev.waypoints || []), { latitude: 0, longitude: 0 }],
        };
      }
      return prev;
    });
  };

  const removeRouteLocation = (index: number) => {
    setNewSubsection((prev) => {
      if (prev.type === SubsectionType.ROUTE) {
        const updatedWaypoints = [...(prev.waypoints || [])];
        updatedWaypoints.splice(index, 1);

        return {
          ...prev,
          waypoints: updatedWaypoints,
        };
      }
      return prev;
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
      // Base subsection object including type (cast to any to satisfy TS)
      const subsectionToAdd: SubsectionFormState = newSubsection;

      // Add type-specific properties
      if (
        subsectionToAdd.type === SubsectionType.SIGHTSEEING &&
        newSubsection.type === SubsectionType.SIGHTSEEING
      ) {
        subsectionToAdd.location = newSubsection.location!;
      } else if (
        subsectionToAdd.type === SubsectionType.ACTIVITY &&
        newSubsection.type === SubsectionType.ACTIVITY
      ) {
        subsectionToAdd.location = newSubsection.location!;
        subsectionToAdd.activity_type =
          newSubsection.activity_type || ActivityType.OTHER;
      } else if (
        subsectionToAdd.type === SubsectionType.ROUTE &&
        newSubsection.type === SubsectionType.ROUTE
      ) {
        subsectionToAdd.waypoints = newSubsection.waypoints || [];
        subsectionToAdd.total_time = newSubsection.total_time || 0;
        subsectionToAdd.total_distance = newSubsection.total_distance || 0;
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
        location: { latitude: 0, longitude: 0 } as GeoLocation,
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

  const getTypeColor = (type: SubsectionType) => {
    switch (type) {
      case SubsectionType.SIGHTSEEING:
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400';
      case SubsectionType.ACTIVITY:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
      case SubsectionType.ROUTE:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-4xl sm:max-w-4xl max-h-[80vh] overflow-y-auto p-0">
        <div className="flex justify-between items-center px-6 py-4 border-b border-muted/20 sticky top-0 bg-background/80 backdrop-blur-md z-10">
          <DialogTitle className="text-2xl font-bold flex items-center p-0 m-0">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {journal ? 'Edit Journal' : 'Create New Journal'}
            </span>
          </DialogTitle>
          <DialogXButton onClose={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-foreground/80 mb-1.5 block"
                >
                  Journal Title
                </label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="My Amazing Journey"
                  className="h-11"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="destinationName"
                  className="text-sm font-medium text-foreground/80 mb-1.5 block"
                >
                  Destination Name
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    id="destinationName"
                    name="destinationName"
                    value={destinationName}
                    onChange={(e) => setDestinationName(e.target.value)}
                    placeholder="Paris, France"
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="text-sm font-medium text-foreground/80 mb-1.5 block"
                  >
                    Start Date
                  </label>
                  <div className="relative">
                    <CalendarRange className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={travelDates.startDate}
                      onChange={handleDateChange}
                      className="h-11 pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="text-sm font-medium text-foreground/80 mb-1.5 block"
                  >
                    End Date
                  </label>
                  <div className="relative">
                    <CalendarRange className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={travelDates.endDate}
                      onChange={handleDateChange}
                      className="h-11 pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="coverImage"
                  className="text-sm font-medium text-foreground/80 mb-1.5 block"
                >
                  Cover Image URL
                </label>
                <div className="relative">
                  <Camera className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    id="coverImage"
                    name="coverImage"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="h-11 pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="latitude"
                    className="text-sm font-medium text-foreground/80 mb-1.5 block"
                  >
                    Latitude
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.000001"
                      id="latitude"
                      name="latitude"
                      value={formData.destination.latitude}
                      onChange={handleLocationChange}
                      placeholder="0.00"
                      className="h-11 pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="longitude"
                    className="text-sm font-medium text-foreground/80 mb-1.5 block"
                  >
                    Longitude
                  </label>
                  <div className="relative">
                    <Navigation className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.000001"
                      id="longitude"
                      name="longitude"
                      value={formData.destination.longitude}
                      onChange={handleLocationChange}
                      placeholder="0.00"
                      className="h-11 pl-10"
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
                  className="text-sm font-medium text-foreground/80 mb-1.5 block"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your journey experience..."
                  className="resize-none"
                  required
                />
              </div>

              {/* Preview cover image if URL is provided */}
              {coverImage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative rounded-xl overflow-hidden h-[180px] border border-muted/30 shadow-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                  <Image
                    src={coverImage}
                    alt="Journal cover"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/images/roamance-logo-bg.png';
                    }}
                  />
                  <div className="absolute bottom-3 left-3 text-white z-20">
                    <Badge
                      variant="outline"
                      className="bg-black/30 text-white border-white/20 backdrop-blur-sm"
                    >
                      Cover Preview
                    </Badge>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Subsections */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <span className="mr-2">Journal Sections</span>
                {formData.subsections?.length > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/30"
                  >
                    {formData.subsections?.length}
                  </Badge>
                )}
              </h3>

              <Button
                type="button"
                onClick={() => setSubsectionFormVisible(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </Button>
            </div>

            {formData.subsections?.length > 0 ? (
              <div className="space-y-3 mb-6">
                {formData.subsections.map((subsection, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-muted/10 rounded-xl p-4 border border-muted/30 hover:border-indigo-200 dark:hover:border-indigo-800/50 shadow-sm flex items-start justify-between group transition-all duration-200"
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg ${getTypeColor(subsection.type)} flex items-center justify-center`}
                      >
                        {getSubsectionIcon(subsection.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground leading-tight">
                          {subsection.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs',
                              getTypeColor(subsection.type)
                            )}
                          >
                            {subsection.type}
                          </Badge>

                          {subsection.notes?.length > 0 && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <StickyNote className="w-3 h-3 mr-1" />
                              {subsection.notes?.length} notes
                            </div>
                          )}

                          {subsection.checklists?.length > 0 && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <ListChecks className="w-3 h-3 mr-1" />
                              {subsection.checklists?.length} items
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSubsection(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/5 rounded-xl p-8 text-center border border-dashed border-muted/30 mb-6">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 mb-4">
                  <Plus className="h-7 w-7" />
                </div>
                <h3 className="text-base font-medium text-foreground">
                  No sections added
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">
                  Add sections to organize your journal entries by sightseeing
                  locations, activities, or travel routes
                </p>
                <Button
                  type="button"
                  onClick={() => setSubsectionFormVisible(true)}
                  variant="outline"
                  className="mt-5 border-indigo-200 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add your first section
                </Button>
              </div>
            )}

            {/* Subsection Form Modal using shadcn Dialog */}
            <Dialog
              open={subsectionFormVisible}
              onOpenChange={setSubsectionFormVisible}
            >
              <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[60vh] overflow-y-auto p-0">
                <DialogHeader className="p-6 pb-3 border-b border-muted/20">
                  <DialogTitle className="text-xl font-semibold text-foreground">
                    Add New Section
                  </DialogTitle>
                  {/* Optional: Add DialogDescription if needed */}
                </DialogHeader>

                <div className="p-6 space-y-5">
                  {subsectionError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 p-3 bg-destructive/10 dark:bg-destructive/20 rounded-lg text-destructive text-sm flex items-start border border-destructive/20"
                    >
                      <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{subsectionError}</span>
                    </motion.div>
                  )}

                  <div>
                    <label
                      htmlFor="subsectionTitle"
                      className="text-sm font-medium text-foreground/80 mb-1.5 block"
                    >
                      Section Title
                    </label>
                    <Input
                      type="text"
                      id="subsectionTitle"
                      name="title"
                      value={newSubsection.title}
                      onChange={handleSubsectionChange}
                      placeholder="e.g., Visit to Eiffel Tower"
                      className="h-11"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subsectionType"
                      className="text-sm font-medium text-foreground/80 mb-1.5 block"
                    >
                      Section Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleSubsectionChange({
                            target: {
                              name: 'type',
                              value: SubsectionType.SIGHTSEEING,
                            },
                          } as unknown as React.ChangeEvent<HTMLInputElement>)
                        }
                        className={cn(
                          'flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 h-[90px]',
                          newSubsection.type === SubsectionType.SIGHTSEEING
                            ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/50'
                            : 'bg-muted/10 border-muted/30 hover:bg-muted/20'
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                            newSubsection.type === SubsectionType.SIGHTSEEING
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-800/50 dark:text-indigo-300'
                              : 'bg-muted/50 text-muted-foreground'
                          )}
                        >
                          <Eye className="w-5 h-5" />
                        </div>
                        <span
                          className={cn(
                            'text-sm',
                            newSubsection.type === SubsectionType.SIGHTSEEING
                              ? 'text-indigo-700 dark:text-indigo-300 font-medium'
                              : 'text-muted-foreground'
                          )}
                        >
                          Sightseeing
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSubsectionChange({
                            target: {
                              name: 'type',
                              value: SubsectionType.ACTIVITY,
                            },
                          } as unknown as React.ChangeEvent<HTMLInputElement>)
                        }
                        className={cn(
                          'flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 h-[90px]',
                          newSubsection.type === SubsectionType.ACTIVITY
                            ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50'
                            : 'bg-muted/10 border-muted/30 hover:bg-muted/20'
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                            newSubsection.type === SubsectionType.ACTIVITY
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-800/50 dark:text-amber-300'
                              : 'bg-muted/50 text-muted-foreground'
                          )}
                        >
                          <Activity className="w-5 h-5" />
                        </div>
                        <span
                          className={cn(
                            'text-sm',
                            newSubsection.type === SubsectionType.ACTIVITY
                              ? 'text-amber-700 dark:text-amber-300 font-medium'
                              : 'text-muted-foreground'
                          )}
                        >
                          Activity
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSubsectionChange({
                            target: {
                              name: 'type',
                              value: SubsectionType.ROUTE,
                            },
                          } as unknown as React.ChangeEvent<HTMLInputElement>)
                        }
                        className={cn(
                          'flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 h-[90px]',
                          newSubsection.type === SubsectionType.ROUTE
                            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/50'
                            : 'bg-muted/10 border-muted/30 hover:bg-muted/20'
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center mb-2',
                            newSubsection.type === SubsectionType.ROUTE
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-300'
                              : 'bg-muted/50 text-muted-foreground'
                          )}
                        >
                          <Route className="w-5 h-5" />
                        </div>
                        <span
                          className={cn(
                            'text-sm',
                            newSubsection.type === SubsectionType.ROUTE
                              ? 'text-emerald-700 dark:text-emerald-300 font-medium'
                              : 'text-muted-foreground'
                          )}
                        >
                          Route
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Type-specific fields */}
                  {(newSubsection.type === SubsectionType.SIGHTSEEING ||
                    newSubsection.type === SubsectionType.ACTIVITY) && (
                    <div
                      className={cn(
                        'space-y-4 p-4 rounded-xl border',
                        newSubsection.type === SubsectionType.SIGHTSEEING
                          ? 'bg-indigo-50/30 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-800/30'
                          : 'bg-amber-50/30 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800/30'
                      )}
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="subsectionLatitude"
                            className="text-sm font-medium text-foreground/80 mb-1.5 block"
                          >
                            Latitude
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.000001"
                              id="subsectionLatitude"
                              name="subsectionLatitude"
                              value={newSubsection.location?.latitude || 0}
                              onChange={handleSubsectionLocationChange}
                              placeholder="0.00"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="subsectionLongitude"
                            className="text-sm font-medium text-foreground/80 mb-1.5 block"
                          >
                            Longitude
                          </label>
                          <div className="relative">
                            <Navigation className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.000001"
                              id="subsectionLongitude"
                              name="subsectionLongitude"
                              value={newSubsection.location?.longitude || 0}
                              onChange={handleSubsectionLocationChange}
                              placeholder="0.00"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      {newSubsection.type === SubsectionType.ACTIVITY && (
                        <div>
                          <label
                            htmlFor="activityType"
                            className="text-sm font-medium text-foreground/80 mb-1.5 block"
                          >
                            Activity Type
                          </label>
                          <div className="relative">
                            <Activity className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <select
                              id="activityType"
                              name="activity_type"
                              value={
                                newSubsection.activity_type ||
                                ActivityType.OTHER
                              }
                              onChange={handleSubsectionChange}
                              className="pl-10 h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Apply input-like styles
                            >
                              {Object.values(ActivityType).map((type) => (
                                <option key={type} value={type}>
                                  {type.replace(/_/g, ' ')}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {newSubsection.type === SubsectionType.ROUTE && (
                    <div className="space-y-4 p-4 rounded-xl bg-emerald-50/30 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800/30">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-foreground/80">
                            Route Locations
                          </label>
                          <Button
                            type="button"
                            onClick={addRouteLocation}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30"
                          >
                            <Plus className="w-3 h-3" />
                            Add Stop
                          </Button>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                          {(newSubsection.waypoints || []).length > 0 ? (
                            (newSubsection.waypoints || []).map(
                              (location, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2"
                                >
                                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-medium flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 grid grid-cols-2 gap-2">
                                    <Input
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
                                      className="h-9 text-sm"
                                      placeholder="Latitude"
                                    />
                                    <Input
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
                                      className="h-9 text-sm"
                                      placeholder="Longitude"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRouteLocation(index)}
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-full transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              )
                            )
                          ) : (
                            <div className="text-sm text-muted-foreground py-3 text-center bg-background/50 rounded-lg border border-muted/30">
                              No route locations added yet
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="totalDistance"
                            className="text-sm font-medium text-foreground/80 mb-1.5 block"
                          >
                            Total Distance (km)
                          </label>
                          <div className="relative">
                            <Route className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="number"
                              step="0.1"
                              id="totalDistance"
                              name="total_distance"
                              value={newSubsection.total_distance || 0}
                              onChange={handleSubsectionChange}
                              placeholder="0.0"
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="totalTime"
                            className="text-sm font-medium text-foreground/80 mb-1.5 block"
                          >
                            Total Time (min)
                          </label>
                          <div className="relative">
                            <Clock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="number"
                              id="totalTime"
                              name="total_time"
                              value={newSubsection.total_time || 0}
                              onChange={handleSubsectionChange}
                              placeholder="0"
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes and Checklists (shared across all types) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-foreground/80">
                          <span className="flex items-center">
                            <StickyNote className="w-4 h-4 mr-1.5 text-indigo-500" />
                            Notes
                          </span>
                        </label>
                        {newSubsection.notes?.length > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs h-5 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30"
                          >
                            {newSubsection.notes?.length}
                          </Badge>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="Add a note..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addNote();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addNote}
                          variant="outline"
                          size="sm"
                          className="h-9 shrink-0 border-indigo-200 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30 transition-colors"
                        >
                          Add
                        </Button>
                      </div>

                      <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1 scrollbar-hide rounded-lg border border-muted/30 bg-background/50 divide-y divide-muted/20">
                        {newSubsection.notes?.length > 0 ? (
                          newSubsection.notes.map((note, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 group p-2.5 hover:bg-muted/10 transition-colors duration-200"
                            >
                              <span className="text-sm text-foreground/80 flex-1 line-clamp-1">
                                {note}
                              </span>
                              <Button
                                type="button"
                                onClick={() => removeNote(index)}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive rounded-full opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground py-4 text-center">
                            No notes added yet
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-foreground/80">
                          <span className="flex items-center">
                            <ListChecks className="w-4 h-4 mr-1.5 text-emerald-500" />
                            Checklist
                          </span>
                        </label>
                        {newSubsection.checklists?.length > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs h-5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                          >
                            {newSubsection.checklists?.length}
                          </Badge>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          value={newChecklistItem}
                          onChange={(e) => setNewChecklistItem(e.target.value)}
                          className="h-9 text-sm"
                          placeholder="Add checklist item..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addChecklistItem();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addChecklistItem}
                          variant="outline"
                          size="sm"
                          className="h-9 shrink-0 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-colors"
                        >
                          Add
                        </Button>
                      </div>

                      <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1 scrollbar-hide rounded-lg border border-muted/30 bg-background/50 divide-y divide-muted/20">
                        {newSubsection.checklists?.length > 0 ? (
                          newSubsection.checklists.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 group p-2.5 hover:bg-muted/10 transition-colors duration-200"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                              <span className="text-sm text-foreground/80 flex-1 line-clamp-1">
                                {item}
                              </span>
                              <Button
                                type="button"
                                onClick={() => removeChecklistItem(index)}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive rounded-full opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground py-4 text-center">
                            No checklist items added yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="p-6 pt-5 border-t border-muted/20 flex justify-end space-x-3">
                  <Button
                    type="button"
                    onClick={() => setSubsectionFormVisible(false)}
                    variant="outline"
                    className="px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={addSubsection}
                    disabled={isSubmittingSubsection}
                    className="px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  >
                    {isSubmittingSubsection ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Section'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="pt-8 border-t border-muted/20 mt-8 flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[150px] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Journal...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Journal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
