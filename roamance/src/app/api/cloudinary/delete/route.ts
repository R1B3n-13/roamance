import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { ENV_VARS } from '@/constants/keys';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: ENV_VARS.CLOUDINARY_CLOUD_NAME,
  api_key: ENV_VARS.CLOUDINARY_API_KEY,
  api_secret: ENV_VARS.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: NextRequest) {
  try {
    // Extract the public ID from the request body
    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: 'Public ID is required',
      }, { status: 400 });
    }

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    // Check if the deletion was successful
    if (result.result !== 'ok') {
      return NextResponse.json({
        success: false,
        status: 404,
        message: `Failed to delete image: ${result.result}`,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      status: 200,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting Cloudinary image:', error);

    return NextResponse.json({
      success: false,
      status: 500,
      message: error instanceof Error ? error.message : 'Failed to delete image',
    }, { status: 500 });
  }
}
