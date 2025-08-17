'use client';

import { auth } from '@/lib/firebase';
import { logActivity, ActivityType } from './activity-service';

export const handleLogin = async (user, details = {}) => {
  await logActivity(user.uid, ActivityType.LOGIN, {
    email: user.email,
    displayName: user.displayName,
    ipAddress: details?.ipAddress || 'unknown',
    userAgent: details?.userAgent || 'unknown',
    loginMethod: details?.loginMethod || 'email'
  });
};

export const handleLogout = async (user, details = {}) => {
  if (user?.uid) {
    await logActivity(user.uid, ActivityType.LOGOUT, {
      email: user.email,
      displayName: user.displayName,
      ipAddress: details?.ipAddress || 'unknown',
      userAgent: details?.userAgent || 'unknown'
    });
  }
};

export const handleProfileUpdate = async (userId, updates, details = {}) => {
  await logActivity(userId, ActivityType.PROFILE_UPDATE, {
    updates: Object.keys(updates).join(', '),
    updatedFields: updates,
    ipAddress: details?.ipAddress || 'unknown',
    userAgent: details?.userAgent || 'unknown'
  });
};
