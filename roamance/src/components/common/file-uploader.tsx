import {
  CloudinaryService,
  CloudinaryUploadResult,
} from '@/service/cloudinary-service';
import {
  CheckCircle,
  Copy,
  FileText,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface FileUploaderProps {
  onUploadSuccess?: (
    result: CloudinaryUploadResult | CloudinaryUploadResult[]
  ) => void;
  onUploadError?: (error: Error) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  buttonText?: string;
  className?: string;
  multiple?: boolean;
  showPreview?: boolean;
  onClose?: () => void;
  buttonClassName?: string;
  buttonContent?: React.ReactNode;
  children?: React.ReactNode;
  height?: string;
  previewHeight?: string;
  dropzoneText?: string;
  showCloseButton?: boolean; // New prop to control close button visibility
  showRefreshButton?: boolean; // New prop to control refresh button visibility
}

/**
 * Enhanced FileUploader component for handling file uploads to Cloudinary
 * Supports images, videos, and documents with drag-and-drop functionality
 */
export const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadSuccess,
  onUploadError,
  acceptedFileTypes = 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
  maxSizeMB = 10,
  buttonText = 'Select file to upload',
  className = '',
  multiple = false,
  showPreview = true,
  onClose,
  buttonClassName,
  buttonContent,
  children,
  height = 'h-32',
  previewHeight = 'h-32',
  dropzoneText = 'Drag and drop files here or click to browse',
  showCloseButton = false,
  showRefreshButton = false,
}) => {
  // State variables
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<CloudinaryUploadResult[]>(
    []
  );
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLLabelElement>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Get the first file for backward compatibility
  const uploadedFile = uploadedFiles[0] || null;

  // Handle drag events
  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragging) {
        setIsDragging(true);
      }
    },
    [isDragging]
  );

  // Validate file before upload
  const validateFile = (file: File): boolean => {
    // Validate file size
    if (file.size > maxSizeBytes) {
      const errorMsg = `File size exceeds ${maxSizeMB}MB limit`;
      setError(errorMsg);
      onUploadError?.(new Error(errorMsg));
      return false;
    }

    // Validate file type (if acceptedFileTypes is provided)
    if (acceptedFileTypes) {
      const fileTypeAccepted = acceptedFileTypes.split(',').some((type) => {
        type = type.trim();
        if (type.startsWith('.')) {
          // Check file extension
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        } else if (type.includes('/*')) {
          // Check MIME type category (e.g., image/*)
          const category = type.split('/')[0];
          return file.type.startsWith(`${category}/`);
        } else {
          // Exact MIME type match
          return file.type === type;
        }
      });

      if (!fileTypeAccepted) {
        const errorMsg = `File type not accepted. Please upload ${acceptedFileTypes.replace(/,/g, ', ')}`;
        setError(errorMsg);
        onUploadError?.(new Error(errorMsg));
        return false;
      }
    }

    return true;
  };

  // Handle drop event
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (uploading) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (!droppedFiles.length) return;

      if (multiple) {
        const validFiles = droppedFiles.filter(validateFile);
        if (validFiles.length) {
          handleFilesUpload(validFiles);
        }
      } else if (droppedFiles[0] && validateFile(droppedFiles[0])) {
        handleFilesUpload([droppedFiles[0]]);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploading, multiple, validateFile]
  );

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    if (multiple) {
      const filesArray = Array.from(files);
      const validFiles = filesArray.filter(validateFile);
      if (validFiles.length) {
        handleFilesUpload(validFiles);
      }
    } else if (files[0] && validateFile(files[0])) {
      handleFilesUpload([files[0]]);
    }
  };

  // Upload files to Cloudinary
  const handleFilesUpload = async (files: File[]) => {
    setUploading(true);
    setProgress(10);
    setError(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) =>
          Math.min(prev + Math.floor(Math.random() * 15), 90)
        );
      }, 600);

      const uploadPromises = files.map((file) =>
        CloudinaryService.upload(file)
      );
      const results = await Promise.all(uploadPromises);

      clearInterval(progressInterval);
      setProgress(100);
      setUploadedFiles(results);
      onUploadSuccess?.(multiple ? results : results[0]);
    } catch (err: unknown) {
      let errorMessage = 'Upload failed';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      onUploadError?.(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setUploading(false);
    }
  };

  // Reset everything
  const resetUpload = () => {
    setUploadedFiles([]);
    setError(null);
    setProgress(0);
    setCopyStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle close - now actually used by the close button
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Function to trigger a new upload
  const handleNewUpload = () => {
    resetUpload();
    // Focus and click the file input to open the file dialog
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = () => {
    if (!uploadedFile?.url) return;
    navigator.clipboard.writeText(uploadedFile.url).then(
      () => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
      },
      (err) => {
        console.error('Failed to copy URL: ', err);
      }
    );
  };

  // Cleanup effects
  useEffect(() => {
    return () => {
      // Reset when component unmounts
      resetUpload();
    };
  }, []);

  // File type helpers
  const getFileTypeInfo = (file: CloudinaryUploadResult) => {
    const isImage = file.resource_type === 'image';
    const isVideo = file.resource_type === 'video';
    return { isImage, isVideo };
  };

  // Effects to reset the input when uploading is complete
  useEffect(() => {
    if (!uploading && uploadedFiles.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [uploading, uploadedFiles]);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col gap-3">
        {/* Upload controls - top bar with buttons */}
        {(showCloseButton || showRefreshButton) &&
          uploadedFiles.length > 0 &&
          !uploading && (
            <div className="flex justify-end gap-2 mb-1">
              {showRefreshButton && (
                <button
                  onClick={handleNewUpload}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                  aria-label="Upload new file"
                  title="Upload new file"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  New Upload
                </button>
              )}
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close uploader"
                  title="Close uploader"
                >
                  <X className="w-3 h-3 mr-1" />
                  Close
                </button>
              )}
            </div>
          )}

        {/* File Upload Section */}
        <div className={`relative w-full ${height}`}>
          {/* Uploading State */}
          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full p-4 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <div className="w-full max-w-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Uploading...
                  </span>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Preview State */}
          {!uploading && uploadedFiles.length > 0 && showPreview && (
            <div
              className={`absolute inset-0 w-full h-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${previewHeight}`}
            >
              {/* File Preview Content */}
              <div className="relative w-full h-full p-1">
                {multiple && uploadedFiles.length > 1 ? (
                  // Multiple files preview grid
                  <div className="grid grid-cols-2 gap-1 w-full h-full overflow-auto p-1">
                    {uploadedFiles.map((file, index) => {
                      const { isImage, isVideo } = getFileTypeInfo(file);
                      return (
                        <div
                          key={index}
                          className="relative flex items-center justify-center bg-white dark:bg-gray-700 rounded overflow-hidden border border-gray-200 dark:border-gray-600 aspect-square"
                        >
                          {isImage && (
                            <Image
                              src={file.url}
                              alt={
                                file.original_filename ||
                                `Uploaded image ${index + 1}`
                              }
                              className="object-cover w-full h-full"
                              width={100}
                              height={100}
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          )}
                          {isVideo && (
                            <div className="flex items-center justify-center w-full h-full">
                              <svg
                                className="w-8 h-8 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                          )}
                          {!isImage && !isVideo && (
                            <div className="flex items-center justify-center w-full h-full">
                              <FileText className="w-8 h-8 text-gray-500" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Single file preview (or first file if multiple but only one uploaded)
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {getFileTypeInfo(uploadedFile!).isImage && (
                      <Image
                        src={uploadedFile!.url}
                        alt="Uploaded image"
                        className="object-cover w-full h-full rounded"
                        sizes="full"
                        width={0}
                        height={0}
                        priority
                      />
                    )}
                    {getFileTypeInfo(uploadedFile!).isVideo && (
                      <video
                        src={uploadedFile!.url}
                        controls
                        className="object-cover w-full h-full rounded"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                    {!getFileTypeInfo(uploadedFile!).isImage &&
                      !getFileTypeInfo(uploadedFile!).isVideo && (
                        <div className="flex flex-col items-center text-center p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 max-w-full max-h-full overflow-auto">
                          <FileText className="w-6 h-6 text-gray-500 dark:text-gray-300 mb-1 flex-shrink-0" />
                          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {uploadedFile!.original_filename || 'Document'}
                          </p>
                          <a
                            href={uploadedFile!.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                          >
                            View File (
                            {uploadedFile!.format?.toUpperCase() || 'File'})
                          </a>
                        </div>
                      )}

                    {/* Copy URL Button */}
                    <button
                      onClick={handleCopyUrl}
                      className={`absolute bottom-2 right-2 p-1.5 rounded ${
                        copyStatus === 'copied'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 dark:bg-opacity-80 dark:hover:bg-opacity-100 transition-colors text-xs`}
                      aria-label={
                        copyStatus === 'copied' ? 'Copied!' : 'Copy link'
                      }
                      title={copyStatus === 'copied' ? 'Copied!' : 'Copy link'}
                    >
                      {copyStatus === 'copied' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {/* Reset button */}
                <button
                  onClick={resetUpload}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 transition-colors"
                  aria-label="Remove uploaded file"
                  title="Remove uploaded file"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Quick new upload button */}
                <button
                  onClick={handleNewUpload}
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors"
                  aria-label="Upload a new file"
                  title="Upload a new file"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Dropzone / Initial State */}
          {!uploading && uploadedFiles.length === 0 && (
            <label
              ref={dropzoneRef}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`absolute inset-0 flex flex-col items-center justify-center w-full h-full px-4 transition-all duration-200 border-2 border-dashed rounded-lg cursor-pointer ${
                isDragging
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-gray-950 border-blue-600/50 dark:border-blue-500/50 hover:border-blue-600 dark:hover:border-blue-500'
              } ${buttonClassName || ''}`}
              aria-label="Upload area"
            >
              {buttonContent ? (
                buttonContent
              ) : (
                <div
                  className={`flex flex-col items-center justify-center ${isDragging ? 'scale-110' : ''} transition-transform duration-200 pt-5 pb-6 text-center`}
                >
                  <Upload
                    className={`w-8 h-8 mb-3 ${isDragging ? 'text-blue-600 dark:text-blue-400 animate-bounce' : 'text-blue-500 dark:text-blue-400'}`}
                  />
                  <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">
                      {isDragging ? 'Drop files here' : buttonText}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {!isDragging && <span>{dropzoneText}</span>}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {multiple
                      ? `Multiple files allowed (Max ${maxSizeMB}MB each)`
                      : `Max. ${maxSizeMB}MB`}
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={acceptedFileTypes}
                onChange={handleFileChange}
                disabled={uploading}
                multiple={multiple}
                aria-label="File input"
              />
            </label>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div
            className="p-3 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-950 dark:text-red-400 animate-fadeIn"
            role="alert"
          >
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
              </svg>
              <span>{error}</span>
              <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-red-50 dark:bg-red-950 text-red-500 rounded-lg p-1.5 hover:bg-red-100 dark:hover:bg-red-900 inline-flex items-center justify-center h-8 w-8"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                <span className="sr-only">Dismiss</span>
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Upload info */}
        {uploadedFiles.length > 0 && multiple && (
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            <p>
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}{' '}
              uploaded successfully
            </p>
          </div>
        )}

        {/* Action Buttons (when no file is uploaded) */}
        {showCloseButton && !uploadedFiles.length && !uploading && (
          <div className="flex justify-end mt-1">
            <button
              onClick={handleClose}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close uploader"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Cancel
            </button>
          </div>
        )}

        {/* Render children if provided */}
        {children}
      </div>
    </div>
  );
};

export default FileUploader;
