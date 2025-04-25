'use client';

import { User } from '@/types/social';
import {
  Camera, ImageIcon, MapPin, Smile, Video, X
} from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (e.target.value.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, you would upload these files to your server/cloud storage
    // and get back URLs to store in imagePaths
    const files = e.target.files;
    if (files && files.length > 0) {
      // Simulating image uploads for demonstration
      const newImagePaths = Array.from(files).map(file => URL.createObjectURL(file));
      setImagePaths(prev => [...prev, ...newImagePaths]);
      setIsExpanded(true);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, you would upload these files to your server/cloud storage
    // and get back URLs to store in videoPaths
    const files = e.target.files;
    if (files && files.length > 0) {
      // Simulating video uploads for demonstration
      const newVideoPaths = Array.from(files).map(file => URL.createObjectURL(file));
      setVideoPaths(prev => [...prev, ...newVideoPaths]);
      setIsExpanded(true);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePaths(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setVideoPaths(prev => prev.filter((_, i) => i !== index));
  };

  const handleLocationAdd = () => {
    // In a real app, you would use the browser's geolocation API
    // or let the user select a location from a map
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          name: 'Current Location' // You would get the real location name from a reverse geocoding service
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        // Fallback to a default location
        setLocation({
          latitude: 40.712776,
          longitude: -74.005974,
          name: 'New York City'
        });
      }
    );
    setIsExpanded(true);
  };

  const handleRemoveLocation = () => {
    setLocation(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting || text.trim() === '') return;

    await onSubmit({
      text,
      image_paths: imagePaths,
      video_paths: videoPaths,
      location: location || undefined
    });

    // Reset form
    setText('');
    setImagePaths([]);
    setVideoPaths([]);
    setLocation(null);
    setIsExpanded(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700/50 transition-all duration-300">
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
                        <div key={`img-${index}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <Image
                            src={path}
                            alt={`Uploaded image ${index}`}
                            layout="fill"
                            objectFit="cover"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-black/80 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {videoPaths.map((path, index) => (
                        <div key={`vid-${index}`} className="relative w-24 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <video
                            src={path}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                          <button
                            onClick={() => handleRemoveVideo(index)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-black/80 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Location Display */}
                  {location && (
                    <div className="mt-3 flex items-center bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-300 rounded-full py-1.5 px-3 w-fit">
                      <MapPin className="h-3.5 w-3.5 mr-1.5 text-purple-500 dark:text-purple-400" />
                      <span>{location.name}</span>
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
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <ImageIcon className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  <span>Photo</span>
                </button>

                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                  accept="video/*"
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Video className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                  <span>Video</span>
                </button>

                <button
                  onClick={handleLocationAdd}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                  <span>Location</span>
                </button>

                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-700 dark:text-gray-300 transition-colors">
                  <Smile className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                  <span>Feeling</span>
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || text.trim() === ''}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  text.trim() !== ''
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm hover:shadow"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                )}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
