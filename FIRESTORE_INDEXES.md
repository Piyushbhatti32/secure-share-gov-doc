# Firestore Indexes Setup

This document explains how to resolve Firestore index errors in the SecureShare application.

## The Problem

Firestore requires composite indexes when you query with both a `where` clause and an `orderBy` clause on different fields. The application uses several such queries:

1. **Notifications**: `where('userId', '==', userId)` + `orderBy('createdAt', 'desc')`
2. **Documents**: `where('userId', '==', userId)` + `orderBy('createdAt', 'desc')`
3. **Activities**: `where('userId', '==', userId)` + `orderBy('timestamp', 'desc')`
4. **Notifications (unread)**: `where('userId', '==', userId)` + `where('read', '==', false)`

## Solution Options

### Option 1: Automatic Deployment (Recommended)

1. Make sure you have Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Deploy the indexes:
   ```bash
   npm run deploy:indexes
   ```

### Option 2: Manual Creation

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** > **Indexes**
4. Click **Add Index** and create the following indexes:

#### Index 1: Notifications by User and Creation Date
- **Collection ID**: `notifications`
- **Fields**:
  - `userId` (Ascending)
  - `createdAt` (Descending)

#### Index 2: Notifications by User and Read Status
- **Collection ID**: `notifications`
- **Fields**:
  - `userId` (Ascending)
  - `read` (Ascending)

#### Index 3: Documents by User and Creation Date
- **Collection ID**: `documents`
- **Fields**:
  - `userId` (Ascending)
  - `createdAt` (Descending)

#### Index 4: Activities by User and Timestamp
- **Collection ID**: `activities`
- **Fields**:
  - `userId` (Ascending)
  - `timestamp` (Descending)

## Index Creation Time

Index creation typically takes 1-5 minutes. You can monitor the progress in the Firebase Console under **Firestore Database** > **Indexes**.

## Error Handling

The application now includes graceful error handling for index errors:

- If indexes are missing, the app will show helpful error messages in the console
- Functions will return empty arrays/values instead of crashing
- Users will see appropriate fallback content

## Current Status

✅ **Indexes Successfully Deployed!**

The required Firestore indexes have been deployed and are currently being built. You can check their status with:

```bash
npm run check:indexes
```

## Verification

After the indexes are built (typically 1-5 minutes), you can verify they're working by:

1. Running `npm run check:indexes` to see index status
2. Refreshing the application
3. Checking the browser console for any remaining index errors
4. Testing the dashboard page to ensure recent documents and activities load
5. Testing the notifications functionality

## Monitoring Progress

You can monitor the index building progress at:
https://console.firebase.google.com/project/share-gov-docs-213b7/firestore/indexes

Look for indexes with status "Building" → "Enabled"

## Troubleshooting

If you still see index errors after creating the indexes:

1. Wait a few more minutes for index creation to complete
2. Check the Firebase Console to ensure indexes are in "Enabled" state
3. Clear browser cache and refresh
4. Check that the field names and types match exactly

## Additional Notes

- Indexes are required for production queries that combine filtering and sorting
- The indexes defined here are optimized for the most common query patterns
- You may need additional indexes if you add new query patterns in the future
