import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import DocumentStorageService from '@/lib/services/documentStorage';

export async function GET(request) {
  try {
    // Verify user authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const storageService = new DocumentStorageService();

    // Resolve current user's primary email for email-based sharing lookups
    let userEmail = null;
    try {
      const clerk = clerkClient();
      console.log('Clerk client:', typeof clerk, clerk ? 'exists' : 'null');
      if (clerk && clerk.users) {
        const me = await clerk.users.getUser(userId);
        userEmail = me?.primaryEmailAddress?.emailAddress || 
                   me?.emailAddresses?.[0]?.emailAddress || 
                   me?.emailAddresses?.find(email => email.verification?.status === 'verified')?.emailAddress ||
                   null;
        console.log('Fetched user email from Clerk:', userEmail);
        console.log('User email addresses:', me?.emailAddresses?.map(e => ({ email: e.emailAddress, verified: e.verification?.status })));
        
        // Pre-cache the current user's email in the storage service
        if (userEmail) {
          storageService.setUserEmail(userId, userEmail);
        }
      } else {
        console.log('Clerk client or users not available');
      }
    } catch (error) {
      console.log('Failed to fetch user email:', error.message);
      console.log('Error details:', error);
    }
    
    console.log('=== FETCHING DOCUMENTS API ===');
    console.log('User ID:', userId, 'User email:', userEmail);
    
    // Get user's own documents only
    console.log('Fetching user documents...');
    const userDocuments = await storageService.getUserDocuments(userId);
    console.log('User documents count:', userDocuments.length);
    
    // Get documents shared with this user
    console.log('Fetching shared documents...');
    const sharedDocuments = await storageService.getSharedDocuments(userId, userEmail);
    console.log('Shared documents count:', sharedDocuments.length);

    return NextResponse.json({
      success: true,
      documents: {
        owned: userDocuments,
        shared: sharedDocuments
      },
      totalCount: userDocuments.length + sharedDocuments.length
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: `Failed to fetch documents: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Verify user authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { documentId } = await request.json();
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const storageService = new DocumentStorageService();
    
    // Delete document (only if user owns it)
    const result = await storageService.deleteDocument(documentId, userId);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      result: result
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: `Failed to delete document: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Verify user authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Accept document metadata from client after successful upload
    const body = await request.json();
    const {
      title = '',
      description = '',
      type = '',
      tags = [],
      fileName,
      originalFileName,
      fileSize,
      fileType,
      status = 'active',
      cloudinaryId,
      uploadedAt
    } = body || {};

    // Require at minimum a Cloudinary identifier
    const resolvedId = cloudinaryId || fileName;
    if (!resolvedId) {
      return NextResponse.json(
        { error: 'cloudinaryId or fileName is required' },
        { status: 400 }
      );
    }

    // Build a normalized document record (no DB persistence yet; Cloudinary is source of truth)
    const now = new Date().toISOString();
    const document = {
      id: resolvedId,
      title,
      description,
      type,
      tags: Array.isArray(tags) ? tags : String(tags || '')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      fileName: resolvedId,
      originalFileName: originalFileName || null,
      fileSize: fileSize || null,
      fileType: fileType || null,
      status,
      cloudinaryId: resolvedId,
      ownerId: userId,
      uploadedAt: uploadedAt || now,
      createdAt: now,
      updatedAt: now
    };

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: `Failed to create document: ${error.message}` },
      { status: 500 }
    );
  }
}
