# Google Drive Persistent Connection

This document explains the new persistent Google Drive connection feature that eliminates the need for users to reconnect every time they upload documents.

## Problem Solved

Previously, users had to:
- Connect to Google Drive every time they visited the upload page
- Re-authenticate for each document upload
- Deal with connection interruptions during uploads

## New Solution

The new system provides:
- **One-time connection**: Users connect once and stay connected
- **Automatic token refresh**: Expired tokens are automatically refreshed
- **Persistent status**: Connection status is stored in user profile
- **Visual indicators**: Clear status indicators in the navbar
- **Automatic reconnection**: Failed connections are automatically retried

## How It Works

### 1. Connection Storage
- Google OAuth tokens are stored in Firebase custom claims
- Connection status is stored in the user's Firestore profile
- Tokens are automatically refreshed when needed

### 2. Connection Checking
- The system checks connection status on page load
- Periodic checks every 5 minutes ensure connection health
- Failed connections trigger automatic refresh attempts

### 3. User Interface
- **Navbar indicator**: Shows "Drive Connected" or "Drive Disconnected"
- **Upload page**: Clear connection status with green/blue indicators
- **One-click disconnect**: Users can disconnect from the navbar

## API Endpoints

### Check Connection Status
```
GET /api/google-drive/check-connection
```
- Verifies if Google Drive connection is active
- Tests API access with current tokens
- Returns connection status and error details

### Refresh Connection
```
POST /api/google-drive/refresh-connection
```
- Refreshes expired access tokens
- Updates Firebase custom claims
- Returns success/failure status

### Disconnect
```
POST /api/google-drive/disconnect
```
- Clears stored OAuth tokens
- Updates user profile connection status
- Removes access to Google Drive

## User Experience

### First Time Setup
1. User visits upload page
2. Sees "Connect Google Drive" button
3. Clicks to authorize with Google
4. Connection is established and stored
5. User can now upload documents without reconnecting

### Subsequent Visits
1. User visits upload page
2. System automatically checks connection status
3. If connected: Green indicator shows "Drive Connected"
4. If disconnected: Blue indicator prompts reconnection
5. If expired: System automatically refreshes tokens

### Connection Management
- **Navbar indicator**: Always visible connection status
- **Disconnect option**: One-click disconnect from navbar
- **Automatic refresh**: Expired tokens are refreshed automatically
- **Error handling**: Clear error messages for connection issues

## Technical Implementation

### Services
- `google-drive-connection-service.js`: Main connection management
- `google-auth-service.js`: Token refresh functionality
- `google-drive-service.js`: File upload operations

### Components
- `GoogleDriveStatus.js`: Navbar status indicator
- Updated upload page with persistent connection checking

### Database Storage
- **Firebase Custom Claims**: OAuth tokens (access_token, refresh_token)
- **Firestore User Profile**: Connection status and timestamps

## Benefits

1. **Better UX**: No more repeated authentication
2. **Reliability**: Automatic token refresh prevents connection loss
3. **Transparency**: Clear visual indicators of connection status
4. **Security**: Proper token management and cleanup
5. **Performance**: Faster uploads without authentication delays

## Troubleshooting

### Connection Issues
- Check if user is signed in with Google account
- Verify Google Drive API is enabled in Google Cloud Console
- Check Firebase custom claims for stored tokens

### Token Refresh Failures
- Refresh tokens may expire after 6 months
- User needs to re-authenticate if refresh token is invalid
- Check Google Cloud Console for API quotas and limits

### Common Errors
- "Google account not connected": User needs to sign in with Google
- "Token expired": Automatic refresh should handle this
- "API quota exceeded": Check Google Cloud Console usage

## Future Enhancements

- **Connection analytics**: Track connection usage and patterns
- **Multiple account support**: Allow connecting multiple Google accounts
- **Offline mode**: Cache documents for offline access
- **Connection health monitoring**: Proactive connection status checking
