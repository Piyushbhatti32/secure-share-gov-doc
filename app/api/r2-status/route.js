import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      status: {
        configured: false,
        message: "R2 storage is not used in this application. Using Cloudinary for document storage.",
        storage: "Cloudinary"
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking storage status:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      status: {
        configured: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
