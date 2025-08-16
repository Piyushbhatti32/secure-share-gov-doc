'use client';

import { auth } from '@/lib/firebase';
import { logActivity, ActivityType } from './activity-service';

export const handleLogin = async (user) => {
  await logActivity(user.uid, ActivityType.LOGIN);
};

export const handleLogout = async (user) => {
  if (user?.uid) {
    await logActivity(user.uid, ActivityType.LOGOUT);
  }
};

export const handleProfileUpdate = async (userId, updates) => {
  await logActivity(userId, ActivityType.PROFILE_UPDATE, {
    updates: Object.keys(updates).join(', ')
  });
};
