import { NextResponse } from 'next/server';
import { getCloudinaryInfo } from '@/lib/services/cloudinary-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');
    
    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    console.log('🔍 Fetching file:', fileName);

    // Fetch file info from Cloudinary
    const info = await getCloudinaryInfo(fileName);
    if (!info || !info.secure_url) {
      console.log('❌ File not found in Cloudinary:', fileName);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    console.log('✅ File found in Cloudinary:', info.secure_url);

    // Return the secure_url for the file
    return NextResponse.json({
      success: true,
      url: info.secure_url,
      fileName: fileName,
      format: info.format,
      resource_type: info.resource_type,
      info
    });
  } catch (error) {
    console.error('❌ Error fetching from Cloudinary:', error);
    return NextResponse.json({
      error: 'Failed to fetch file from Cloudinary',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
