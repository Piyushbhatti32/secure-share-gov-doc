'use client';

// Activity service for tracking user actions
// This service works with the mock data service instead of Firebase

import mockDataService from './mock-data-service';

export const ActivityType = {
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_DOWNLOADED: 'document_downloaded',
  DOCUMENT_SHARED: 'document_shared',
  DOCUMENT_DELETED: 'document_deleted',
  DOCUMENT_EDITED: 'document_edited',
  DOCUMENT_ARCHIVED: 'document_archived',
  DOCUMENT_RESTORED: 'document_restored',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PROFILE_UPDATED: 'profile_updated',
  SECURITY_SETTINGS_CHANGED: 'security_settings_changed'
};

export const ActivityIcons = {
  [ActivityType.DOCUMENT_UPLOADED]: 'fa-solid fa-upload',
  [ActivityType.DOCUMENT_DOWNLOADED]: 'fa-solid fa-download',
  [ActivityType.DOCUMENT_SHARED]: 'fa-solid fa-share-nodes',
  [ActivityType.DOCUMENT_DELETED]: 'fa-solid fa-trash',
  [ActivityType.DOCUMENT_EDITED]: 'fa-solid fa-pen-to-square',
  [ActivityType.DOCUMENT_ARCHIVED]: 'fa-solid fa-box-archive',
  [ActivityType.DOCUMENT_RESTORED]: 'fa-solid fa-rotate-left',
  [ActivityType.LOGIN]: 'fa-solid fa-sign-in-alt',
  [ActivityType.LOGOUT]: 'fa-solid fa-sign-out-alt',
  [ActivityType.PROFILE_UPDATED]: 'fa-solid fa-user-edit',
  [ActivityType.SECURITY_SETTINGS_CHANGED]: 'fa-solid fa-shield-halved'
};

export const logActivity = async (userId, type, description, metadata = {}) => {
  try {
    const activity = {
      userId,
      type,
      description,
      metadata,
      timestamp: new Date()
    };
    
    await mockDataService.addActivity(activity);
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

export const getUserActivities = async (userId, limit = 50) => {
  try {
    const activities = await mockDataService.getActivities(userId);
    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

export const getRecentActivities = async (userId, limit = 10) => {
  try {
    const activities = await mockDataService.getActivities(userId);
    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};
