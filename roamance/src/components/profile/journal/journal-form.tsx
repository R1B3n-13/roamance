import { DialogXButton } from '@/components/common/button/dialog-x-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CloudinaryUploadResult } from '@/service/cloudinary-service';
import { JournalCreateRequest, JournalDetail } from '@/types/journal';
import { SubsectionRequest } from '@/types/subsection';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Loader2, MapPin, PlusCircle, Save, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { JournalMetadataForm } from './journal-metadata-form';
import { SubsectionForm } from './subsection-form';
import { SubsectionList } from './subsection-list';

interface JournalFormProps {
  journal?: JournalDetail;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (journalData: JournalCreateRequest) => Promise<void>;
  isLoading: boolean;
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
    is_favorite: false,
    is_archived: false,
    is_shared: false,
    date: new Date().toISOString().split('T')[0],
    cover_image: '',
  });

  const [subsectionFormVisible, setSubsectionFormVisible] = useState(false);
  const [isSubmittingSubsection, setIsSubmittingSubsection] = useState(false);

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
        is_favorite: journal.is_favorite,
        is_archived: journal.is_archived,
        is_shared: journal.is_shared,
        date: journal.date || new Date().toISOString().split('T')[0],
        cover_image: journal.cover_image || '',
      });
    } else {
      // Reset form when creating a new journal
      setFormData({
        title: '',
        description: '',
        destination: { latitude: 0, longitude: 0 },
        subsections: [],
        is_favorite: false,
        is_archived: false,
        is_shared: false,
        date: new Date().toISOString().split('T')[0],
        cover_image: '',
      });
    }
  }, [journal]);

  const handleCoverImageUpload = (result: CloudinaryUploadResult) => {
    // Update the form data with the uploaded image URL
    setFormData((prev) => ({
      ...prev,
      cover_image: result.url,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for checkbox fields
    if (name === 'is_favorite' || name === 'is_archived' || name === 'is_shared') {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : value === 'true',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

  const handleAddSubsection = (subsection: SubsectionRequest) => {
    setIsSubmittingSubsection(true);

    try {
      // Add to form data
      setFormData((prev) => ({
        ...prev,
        subsections: [...prev.subsections, subsection],
      }));

      setSubsectionFormVisible(false);
    } catch (error) {
      console.error('Error adding subsection:', error);
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
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-4xl sm:max-w-4xl max-h-[85vh] overflow-hidden p-0 rounded-xl border border-muted/30 shadow-xl">
        {/* Decorative header with gradient background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-violet-600/10 z-0"></div>
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600"></div>
          <div className="absolute -left-20 -top-20 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -right-20 -bottom-10 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl"></div>

          <div className="relative px-8 py-5 border-b border-muted/20 bg-background/80 backdrop-blur-md z-10 flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold p-0 m-0">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {journal ? 'Edit Journal' : 'Create New Journal'}
                  </span>
                </DialogTitle>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {journal ? 'Update your travel memories' : 'Document your travel experiences'}
                </p>
              </div>
            </motion.div>
            <DialogXButton
              onClick={onClose}
              className="hover:bg-muted/80 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col flex-1 h-full max-h-[calc(85vh-80px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="px-8 py-6">
              {/* Form header with decorative element */}
              <div className="relative mb-6">
                <div className="absolute left-0 top-1/2 w-1 h-6 bg-indigo-500 rounded-r-full transform -translate-y-1/2"></div>
                <h3 className="text-lg font-medium pl-3 text-foreground">Journal Details</h3>
              </div>

              {/* Journal Metadata Form */}
              <div className="bg-muted/5 rounded-xl border border-muted/20 p-6 mb-8 shadow-sm">
                <JournalMetadataForm
                  formData={formData}
                  onChange={handleChange}
                  onLocationChange={handleLocationChange}
                  onCoverImageUpload={handleCoverImageUpload}
                />
              </div>

              {/* Sections header with decorative element */}
              <div className="relative mb-6 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="absolute left-0 top-1/2 w-1 h-6 bg-purple-500 rounded-r-full transform -translate-y-1/2"></div>
                  <h3 className="text-lg font-medium pl-3 text-foreground">Journal Sections</h3>
                </div>

                <Button
                  type="button"
                  onClick={() => setSubsectionFormVisible(true)}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-sm hover:shadow-md transition-all duration-200 gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Section
                </Button>
              </div>

              {/* Sections list with improved styling */}
              <div className="bg-muted/5 rounded-xl border border-muted/20 p-2 shadow-sm mb-6 min-h-[150px]">
                <SubsectionList
                  subsections={formData.subsections}
                  onRemoveSubsection={removeSubsection}
                  onAddSubsectionClick={() => setSubsectionFormVisible(true)}
                />
              </div>
            </form>
          </div>

          {/* Footer with action buttons */}
          <div className="sticky bottom-0 w-full bg-muted/10 backdrop-blur-sm border-t border-muted/20 p-6 flex justify-between items-center">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="min-w-[100px] border-muted/60 hover:bg-background gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </Button>

            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className={cn(
                "min-w-[180px] relative overflow-hidden gap-2",
                "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700",
                "text-white shadow-md hover:shadow-lg transition-all duration-300"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Journal...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Journal</span>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-4 h-4 text-white/80" />
                  </motion.div>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Journal Subsection Form Modal with enhanced styling */}
        <AnimatePresence>
          {subsectionFormVisible && (
            <Dialog
              open={subsectionFormVisible}
              onOpenChange={setSubsectionFormVisible}
            >
              <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[70vh] overflow-hidden p-0 rounded-xl border border-muted/30 shadow-xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-600/10 z-0"></div>
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
                  <div className="absolute -left-20 -top-20 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl"></div>

                  <div className="relative p-6 pb-4 border-b border-muted/20 bg-background/80 backdrop-blur-md z-10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold text-foreground m-0 p-0">
                        Add New Journal Section
                      </DialogTitle>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        Document a specific part of your journey
                      </p>
                    </div>
                    <DialogXButton
                      onClick={() => setSubsectionFormVisible(false)}
                      className="ml-auto hover:bg-muted/80 transition-colors"
                    />
                  </div>
                </div>

                <div className="max-h-[calc(70vh-140px)] overflow-y-auto">
                  <div className="p-6">
                    <SubsectionForm
                      isSubmitting={isSubmittingSubsection}
                      onAddSubsection={handleAddSubsection}
                      onCancel={() => setSubsectionFormVisible(false)}
                      journalId={journal?.id}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
