import { NextResponse } from 'next/server';
import { getR2Status } from '@/lib/services/r2-storage-service';

export async function GET() {
  try {
    console.log('🧪 Test upload endpoint called');
    
    // Check R2 configuration
    const r2Status = getR2Status();
    console.log('R2 Status:', r2Status);
    
    // Test if we can create an R2 client
    let clientTest = 'NOT_TESTED';
    try {
      const { S3Client } = require('@aws-sdk/client-s3');
      const testClient = new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
        maxAttempts: 1,
      });
      clientTest = 'CLIENT_CREATED_SUCCESSFULLY';
    } catch (error) {
      clientTest = `CLIENT_CREATION_FAILED: ${error.message}`;
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      test: 'upload-system',
      r2Status: r2Status,
      clientTest: clientTest,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'NOT SET',
        hasAccountId: !!process.env.R2_ACCOUNT_ID,
        hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
        hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
        hasBucketName: !!process.env.R2_BUCKET_NAME
      }
    });
    
  } catch (error) {
    console.error('Test upload endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
