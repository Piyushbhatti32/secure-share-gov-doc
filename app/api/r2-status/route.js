import { NextResponse } from 'next/server';
import { getR2Status } from '@/lib/services/r2-storage-service';

export async function GET() {
  try {
    const status = getR2Status();
    
    return NextResponse.json({
      success: true,
      status: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking R2 status:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      status: {
        configured: false,
        error: error.message,
        missingVars: []
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
