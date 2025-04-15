'use client';

import { useState, useCallback, useEffect } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import {
  getCloudinarySignature,
  CloudinaryUploadResult,
  CloudinarySignature,
} from '@/api/cloudinary-api';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CloudinaryUploaderProps {
  onUpload: (result: CloudinaryUploadResult) => void;
  onError?: (error: Error) => void;
  value?: string;
  publicId?: string;
  buttonText?: string;
  className?: string;
  uploadPreset?: string;
}

export function CloudinaryUploader({
  onUpload,
  onError,
  value,
  publicId,
  buttonText = 'Upload Image',
  className = '',
  uploadPreset = 'roamance_uploads',
}: CloudinaryUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [signature, setSignature] = useState<CloudinarySignature | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch the signature when component mounts to have it ready
  useEffect(() => {
    const fetchSignature = async () => {
      try {
        setIsLoading(true);
        const signatureData = await getCloudinarySignature(publicId);
        setSignature(signatureData);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to get signature:', error);
        onError?.(
          error instanceof Error
            ? error
            : new Error('Failed to get upload signature')
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignature();
  }, [publicId, onError]);

  // Fetch the signature from our API when the upload widget is opened
  const handleOpen = useCallback(async () => {
    if (signature) return true; // If we already have a signature, proceed

    try {
      setIsLoading(true);
      const signatureData = await getCloudinarySignature(publicId);
      setSignature(signatureData);
      setIsReady(true);
      return true;
    } catch (error) {
      console.error('Failed to get signature:', error);
      onError?.(
        error instanceof Error
          ? error
          : new Error('Failed to get upload signature')
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [publicId, onError, signature]);

  // Use the preset from signature or fallback to the provided/default preset
  const effectiveUploadPreset = signature?.preset || uploadPreset;

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {value ? (
        <motion.div
          className="relative w-full overflow-hidden rounded-lg border border-border/40 shadow-sm bg-gradient-to-tr from-background via-background to-background/80"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="aspect-[16/9] w-full relative">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20 pointer-events-none" />
          </div>
          <div className="p-3 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Image uploaded</p>
            <div className="bg-ocean/10 text-ocean px-2 py-1 rounded-full text-xs">
              cloudinary
            </div>
          </div>
        </motion.div>
      ) : null}

      {isReady && effectiveUploadPreset && (
        <CldUploadWidget
          onOpen={handleOpen}
          uploadPreset={effectiveUploadPreset}
          signatureEndpoint="/api/cloudinary/signature"
          onSuccess={(result) => {
            if (result.info && typeof result.info === 'object') {
              // Add type assertion to handle the structure mismatch
              const info = result.info as unknown as CloudinaryUploadResult;
              onUpload(info);
            }
          }}
          onError={(error) => {
            console.error('Upload error:', error);
            if (error) {
              const errorMessage =
                typeof error === 'string'
                  ? error
                  : error.statusText || 'Upload failed';
              onError?.(new Error(errorMessage));
            }
          }}
          options={{
            sources: ['local', 'url', 'camera'],
            multiple: false,
            maxFiles: 1,
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
            maxFileSize: 10000000, // 10MB
            cloudName: signature?.cloudName,
            apiKey: signature?.apiKey,
            folder: 'roamance_uploads'
          }}
        >
          {({ open }) => (
            <>
              {!value && (
                <motion.div
                  className={cn(
                    "w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer",
                    isHovered
                      ? "border-primary/50 bg-primary/5"
                      : "border-muted/60 bg-muted/5"
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onClick={(e) => {
                    e.preventDefault();
                    open();
                  }}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      open();
                    }
                  }}
                >
                  <div className={cn(
                    "p-4 rounded-full transition-colors duration-300",
                    isHovered ? "bg-primary/20" : "bg-muted/20"
                  )}>
                    <ImageIcon className={cn(
                      "h-8 w-8 transition-colors duration-300",
                      isHovered ? "text-primary" : "text-muted-foreground/60"
                    )} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-medium">Upload your image</h3>
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or click to browse
                    </p>
                  </div>
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full max-w-xs mx-auto mt-4"
              >
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={(e) => {
                    e.preventDefault();
                    open();
                  }}
                  disabled={isLoading}
                  className={cn(
                    "w-full rounded-full font-medium hover:shadow-md transition-all",
                    "border-primary/30 bg-gradient-to-r from-background via-background to-background/80",
                    isLoading ? "" : "hover:bg-primary/10 hover:border-primary/50"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                      <span className="text-muted-foreground">Loading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4 text-primary" />
                      {value ? 'Change Image' : buttonText}
                    </>
                  )}
                </Button>
              </motion.div>
            </>
          )}
        </CldUploadWidget>
      )}

      {!isReady && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button type="button" variant="outline" disabled={true} size="lg" className="rounded-full min-w-40">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Initializing...
          </Button>
        </motion.div>
      )}
    </div>
  );
}
