import { auth } from '@clerk/nextjs/server';

export class SecurityAuditService {
  constructor() {
    this.cloudinary = require('cloudinary').v2;
    this.cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Log document access attempt
   * @param {string} userId - User ID attempting access
   * @param {string} documentId - Document being accessed
   * @param {string} action - Action performed (view, download, delete, share)
   * @param {boolean} success - Whether access was granted
   * @param {string} reason - Reason for access denial if applicable
   */
  async logDocumentAccess(userId, documentId, action, success, reason = null) {
    try {
      const auditEntry = {
        timestamp: new Date().toISOString(),
        userId: userId,
        documentId: documentId,
        action: action,
        success: success,
        reason: reason,
        ipAddress: 'N/A', // Could be enhanced with actual IP logging
        userAgent: 'N/A', // Could be enhanced with actual user agent
        sessionId: 'N/A' // Could be enhanced with Clerk session ID
      };

      // Store audit log in Cloudinary as metadata
      await this.cloudinary.uploader.explicit(documentId, {
        type: 'upload',
        context: {
          ...auditEntry,
          auditLog: true
        }
      });

      // Also log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 Security Audit:', auditEntry);
      }

      return auditEntry;
    } catch (error) {
      console.error('Error logging security audit:', error);
      // Don't throw error as audit logging shouldn't break main functionality
    }
  }

  /**
   * Log document sharing activity
   * @param {string} ownerId - Document owner ID
   * @param {string} documentId - Document being shared
   * @param {Array} sharedWith - Array of user IDs shared with
   * @param {Array} permissions - Permissions granted
   */
  async logDocumentSharing(ownerId, documentId, sharedWith, permissions) {
    try {
      const sharingLog = {
        timestamp: new Date().toISOString(),
        ownerId: ownerId,
        documentId: documentId,
        sharedWith: sharedWith,
        permissions: permissions,
        action: 'share',
        success: true
      };

      // Store sharing log
      await this.cloudinary.uploader.explicit(documentId, {
        type: 'upload',
        context: {
          ...sharingLog,
          sharingLog: true
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('📤 Document Sharing Log:', sharingLog);
      }

      return sharingLog;
    } catch (error) {
      console.error('Error logging document sharing:', error);
    }
  }

  /**
   * Get audit trail for a document
   * @param {string} documentId - Document ID
   * @param {string} userId - User requesting audit (must be owner or admin)
   * @returns {Array} - Audit trail entries
   */
  async getDocumentAuditTrail(documentId, userId) {
    try {
      // Get document metadata which includes audit logs
      const result = await this.cloudinary.api.resource(documentId);
      
      const auditTrail = [];
      
      // Extract audit information from context
      if (result.context) {
        Object.keys(result.context).forEach(key => {
          if (key === 'auditLog' || key === 'sharingLog') {
            auditTrail.push({
              type: key,
              data: result.context[key]
            });
          }
        });
      }

      return auditTrail;
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      return [];
    }
  }

  /**
   * Get user's access history
   * @param {string} userId - User ID
   * @returns {Array} - User's access history
   */
  async getUserAccessHistory(userId) {
    try {
      // Search for documents accessed by this user
      const result = await this.cloudinary.search
        .expression(`context.userId:${userId} AND context.auditLog:true`)
        .sort_by('created_at', 'desc')
        .max_results(100)
        .execute();

      return result.resources.map(resource => ({
        documentId: resource.public_id,
        accessTime: resource.context?.timestamp,
        action: resource.context?.action,
        success: resource.context?.success,
        reason: resource.context?.reason
      }));
    } catch (error) {
      console.error('Error fetching user access history:', error);
      return [];
    }
  }

  /**
   * Generate security report
   * @param {string} userId - User ID (must be admin)
   * @param {Date} startDate - Start date for report
   * @param {Date} endDate - End date for report
   * @returns {Object} - Security report
   */
  async generateSecurityReport(userId, startDate, endDate) {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        generatedBy: userId,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        summary: {
          totalAccesses: 0,
          successfulAccesses: 0,
          failedAccesses: 0,
          totalShares: 0,
          uniqueUsers: new Set(),
          uniqueDocuments: new Set()
        },
        details: []
      };

      // Search for audit logs in the specified period
      const result = await this.cloudinary.search
        .expression(`context.auditLog:true AND context.timestamp:>${startDate.toISOString()} AND context.timestamp:<${endDate.toISOString()}`)
        .sort_by('created_at', 'desc')
        .max_results(1000)
        .execute();

      result.resources.forEach(resource => {
        const auditData = resource.context;
        if (auditData) {
          report.summary.totalAccesses++;
          if (auditData.success) {
            report.summary.successfulAccesses++;
          } else {
            report.summary.failedAccesses++;
          }
          
          report.summary.uniqueUsers.add(auditData.userId);
          report.summary.uniqueDocuments.add(auditData.documentId);
          
          report.details.push({
            timestamp: auditData.timestamp,
            userId: auditData.userId,
            documentId: auditData.documentId,
            action: auditData.action,
            success: auditData.success,
            reason: auditData.reason
          });
        }
      });

      // Convert sets to counts
      report.summary.uniqueUsers = report.summary.uniqueUsers.size;
      report.summary.uniqueDocuments = report.summary.uniqueDocuments.size;

      return report;
    } catch (error) {
      console.error('Error generating security report:', error);
      throw new Error(`Failed to generate security report: ${error.message}`);
    }
  }
}

export default SecurityAuditService;
