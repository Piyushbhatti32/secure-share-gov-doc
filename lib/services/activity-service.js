'use client';

import { collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createLogger } from '@/lib/utils/logger';

// Create module-specific logger
const activityLogger = createLogger('ActivityService');

// Activity types for the application
export const ActivityType = {
  UPLOAD: 'upload',
  ARCHIVE: 'archive',
  DELETE: 'delete',
  SHARE: 'share',
  RECEIVE: 'receive',
  PROFILE_UPDATE: 'profile_update',
  LOGIN: 'login',
  LOGOUT: 'logout',
  RESTORE: 'restore',
  DOWNLOAD: 'download'
};

// Icon mapping for different activity types
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
 * Generate detailed activity description based on type and details
 * @param {ActivityType} type - The type of activity
 * @param {Object} details - Activity details
 * @returns {string} - Human-readable description
 */
const generateActivityDescription = (type, details = {}) => {
  switch (type) {
    case ActivityType.UPLOAD:
      return `Uploaded document "${details.fileName || details.documentName || 'Unknown'}"`;
    
    case ActivityType.DELETE:
      return `Deleted document "${details.fileName || details.documentName || 'Unknown'}"`;
    
    case ActivityType.SHARE:
      return `Shared document with ${details.sharedWith || 'someone'}`;
    
    case ActivityType.ARCHIVE:
      return `Archived document "${details.documentName || 'Unknown'}"`;
    
    case ActivityType.RESTORE:
      return `Restored document "${details.documentName || 'Unknown'}"`;
    
    case ActivityType.DOWNLOAD:
      return `Downloaded document "${details.documentName || 'Unknown'}"`;
    
    case ActivityType.RECEIVE:
      return `Received shared document "${details.documentName || 'Unknown'}"`;
    
    case ActivityType.LOGIN:
      const method = details.loginMethod === 'google' ? 'Google' : 'Email';
      return `Signed in via ${method}`;
    
    case ActivityType.LOGOUT:
      return 'Signed out';
    
    case ActivityType.PROFILE_UPDATE:
      const fields = details.updates ? details.updates.split(', ') : [];
      return `Updated profile: ${fields.join(', ')}`;
    
    default:
      return 'Activity performed';
  }
};

/**
 * Log user activity to Firestore
 * @param {string} userId - The user ID
 * @param {ActivityType} type - The type of activity
 * @param {Object} details - Additional details about the activity
 */
export const logActivity = async (userId, type, details = {}) => {
  try {
    activityLogger.info(`Logging activity for user ${userId}`, { type, details });
    
    // Generate detailed description based on activity type
    const description = generateActivityDescription(type, details);
    
    const activityData = {
      userId,
      type,
      description,
      details,
      timestamp: new Date(),
      ipAddress: details.ipAddress || 'unknown',
      userAgent: details.userAgent || 'unknown'
    };

    const docRef = await addDoc(collection(db, 'activities'), activityData);
    
    activityLogger.info(`Activity logged successfully`, { 
      activityId: docRef.id, 
      userId, 
      type 
    });
    
    return docRef.id;
  } catch (error) {
    activityLogger.error(`Failed to log activity`, { 
      userId, 
      type, 
      details, 
      error: error.message 
    });
    throw error;
  }
};

/**
 * Get recent activities for a user
 * @param {string} userId - The user ID
 * @param {number} limit - Maximum number of activities to return
 */
export const getUserActivities = async (userId, limitCount = 10) => {
  try {
    activityLogger.info(`Fetching activities for user ${userId}`, { limit: limitCount });
    
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(activitiesQuery);
    const activities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    activityLogger.info(`Retrieved ${activities.length} activities for user ${userId}`);
    return activities;
  } catch (error) {
    activityLogger.error(`Failed to fetch user activities`, { 
      userId, 
      limit: limitCount, 
      error: error.message 
    });
    throw error;
  }
};

/**
 * Get recent activities across all users (for admin purposes)
 * @param {number} limit - Maximum number of activities to return
 */
export const getRecentActivities = async (limitCount = 20) => {
  try {
    activityLogger.info(`Fetching recent activities across all users`, { limit: limitCount });
    
    const activitiesQuery = query(
      collection(db, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(activitiesQuery);
    const activities = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    activityLogger.info(`Retrieved ${activities.length} recent activities`);
    return activities;
  } catch (error) {
    activityLogger.error(`Failed to fetch recent activities`, { 
      limit: limitCount, 
      error: error.message 
    });
    throw error;
  }
};
