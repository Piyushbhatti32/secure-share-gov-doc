import { getAuth } from 'firebase-admin/auth';
import { NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
// Only initialize Firebase Admin if we're in a server environment
if (typeof window === 'undefined') {
  initializeFirebaseAdmin();
}

export async function POST(request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify Firebase token
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);

    // Clear Google OAuth tokens from Firebase custom claims
    const auth = getAuth();
    const user = await auth.getUser(decodedToken.uid);
    
    // Remove Google OAuth tokens from custom claims
    const updatedClaims = { ...user.customClaims };
    delete updatedClaims.google_oauth_access_token;
    delete updatedClaims.google_oauth_refresh_token;
    
    await auth.setCustomUserClaims(decodedToken.uid, updatedClaims);

    return NextResponse.json({ success: true, message: 'Google Drive disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting Google Drive:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Drive' },
      { status: 500 }
    );
  }
}
