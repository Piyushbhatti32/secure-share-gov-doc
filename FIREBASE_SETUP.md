# Firebase Configuration Setup Guide

## Prerequisites
1. A Firebase account (https://console.firebase.google.com)
2. A new Firebase project created
3. Firebase CLI installed and authenticated

## Step-by-Step Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `secure-share-gov-doc`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Required Services

#### Authentication
1. Go to Authentication > Sign-in method
2. Enable **Email/Password** provider
3. Enable **Phone** provider
4. Add your domain to authorized domains (for production)

#### Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Start in **test mode** (for development)
4. Choose a location (closest to your users)

#### Storage
1. Go to Storage
2. Click "Get started"
3. Start in **test mode** (for development)

### 3. Get Web App Configuration
1. Go to Project settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" > Web app
4. Register app with name: `Secure Gov Doc Share`
5. Copy the configuration object

### 4. Update Firebase Configuration
Replace the content in `assets/js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 5. Initialize Firebase Project
```bash
firebase login
firebase init
```

Select:
- ✅ Firestore: Configure security rules and indexes files
- ✅ Storage: Configure a security rules file for Cloud Storage
- ✅ Hosting: Configure files for Firebase Hosting

Choose existing project: `secure-share-gov-doc`

### 6. Deploy Security Rules
```bash
firebase deploy --only firestore:rules,storage:rules
```

### 7. Test Locally
```bash
firebase serve
```

### 8. Production Deploy
```bash
firebase deploy
```

## Configuration Template
Copy this to `firebase-config.js` after replacing with your actual values:

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyExample...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
```

## Security Notes
- Never commit actual Firebase credentials to version control
- Use environment variables for production
- Enable App Check for additional security
- Set up proper security rules before going live

## Troubleshooting
- If OTP doesn't work, enable reCAPTCHA in Firebase Console
- Check browser console for errors
- Ensure all Firebase services are enabled
- Verify security rules allow your operations
