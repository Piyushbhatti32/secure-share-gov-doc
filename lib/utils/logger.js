/**
 * Professional Logging System for SecureDocShare
 * Implements structured logging with different levels and formatting
 */

// Log levels in order of severity
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level (can be set via environment variable)
const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

class Logger {
  constructor(module = 'App') {
    this.module = module;
    this.timestamp = () => new Date().toISOString();
  }

  /**
   * Format log message with timestamp, level, module, and data
   */
  formatMessage(level, message, data = null) {
    const timestamp = this.timestamp();
    const modulePrefix = `[${this.module}]`;
    const levelPrefix = `[${level.toUpperCase()}]`;
    
    let formattedMessage = `${timestamp} ${levelPrefix} ${modulePrefix}: ${message}`;
    
    if (data && Object.keys(data).length > 0) {
      formattedMessage += ` | Data: ${JSON.stringify(data, null, 2)}`;
    }
    
    return formattedMessage;
  }

  /**
   * Log error messages (always shown)
   */
  error(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
      const formattedMessage = this.formatMessage('ERROR', message, data);
      console.error(formattedMessage);
      
      // In production, you might want to send to external logging service
      if (process.env.NODE_ENV === 'production') {
        this.sendToExternalLogger('ERROR', message, data);
      }
    }
  }

  /**
   * Log warning messages
   */
  warn(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
      const formattedMessage = this.formatMessage('WARN', message, data);
      console.warn(formattedMessage);
    }
  }

  /**
   * Log informational messages
   */
  info(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      const formattedMessage = this.formatMessage('INFO', message, data);
      console.info(formattedMessage);
    }
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message, data = null) {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      const formattedMessage = this.formatMessage('DEBUG', message, data);
      console.log(formattedMessage);
    }
  }

  /**
   * Log security-related events (always shown, with special formatting)
   */
  security(event, data = null) {
    const formattedMessage = this.formatMessage('SECURITY', event, data);
    console.warn(`🔒 ${formattedMessage}`);
    
    // Security events should always be logged
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger('SECURITY', event, data);
    }
  }

  /**
   * Log user activities (for audit trail)
   */
  activity(userId, action, details = null) {
    const data = { userId, action, ...details };
    const formattedMessage = this.formatMessage('ACTIVITY', `User ${action}`, data);
    console.info(`👤 ${formattedMessage}`);
  }

  /**
   * Log API requests and responses
   */
  api(method, endpoint, statusCode, duration = null, userId = null) {
    const data = { method, endpoint, statusCode, duration, userId };
    const formattedMessage = this.formatMessage('API', `${method} ${endpoint}`, data);
    console.info(`🌐 ${formattedMessage}`);
  }

  /**
   * Send logs to external logging service (placeholder for production)
   */
  sendToExternalLogger(level, message, data) {
    // In production, you would implement:
    // - Sentry for error tracking
    // - LogRocket for user session logs
    // - Custom logging API
    // - CloudWatch/StackDriver for AWS/GCP
    
    // For now, we'll just store in localStorage for demo purposes
    try {
      const logs = JSON.parse(localStorage.getItem('appLogs') || '[]');
      logs.push({
        timestamp: this.timestamp(),
        level,
        message,
        data,
        module: this.module
      });
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('appLogs', JSON.stringify(logs));
    } catch (error) {
      // Fallback to console if localStorage fails
      console.error('Failed to store log:', error);
    }
  }

  /**
   * Get all stored logs (for debugging)
   */
  getLogs() {
    try {
      return JSON.parse(localStorage.getItem('appLogs') || '[]');
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear stored logs
   */
  clearLogs() {
    try {
      localStorage.removeItem('appLogs');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}

// Create default logger instance
const logger = new Logger();

// Create logger factory for different modules
export const createLogger = (module) => new Logger(module);

// Export default logger and factory
export default logger;
