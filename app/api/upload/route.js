import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadDocument } from '@/lib/services/r2-storage-service';

export async function POST(request) {
  try {
    console.log('Upload API called');
    
    // Authenticate user
    const { userId } = await auth();
    console.log('User authenticated:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const description = formData.get('description');
    const type = formData.get('type');
    const tags = formData.get('tags');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
    }

    // Enhanced file size validation (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size must be less than ${(maxSize / 1024 / 1024).toFixed(0)}MB` 
      }, { status: 400 });
    }

    // Enhanced file type validation with more formats
    const allowedTypes = [
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv', 'text/html', 'text/rtf',
      
      // Images
      'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp',
      'image/svg+xml', 'image/bmp', 'image/tiff',
      
      // Archives
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
      'application/x-tar', 'application/gzip',
      
      // Audio/Video (for document purposes)
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not supported. Please upload PDF, image, document, or archive files.' 
      }, { status: 400 });
    }

    // Additional security checks
    const fileName = file.name.toLowerCase();
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js'];
    const hasDangerousExtension = dangerousExtensions.some(ext => fileName.endsWith(ext));
    
    if (hasDangerousExtension) {
      return NextResponse.json({ 
        error: 'Executable files are not allowed for security reasons.' 
      }, { status: 400 });
    }

    // Generate unique filename with better structure
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const uniqueFileName = `${userId}_${sanitizedTitle}_${timestamp}.${fileExtension}`;

    // Convert file to buffer with progress tracking
    console.log('Converting file to buffer...');
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    console.log(`File converted: ${fileBuffer.length} bytes`);

    // Upload to R2 with enhanced error handling
    console.log('Calling R2 upload service...');
    try {
      await uploadDocument(fileBuffer, uniqueFileName, file.type);
      console.log('R2 upload completed successfully');
    } catch (uploadError) {
      console.error('R2 upload failed:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload file to cloud storage. Please try again.',
        details: uploadError.message 
      }, { status: 500 });
    }

    // Calculate file hash for integrity (simplified)
    const fileHash = require('crypto').createHash('md5').update(fileBuffer).digest('hex');

    // Return success response with enhanced file info
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully to secure cloud storage',
      file: {
        originalName: file.name,
        fileName: uniqueFileName,
        size: file.size,
        type: file.type,
        title: title || file.name,
        description: description || '',
        documentType: type || 'other',
        tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        uploadedAt: new Date().toISOString(),
        userId,
        fileHash,
        secure: true,
        cloudStorage: 'Cloudflare R2',
        maxSize: `${(maxSize / 1024 / 1024).toFixed(0)}MB`
      }
    });

  } catch (error) {
    console.error('Upload API error:', error);
    
    // Handle specific error types
    if (error.message.includes('size')) {
      return NextResponse.json({ 
        error: 'File size validation failed',
        details: error.message 
      }, { status: 400 });
    }
    
    if (error.message.includes('type')) {
      return NextResponse.json({ 
        error: 'File type validation failed',
        details: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: 'Method not allowed',
    message: 'Use POST method to upload files'
  }, { status: 405 });
}
