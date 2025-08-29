// User service
// This service works with the mock data service instead of Firebase

import mockDataService from './mock-data-service';

// User profile management
export const getUserProfile = async (userId) => {
  try {
    return await mockDataService.getUser(userId);
  } catch (error) {
    console.error('Get user profile error:', error);
    throw new Error('Failed to get user profile');
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const updatedUser = await mockDataService.updateUser(userId, updates);
    return updatedUser;
  } catch (error) {
    console.error('Update user profile error:', error);
    throw new Error('Failed to update user profile');
  }
};

// User preferences management
export const getUserPreferences = async (userId) => {
  try {
    const user = await mockDataService.updateUser(userId, {
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        privacy: {
          profileVisibility: 'private',
          activityVisibility: 'friends',
          documentVisibility: 'private'
        }
      }
    });
    return user.preferences;
  } catch (error) {
    console.error('Get user preferences error:', error);
    throw new Error('Failed to get user preferences');
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  try {
    const updatedUser = await mockDataService.updateUser(userId, {
      preferences: { ...preferences }
    });
    return updatedUser.preferences;
  } catch (error) {
    console.error('Update user preferences error:', error);
    throw new Error('Failed to update user preferences');
  }
};

// User security settings management
export const getUserSecuritySettings = async (userId) => {
  try {
    const user = await mockDataService.updateUser(userId, {
      security: {
        twoFactorEnabled: false,
        passwordLastChanged: new Date().toISOString(),
        loginAttempts: 0,
        lastLogin: new Date().toISOString(),
        ipWhitelist: [],
        sessionTimeout: 3600, // 1 hour in seconds
        requirePasswordChange: false
      }
    });
    return user.security;
  } catch (error) {
    console.error('Get user security settings error:', error);
    throw new Error('Failed to get user security settings');
  }
};

export const updateUserSecuritySettings = async (userId, securitySettings) => {
  try {
    const updatedUser = await mockDataService.updateUser(userId, {
      security: { ...securitySettings }
    });
    return updatedUser.security;
  } catch (error) {
    console.error('Update user security settings error:', error);
    throw new Error('Failed to update user security settings');
  }
};

// Add the missing updateUser function
export const updateUser = async (userId, updates) => {
  try {
    const updatedUser = await mockDataService.updateUser(userId, updates);
    return updatedUser;
  } catch (error) {
    console.error('Update user error:', error);
    throw new Error('Failed to update user');
  }
};
