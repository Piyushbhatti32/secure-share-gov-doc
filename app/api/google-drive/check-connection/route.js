import { google } from 'googleapis';
import { getAuth } from 'firebase-admin/auth';
import { NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { refreshGoogleToken } from '@/lib/services/google-auth-service';

// DEBUG: Log Firebase Admin env vars
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);
console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('NEXT_PUBLIC_GOOGLE_CLIENT_ID exists:', !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

// Initialize Firebase Admin
// Only initialize Firebase Admin if we're in a server environment
if (typeof window === 'undefined') {
  initializeFirebaseAdmin();
}

// Initialize Google Drive client
const initializeDriveClient = async (accessToken) => {
  const auth = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth });
};

export async function GET(request) {
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

    // Get Google OAuth token
    let accessToken;
    try {
      const user = await auth.getUser(decodedToken.uid);
      
      if (user.customClaims?.google_oauth_access_token) {
        accessToken = user.customClaims.google_oauth_access_token;
      } else {
        // Attempt to refresh the token
        if (user.customClaims?.google_oauth_refresh_token) {
          try {
            accessToken = await refreshGoogleToken(
              decodedToken.uid,
              user.customClaims.google_oauth_refresh_token
            );
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            return NextResponse.json(
              { error: 'Failed to refresh Google access token. Please reconnect your Google account.' },
              { status: 401 }
            );
          }
        } else {
          return NextResponse.json(
            { error: 'Google Drive access not authorized. Please connect your Google account.' },
            { status: 401 }
          );
        }
      }
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed. Please try again.' },
        { status: 401 }
      );
    }

    // Test the connection by making a simple API call
    try {
      const drive = await initializeDriveClient(accessToken);
      
      // Make a simple API call to test the connection
      await drive.about.get({
        fields: 'user'
      });

      return NextResponse.json({ connected: true });
    } catch (driveError) {
      console.error('Drive API error:', driveError);
      
      // If the token is expired, try to refresh it
      if (driveError.code === 401) {
        const user = await auth.getUser(decodedToken.uid);
        
        if (user.customClaims?.google_oauth_refresh_token) {
          try {
            const newAccessToken = await refreshGoogleToken(
              decodedToken.uid,
              user.customClaims.google_oauth_refresh_token
            );
            
            // Test with the new token
            const drive = await initializeDriveClient(newAccessToken);
            await drive.about.get({ fields: 'user' });
            
            return NextResponse.json({ connected: true });
          } catch (refreshError) {
            return NextResponse.json(
              { error: 'Token expired and refresh failed. Please reconnect your Google account.' },
              { status: 401 }
            );
          }
        }
      }
      
      return NextResponse.json(
        { error: 'Google Drive connection failed. Please reconnect your account.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error checking Google Drive connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
