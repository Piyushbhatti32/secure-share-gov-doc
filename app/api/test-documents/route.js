import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test localStorage access
    const testData = {
      test: 'document-persistence',
      timestamp: new Date().toISOString(),
      localStorage: typeof window !== 'undefined' ? 'available' : 'not-available',
      nodeEnv: process.env.NODE_ENV
    };

    return NextResponse.json({
      success: true,
      ...testData
    });
  } catch (error) {
    console.error('Test documents error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
