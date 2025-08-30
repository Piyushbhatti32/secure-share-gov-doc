import { NextResponse } from 'next/server';
import { getCloudinaryInfo, checkCloudinaryConfig } from '@/lib/services/cloudinary-service';

export async function GET() {
  try {
    console.log('🧪 Testing Cloudinary integration...');
    
    // Check configuration
    const configStatus = checkCloudinaryConfig();
    
    // Test with the actual uploaded file ID
    let fileTest = 'NOT_TESTED';
    try {
      const fileInfo = await getCloudinaryInfo('secure-docs/Black White Grayscale Portfolio Presentation');
      fileTest = fileInfo ? 'FILE_FOUND' : 'FILE_NOT_FOUND';
    } catch (error) {
      fileTest = `ERROR: ${error.message}`;
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      configStatus: configStatus,
      fileTest: fileTest,
      environment: {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        hasApiKey: !!process.env.CLOUDINARY_API_KEY,
        hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      }
    });
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
