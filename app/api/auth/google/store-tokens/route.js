import { getAuth } from 'firebase-admin/auth';
import { NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
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

    // Get the request body
    const { accessToken, refreshToken, uid } = await request.json();

    if (!accessToken || !uid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the user is updating their own tokens
    if (decodedToken.uid !== uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get the user's current custom claims
    const user = await getAuth().getUser(uid);
    const currentClaims = user.customClaims || {};

    // Update the user's custom claims with Google OAuth tokens
    await getAuth().setCustomUserClaims(uid, {
      ...currentClaims,
      google_oauth_access_token: accessToken,
      google_oauth_refresh_token: refreshToken, // <-- store refreshToken
      google_oauth_connected: true,
      google_oauth_connected_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Google Drive tokens stored successfully' 
    });

  } catch (error) {
    console.error('Error storing Google tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
