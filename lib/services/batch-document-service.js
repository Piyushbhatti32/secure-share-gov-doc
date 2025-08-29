// Batch document operations service
// This service works with the mock data service instead of Firebase

import mockDataService from './mock-data-service';

export class BatchDocumentService {
  /**
   * Batch delete multiple documents
   */
  static async batchDeleteDocuments(documentIds, userId) {
    try {
      const results = [];
      
      for (const docId of documentIds) {
        const success = await mockDataService.deleteDocument(docId);
        results.push({
          id: docId,
          success,
          message: success ? 'Document deleted successfully' : 'Failed to delete document'
        });
      }
      
      return {
        success: true,
        results,
        totalProcessed: documentIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      console.error('Batch delete error:', error);
      throw new Error('Failed to batch delete documents');
    }
  }

  /**
   * Batch archive multiple documents
   */
  static async batchArchiveDocuments(documentIds, userId) {
    try {
      const results = [];
      
      for (const docId of documentIds) {
        const success = await mockDataService.updateDocument(docId, { status: 'archived' });
        results.push({
          id: docId,
          success: !!success,
          message: success ? 'Document archived successfully' : 'Failed to archive document'
        });
      }
      
      return {
        success: true,
        results,
        totalProcessed: documentIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      console.error('Batch archive error:', error);
      throw new Error('Failed to batch archive documents');
    }
  }

  /**
   * Batch restore multiple documents
   */
  static async batchRestoreDocuments(documentIds, userId) {
    try {
      const results = [];
      
      for (const docId of documentIds) {
        const success = await mockDataService.updateDocument(docId, { status: 'active' });
        results.push({
          id: docId,
          success: !!success,
          message: success ? 'Document restored successfully' : 'Failed to restore document'
        });
      }
      
      return {
        success: true,
        results,
        totalProcessed: documentIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      console.error('Batch restore error:', error);
      throw new Error('Failed to batch restore documents');
    }
  }

  /**
   * Batch update document tags
   */
  static async batchUpdateTags(documentIds, tags, userId) {
    try {
      const results = [];
      
      for (const docId of documentIds) {
        const success = await mockDataService.updateDocument(docId, { tags });
        results.push({
          id: docId,
          success: !!success,
          message: success ? 'Document tags updated successfully' : 'Failed to update document tags'
        });
      }
      
      return {
        success: true,
        results,
        totalProcessed: documentIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      console.error('Batch tag update error:', error);
      throw new Error('Failed to batch update document tags');
    }
  }
}
