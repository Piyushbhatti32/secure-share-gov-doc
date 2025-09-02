import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import DocumentStorageService from '@/lib/services/documentStorage';
import shareService from '@/lib/services/share-service';

export async function POST(request, { params }) {
  try {
    console.log('=== SHARE API START ===');
    
    // Verify user authentication
    const { userId } = await auth();
    console.log('User ID:', userId);
    
    if (!userId) {
      console.log('No user ID, returning 401');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Await params in Next.js 15
    const resolvedParams = await params;
    console.log('Resolved params:', resolvedParams);
    
    // Decode base64 encoded document ID
    const documentId = atob(resolvedParams.id);
    console.log('Decoded document ID:', documentId);
    
    const { sharedWith, permissions } = await request.json();
    console.log('Request body - sharedWith:', sharedWith, 'permissions:', permissions);
    
    if (!documentId || !sharedWith) {
      return NextResponse.json(
        { error: 'Document ID and shared users are required' },
        { status: 400 }
      );
    }

    // Get current user's email for share tracking
    let userEmail = null;
    try {
      const me = await clerkClient().users.getUser(userId);
      userEmail = me?.primaryEmailAddress?.emailAddress || 
                 me?.emailAddresses?.[0]?.emailAddress || 
                 me?.emailAddresses?.find(email => email.verification?.status === 'verified')?.emailAddress ||
                 null;
      console.log('User email:', userEmail);
      console.log('User email addresses:', me?.emailAddresses?.map(e => ({ email: e.emailAddress, verified: e.verification?.status })));
    } catch (error) {
      console.warn('Could not fetch user email:', error.message);
      console.warn('Error details:', error);
    }

    const storageService = new DocumentStorageService();

    // First update Cloudinary storage tags
    const originalEmails = [sharedWith].flat();
    const emailsSanitized = originalEmails.map(email => email.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    console.log('Sharing with emails:', originalEmails);
    console.log('Sanitized emails:', emailsSanitized);
    
    console.log('Calling storageService.shareDocument...');
    const shareResult = await storageService.shareDocument(
      documentId,
      userId,
      Array.isArray(sharedWith) ? sharedWith : [sharedWith],
      { emailsSanitized, originalEmails }
    );
    console.log('Storage service share result:', shareResult);

    // Then track share in local service
    console.log('Calling shareService.shareDocument...');
    const localShareResult = await shareService.shareDocument(
      documentId,
      Array.isArray(sharedWith) ? sharedWith : [sharedWith],
      permissions || ['read'],
      userEmail
    );
    console.log('Local share service result:', localShareResult);

    console.log('=== SHARE API SUCCESS ===');
    return NextResponse.json({
      success: true,
      message: 'Document shared successfully'
    });

  } catch (error) {
    console.error('Error sharing document:', error);
    return NextResponse.json(
      { error: `Failed to share document: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verify user authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Await params in Next.js 15
    const resolvedParams = await params;
    // Decode base64 encoded document ID
    const documentId = atob(resolvedParams.id);
    const { sharedWith } = await request.json();
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Remove sharing access from both services
    const storageService = new DocumentStorageService();
    await storageService.shareDocument(documentId, userId, [], { emailsSanitized: [] });

    if (sharedWith) {
      for (const email of [sharedWith].flat()) {
        await shareService.removeSharingAccess(documentId, email);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Document sharing removed successfully'
    });

  } catch (error) {
    console.error('Error removing document share:', error);
    return NextResponse.json(
      { error: `Failed to remove document share: ${error.message}` },
      { status: 500 }
    );
  }
}
