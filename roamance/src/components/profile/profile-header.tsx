'use client';

import { CloudinaryUploadResult } from '@/api/cloudinary-api';
import { api } from '@/api/roamance-api';
import { CloudinaryUploader } from '@/components/common/cloudinary-uploader';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { USER_ENDPOINTS } from '@/constants/api';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { getDateParts, getMonthName } from '@/utils/format';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Camera, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProfileHeaderProps {
  user: User | null;
  loading: boolean;
  onProfileUpdate?: () => void;
}

export function ProfileHeader({
  user,
  loading,
  onProfileUpdate,
}: ProfileHeaderProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Calculate initials for avatar fallback
  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleUploadSuccess = async (result: CloudinaryUploadResult) => {
    if (!user) return;

    try {
      setIsUploading(true);

      // Send request to update user profile with new image URL
      await api.put(USER_ENDPOINTS.UPDATE, {
        profileImage: result.secure_url,
      });

      toast.success('Profile picture updated successfully');
      setIsUploadDialogOpen(false);

      // Trigger profile refresh
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error('Upload failed:', error);
    toast.error('Image upload failed: ' + error.message);
  };

  return (
    <div className="relative">
      {/* Enhanced decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-64 rounded-full opacity-30 blur-3xl -z-10 bg-gradient-to-br from-ocean via-sunset to-forest animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-1/4 h-48 rounded-full opacity-25 blur-3xl -z-10 bg-gradient-to-tr from-forest via-sand to-sunset animate-pulse-slow" />
      <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full opacity-20 blur-3xl -z-10 bg-gradient-to-r from-mountain to-ocean animate-float" />

      {/* Upload profile picture dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md border border-muted/30 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Update Profile Picture</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload a new profile picture from your device or camera
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <CloudinaryUploader
              onUpload={handleUploadSuccess}
              onError={handleUploadError}
              value={user?.profileImage}
              publicId={user?.id ? `user-${user.id}` : undefined}
              buttonText={isUploading ? "Updating..." : "Select Image"}
              className="w-full"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile header card - enhanced with more elegant design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-muted/30',
          'bg-gradient-to-r from-background via-background to-background/90',
          'backdrop-blur-sm shadow-xl'
        )}
      >
        {/* Enhanced gradient header with artistic pattern overlay */}
        <div className="h-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-ocean via-sunset to-forest opacity-90" />
          <div className="absolute inset-0 opacity-30 bg-[url('/images/roamance-logo-no-text.png')] bg-repeat-space bg-contain mix-blend-overlay" />

          {/* Navigation buttons positioned elegantly in the top-right with refined styling */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center overflow-hidden">
              <ThemeToggle className="h-full w-full text-white bg-transparent hover:bg-transparent border-none shadow-none" />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20 transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/20 transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={() => router.push(routes.home.href)}
              aria-label="Go to homepage"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row px-6 pb-8 -mt-14 md:items-end gap-6">
          {/* Enhanced Avatar with more refined styling and animations */}
          <div className="flex-shrink-0 relative group">
            {loading ? (
              <Skeleton className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-background shadow-xl" />
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Avatar className="w-28 h-28 md:w-36 md:h-36 border-4 border-background shadow-xl ring-2 ring-muted/30 ring-offset-2 ring-offset-background">
                  <AvatarImage
                    src={user?.profileImage || undefined}
                    alt={user?.name || 'User'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-ocean to-ocean-dark text-2xl md:text-3xl text-white font-light">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Enhanced overlay for uploading new image */}
                <div
                  className={`absolute inset-0 bg-black/30 rounded-full transition-all duration-300 flex items-center justify-center backdrop-blur-sm ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${isUploading ? 'cursor-wait' : 'cursor-pointer'}`}
                  onClick={() => !isUploading && setIsUploadDialogOpen(true)}
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="bg-white/30 p-3 rounded-full backdrop-blur-md shadow-lg"
                  >
                    {isUploading ? (
                      <div className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Enhanced Profile info with more spacing and elegant typography */}
          <div className="flex-grow space-y-4 mt-2">
            {loading ? (
              <>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                    {user?.name || 'Traveler'}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Badge
                    variant="outline"
                    className="flex gap-1.5 px-3 py-1.5 bg-ocean/10 border-ocean/20 text-ocean-dark backdrop-blur-sm hover:bg-ocean/15 transition-colors duration-300"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      Joined{' '}
                      {`${getMonthName(getDateParts(`${user?.created_at}`).month)} ${getDateParts(`${user?.created_at}`).year}` ||
                        'April 20XX'}
                    </span>
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
