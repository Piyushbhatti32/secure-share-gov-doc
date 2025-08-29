import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateDownloadUrl } from '@/lib/services/r2-storage-service';

export async function GET(request, { params }) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileName } = params;
    
    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    // Generate signed download URL
    const downloadUrl = await generateDownloadUrl(fileName, 3600); // 1 hour expiry

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresIn: 3600,
      fileName
    });

  } catch (error) {
    console.error('Download URL generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate download URL',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

