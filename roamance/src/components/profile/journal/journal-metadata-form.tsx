import { LocationPickerMap } from '@/components/maps/LocationPickerMap';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { JournalCreateRequest } from '@/types/journal';
import { CloudinaryUploadResult } from '@/service/cloudinary-service';
import {
  Calendar,
  ImageIcon,
  MapPin,
  Share2,
  Archive,
  Star,
  Info,
} from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import FileUploader from '@/components/common/file-uploader';

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
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');

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

  const handleImageUpload = (result: CloudinaryUploadResult) => {
    setImageUploadStatus('uploading');
    try {
      onCoverImageUpload(result);
      setImageUploadStatus('success');

      // Reset status after 3 seconds
      setTimeout(() => {
        setImageUploadStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Image upload failed:', error);
      setImageUploadStatus('error');

      // Reset status after 3 seconds
      setTimeout(() => {
        setImageUploadStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Input */}
      <div className="space-y-2">
        <Label
          htmlFor="title"
          className="text-sm font-medium flex items-center gap-1.5"
        >
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
          Journal Title
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={onChange}
          placeholder="Enter a title for your travel journal"
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
        />
      </div>

      {/* Date Input */}
      <div className="space-y-2">
        <Label
          htmlFor="date"
          className="text-sm font-medium flex items-center gap-1.5"
        >
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          Travel Date
        </Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={formData.date}
          onChange={onChange}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
        />
        {formData.date && (
          <p className="text-xs text-muted-foreground mt-1">
            {/* {format(new Date(formData.date), 'PPPP')} */}
          </p>
        )}
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-medium flex items-center gap-1.5"
        >
          <Info className="h-3.5 w-3.5 text-muted-foreground" />
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Describe your journey, include highlights and special memories"
          className="min-h-24 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
        />
        <p className="text-xs text-muted-foreground">
          You can include trip details like destination name and travel dates.
        </p>
      </div>

      {/* Location Input - Expandable section */}
      <div className="space-y-2">
        <div
          className="flex justify-between items-center cursor-pointer group"
          onClick={() => setShowLocationPicker(!showLocationPicker)}
        >
          <Label className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            <span className="group-hover:text-blue-500 transition-colors">
              Location
            </span>
          </Label>
          <div
            className={cn(
              'text-xs text-blue-600 dark:text-blue-400 flex gap-1 items-center transition-transform duration-300',
              showLocationPicker ? 'rotate-180' : ''
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
            <span>{showLocationPicker ? 'Hide Map' : 'Show Map'}</span>
          </div>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude" className="text-xs text-muted-foreground">
              Latitude
            </Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              value={formData.destination.latitude}
              onChange={onLocationChange}
              step="0.000001"
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
            />
          </div>
          <div>
            <Label
              htmlFor="longitude"
              className="text-xs text-muted-foreground"
            >
              Longitude
            </Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              value={formData.destination.longitude}
              onChange={onLocationChange}
              step="0.000001"
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
            />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {showLocationPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden mt-2 shadow-sm">
                <LocationPickerMap
                  initialLocation={formData.destination}
                  onLocationChangeAction={(lat, lng) => {
                    // Create synthetic events
                    onLocationChange({
                      target: { name: 'latitude', value: lat.toString() },
                    } as React.ChangeEvent<HTMLInputElement>);
                    onLocationChange({
                      target: { name: 'longitude', value: lng.toString() },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  height="300px"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Drag the marker to set your journal&apos;s location, or click
                anywhere on the map
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cover Image */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
          Cover Image
        </Label>

        <div
          className={cn(
            'rounded-lg border-2 border-dashed p-4 transition-all',
            formData.cover_image
              ? 'border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10'
              : 'border-slate-200 dark:border-slate-800'
          )}
        >
          {formData.cover_image ? (
            <div className="space-y-3">
              <div className="aspect-video w-full rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 relative group">
                <Image
                  src={formData.cover_image}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-white/30 transition-colors"
                    onClick={() => {
                      // Reset cover image
                      const syntheticEvent = {
                        target: {
                          name: 'cover_image',
                          value: '',
                        },
                      } as unknown as React.ChangeEvent<HTMLInputElement>;
                      onChange(syntheticEvent);
                    }}
                  >
                    Replace Image
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Selected cover image
                </p>
                <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {imageUploadStatus === 'success' && '✓ Image uploaded'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="mb-3 w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                  Upload a cover image
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  PNG, JPG or WEBP up to 5MB
                </p>
              </div>
              <FileUploader
                onUploadSuccess={handleImageUpload}
                acceptedFileTypes="image/*"
                maxSizeMB={5}
                multiple={false}
                className="rounded-md mt-4"
                buttonText="Select cover image"
              />
            </div>
          )}
        </div>
      </div>

      {/* Journal Settings */}
      <div className="space-y-4 pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-medium text-muted-foreground">
          Journal Settings
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_favorite"
              checked={formData.is_favorite}
              onCheckedChange={handleCheckboxChange('is_favorite')}
              className="w-4 h-4 rounded-sm border-slate-300 dark:border-slate-700 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <Label
              htmlFor="is_favorite"
              className="text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Star className="h-3.5 w-3.5 text-amber-500" />
              Mark as Favorite
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_archived"
              checked={formData.is_archived}
              onCheckedChange={handleCheckboxChange('is_archived')}
              className="w-4 h-4 rounded-sm border-slate-300 dark:border-slate-700 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
            />
            <Label
              htmlFor="is_archived"
              className="text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Archive className="h-3.5 w-3.5 text-violet-500" />
              Archive Journal
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is_shared"
              checked={formData.is_shared}
              onCheckedChange={handleCheckboxChange('is_shared')}
              className="w-4 h-4 rounded-sm border-slate-300 dark:border-slate-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
            <Label
              htmlFor="is_shared"
              className="text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 text-blue-500" />
              Make Public
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
