import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export function initializeFirebaseAdmin() {
  // Only initialize if we're in a server environment and have the required environment variables
  if (typeof window === 'undefined' && getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Check if all required environment variables are present
    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase Admin SDK: Missing required environment variables. Skipping initialization.');
      return;
    }

    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\n/g, '\n'),
        }),
      });
    } catch (error) {
      console.error('Firebase Admin SDK initialization failed:', error);
    }
  }
}
// Do NOT export 'auth' at the module level. Always call getAuth() after initializeFirebaseAdmin() in your API routes/services.
