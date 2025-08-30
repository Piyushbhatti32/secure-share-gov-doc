import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, checkCloudinaryConfig } from '@/lib/services/cloudinary-service';

export async function POST(request) {
  try {
    console.log('🚀 Upload API called');
    
    // Check Cloudinary configuration
    if (!checkCloudinaryConfig()) {
      console.error('❌ Cloudinary not configured');
      return NextResponse.json(
        { error: 'Cloudinary storage not configured. Please check your environment variables.' },
        { status: 500 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('📁 File received:', {
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size);
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 413 }
      );
    }

    // Validate file type (Cloudinary supports images, videos, audio, and raw files)
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Videos
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
      // Audio
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac',
      // Documents (as raw files)
      'text/plain', 'text/csv', 'text/html', 'application/json', 'application/xml'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ File type not supported:', file.type);
      return NextResponse.json(
        { error: `File type not supported. Supported types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('📊 File converted to buffer, size:', buffer.length);

    // Upload to Cloudinary
    console.log('☁️ Uploading to Cloudinary...');
    const uploadResult = await uploadToCloudinary(buffer, file.name, file.type);
    
    console.log('✅ Upload successful:', uploadResult);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully to Cloudinary',
      file: uploadResult.file,
      cloudinary: {
        publicId: uploadResult.cloudinary.public_id,
        url: uploadResult.cloudinary.secure_url,
        format: uploadResult.cloudinary.format
      }
    });

  } catch (error) {
    console.error('❌ Upload API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file to cloud storage. Please try again.',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Log environment variables on GET request too for debugging
  console.log('🔍 GET Request - Environment Variables Check:');
  console.log('R2_ACCOUNT_ID:', process.env.R2_ACCOUNT_ID ? `${process.env.R2_ACCOUNT_ID.substring(0, 8)}...` : 'NOT SET');
  console.log('R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? `${process.env.R2_ACCESS_KEY_ID.substring(0, 8)}...` : 'NOT SET');
  console.log('R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? `${process.env.R2_SECRET_ACCESS_KEY.substring(0, 8)}...` : 'NOT SET');
  console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME || 'NOT SET');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
  
  return NextResponse.json({ 
    error: 'Method not allowed',
    message: 'Use POST method to upload files',
    envCheck: {
      r2Configured: !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME),
      missingVars: ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME'].filter(varName => !process.env[varName])
    }
  }, { status: 405 });
}
