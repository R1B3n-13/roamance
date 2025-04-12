import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { ENV_VARS } from '@/constants/keys';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: ENV_VARS.CLOUDINARY_CLOUD_NAME,
  api_key: ENV_VARS.CLOUDINARY_API_KEY,
  api_secret: ENV_VARS.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    // Get the current timestamp and optional public ID
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId') || undefined;
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Prepare parameters for signature
    const params = {
      timestamp,
      folder: 'roamance_uploads',
      ...(publicId && { public_id: publicId }),
    };

    // Generate signature using Cloudinary's API
    const signature = cloudinary.utils.api_sign_request(params, ENV_VARS.CLOUDINARY_API_SECRET);

    // Return the signature and necessary parameters for client-side upload
    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Signature generated successfully',
      data: {
        signature,
        timestamp,
        cloudName: ENV_VARS.CLOUDINARY_CLOUD_NAME,
        apiKey: ENV_VARS.CLOUDINARY_API_KEY,
        preset: ENV_VARS.CLOUDINARY_UPLOAD_PRESET,
      },
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);

    return NextResponse.json({
      success: false,
      status: 500,
      message: error instanceof Error ? error.message : 'Failed to generate signature',
    }, { status: 500 });
  }
}
