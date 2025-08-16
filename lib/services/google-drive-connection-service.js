'use client';

import { auth } from '@/lib/firebase';
import { getUserProfile, updateUser } from '@/lib/services/user-service';

export const checkGoogleDriveConnection = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return { connected: false, error: 'User not authenticated' };
    }

    // Get user profile to check connection status
    const userProfile = await getUserProfile(currentUser.uid);
    
    if (userProfile.googleDriveConnected) {
      // Check if the token is still valid by making a test API call
      try {
        const token = await currentUser.getIdToken(true);
        const response = await fetch('/api/google-drive/check-connection', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          return { connected: true };
        } else {
          // Token might be expired, try to refresh
          const data = await response.json();
          if (data.error && data.error.includes('refresh')) {
            return { connected: false, needsRefresh: true };
          }
          return { connected: false, error: data.error };
        }
      } catch (error) {
        console.error('Error checking Google Drive connection:', error);
        return { connected: false, error: 'Failed to verify connection' };
      }
    }

    return { connected: false };
  } catch (error) {
    console.error('Error checking Google Drive connection:', error);
    return { connected: false, error: error.message };
  }
};

export const setGoogleDriveConnected = async (connected = true) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    await updateUser(currentUser.uid, {
      googleDriveConnected: connected,
      googleDriveConnectedAt: connected ? new Date().toISOString() : null
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting Google Drive connection status:', error);
    throw error;
  }
};

export const disconnectGoogleDrive = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Clear connection status
    await setGoogleDriveConnected(false);

    // Clear any stored tokens (this would be handled by the backend)
    const token = await currentUser.getIdToken(true);
    await fetch('/api/google-drive/disconnect', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Google Drive:', error);
    throw error;
  }
};

export const refreshGoogleDriveConnection = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const token = await currentUser.getIdToken(true);
    const response = await fetch('/api/google-drive/refresh-connection', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      await setGoogleDriveConnected(true);
      return { success: true };
    } else {
      const data = await response.json();
      throw new Error(data.error || 'Failed to refresh connection');
    }
  } catch (error) {
    console.error('Error refreshing Google Drive connection:', error);
    throw error;
  }
};
