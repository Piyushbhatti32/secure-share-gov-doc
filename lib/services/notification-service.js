// Notification service
// This service works with the mock data service instead of Firebase

import mockDataService from './mock-data-service';

// Notification types
export const NotificationType = {
  DOCUMENT_SHARED: 'document_shared',
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_DOWNLOADED: 'document_downloaded',
  DOCUMENT_DELETED: 'document_deleted',
  SECURITY_ALERT: 'security_alert',
  SYSTEM_UPDATE: 'system_update',
  PASSWORD_CHANGE: 'password_change',
  LOGIN_ATTEMPT: 'login_attempt'
};

// Notification priority levels
export const NotificationPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Get user notifications
export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const notifications = await mockDataService.getNotifications(userId);
    return notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  } catch (error) {
    console.error('Get user notifications error:', error);
    throw new Error('Failed to get user notifications');
  }
};

// Create a new notification
export const createNotification = async (notificationData) => {
  try {
    const notification = await mockDataService.addNotification(notificationData);
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw new Error('Failed to create notification');
  }
};

// Mark notifications as read
export const markNotificationsAsRead = async (notificationIds) => {
  try {
    const results = [];
    
    for (const id of notificationIds) {
      try {
        const notification = await mockDataService.markNotificationAsRead(id);
        results.push({
          id,
          success: !!notification,
          message: notification ? 'Notification marked as read' : 'Failed to mark notification as read'
        });
      } catch (error) {
        results.push({
          id,
          success: false,
          message: error.message
        });
      }
    }
    
    return {
      success: true,
      results,
      totalProcessed: notificationIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    throw new Error('Failed to mark notifications as read');
  }
};

// Delete notifications
export const deleteNotifications = async (notificationIds) => {
  try {
    const results = [];
    
    for (const id of notificationIds) {
      try {
        // In a real app, you would delete the notification from the database
        // For now, we'll just mark it as deleted
        const notification = await mockDataService.updateNotification(id, { deleted: true });
        results.push({
          id,
          success: !!notification,
          message: notification ? 'Notification deleted' : 'Failed to delete notification'
        });
      } catch (error) {
        results.push({
          id,
          success: false,
          message: error.message
        });
      }
    }
    
    return {
      success: true,
      results,
      totalProcessed: notificationIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  } catch (error) {
    console.error('Delete notifications error:', error);
    throw new Error('Failed to delete notifications');
  }
};

// Get notification count for a user
export const getNotificationCount = async (userId) => {
  try {
    const notifications = await mockDataService.getNotifications(userId);
    const unreadCount = notifications.filter(n => !n.read && !n.deleted).length;
    const totalCount = notifications.filter(n => !n.deleted).length;
    
    return {
      unread: unreadCount,
      total: totalCount
    };
  } catch (error) {
    console.error('Get notification count error:', error);
    throw new Error('Failed to get notification count');
  }
};

// Clear all notifications for a user
export const clearAllNotifications = async (userId) => {
  try {
    const notifications = await mockDataService.getNotifications(userId);
    const results = [];
    
    for (const notification of notifications) {
      try {
        const updatedNotification = await mockDataService.updateNotification(notification.id, { deleted: true });
        results.push({
          id: notification.id,
          success: !!updatedNotification,
          message: updatedNotification ? 'Notification cleared' : 'Failed to clear notification'
        });
      } catch (error) {
        results.push({
          id: notification.id,
          success: false,
          message: error.message
        });
      }
    }
    
    return {
      success: true,
      results,
      totalProcessed: notifications.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  } catch (error) {
    console.error('Clear all notifications error:', error);
    throw new Error('Failed to clear all notifications');
  }
};
