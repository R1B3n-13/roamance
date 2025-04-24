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
  Camera,
  Map,
  ChevronDown,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { FileUploader } from '@/components/common/file-uploader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadSuccessful, setUploadSuccessful] = useState(false);

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

  const handleUploadSuccess = async (result: CloudinaryUploadResult) => {
    try {
      setIsUploading(true);

      // Update the form data with the uploaded image URL
      onCoverImageUpload(result);

      toast.success('Cover image uploaded successfully');

      // Mark that upload was successful
      setUploadSuccessful(true);
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload cover image');
      setUploadSuccessful(false);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle dialog close event
  const handleDialogOpenChange = (open: boolean) => {
    setIsUploadDialogOpen(open);

    // Reset the flag when dialog is closed
    if (!open) {
      setUploadSuccessful(false);
    }
  };

  // Handle FileUploader's close button click
  const handleUploaderClose = () => {
    setIsUploadDialogOpen(false);
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload failed:', error);
    toast.error('Image upload failed: ' + error.message);
    setUploadSuccessful(false);
  };

  return (
    <div className="space-y-6">
      {/* Cover Image upload dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md border border-muted/30 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-ocean to-forest bg-clip-text text-transparent">
              Update Journal Cover Image
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload a new cover image for your journal
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <FileUploader
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              acceptedFileTypes="image/*"
              maxSizeMB={5}
              buttonText={isUploading ? 'Uploading...' : 'Select Cover Image'}
              className="w-full"
              showPreview={true}
              onClose={handleUploaderClose}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Cover Image - matching the style in journal-detail-view */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
          Cover Image
        </Label>

        <div className="relative h-32 md:h-40 lg:h-52 overflow-hidden rounded-lg border border-muted/30 transition-all duration-300 hover:border-muted/50 group">
          {/* Cover image container with overlay and effects */}
          {formData.cover_image ? (
            <div className="relative w-full h-full">
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-10 group-hover:opacity-70 transition-opacity duration-300" />

              {/* Cover image */}
              <Image
                src={formData.cover_image}
                alt="Journal cover"
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-10000 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/roamance-logo-bg.png';
                }}
              />

              {/* Change cover button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute bottom-4 right-4 z-20 bg-white/20 hover:bg-white/40 text-white border border-white/30 transition-all duration-300 backdrop-blur-md shadow-md"
                onClick={() => !isUploading && setIsUploadDialogOpen(true)}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-1.5" />
                    <span>Change Cover</span>
                  </>
                )}
              </Button>

              {/* Journal title placeholder */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="space-y-2"
                >
                  <Badge className="bg-white/20 text-white backdrop-blur-sm border-none px-3 py-1">
                    Journal Cover
                  </Badge>
                  <h3 className="text-xl md:text-2xl font-bold text-white leading-tight tracking-tight drop-shadow-sm">
                    {formData.title || 'Your Journal Title'}
                  </h3>
                </motion.div>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 opacity-90">
                {/* Decorative elements */}
                <div className="absolute -left-20 -top-20 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -right-20 -bottom-10 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl"></div>
              </div>
              <div className="absolute inset-0 opacity-20 bg-[url('/images/roamance-logo-no-text.png')] bg-repeat-space bg-contain mix-blend-overlay animate-pulse-slow" />

              {/* Add cover button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-white">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full mb-3">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold leading-tight tracking-tight mb-2 text-center">
                  {formData.title || 'Your Journal Title'}
                </h3>
                <p className="text-sm text-center mb-4 max-w-md">
                  Add a beautiful cover image to showcase your travel memories
                </p>
                <Button
                  onClick={() => !isUploading && setIsUploadDialogOpen(true)}
                  disabled={isUploading}
                  className="bg-white/20 hover:bg-white/40 text-white border border-white/30 backdrop-blur-md"
                >
                  {isUploading ? (
                    <>
                      <span className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-1.5" />
                      <span>Add Cover Image</span>
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title Input - with styled section heading */}
      <div className="space-y-3 pt-2">
        <div className="relative">
          <div className="absolute left-0 top-1/2 w-1 h-6 bg-indigo-500 rounded-r-full transform -translate-y-1/2"></div>
          <h3 className="text-lg font-medium pl-3 text-foreground">
            Journal Information
          </h3>
        </div>

        <div className="bg-muted/5 rounded-xl border border-muted/20 p-6 shadow-sm space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium flex items-center gap-1.5"
            >
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              Journal Title <span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={onChange}
              placeholder="Enter a title for your travel journal"
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
              required
              aria-required="true"
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
        </div>
      </div>

      {/* Location section with improved styling */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute left-0 top-1/2 w-1 h-6 bg-purple-500 rounded-r-full transform -translate-y-1/2"></div>
          <h3 className="text-lg font-medium pl-3 text-foreground">
            Location
          </h3>
        </div>

        <div className="bg-muted/5 rounded-xl border border-muted/20 p-6 shadow-sm space-y-4">
          {/* Interactive Map Toggle - similar to the detail view */}
          <Button
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            variant="outline"
            className={cn(
              'w-full justify-between group p-4 h-auto border-muted/50 hover:border-indigo-400/50',
              showLocationPicker &&
                'border-indigo-400/50 bg-indigo-50/50 dark:bg-indigo-900/10'
            )}
          >
            <span className="flex items-center text-foreground">
              <Map className="w-5 h-5 mr-2 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-200" />
              <span className="font-medium">
                {showLocationPicker ? 'Hide Map Location' : 'Set Journal Location'}
              </span>
            </span>
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300',
                showLocationPicker
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 rotate-180'
                  : 'bg-muted/50'
              )}
            >
              <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </Button>

          <AnimatePresence initial={false}>
            {showLocationPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Coordinates inputs in a grid with improved styling */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Latitude</div>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      value={formData.destination.latitude}
                      onChange={onLocationChange}
                      step="0.000001"
                      className="bg-white dark:bg-slate-900 border-none shadow-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Longitude</div>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      value={formData.destination.longitude}
                      onChange={onLocationChange}
                      step="0.000001"
                      className="bg-white dark:bg-slate-900 border-none shadow-none"
                    />
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
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
                <p className="text-xs text-muted-foreground">
                  Drag the marker to set your journal&apos;s location, or click
                  anywhere on the map
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Journal Settings */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute left-0 top-1/2 w-1 h-6 bg-amber-500 rounded-r-full transform -translate-y-1/2"></div>
          <h3 className="text-lg font-medium pl-3 text-foreground">
            Journal Settings
          </h3>
        </div>

        <div className="bg-muted/5 rounded-xl border border-muted/20 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/20">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-amber-500 dark:text-amber-400 font-medium">Favorite</span>
                <div className="mt-1">
                  <Checkbox
                    id="is_favorite"
                    checked={formData.is_favorite}
                    onCheckedChange={handleCheckboxChange('is_favorite')}
                    className="w-4 h-4 rounded-sm border-amber-300 dark:border-amber-700 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <Label
                    htmlFor="is_favorite"
                    className="ml-2 text-sm cursor-pointer"
                  >
                    Mark as Favorite
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/20">
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-800/30 flex items-center justify-center flex-shrink-0">
                <Archive className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-violet-500 dark:text-violet-400 font-medium">Archive</span>
                <div className="mt-1">
                  <Checkbox
                    id="is_archived"
                    checked={formData.is_archived}
                    onCheckedChange={handleCheckboxChange('is_archived')}
                    className="w-4 h-4 rounded-sm border-violet-300 dark:border-violet-700 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500"
                  />
                  <Label
                    htmlFor="is_archived"
                    className="ml-2 text-sm cursor-pointer"
                  >
                    Archive Journal
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/20">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center flex-shrink-0">
                <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-blue-500 dark:text-blue-400 font-medium">Sharing</span>
                <div className="mt-1">
                  <Checkbox
                    id="is_shared"
                    checked={formData.is_shared}
                    onCheckedChange={handleCheckboxChange('is_shared')}
                    className="w-4 h-4 rounded-sm border-blue-300 dark:border-blue-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  />
                  <Label
                    htmlFor="is_shared"
                    className="ml-2 text-sm cursor-pointer"
                  >
                    Make Public
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
