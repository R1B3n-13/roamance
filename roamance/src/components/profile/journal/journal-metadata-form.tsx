import { LocationPickerMap } from '@/components/maps/LocationPickerMap';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { JournalCreateRequest } from '@/types/journal';
import { CloudinaryUploadResult } from '@/service/cloudinary-service';
import FileUploader from '@/components/common/file-uploader';
import {
  Calendar,
  ImageIcon,
  Share2
} from 'lucide-react';
import React from 'react';

interface JournalMetadataFormProps {
  formData: JournalCreateRequest;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverImageUpload: (result: CloudinaryUploadResult) => void;
}

export const JournalMetadataForm: React.FC<JournalMetadataFormProps> = ({
  formData,
  onChange,
  onLocationChange,
  onCoverImageUpload,
}) => {
  const handleCheckboxChange = (field: string) => {
    return (checked: boolean) => {
      const syntheticEvent = {
        target: {
          name: field,
          value: checked,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Text information */}
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
              onChange={onChange}
              placeholder="My Amazing Journey"
              className="h-11"
              required
            />
          </div>

          <div>
            <label
              htmlFor="date"
              className="text-sm font-medium text-foreground/80 mb-1.5 block"
            >
              Journal Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={onChange}
                className="h-11 pl-10"
                required
              />
            </div>
          </div>
        </div>

        {/* Right column - Description */}
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
              onChange={onChange}
              rows={5}
              placeholder="Describe your journey experience..."
              className="resize-none"
              required
            />
          </div>

          <div className="flex items-center space-x-3 mt-2">
            <Checkbox
              id="is_shared"
              checked={formData.is_shared}
              onCheckedChange={handleCheckboxChange('is_shared')}
            />
            <Label
              htmlFor="is_shared"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              Share Publicly
            </Label>
          </div>
        </div>
      </div>

      {/* Full width elements */}
      <div className="space-y-6 mt-6">
        <div>
          <label
            htmlFor="cover_image"
            className="text-sm font-medium text-foreground/80 mb-1.5 block"
          >
            Cover Image
          </label>
          <div className="space-y-2 h-[250px] flex flex-col">
            <FileUploader
              onUploadSuccess={(result) => onCoverImageUpload(result)}
              onUploadError={(error) => console.error('Upload error:', error)}
              acceptedFileTypes="image/*"
              maxSizeMB={5}
              buttonText="Upload Journal Cover Image"
              showPreview={true}
              className="w-full flex-1"
            />
            {formData.cover_image && (
              <div className="text-xs text-muted-foreground truncate mt-1">
                <ImageIcon className="w-3 h-3 inline-block mr-1" />
                {formData.cover_image}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="location"
            className="text-sm font-medium text-foreground/80 mb-1.5 block"
          >
            Destination Location
          </label>
          <LocationPickerMap
            initialLocation={formData.destination || { latitude: 0, longitude: 0 }}
            onLocationChangeAction={(lat, lng) => {
              const syntheticEvent = {
                target: {
                  name: 'latitude',
                  value: lat.toString(),
                },
              } as React.ChangeEvent<HTMLInputElement>;
              onLocationChange(syntheticEvent);

              const longitudeEvent = {
                target: {
                  name: 'longitude',
                  value: lng.toString(),
                },
              } as React.ChangeEvent<HTMLInputElement>;
              onLocationChange(longitudeEvent);
            }}
            height="300px"
          />
        </div>
      </div>
    </div>
  );
};
