import { ApiResponse } from '@/types';
import axios, { AxiosError } from 'axios';
import { CldUploadWidget } from 'next-cloudinary';
import { ApiError } from './errors';

// Types for Cloudinary responses
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  resource_type: string;
  asset_id: string;
  version_id: string;
  created_at: string;
}

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  preset: string;
}

/**
 * Get a server-signed signature for secure Cloudinary uploads
 * @param publicId Optional public ID to assign to the uploaded asset
 * @returns Cloudinary signature data
 */
export async function getCloudinarySignature(publicId?: string): Promise<CloudinarySignature> {
  try {
    const response = await axios.get<ApiResponse & { data: CloudinarySignature }>('/api/cloudinary/signature', {
      params: { publicId }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get signature');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error getting Cloudinary signature:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorResponse = axiosError.response?.data;
      const status = errorResponse?.status || axiosError.response?.status || 500;
      const message = errorResponse?.message || 'Failed to get Cloudinary signature';
      throw new ApiError(message, status);
    }

    throw new ApiError('Failed to get Cloudinary signature', 500);
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId The public ID of the image to delete
 * @returns Success status
 */
export async function deleteCloudinaryImage(publicId: string): Promise<boolean> {
  try {
    const response = await axios.delete<ApiResponse>('/api/cloudinary/delete', {
      data: { publicId }
    });

    return response.data.success;
  } catch (error) {
    console.error(`Error deleting Cloudinary image (${publicId}):`, error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorResponse = axiosError.response?.data;
      const status = errorResponse?.status || axiosError.response?.status || 500;
      const message = errorResponse?.message || `Failed to delete image (${publicId})`;
      throw new ApiError(message, status);
    }

    throw new ApiError(`Failed to delete image (${publicId})`, 500);
  }
}

export { CldUploadWidget };
