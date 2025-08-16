'use client';

import { collection, addDoc, query, where, getDocs, orderBy, limit, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const createNotification = async (userId, title, message, type = 'info') => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId, options = { limit: 20, onlyUnread: false }) => {
  try {
    let q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (options.onlyUnread) {
      q = query(q, where('read', '==', false));
    }

    if (options.limit) {
      q = query(q, limit(options.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    // If it's an index error, provide helpful information
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      if (error.message.includes('currently building')) {
        // No-op in production
      } else {
        // No-op in production
      }
      return [];
    }
    
    throw error;
  }
};

export const markNotificationsAsRead = async (notificationIds) => {
  try {
    const batch = writeBatch(db);
    
    notificationIds.forEach(notificationId => {
      const notificationRef = doc(db, 'notifications', notificationId);
      batch.update(notificationRef, {
        read: true,
        readAt: new Date().toISOString()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

export const deleteNotifications = async (notificationIds) => {
  try {
    const batch = writeBatch(db);
    
    notificationIds.forEach(notificationId => {
      const notificationRef = doc(db, 'notifications', notificationId);
      batch.delete(notificationRef);
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error deleting notifications:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: new Date().toISOString()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    
    // If it's an index error, provide helpful information
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      if (error.message.includes('currently building')) {
        // No-op in production
      } else {
        // No-op in production
      }
      return; // Don't throw, just return
    }
    
    throw error;
  }
};

export const getUnreadNotificationCount = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    
    // If it's an index error, provide helpful information
    if (error.code === 'failed-precondition' && error.message.includes('index')) {
      if (error.message.includes('currently building')) {
        // No-op in production
      } else {
        // No-op in production
      }
      return 0; // Return 0 as fallback
    }
    
    return 0;
  }
};
