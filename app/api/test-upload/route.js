import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Test upload endpoint called');
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      test: 'upload-system',
      message: "Upload system is configured for Cloudinary",
      storage: "Cloudinary",
      environment: {
        nodeEnv: process.env.NODE_ENV || 'NOT SET',
        hasCloudinaryCloudName: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        hasCloudinaryApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasCloudinaryApiSecret: !!process.env.CLOUDINARY_API_SECRET,
        hasCloudinaryUploadPreset: !!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      }
    });
    
  } catch (error) {
    console.error('Test upload endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
