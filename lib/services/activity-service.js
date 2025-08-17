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
 * Log user activity to Firestore
 * @param {string} userId - The user ID
 * @param {ActivityType} type - The type of activity
 * @param {Object} details - Additional details about the activity
 */
export const logActivity = async (userId, type, details = {}) => {
  try {
    activityLogger.info(`Logging activity for user ${userId}`, { type, details });
    
    const activityData = {
      userId,
      type,
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
