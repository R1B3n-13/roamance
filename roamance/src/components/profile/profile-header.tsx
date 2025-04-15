'use client';

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
import { routes } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { User, UserInfo } from '@/types';
import { getDateParts, getMonthName } from '@/utils/format';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Camera, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { FileUploader } from '@/components/common/file-uploader';
import { userService } from '@/service/user-service';
import { CloudinaryUploadResult } from '@/service/cloudinary-service';

interface ProfileHeaderProps {
  user: User | null;
  userInfo: UserInfo | null;
  loading: boolean;
  onProfileUpdate?: () => void;
}

export function ProfileHeader({
  user,
  userInfo,
  loading,
  onProfileUpdate,
}: ProfileHeaderProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadSuccessful, setUploadSuccessful] = useState(false);

  // New state for cover image upload
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isCoverUploadDialogOpen, setIsCoverUploadDialogOpen] = useState(false);
  const [coverUploadSuccessful, setCoverUploadSuccessful] = useState(false);

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

      // Update user info with new profile image
      await userService.updateUserInfo({
        ...userInfo,
        profile_image: result.url,
      });

      toast.success('Profile picture updated successfully');

      // Mark that upload was successful, but don't call onProfileUpdate yet
      setUploadSuccessful(true);
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      toast.error('Failed to update profile picture');
      setUploadSuccessful(false);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle dialog close event
  const handleDialogOpenChange = (open: boolean) => {
    setIsUploadDialogOpen(open);

    // When dialog is closed and there was a successful upload, refresh the profile
    if (!open && uploadSuccessful) {
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      // Reset the flag
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

  // Cover image upload functions
  const handleCoverUploadSuccess = async (result: CloudinaryUploadResult) => {
    if (!user) return;

    try {
      setIsCoverUploading(true);

      // Update user info with new cover image
      await userService.updateUserInfo({
        ...userInfo,
        cover_image: result.url,
      });

      toast.success('Cover image updated successfully');

      // Mark that upload was successful, but don't call onProfileUpdate yet
      setCoverUploadSuccessful(true);
    } catch (error) {
      console.error('Failed to update cover image:', error);
      toast.error('Failed to update cover image');
      setCoverUploadSuccessful(false);
    } finally {
      setIsCoverUploading(false);
    }
  };

  // Handle cover dialog close event
  const handleCoverDialogOpenChange = (open: boolean) => {
    setIsCoverUploadDialogOpen(open);

    // When dialog is closed and there was a successful upload, refresh the profile
    if (!open && coverUploadSuccessful) {
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      // Reset the flag
      setCoverUploadSuccessful(false);
    }
  };

  // Handle cover FileUploader's close button click
  const handleCoverUploaderClose = () => {
    setIsCoverUploadDialogOpen(false);
  };

  const handleCoverUploadError = (error: Error) => {
    console.error('Cover upload failed:', error);
    toast.error('Cover image upload failed: ' + error.message);
    setCoverUploadSuccessful(false);
  };

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 w-1/3 h-64 rounded-full opacity-30 blur-3xl -z-10 bg-gradient-to-br from-ocean via-sunset to-forest animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-1/4 h-48 rounded-full opacity-25 blur-3xl -z-10 bg-gradient-to-tr from-forest via-sand to-sunset animate-pulse-slow" />
      <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full opacity-20 blur-3xl -z-10 bg-gradient-to-r from-mountain to-ocean animate-float" />

      <Dialog open={isUploadDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md border border-muted/30 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Update Profile Picture
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload a new profile picture from your device or camera
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <FileUploader
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              acceptedFileTypes="image/*"
              maxSizeMB={5}
              buttonText={isUploading ? 'Uploading...' : 'Select Profile Image'}
              className="w-full"
              showPreview={true}
              onClose={handleUploaderClose}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Cover image upload dialog */}
      <Dialog open={isCoverUploadDialogOpen} onOpenChange={handleCoverDialogOpenChange}>
        <DialogContent className="sm:max-w-md border border-muted/30 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Update Cover Image
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload a new cover image from your device
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <FileUploader
              onUploadSuccess={handleCoverUploadSuccess}
              onUploadError={handleCoverUploadError}
              acceptedFileTypes="image/*"
              maxSizeMB={5}
              buttonText={isCoverUploading ? 'Uploading...' : 'Select Cover Image'}
              className="w-full"
              showPreview={true}
              onClose={handleCoverUploaderClose}
            />
          </div>
        </DialogContent>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-muted/30',
          'bg-gradient-to-r from-background via-background to-background/90',
          'backdrop-blur-sm shadow-xl'
        )}
      >
        <div className="h-28 relative overflow-hidden">
          {/* Cover image with background fallback */}
          <div className="cover-image-container group">
            {userInfo?.cover_image ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${userInfo.cover_image})` }}
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-ocean via-sunset to-forest opacity-90" />
                <div className="absolute inset-0 opacity-30 bg-[url('/images/roamance-logo-no-text.png')] bg-repeat-space bg-contain mix-blend-overlay" />
              </>
            )}

            {/* Overlay for hover effect - limited to cover image only */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${isCoverUploading ? 'bg-black/40' : 'bg-black/10 group-hover:bg-black/30'} flex items-center justify-center`}
            >
              {/* Change cover button */}
              {!loading && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`absolute bottom-2 right-2 bg-white/30 hover:bg-white/50 text-white border border-white/30 transition-all duration-300 opacity-0 group-hover:opacity-100 ${isCoverUploading ? 'pointer-events-none' : ''}`}
                  onClick={() => !isCoverUploading && setIsCoverUploadDialogOpen(true)}
                >
                  {isCoverUploading ? (
                    <>
                      <span className="h-4 w-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-1.5" />
                      Change Cover
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Header controls in their own container, isolated from cover image hover effects */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
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
                    src={userInfo?.profile_image || undefined}
                    alt={user?.name || 'User'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-ocean to-ocean-dark text-2xl md:text-3xl text-white font-light">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute inset-0 bg-black/30 rounded-full transition-all duration-300 flex items-center justify-center backdrop-blur-sm ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} ${isUploading ? 'cursor-wait' : 'cursor-pointer'}`}
                  onClick={() => !isUploading && setIsUploadDialogOpen(true)}
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
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
                  {userInfo?.location && (
                    <p className="text-muted-foreground">{userInfo.location}</p>
                  )}
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
