// User service
// Simplified service for basic user operations

// User profile management
export const getUserProfile = async (userId) => {
  try {
    // Return basic user info - in a real app, this would fetch from a database
    return {
      id: userId,
      name: 'User',
      email: 'user@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    throw new Error('Failed to get user profile');
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    // In a real app, this would update the database
    return {
      id: userId,
      ...updates,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Update user profile error:', error);
    throw new Error('Failed to update user profile');
  }
};

// User preferences management
export const getUserPreferences = async (userId) => {
  try {
    return {
      theme: 'dark',
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
    };
  } catch (error) {
    console.error('Get user preferences error:', error);
    throw new Error('Failed to get user preferences');
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  try {
    return { ...preferences };
  } catch (error) {
    console.error('Update user preferences error:', error);
    throw new Error('Failed to update user preferences');
  }
};

// User security settings management
export const getUserSecuritySettings = async (userId) => {
  try {
    return {
      twoFactorEnabled: false,
      passwordLastChanged: new Date().toISOString(),
      loginAttempts: 0,
      lastLogin: new Date().toISOString(),
      ipWhitelist: [],
      sessionTimeout: 3600, // 1 hour in seconds
      requirePasswordChange: false
    };
  } catch (error) {
    console.error('Get user security settings error:', error);
    throw new Error('Failed to get user security settings');
  }
};

export const updateUserSecuritySettings = async (userId, securitySettings) => {
  try {
    return { ...securitySettings };
  } catch (error) {
    console.error('Update user security settings error:', error);
    throw new Error('Failed to update user security settings');
  }
};

// Add the missing updateUser function
export const updateUser = async (userId, updates) => {
  try {
    return {
      id: userId,
      ...updates,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Update user error:', error);
    throw new Error('Failed to update user');
  }
};
