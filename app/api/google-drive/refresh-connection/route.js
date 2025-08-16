import { getAuth } from 'firebase-admin/auth';
import { NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { refreshGoogleToken } from '@/lib/services/google-auth-service';

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

    // Check if user has Google authentication (either direct Google sign-in or OAuth tokens)
    const hasGoogleIdentity = decodedToken.firebase.identities['google.com'];
    const auth = getAuth();
    const user = await auth.getUser(decodedToken.uid);
    const hasOAuthTokens = user.customClaims?.google_oauth_access_token || user.customClaims?.google_oauth_refresh_token;
    
    if (!hasGoogleIdentity && !hasOAuthTokens) {
      return NextResponse.json(
        { error: 'Google account not connected. Please connect your Google account first.' },
        { status: 401 }
      );
    }

    // Check for refresh token
    if (!user.customClaims?.google_oauth_refresh_token) {
      return NextResponse.json(
        { error: 'No refresh token found. Please reconnect your Google account.' },
        { status: 401 }
      );
    }

    // Refresh the access token
    try {
      const newAccessToken = await refreshGoogleToken(
        decodedToken.uid,
        user.customClaims.google_oauth_refresh_token
      );

      return NextResponse.json({ 
        success: true, 
        message: 'Google Drive connection refreshed successfully' 
      });
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      return NextResponse.json(
        { error: 'Failed to refresh Google access token. Please reconnect your Google account.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error refreshing Google Drive connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
