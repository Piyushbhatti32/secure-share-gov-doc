import { google } from 'googleapis';
import { getAuth } from 'firebase-admin/auth';

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
);

export const refreshGoogleToken = async (userId, refreshToken) => {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Update Firebase custom claims with new access token
    const auth = getAuth();
    const user = await auth.getUser(userId);
    
    await auth.setCustomUserClaims(userId, {
      ...user.customClaims,
      google_oauth_access_token: credentials.access_token,
    });

    return credentials.access_token;
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    throw error;
  }
};
