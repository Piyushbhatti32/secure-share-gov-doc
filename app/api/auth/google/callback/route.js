import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

// Only initialize Firebase Admin if we're in a server environment
if (typeof window === 'undefined') {
  initializeFirebaseAdmin();
}

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This contains the user ID

    // Dynamically detect protocol and host
    const host = request.headers.get('host');
    const protocol = host.startsWith('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    if (!code || !state) {
      return NextResponse.redirect(
        `${baseUrl}/documents/upload?error=Missing required parameters`
      );
    }

    // Dynamically construct the OAuth2 client with the correct redirect URI
    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      process.env.GOOGLE_CLIENT_SECRET || '',
      `${baseUrl}/api/auth/google/callback`
    );

    // Get tokens from code
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store access token in Firebase custom claims
    const auth = getAuth();
    const user = await auth.getUser(state);
    
    await auth.setCustomUserClaims(state, {
      ...user.customClaims,
      google_oauth_access_token: tokens.access_token,
      google_oauth_refresh_token: tokens.refresh_token,
    });

    // Redirect back to the upload page with success
    return NextResponse.redirect(
      `${baseUrl}/documents/upload?connected=true&setup=true`
    );
  } catch (error) {
    console.error('Error handling Google callback:', error);
    // Try to redirect to the detected domain with the error message
    const host = request.headers.get('host');
    const protocol = host && host.startsWith('localhost') ? 'http' : 'https';
    const baseUrl = host ? `${protocol}://${host}` : '';
    return NextResponse.redirect(
      `${baseUrl}/documents/upload?error=${encodeURIComponent(error.message)}`
    );
  }
}
