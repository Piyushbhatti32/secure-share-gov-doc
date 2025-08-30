import { NextResponse } from 'next/server';
import { getCloudinaryStatus } from '@/lib/services/cloudinary-service';

export async function GET() {
  try {
    const status = getCloudinaryStatus();
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('❌ Cloudinary status check failed:', error);
    
    return NextResponse.json({
      configured: false,
      cloudName: '',
      uploadPreset: '',
      hasApiKey: false,
      hasApiSecret: false,
      error: error.message
    });
  }
}
