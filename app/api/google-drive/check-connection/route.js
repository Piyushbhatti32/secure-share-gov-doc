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

    // Get user's Google OAuth access token from custom claims
    const auth = getAuth();
    const user = await auth.getUser(decodedToken.uid);
    let accessToken = user.customClaims?.google_oauth_access_token;
    const refreshToken = user.customClaims?.google_oauth_refresh_token;

    if (!accessToken && !refreshToken) {
      return NextResponse.json({ error: 'Google Drive not connected' }, { status: 401 });
    }

    // Try to use the access token, refresh if needed
    let drive;
    try {
      drive = await initializeDriveClient(accessToken);
      await drive.about.get({ fields: 'user' });
      return NextResponse.json({ connected: true });
    } catch (driveError) {
      // If token is expired and we have a refresh token, try to refresh
      if (driveError.code === 401 && refreshToken) {
        try {
          accessToken = await refreshGoogleToken(decodedToken.uid, refreshToken);
          drive = await initializeDriveClient(accessToken);
          await drive.about.get({ fields: 'user' });
          return NextResponse.json({ connected: true, refreshed: true });
        } catch (refreshError) {
          return NextResponse.json({ error: 'Token expired and refresh failed. Please reconnect your Google account.' }, { status: 401 });
        }
      }
      return NextResponse.json({ error: 'Google Drive connection failed. Please reconnect your account.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error checking Google Drive connection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
