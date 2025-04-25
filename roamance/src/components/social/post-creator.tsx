'use client';

import { User } from '@/types/social';
import {
  Camera, ImageIcon, MapPin, Smile, Video, X, Loader2, ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { PostService } from '@/service/social-service';
import { toast } from 'sonner';
import { CloudinaryService } from '@/service/cloudinary-service';

interface PostCreatorProps {
  currentUser?: User;
  onSubmit: (postData: {
    text: string;
    image_paths: string[];
    video_paths: string[];
    location?: { latitude: number; longitude: number; name?: string };
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export const PostCreator = ({ currentUser, onSubmit, isSubmitting = false }: PostCreatorProps) => {
  const [text, setText] = useState('');
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [videoPaths, setVideoPaths] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; name?: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 500;

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setText(value);
      setCharCount(value.length);
    }

    if (value.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        setUploadingMedia(true);
        setIsExpanded(true);

        // Convert FileList to array and upload each file
        const uploads = Array.from(files).map(async (file) => {
          // Create a temporary URL for preview
          const previewUrl = URL.createObjectURL(file);

          try {
            // Upload to Cloudinary
            const uploadedUrl = await CloudinaryService.uploadImage(file);
            return { previewUrl, uploadedUrl };
          } catch (error) {
            console.error("Error uploading image:", error);
            return { previewUrl, error: true };
          }
        });

        // Wait for all uploads to complete
        const results = await Promise.all(uploads);

        // Add uploaded images to state
        const newPaths = results.map(result => result.uploadedUrl || result.previewUrl);
        setImagePaths(prev => [...prev, ...newPaths]);

        // Show error toast if any uploads failed
        const failedUploads = results.filter(r => r.error).length;
        if (failedUploads > 0) {
          toast.error(`Failed to upload ${failedUploads} image${failedUploads > 1 ? 's' : ''}.`);
        }
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error('Failed to upload images. Please try again.');
      } finally {
        setUploadingMedia(false);
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      try {
        setUploadingMedia(true);
        setIsExpanded(true);

        // Convert FileList to array and upload each file
        const uploads = Array.from(files).map(async (file) => {
          // Create a temporary URL for preview
          const previewUrl = URL.createObjectURL(file);

          try {
            // Upload to Cloudinary
            const uploadedUrl = await CloudinaryService.uploadVideo(file);
            return { previewUrl, uploadedUrl };
          } catch (error) {
            console.error("Error uploading video:", error);
            return { previewUrl, error: true };
          }
        });

        // Wait for all uploads to complete
        const results = await Promise.all(uploads);

        // Add uploaded videos to state
        const newPaths = results.map(result => result.uploadedUrl || result.previewUrl);
        setVideoPaths(prev => [...prev, ...newPaths]);

        // Show error toast if any uploads failed
        const failedUploads = results.filter(r => r.error).length;
        if (failedUploads > 0) {
          toast.error(`Failed to upload ${failedUploads} video${failedUploads > 1 ? 's' : ''}.`);
        }
      } catch (error) {
        console.error('Error uploading videos:', error);
        toast.error('Failed to upload videos. Please try again.');
      } finally {
        setUploadingMedia(false);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePaths(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setVideoPaths(prev => prev.filter((_, i) => i !== index));
  };

  const handleLocationAdd = () => {
    // Show loading state
    const locationToast = toast.loading('Getting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Get location name using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );

          const data = await response.json();
          let locationName = data.display_name;

          // Try to get a shorter name if possible
          if (data.address) {
            locationName = data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.suburb ||
              data.address.county ||
              locationName;
          }

          // Set location with name
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: locationName
          });

          toast.dismiss(locationToast);
          toast.success('Location added!');
        } catch (error) {
          console.error('Error getting location name:', error);

          // Fallback to coordinates only
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });

          toast.dismiss(locationToast);
          toast.success('Location added (coordinates only).');
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.dismiss(locationToast);
        toast.error('Could not get your location. Please check your permissions.');

        // Ask user to enter location manually
        const manualLocation = window.prompt('Enter a location name:');
        if (manualLocation) {
          setLocation({
            latitude: 0, // Default coordinates
            longitude: 0,
            name: manualLocation
          });
        }
      }
    );

    setIsExpanded(true);
  };

  const handleRemoveLocation = () => {
    setLocation(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting || uploadingMedia || text.trim() === '') return;

    try {
      // First call the parent component's onSubmit for immediate feedback
      await onSubmit({
        text,
        image_paths: imagePaths,
        video_paths: videoPaths,
        location: location || undefined
      });

      // Now also try to submit to the actual API
      try {
        await PostService.createPost({
          text,
          image_paths: imagePaths,
          video_paths: videoPaths,
          location: location || { latitude: 0, longitude: 0 }
        });
      } catch (apiError) {
        console.error("API error when creating post:", apiError);
        // We don't show this error to the user since the post was already added to the UI
      }

      // Reset form
      setText('');
      setCharCount(0);
      setImagePaths([]);
      setVideoPaths([]);
      setLocation(null);
      setIsExpanded(false);

      toast.success('Post shared successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700/50">
      <div className="p-4">
        <div className="flex gap-3">
          <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-purple-200 dark:border-purple-700">
            <Image
              src={currentUser?.profile_image_url || '/images/roamance-logo-no-text.png'}
              alt={currentUser?.full_name || 'User'}
              layout="fill"
              objectFit="cover"
              className="rounded-full"
            />
          </div>

          <div className="flex-1">
            <textarea
              value={text}
              onChange={handleTextChange}
              onClick={() => setIsExpanded(true)}
              placeholder="Share your travel experience..."
              rows={isExpanded ? 3 : 1}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
            />

            {/* Character count */}
            <div className={cn(
              "mt-1 text-xs text-right transition-colors",
              charCount > MAX_CHARS * 0.8
                ? charCount > MAX_CHARS * 0.9
                  ? "text-red-500 dark:text-red-400"
                  : "text-amber-500 dark:text-amber-400"
                : "text-gray-400 dark:text-gray-500"
            )}>
              {charCount}/{MAX_CHARS}
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Media Previews */}
                  {(imagePaths.length > 0 || videoPaths.length > 0) && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {imagePaths.map((path, index) => (
                        <div key={`img-${index}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                          <Image
                            src={path}
                            alt={`Uploaded image ${index}`}
                            layout="fill"
                            objectFit="cover"
                            className="transition-transform group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-black/80 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {videoPaths.map((path, index) => (
                        <div key={`vid-${index}`} className="relative w-24 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                          <video
                            src={path}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                          <button
                            onClick={() => handleRemoveVideo(index)}
                            className="absolute top-1 right-1 bg-black/60 backdrop-blur-sm text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-black/80 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Status */}
                  {uploadingMedia && (
                    <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                      <Loader2 className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400 animate-spin" />
                      Uploading media...
                    </div>
                  )}

                  {/* Location Display */}
                  {location && (
                    <div className="mt-3 flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 text-sm text-gray-700 dark:text-gray-300 rounded-full py-1.5 px-3 w-fit group border border-gray-100 dark:border-gray-700/50">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-purple-500 dark:text-purple-400" />
                      <span className="group-hover:underline transition-all">
                        {location.name || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
                      </span>
                      <button
                        onClick={handleRemoveLocation}
                        className="ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700/30"
          >
            <div className="flex flex-wrap justify-between items-center gap-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploadingMedia || isSubmitting}
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-all",
                    uploadingMedia || isSubmitting
                      ? "bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30 hover:shadow-sm"
                  )}
                  disabled={uploadingMedia || isSubmitting}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Photo</span>
                </button>

                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                  accept="video/*"
                  multiple
                  className="hidden"
                  disabled={uploadingMedia || isSubmitting}
                />
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-all",
                    uploadingMedia || isSubmitting
                      ? "bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800/30 hover:shadow-sm"
                  )}
                  disabled={uploadingMedia || isSubmitting}
                >
                  <Video className="h-4 w-4" />
                  <span>Video</span>
                </button>

                <button
                  onClick={handleLocationAdd}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-all",
                    uploadingMedia || isSubmitting
                      ? "bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30 hover:shadow-sm"
                  )}
                  disabled={uploadingMedia || isSubmitting}
                >
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </button>

                <button
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-all",
                    uploadingMedia || isSubmitting
                      ? "bg-gray-100 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 text-yellow-600 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-800/30 hover:shadow-sm"
                  )}
                  disabled={uploadingMedia || isSubmitting}
                >
                  <Smile className="h-4 w-4" />
                  <span>Mood</span>
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || uploadingMedia || text.trim() === ''}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all",
                  text.trim() !== '' && !uploadingMedia && !isSubmitting
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:shadow hover:from-purple-500 hover:to-indigo-500 hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </span>
                ) : uploadingMedia ? (
                  <span className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Share Post
                    <ChevronDown className="ml-1 h-4 w-4 rotate-270" />
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
