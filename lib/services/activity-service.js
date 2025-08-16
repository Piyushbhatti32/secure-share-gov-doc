'use client';

import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Activity types enum
export const ActivityType = {
  UPLOAD: 'UPLOAD',
  ARCHIVE: 'ARCHIVE',
  DELETE: 'DELETE',
  SHARE: 'SHARE',
  RECEIVE: 'RECEIVE',
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  RESTORE: 'RESTORE',
  DOWNLOAD: 'DOWNLOAD'
};

// Activity icons mapping
export const ActivityIcons = {
  [ActivityType.UPLOAD]: 'upload',
  [ActivityType.ARCHIVE]: 'archive',
  [ActivityType.DELETE]: 'trash-alt',
  [ActivityType.SHARE]: 'share-alt',
  [ActivityType.RECEIVE]: 'inbox',
  [ActivityType.PROFILE_UPDATE]: 'user-edit',
  [ActivityType.LOGIN]: 'sign-in-alt',
  [ActivityType.LOGOUT]: 'sign-out-alt',
  [ActivityType.RESTORE]: 'undo',
  [ActivityType.DOWNLOAD]: 'download'
};

/**
 * Log a new activity
 * @param {string} userId - The user ID
 * @param {ActivityType} type - The type of activity
 * @param {Object} details - Additional activity details
 */
export const logActivity = async (userId, type, details = {}) => {
  try {
    const { documentId, documentName, sharedWith } = details;
    
    const activityData = {
      userId,
      type,
      timestamp: serverTimestamp(),
      description: generateActivityDescription(type, details)
    };

    // Only add fields if they have valid values (not undefined or null)
    if (documentId) {
      activityData.documentId = documentId;
    }
    if (documentName) {
      activityData.documentName = documentName;
    }
    if (sharedWith) {
      activityData.sharedWith = sharedWith;
    }

    await addDoc(collection(db, 'activities'), activityData);
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

// Helper function to generate human-readable activity descriptions
const generateActivityDescription = (type, details) => {
  const { documentName, sharedWith } = details;
  
  switch (type) {
    case ActivityType.UPLOAD:
      return `Uploaded document "${documentName}"`;
    case ActivityType.ARCHIVE:
      return `Archived document "${documentName}"`;
    case ActivityType.DELETE:
      return `Deleted document "${documentName}"`;
    case ActivityType.SHARE:
      return `Shared document "${documentName}" with ${sharedWith}`;
    case ActivityType.RECEIVE:
      return `Received access to document "${documentName}"`;
    case ActivityType.PROFILE_UPDATE:
      return 'Updated profile information';
    case ActivityType.LOGIN:
      return 'Logged in to the system';
    case ActivityType.LOGOUT:
      return 'Logged out of the system';
    case ActivityType.RESTORE:
      return `Restored document "${documentName}" from archive`;
    case ActivityType.DOWNLOAD:
      return `Downloaded document "${documentName}"`;
    default:
      return 'Performed an action';
  }
};

export const getUserActivities = async (userId) => {
  try {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};
