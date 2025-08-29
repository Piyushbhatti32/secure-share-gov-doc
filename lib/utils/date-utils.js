// Date utility functions for formatting and relative time calculations

/**
 * Format a date to a readable string
 * @param {Date|string|number} date - The date to format
 * @param {string} format - The format style ('short', 'long', 'time', 'datetime')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'Not available';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    switch (format) {
      case 'short':
        return new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).format(dateObj);
        
      case 'long':
        return new Intl.DateTimeFormat('en-GB', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }).format(dateObj);
        
      case 'time':
        return new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit'
        }).format(dateObj);
        
      case 'datetime':
        return new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(dateObj);
        
      default:
        return dateObj.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Calculate relative time (e.g., "2 hours ago", "3 days ago")
 * @param {Date|string|number} date - The date to calculate relative time for
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Not available';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    const now = new Date();
    const diffInMs = now - dateObj;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Invalid Date';
  }
};

/**
 * Check if a date is today
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} - True if the date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    const today = new Date();
    
    return dateObj.toDateString() === today.toDateString();
  } catch (error) {
    return false;
  }
};

/**
 * Check if a date is yesterday
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} - True if the date is yesterday
 */
export const isYesterday = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return dateObj.toDateString() === yesterday.toDateString();
  } catch (error) {
    return false;
  }
};

/**
 * Get the start of a day (midnight)
 * @param {Date|string|number} date - The date to get the start of
 * @returns {Date} - Date object set to start of day
 */
export const startOfDay = (date) => {
  if (!date) return new Date();
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    const start = new Date(dateObj);
    start.setHours(0, 0, 0, 0);
    return start;
  } catch (error) {
    return new Date();
  }
};

/**
 * Get the end of a day (23:59:59.999)
 * @param {Date|string|number} date - The date to get the end of
 * @returns {Date} - Date object set to end of day
 */
export const endOfDay = (date) => {
  if (!date) return new Date();
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    const end = new Date(dateObj);
    end.setHours(23, 59, 59, 999);
    return end;
  } catch (error) {
    return new Date();
  }
};
