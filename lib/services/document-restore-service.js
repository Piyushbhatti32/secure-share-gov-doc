// Document restore service
// This service works with the mock data service instead of Firebase

import mockDataService from './mock-data-service';

export class DocumentRestoreService {
  /**
   * Restore a deleted document
   */
  static async restoreDocument(documentId, userId) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      if (document.status !== 'deleted') {
        throw new Error('Document is not deleted');
      }

      const updatedDoc = await mockDataService.updateDocument(documentId, {
        status: 'active',
        restoredAt: new Date().toISOString(),
        restoredBy: userId
      });

      if (updatedDoc) {
        // Log the restore activity
        await mockDataService.addActivity({
          type: 'document_restored',
          description: `Document "${document.title}" restored from trash`,
          documentId,
          userId,
          timestamp: new Date()
        });
      }

      return updatedDoc;
    } catch (error) {
      console.error('Restore document error:', error);
      throw new Error('Failed to restore document');
    }
  }

  /**
   * Get deleted documents for a user
   */
  static async getDeletedDocuments(userId) {
    try {
      const documents = await mockDataService.getDocuments(userId);
      return documents.filter(doc => doc.status === 'deleted');
    } catch (error) {
      console.error('Get deleted documents error:', error);
      throw new Error('Failed to get deleted documents');
    }
  }

  /**
   * Permanently delete a document
   */
  static async permanentlyDeleteDocument(documentId, userId) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      if (document.status !== 'deleted') {
        throw new Error('Document is not in trash');
      }

      const success = await mockDataService.deleteDocument(documentId);
      
      if (success) {
        // Log the permanent deletion activity
        await mockDataService.addActivity({
          type: 'document_permanently_deleted',
          description: `Document "${document.title}" permanently deleted from trash`,
          documentId,
          userId,
          timestamp: new Date()
        });
      }

      return success;
    } catch (error) {
      console.error('Permanently delete document error:', error);
      throw new Error('Failed to permanently delete document');
    }
  }

  /**
   * Empty trash for a user
   */
  static async emptyTrash(userId) {
    try {
      const deletedDocuments = await this.getDeletedDocuments(userId);
      const results = [];

      for (const doc of deletedDocuments) {
        try {
          const success = await mockDataService.deleteDocument(doc.id);
          results.push({
            id: doc.id,
            success,
            message: success ? 'Document permanently deleted' : 'Failed to delete document'
          });
        } catch (error) {
          results.push({
            id: doc.id,
            success: false,
            message: error.message
          });
        }
      }

      // Log the empty trash activity
      await mockDataService.addActivity({
        type: 'trash_emptied',
        description: `Trash emptied - ${deletedDocuments.length} documents permanently deleted`,
        userId,
        timestamp: new Date()
      });

      return {
        success: true,
        results,
        totalProcessed: deletedDocuments.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      console.error('Empty trash error:', error);
      throw new Error('Failed to empty trash');
    }
  }

  /**
   * Get trash statistics for a user
   */
  static async getTrashStats(userId) {
    try {
      const deletedDocuments = await this.getDeletedDocuments(userId);
      
      return {
        totalDeleted: deletedDocuments.length,
        totalSize: deletedDocuments.reduce((total, doc) => {
          if (doc.size) {
            const sizeStr = doc.size.toString();
            if (sizeStr.includes('MB')) {
              return total + parseFloat(sizeStr) * 1024 * 1024;
            } else if (sizeStr.includes('KB')) {
              return total + parseFloat(sizeStr) * 1024;
            } else if (sizeStr.includes('B')) {
              return total + parseFloat(sizeStr);
            }
          }
          return total;
        }, 0),
        oldestDeleted: deletedDocuments.length > 0 ? 
          Math.min(...deletedDocuments.map(doc => new Date(doc.deletedAt || doc.updatedAt).getTime())) : null,
        newestDeleted: deletedDocuments.length > 0 ? 
          Math.max(...deletedDocuments.map(doc => new Date(doc.deletedAt || doc.updatedAt).getTime())) : null
      };
    } catch (error) {
      console.error('Get trash stats error:', error);
      throw new Error('Failed to get trash statistics');
    }
  }
}
