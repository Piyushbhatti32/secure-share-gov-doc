import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import DocumentStorageService from '@/lib/services/documentStorage';

export async function GET(request, { params }) {
  try {
    // Verify user authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: documentId } = params;
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get expiration time from query params (default: 1 hour)
    const url = new URL(request.url);
    const expiresIn = parseInt(url.searchParams.get('expiresIn')) || 3600; // 1 hour default

    // Validate expiration time (max 24 hours for security)
    if (expiresIn > 86400) {
      return NextResponse.json(
        { error: 'Expiration time cannot exceed 24 hours' },
        { status: 400 }
      );
    }

    const storageService = new DocumentStorageService();
    
    // Generate signed URLs
    const signedUrls = await storageService.generateSignedUrls(documentId, userId, expiresIn);

    return NextResponse.json({
      success: true,
      signedUrls: signedUrls
    });

  } catch (error) {
    console.error('Error generating signed URLs:', error);
    return NextResponse.json(
      { error: `Failed to generate signed URLs: ${error.message}` },
      { status: 500 }
    );
  }
}
