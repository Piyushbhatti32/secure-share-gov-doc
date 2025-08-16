import { google } from 'googleapis';
import { getAuth } from 'firebase-admin/auth';
import { NextResponse } from 'next/server';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';
import { refreshGoogleToken } from '@/lib/services/google-auth-service';
import { Readable } from 'stream';

// Convert a ReadableStream to a Node.js Readable stream
function createReadableStream(buffer) {
  return new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    }
  });
}

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

// Find or create a folder in Google Drive
async function findOrCreateFolder(drive, folderName) {
  try {
    // Search for existing folder
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create new folder if not found
    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    return folder.data.id;
  } catch (error) {
    console.error('Error managing folder:', error);
    throw new Error('Failed to manage Google Drive folder');
  }
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

    // Check if user has Google authentication
    if (!decodedToken.firebase.identities['google.com']) {
      return NextResponse.json(
        { error: 'Google account not connected. Please sign in with Google.' },
        { status: 401 }
      );
    }

    // Get Google OAuth token
    let accessToken;
    try {
      const auth = getAuth();
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

    const formData = await request.formData();
    const file = formData.get('file');
    const folderName = formData.get('folderName') || 'SecureDocShare';

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No valid file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const mimeType = file.type || 'application/octet-stream';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get Google OAuth token from Firebase Custom Claims
    if (!decodedToken.google_oauth_access_token) {
      return NextResponse.json(
        { error: 'Google Drive access not authorized. Please connect your Google account.' },
        { status: 401 }
      );
    }

    // Initialize Drive client with the OAuth token
    let drive;
    try {
      drive = await initializeDriveClient(accessToken);
    } catch (driveError) {
      console.error('Failed to initialize Google Drive client:', driveError);
      return NextResponse.json({
        error: 'Failed to initialize Google Drive connection',
        details: driveError.message
      }, { status: 500 });
    }

    // Find or create the folder
    const folderId = await findOrCreateFolder(drive, folderName);

    let driveResponse;
    try {
      // Create a Node.js readable stream from the buffer
      const readable = createReadableStream(fileBuffer);

      // Upload file to Google Drive
      driveResponse = await drive.files.create({
        requestBody: {
          name: fileName,
          mimeType: mimeType,
          parents: [folderId],
        },
        media: {
          mimeType: mimeType,
          body: readable,
        },
        fields: 'id, name, webViewLink, webContentLink',
      },
      {
        // Add timeout and retry options
        timeout: 60000,
        retry: true,
      });
    } catch (uploadError) {
      console.error('Google Drive upload error:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload file to Google Drive',
        details: uploadError.message 
      }, { status: 500 });
    }

    if (!driveResponse?.data?.id) {
      console.error('Invalid response from Google Drive:', driveResponse);
      return NextResponse.json({ 
        error: 'Invalid response from Google Drive'
      }, { status: 500 });
    }

    try {
      // Set file permissions to private
      await drive.permissions.create({
        fileId: driveResponse.data.id,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: decodedToken.email || decodedToken.firebase.identities['google.com'][0],
        },
        // Make sure the file is not publicly accessible
        supportsAllDrives: true,
        transferOwnership: false,
      });

      // Set the file to private (not publicly accessible)
      await drive.files.update({
        fileId: driveResponse.data.id,
        requestBody: {
          // Remove any shared permissions
          permissionIds: [],
          // Set private visibility
          viewersCanCopyContent: false,
          copyRequiresWriterPermission: true,
          published: false,
          publiclyViewable: false,
        },
      });
    } catch (permissionError) {
      console.error('Permission setting error:', permissionError);
      // Don't fail the upload if permission setting fails
    }

    // Validate the upload response
    if (!driveResponse?.data) {
      console.error('Invalid drive response:', driveResponse);
      return NextResponse.json({ 
        error: 'Invalid response from Google Drive' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      fileId: driveResponse.data.id,
      name: driveResponse.data.name,
      viewLink: driveResponse.data.webViewLink,
      downloadLink: driveResponse.data.webContentLink,
    });
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file to Google Drive' },
      { status: 500 }
    );
  }
}
