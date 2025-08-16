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

// Sign in with Google
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Get the Google Access Token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential) {
      throw new Error('Failed to get Google credentials');
    }
    
    const token = credential.accessToken;
    if (!token) {
      throw new Error('Failed to get Google access token');
    }
    
    // Store the token in local storage for Drive API use
    localStorage.setItem('googleAccessToken', token);
    
    // Add Google Drive scope to the user's token
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
