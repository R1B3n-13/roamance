import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { JournalCreateRequest } from '@/types/journal';
import {
  Calendar,
  ImageIcon,
  MapPin,
  Navigation,
  Share2,
} from 'lucide-react';
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface JournalMetadataFormProps {
  formData: JournalCreateRequest;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const JournalMetadataForm: React.FC<JournalMetadataFormProps> = ({
  formData,
  onChange,
  onLocationChange,
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
                onChange={onLocationChange}
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
                onChange={onLocationChange}
                placeholder="0.00"
                className="h-11 pl-10"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="cover_image"
            className="text-sm font-medium text-foreground/80 mb-1.5 block"
          >
            Cover Image URL
          </label>
          <div className="relative">
            <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              id="cover_image"
              name="cover_image"
              value={formData.cover_image}
              onChange={onChange}
              placeholder="https://example.com/image.jpg"
              className="h-11 pl-10"
            />
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
            onChange={onChange}
            rows={5}
            placeholder="Describe your journey experience..."
            className="resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 mt-5">
          <div className="flex items-center space-x-3">
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
    </div>
  );
};
