import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Add your Firebase configuration here
  // You can get this from your Firebase console
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline'
});

// Sign in with Google
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Get the Google Access Token and Refresh Token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential.accessToken;
    // Try to get refreshToken from credential or user
    const refreshToken = credential.refreshToken || result.user.stsTokenManager.refreshToken;
    if (!token) {
      throw new Error('Failed to get Google access token');
    }
    // Store the token in local storage for immediate use
    localStorage.setItem('googleAccessToken', token);
    // Send the token and refresh token to your backend to store in user claims
    try {
      const response = await fetch('/api/auth/google/store-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await result.user.getIdToken()}`
        },
        body: JSON.stringify({
          accessToken: token,
          refreshToken, // <-- send refreshToken
          uid: result.user.uid
        })
      });
      if (!response.ok) {
        console.warn('Failed to store Google tokens in backend, but sign-in succeeded');
      }
    } catch (tokenError) {
      console.warn('Could not store Google tokens in backend:', tokenError);
      // Don't fail the sign-in if token storage fails
    }
    // Refresh the user's ID token to include any new claims
    await result.user.getIdToken(true);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    
    // Handle specific error cases
    switch (error.code) {
      case 'auth/operation-not-allowed':
        throw new Error('Google Sign-In is not enabled. Please ensure Google authentication is enabled in the Firebase Console.');
      case 'auth/popup-blocked':
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups for this site.');
      case 'auth/popup-closed-by-user':
        throw new Error('Sign-in was cancelled. Please try again.');
      case 'auth/cancelled-popup-request':
        throw new Error('Only one sign-in window can be open at a time.');
      default:
        throw new Error(error.message || 'Failed to sign in with Google. Please try again.');
    }
  }
};

export { app, auth, db, storage, signInWithGoogle };
