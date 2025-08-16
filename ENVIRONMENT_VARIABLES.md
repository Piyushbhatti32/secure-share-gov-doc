# Environment Variables Setup Guide

## Required Environment Variables

Copy these variables to your `.env.local` file for local development or set them in your Vercel project settings for production.

### Firebase Configuration (Client-side)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Firebase Admin (Server-side)
```bash
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
```

### Google OAuth Configuration
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Email Configuration
```bash
EMAIL_USER=your_email@domain.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_email@domain.com
```

## How to Get These Values

### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → General
4. Scroll down to "Your apps" section
5. Copy the configuration values

### Firebase Admin
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values from the JSON file

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set authorized redirect URIs to include your domain

### Email Configuration
1. Use your email provider's SMTP settings
2. For Gmail, you might need to use an App Password
3. For production, consider using services like SendGrid or Mailgun

## Security Notes

- Never commit `.env.local` files to version control
- Use different values for development and production
- Regularly rotate sensitive credentials
- Use strong, unique passwords for all services
