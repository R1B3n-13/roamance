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
  Globe,
  Upload,
  PlusCircle,
  Eye,
  Settings2
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
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverImageUpload: (result: CloudinaryUploadResult) => void;
}

export const JournalMetadataForm: React.FC<JournalMetadataFormProps> = ({
  formData,
  onChange,
  onLocationChange,
  onCoverImageUpload,
}) => {
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [showCoverImage, setShowCoverImage] = useState(!!formData.cover_image);

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-1.5 text-foreground/80">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            Cover Image
          </Label>
          {formData.cover_image && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCoverImage(!showCoverImage)}
              className="h-7 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground"
            >
              {showCoverImage ? (
                <>
                  <X className="h-3.5 w-3.5" />
                  Hide Image
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Show Image
                </>
              )}
            </Button>
          )}
        </div>

        {formData.cover_image && showCoverImage ? (
          <div className="relative rounded-lg overflow-hidden border border-muted bg-muted/20 h-48 group">
            <Image
              src={formData.cover_image}
              alt="Cover"
              fill
              className="object-cover transition-all duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex justify-between">
                <FileUploader
                  onUploadComplete={onCoverImageUpload}
                  uploadPreset="journal_covers"
                  buttonClassName="bg-white/90 hover:bg-white text-slate-800 h-8 text-xs px-2 gap-1"
                  buttonContent={
                    <>
                      <Camera className="h-3.5 w-3.5" /> Change Photo
                    </>
                  }
                />

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onChange({
                    target: { name: 'cover_image', value: '' }
                  } as React.ChangeEvent<HTMLInputElement>)}
                  className="h-8 text-xs px-2 gap-1 bg-red-500/90 hover:bg-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center border border-dashed border-muted rounded-lg bg-muted/10 h-32">
            <FileUploader
              onUploadComplete={onCoverImageUpload}
              uploadPreset="journal_covers"
              buttonClassName="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-9 gap-1.5 shadow-sm hover:shadow-md transition-all duration-200"
              buttonContent={
                <>
                  <Upload className="h-4 w-4" /> Upload Cover Image
                </>
              }
            />
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Upload a cover image to make your journal more visually appealing
        </p>
      </div>

      {/* Title and Date */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-2">
          <Label
            htmlFor="title"
            className="text-sm font-medium flex items-center gap-1.5 text-foreground/80"
          >
            <Info className="h-4 w-4 text-muted-foreground" />
            Journal Title
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="Enter a title for your travel journal"
            className="w-full border-muted focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="date"
            className="text-sm font-medium flex items-center gap-1.5 text-foreground/80"
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Travel Date
          </Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={onChange}
            className="w-full border-muted focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label
          htmlFor="description"
          className="text-sm font-medium flex items-center gap-1.5 text-foreground/80"
        >
          <Globe className="h-4 w-4 text-muted-foreground" />
          Description & Destination
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onChange}
          placeholder="Describe your journey and the destination..."
          className="resize-y min-h-[100px] border-muted focus-visible:ring-blue-500/20 focus-visible:border-blue-500"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Tip: Add "Destination: [Name]" and "Travel Dates: [Dates]" at the start to highlight key information
        </p>
      </div>

      {/* Location (Map) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-1.5 text-foreground/80">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Main Destination Location
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsMapDialogOpen(true)}
            className="h-7 gap-1.5 text-xs border-muted hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Map className="h-3.5 w-3.5" />
            Select on Map
          </Button>
        </div>

        {/* Coordinates Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="latitude"
              className="text-xs text-muted-foreground"
            >
              Latitude
            </Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="0.000001"
              value={formData.destination?.latitude || 0}
              onChange={onLocationChange}
              className="border-muted"
            />
          </div>
          <div className="space-y-2">
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
              step="0.000001"
              value={formData.destination?.longitude || 0}
              onChange={onLocationChange}
              className="border-muted"
            />
          </div>
        </div>

        {/* Preview location indicator */}
        {formData.destination &&
          (formData.destination.latitude !== 0 || formData.destination.longitude !== 0) && (
          <div className="flex items-center justify-between mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800/60 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Location Set
                </div>
                <div className="text-xs text-blue-600/80 dark:text-blue-500/80">
                  {formData.destination.latitude.toFixed(6)}, {formData.destination.longitude.toFixed(6)}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({
                target: {
                  name: 'destination',
                  value: { latitude: 0, longitude: 0 }
                }
              } as any)}
              className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800/30"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Journal Flags/Settings */}
      <div className="space-y-4 pt-2 border-t border-muted/60">
        <Label className="text-sm font-medium flex items-center gap-1.5 text-foreground/80">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          Journal Settings
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="is_favorite"
              name="is_favorite"
              checked={formData.is_favorite}
              onCheckedChange={(checked) => {
                onChange({
                  target: {
                    name: 'is_favorite',
                    value: checked,
                    type: 'checkbox',
                    checked: checked as boolean,
                  }
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              className="h-5 w-5 mt-0.5 text-amber-500 border-muted data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <div className="space-y-1">
              <Label
                htmlFor="is_favorite"
                className="font-medium cursor-pointer flex items-center gap-1.5"
              >
                <Star className="h-4 w-4 text-amber-500" />
                <span>Favorite</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Mark this journal as a favorite for quick access
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="is_shared"
              name="is_shared"
              checked={formData.is_shared}
              onCheckedChange={(checked) => {
                onChange({
                  target: {
                    name: 'is_shared',
                    value: checked,
                    type: 'checkbox',
                    checked: checked as boolean,
                  }
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              className="h-5 w-5 mt-0.5 text-blue-500 border-muted data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
            <div className="space-y-1">
              <Label
                htmlFor="is_shared"
                className="font-medium cursor-pointer flex items-center gap-1.5"
              >
                <Share2 className="h-4 w-4 text-blue-500" />
                <span>Public</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Make this journal publicly viewable by others
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="is_archived"
              name="is_archived"
              checked={formData.is_archived}
              onCheckedChange={(checked) => {
                onChange({
                  target: {
                    name: 'is_archived',
                    value: checked,
                    type: 'checkbox',
                    checked: checked as boolean,
                  }
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              className="h-5 w-5 mt-0.5 text-slate-500 border-muted data-[state=checked]:bg-slate-500 data-[state=checked]:border-slate-500"
            />
            <div className="space-y-1">
              <Label
                htmlFor="is_archived"
                className="font-medium cursor-pointer flex items-center gap-1.5"
              >
                <Archive className="h-4 w-4 text-slate-500" />
                <span>Archived</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Archive this journal to hide it from your main list
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Dialog for selecting location */}
      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Select Location
            </DialogTitle>
            <DialogDescription>
              Click on the map to select the main destination for your journal
            </DialogDescription>
          </DialogHeader>

          <div className="border rounded-lg overflow-hidden h-[400px]">
            <LocationPickerMap
              initialLocation={formData.destination}
              onLocationChangeAction={(lat, lng) => {
                onChange({
                  target: {
                    name: 'destination',
                    value: { latitude: lat, longitude: lng },
                  }
                } as any);
              }}
              height="400px"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="text-muted-foreground">Selected: </span>
              <span className="font-medium">
                {formData.destination.latitude.toFixed(6)}, {formData.destination.longitude.toFixed(6)}
              </span>
            </div>
            <Button
              type="button"
              onClick={() => setIsMapDialogOpen(false)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              Confirm Location
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
