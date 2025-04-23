import { DialogXButton } from '@/components/common/button/dialog-x-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { JournalCreateRequest, JournalDetail } from '@/types/journal';
import { SubsectionRequest } from '@/types/subsection';
import { Loader2, Save } from 'lucide-react';
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
  });

  const [subsectionFormVisible, setSubsectionFormVisible] = useState(false);
  const [isSubmittingSubsection, setIsSubmittingSubsection] = useState(false);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    const enhancedFormData = {
      ...formData,
      // We can add the additional metadata to description until backend supports it
      description: `${formData.description}\n\nDestination: ${destinationName}\nTravel Dates: ${travelDates.startDate} to ${travelDates.endDate}\nCover Image: ${coverImage}`,
    };
    await onSubmit(enhancedFormData);
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
          {/* Journal Metadata Form */}
          <JournalMetadataForm
            formData={formData}
            destinationName={destinationName}
            coverImage={coverImage}
            travelDates={travelDates}
            onChange={handleChange}
            onLocationChange={handleLocationChange}
            onDateChange={handleDateChange}
            onDestinationNameChange={(e) => setDestinationName(e.target.value)}
            onCoverImageChange={(e) => setCoverImage(e.target.value)}
          />

          {/* Subsections */}
          <SubsectionList
            subsections={formData.subsections}
            onRemoveSubsection={removeSubsection}
            onAddSubsectionClick={() => setSubsectionFormVisible(true)}
          />

          {/* Journal Subsection Form Modal */}
          <Dialog
            open={subsectionFormVisible}
            onOpenChange={setSubsectionFormVisible}
          >
            <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[60vh] overflow-y-auto p-0">
              <DialogHeader className="p-6 pb-3 border-b border-muted/20">
                <DialogTitle className="text-xl font-semibold text-foreground">
                  Add New Section
                </DialogTitle>
              </DialogHeader>

              <div className="p-6">
                <SubsectionForm
                  isSubmitting={isSubmittingSubsection}
                  onAddSubsection={handleAddSubsection}
                  onCancel={() => setSubsectionFormVisible(false)}
                  journalId={journal?.id}
                />
              </div>
            </DialogContent>
          </Dialog>

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
