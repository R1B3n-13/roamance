import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { JournalCreateRequest } from '@/types/journal';
import { Camera, CalendarRange, Globe, MapPin, Navigation } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface JournalMetadataFormProps {
  formData: JournalCreateRequest;
  destinationName: string;
  coverImage: string;
  travelDates: {
    startDate: string;
    endDate: string;
  };
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDestinationNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const JournalMetadataForm: React.FC<JournalMetadataFormProps> = ({
  formData,
  destinationName,
  coverImage,
  travelDates,
  onChange,
  onLocationChange,
  onDateChange,
  onDestinationNameChange,
  onCoverImageChange,
}) => {
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
              onChange={onDestinationNameChange}
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
                onChange={onDateChange}
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
                onChange={onDateChange}
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
              onChange={onCoverImageChange}
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
              width={500}
              height={300}
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
  );
};
