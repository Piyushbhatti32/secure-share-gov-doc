import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

initializeFirebaseAdmin();

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
);

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This contains the user ID

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/documents/upload?error=Missing required parameters`
      );
    }

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
      `${process.env.NEXT_PUBLIC_APP_URL}/documents/upload?connected=true&setup=true`
    );
  } catch (error) {
    console.error('Error handling Google callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/documents/upload?error=${encodeURIComponent(error.message)}`
    );
  }
}
