import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { auth } from '@clerk/nextjs/server';
import DocumentStorageService from '@/lib/services/documentStorage';

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

    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const maxSize = 50 * 1024 * 1024; // 50MB for PDFs and documents

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, images, text, and Office documents are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Initialize secure document storage service
    const storageService = new DocumentStorageService();
    
    // Create temporary file path for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write to a temporary file so Cloudinary can read from a path
    const tempPath = join(tmpdir(), `upload-${Date.now()}-${file.name}`);
    await fs.writeFile(tempPath, buffer);

    let uploadResult;
    try {
      // Create temporary file object with disk path
      const tempFile = {
        path: tempPath,
        name: file.name,
        type: file.type,
        size: file.size
      };

      // Upload document with user isolation and PDF handling
      uploadResult = await storageService.uploadDocument(tempFile, userId, {
        type: file.type,
        securityLevel: 'standard',
        originalName: file.name
      });
    } finally {
      // Clean up temp file
      try { await fs.unlink(tempPath); } catch {}
    }

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document: uploadResult
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` },
      { status: 500 }
    );
  }
}

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
    
    // Get user's documents only
    const userDocuments = await storageService.getUserDocuments(userId);
    
    // Get shared documents with this user
    const sharedDocuments = await storageService.getSharedDocuments(userId);

    return NextResponse.json({
      success: true,
      userDocuments: userDocuments,
      sharedDocuments: sharedDocuments
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: `Failed to fetch documents: ${error.message}` },
      { status: 500 }
    );
  }
}
