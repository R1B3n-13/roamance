import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';
import { CloudinaryUploadResult } from '@/service/cloudinary-service';
import { subsectionService } from '@/service/subsection-service';
import { JournalCreateRequest, JournalDetail } from '@/types/journal';
import {
  SubsectionDetailResponseDto,
  SubsectionRequest,
  SubsectionType,
} from '@/types/subsection';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Loader2,
  PlusCircle,
  Save,
} from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { JournalMetadataForm } from './journal-metadata-form';
import { SubsectionDetail } from './subsection-detail';
import { SubsectionForm } from './subsection-form';
import { SubsectionList } from './subsection-list';
import { getSubsectionTypeColors } from './colorscheme';

interface JournalEditorProps {
  journal: JournalDetail;
  onSave: (journal: JournalCreateRequest) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

// Create a type for our subsection details cache
interface SubsectionDetailsCache {
  [key: string]: SubsectionDetailResponseDto;
}

// Create a separate state for loading flags
interface LoadingState {
  [key: string]: boolean;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  journal,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedSubsectionId, setSelectedSubsectionId] = useState<
    string | null
  >(null);
  const [selectedSubsectionIndex, setSelectedSubsectionIndex] =
    useState<number>(-1);
  const [isCreatingSubsection, setIsCreatingSubsection] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [subsectionFormData, setSubsectionFormData] =
    useState<SubsectionRequest | null>(null);
  const [subsectionDetails, setSubsectionDetails] =
    useState<SubsectionDetailsCache>({});
  // Tracks whether subsections are currently loading
  const [isLoading, setIsLoading] = useState<LoadingState>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  // Create a tracking map for temporary IDs
  const [tempIdMap, setTempIdMap] = useState<Record<string, string>>({});

  const [editableJournal, setEditableJournal] = useState<JournalCreateRequest>({
    title: journal.title,
    description: journal.description,
    destination: journal.destination,
    subsections: journal.subsections.map((sub) => ({
      ...sub,
      journal_id: journal.id,
    })),
    is_favorite: journal.is_favorite,
    is_archived: journal.is_archived,
    is_shared: journal.is_shared,
    date: journal.date || new Date().toISOString().split('T')[0],
    cover_image: journal.cover_image || '',
  });

  // Function to fetch subsection details
  const fetchSubsectionDetails = useCallback(
    async (subsectionId: string) => {
      if (subsectionDetails[subsectionId]) {
        // Already loaded
        return;
      }

      // Set loading state for this subsection
      setIsLoading((prev) => ({
        ...prev,
        [subsectionId]: true,
      }));

      try {
        const response =
          await subsectionService.getSubsectionById(subsectionId);
        if (response && response.data) {
          // Add the fetched subsection to our cache
          setSubsectionDetails((prev) => ({
            ...prev,
            [subsectionId]: response.data,
          }));
        }
      } catch (error) {
        console.error(
          `Failed to fetch subsection details for ID ${subsectionId}:`,
          error
        );
        // Don't show error toast for background loading
        // Only show errors when explicitly trying to view a subsection
      } finally {
        setIsLoading((prev) => ({
          ...prev,
          [subsectionId]: false,
        }));
      }
    },
    [subsectionDetails]
  );

  // Immediately start background loading of all subsections
  useEffect(() => {
    if (journal.subsections && journal.subsections.length > 0) {
      // Load all subsections in the background as soon as the journal loads
      journal.subsections.forEach(subsection => {
        fetchSubsectionDetails(subsection.id);
      });
    }
  }, [journal.subsections, fetchSubsectionDetails]);

  // Auto-select the first subsection if one exists - but don't wait for the fetch to complete
  useEffect(() => {
    if (
      journal.subsections &&
      journal.subsections.length > 0 &&
      !selectedSubsectionId
    ) {
      const firstSubsectionId = journal.subsections[0].id;
      setSelectedSubsectionId(firstSubsectionId);
      setSelectedSubsectionIndex(0);
      // Note: We don't need to call fetchSubsectionDetails here
      // since we're already loading all subsections in the background
    }
  }, [journal.subsections, selectedSubsectionId]);

  // Automatically keep the sidebar visible on desktop and hidden on mobile
  useEffect(() => {
    setSidebarVisible(isDesktop);
  }, [isDesktop]);

  const handleCreateSubsection = () => {
    if (editMode) {
      if (confirm('You have unsaved changes. Discard them?')) {
        setEditMode(false);
      } else {
        return;
      }
    }

    setSelectedSubsectionId(null);
    setSelectedSubsectionIndex(-1);
    setIsCreatingSubsection(true);

    // Initialize a new subsection
    setSubsectionFormData({
      title: '',
      type: SubsectionType.SIGHTSEEING,
      note: '',
      checklists: [],
      journal_id: journal.id,
      location: { latitude: 0, longitude: 0 },
    });
  };

  const handleEditSubsection = () => {
    if (!selectedSubsectionId || selectedSubsectionIndex === -1) return;

    setEditMode(true);
    const subsection = editableJournal.subsections[selectedSubsectionIndex];
    setSubsectionFormData(subsection);
  };

  const handleAddSubsection = (subsection: SubsectionRequest) => {
    // Create a new subsection with a temporary ID
    const tempId = `temp-${Date.now()}`;

    setEditableJournal((prev) => {
      // Just use the subsection as-is without adding tempId to it
      const updatedJournal = {
        ...prev,
        subsections: [...prev.subsections, subsection],
      };

      // Add to our temp ID tracking
      setTempIdMap((prev) => ({
        ...prev,
        [tempId]: subsection.journal_id, // Store some ID to track this subsection
      }));

      // Use the updated state to get the correct index
      const newIndex = updatedJournal.subsections.length - 1;

      // Reset create mode
      setIsCreatingSubsection(false);
      setAutoSaveStatus('saving');

      // Simulate auto-save
      setTimeout(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);

        // Select the newly added subsection
        setSelectedSubsectionId(tempId);
        setSelectedSubsectionIndex(newIndex);

        // Create a valid SubsectionDetailResponseDto object to add to cache
        const detailsObj: SubsectionDetailResponseDto = {
          ...subsection,
          id: tempId,
          audit: {
            created_at: new Date().toISOString(),
            created_by: 'current-user',
            last_modified_at: new Date().toISOString(),
            last_modified_by: 'current-user',
          },
        } as SubsectionDetailResponseDto;

        // Add to details cache with the temporary ID
        setSubsectionDetails((prev) => ({
          ...prev,
          [tempId]: detailsObj,
        }));
      }, 1000);

      return updatedJournal;
    });
  };

  const handleUpdateSubsection = async (
    updatedSubsection: SubsectionDetailResponseDto
  ) => {
    if (selectedSubsectionIndex === -1) return;

    // Update in our form data
    setEditableJournal((prev) => {
      const updatedSubsections = [...prev.subsections];
      updatedSubsections[selectedSubsectionIndex] = {
        ...updatedSubsections[selectedSubsectionIndex],
        ...updatedSubsection,
      };

      return {
        ...prev,
        subsections: updatedSubsections,
      };
    });

    // Update in our cache
    setSubsectionDetails((prev) => ({
      ...prev,
      [updatedSubsection.id]: updatedSubsection,
    }));

    // Show autosave feedback
    setAutoSaveStatus('saving');
    setTimeout(() => {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 800);

    return Promise.resolve();
  };

  const handleUpdateEditingSubsection = (subsection: SubsectionRequest) => {
    if (selectedSubsectionIndex === -1 || !selectedSubsectionId) return;

    // Update the subsection in the journal
    setEditableJournal((prev) => {
      const updatedSubsections = [...prev.subsections];
      updatedSubsections[selectedSubsectionIndex] = subsection;

      return {
        ...prev,
        subsections: updatedSubsections,
      };
    });

    // Reset edit mode
    setEditMode(false);
    setSubsectionFormData(null);

    // Update in our cache with proper type casting
    if (selectedSubsectionId) {
      const existing = subsectionDetails[selectedSubsectionId];

      // Create a valid SubsectionDetailResponseDto object
      const detailsObj: SubsectionDetailResponseDto = {
        ...subsection,
        id: selectedSubsectionId,
        audit: existing?.audit || {
          created_at: new Date().toISOString(),
          created_by: 'current-user',
          last_modified_at: new Date().toISOString(),
          last_modified_by: 'current-user',
        },
      } as SubsectionDetailResponseDto;

      setSubsectionDetails((prev) => ({
        ...prev,
        [selectedSubsectionId]: detailsObj,
      }));
    }

    // Show autosave feedback
    setAutoSaveStatus('saving');
    setTimeout(() => {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleRemoveSubsection = (index: number) => {
    if (
      confirm(
        'Are you sure you want to delete this section? This action cannot be undone.'
      )
    ) {
      setEditableJournal((prev) => {
        const updatedSubsections = [...prev.subsections];
        // const removedSubsection = updatedSubsections.splice(index, 1)[0];

        // If we're removing the currently selected subsection, clear selection
        if (selectedSubsectionIndex === index) {
          setSelectedSubsectionId(null);
          setSelectedSubsectionIndex(-1);
        }
        // If we're removing a subsection before the currently selected one, adjust the index
        else if (selectedSubsectionIndex > index) {
          setSelectedSubsectionIndex(selectedSubsectionIndex - 1);
        }

        // Use a safer approach to get the subsection ID by directly using selectedSubsectionId
        // since we're removing the currently selected subsection
        if (selectedSubsectionId && selectedSubsectionIndex === index) {
          setSubsectionDetails((prev) => {
            const newCache = { ...prev };
            delete newCache[selectedSubsectionId];
            return newCache;
          });
        }

        return {
          ...prev,
          subsections: updatedSubsections,
        };
      });

      // Show autosave feedback
      setAutoSaveStatus('saving');
      setTimeout(() => {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }, 800);
    }
  };

  const handleReorderSubsections = (startIndex: number, endIndex: number) => {
    setEditableJournal((prev) => {
      const updatedSubsections = [...prev.subsections];
      const [movedItem] = updatedSubsections.splice(startIndex, 1);
      updatedSubsections.splice(endIndex, 0, movedItem);

      // Update the selected subsection index if it moved
      if (selectedSubsectionIndex === startIndex) {
        setSelectedSubsectionIndex(endIndex);
      }
      // Handle the case where the selected item is shifted due to reordering
      else if (
        (selectedSubsectionIndex > startIndex &&
          selectedSubsectionIndex <= endIndex) ||
        (selectedSubsectionIndex < startIndex &&
          selectedSubsectionIndex >= endIndex)
      ) {
        if (startIndex < endIndex) {
          setSelectedSubsectionIndex((prev) => prev - 1);
        } else {
          setSelectedSubsectionIndex((prev) => prev + 1);
        }
      }

      return {
        ...prev,
        subsections: updatedSubsections,
      };
    });

    // Show autosave feedback
    setAutoSaveStatus('saving');
    setTimeout(() => {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleJournalMetadataChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for checkbox fields
    if (
      name === 'is_favorite' ||
      name === 'is_archived' ||
      name === 'is_shared'
    ) {
      setEditableJournal((prev) => ({
        ...prev,
        [name]:
          e.target.type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : value === 'true',
      }));
    } else {
      setEditableJournal((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);

    setEditableJournal((prev) => ({
      ...prev,
      destination: {
        ...prev.destination,
        [name === 'latitude' ? 'latitude' : 'longitude']: isNaN(numValue)
          ? 0
          : numValue,
      },
    }));
  };

  const handleCoverImageUpload = (result: CloudinaryUploadResult) => {
    setEditableJournal((prev) => ({
      ...prev,
      cover_image: result.url,
    }));
  };

  const handleSaveJournal = async () => {
    try {
      await onSave(editableJournal);
      toast.success('Journal saved successfully');
    } catch (error) {
      console.error('Error saving journal:', error);
      toast.error('Failed to save journal');
    }
  };

  // Get autosave status indicator
  const getAutoSaveIndicator = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return (
          <div className="flex items-center text-xs text-sky-600 dark:text-sky-400 gap-1">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Saving changes...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 gap-1">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Changes saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-xs text-red-600 dark:text-red-400 gap-1">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span>Error saving</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md relative">
      {/* Sidebar with list of subsections */}
      <AnimatePresence initial={false}>
        {sidebarVisible && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'w-full lg:max-w-xs border-r border-slate-200 dark:border-slate-800 flex flex-col',
              !isDesktop &&
                'absolute inset-y-0 left-0 z-20 bg-white dark:bg-slate-950'
            )}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-lg truncate pr-6 max-w-[240px]">
                  {journal.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {editableJournal.subsections.length} sections
                </p>
              </div>

              {!isDesktop && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500"
                  onClick={() => setSidebarVisible(false)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
            </div>

            <div className="p-4 flex-1 overflow-auto">
              <SubsectionList
                subsections={editableJournal.subsections}
                onRemoveSubsection={handleRemoveSubsection}
                onAddSubsectionClick={handleCreateSubsection}
                onReorderSubsections={handleReorderSubsections}
              />
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              {getAutoSaveIndicator()}

              <Button
                type="button"
                onClick={handleCreateSubsection}
                size="sm"
                className="ml-auto gap-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border-none shadow-sm hover:shadow-md transition-all duration-200"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex items-center">
          {!sidebarVisible && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-3 h-8 w-8 text-slate-500"
              onClick={() => setSidebarVisible(true)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}

          <div className="flex-1 min-w-0">
            {isCreatingSubsection ? (
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Create New Section
              </h2>
            ) : editMode ? (
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Edit Section:{' '}
                {editableJournal.subsections[selectedSubsectionIndex]?.title || ''}
              </h2>
            ) : selectedSubsectionId ? (
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate pr-4">
                  {editableJournal.subsections[selectedSubsectionIndex]
                    ?.title || ''}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditSubsection}
                  className="gap-1 border-slate-200 dark:border-slate-700 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            ) : (
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Journal Information
              </h2>
            )}
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {isCreatingSubsection ? (
            <SubsectionForm
              isSubmitting={false}
              onAddSubsection={handleAddSubsection}
              onCancel={() => setIsCreatingSubsection(false)}
              journalId={journal.id}
            />
          ) : editMode && subsectionFormData ? (
            <SubsectionForm
              isSubmitting={false}
              onAddSubsection={handleUpdateEditingSubsection}
              onCancel={() => {
                setEditMode(false);
                setSubsectionFormData(null);
              }}
              journalId={journal.id}
              existingSubsection={subsectionFormData}
            />
          ) : selectedSubsectionId && selectedSubsectionIndex !== -1 ? (
            <div className="max-w-3xl mx-auto">
              {subsectionDetails[selectedSubsectionId] ? (
                <SubsectionDetail
                  subsection={subsectionDetails[selectedSubsectionId]}
                  isActive={true}
                  toggleSubsection={() => {}}
                  colors={getSubsectionTypeColors(
                    subsectionDetails[selectedSubsectionId].type
                  )}
                  index={selectedSubsectionIndex}
                  onUpdateSubsection={handleUpdateSubsection}
                />
              ) : (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                  <span className="ml-3 text-slate-600 dark:text-slate-400">
                    Loading section details...
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                  Journal Metadata
                </h3>
                <JournalMetadataForm
                  formData={editableJournal}
                  onChange={handleJournalMetadataChange}
                  onLocationChange={handleLocationChange}
                  onCoverImageUpload={handleCoverImageUpload}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={onCancel}
            className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSaveJournal}
            disabled={isSaving}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-6 shadow-sm hover:shadow-md transition-all duration-200"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Journal
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
