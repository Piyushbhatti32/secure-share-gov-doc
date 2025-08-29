// Document archive service
// This service works with the mock data service instead of Firebase

import mockDataService from './mock-data-service';

export class DocumentArchiveService {
  /**
   * Archive a document
   */
  static async archiveDocument(documentId, userId) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      const updatedDoc = await mockDataService.updateDocument(documentId, {
        status: 'archived',
        archivedAt: new Date().toISOString(),
        archivedBy: userId
      });

      if (updatedDoc) {
        // Log the archive activity
        await mockDataService.addActivity({
          type: 'document_archived',
          description: `Document "${document.title}" archived`,
          documentId,
          userId,
          timestamp: new Date()
        });
      }

      return updatedDoc;
    } catch (error) {
      console.error('Archive document error:', error);
      throw new Error('Failed to archive document');
    }
  }

  /**
   * Restore an archived document
   */
  static async restoreDocument(documentId, userId) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
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
          description: `Document "${document.title}" restored`,
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
   * Get archived documents for a user
   */
  static async getArchivedDocuments(userId) {
    try {
      const documents = await mockDataService.getDocuments(userId);
      return documents.filter(doc => doc.status === 'archived');
    } catch (error) {
      console.error('Get archived documents error:', error);
      throw new Error('Failed to get archived documents');
    }
  }

  /**
   * Permanently delete an archived document
   */
  static async permanentlyDeleteDocument(documentId, userId) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      if (document.status !== 'archived') {
        throw new Error('Only archived documents can be permanently deleted');
      }

      const success = await mockDataService.deleteDocument(documentId);
      
      if (success) {
        // Log the permanent deletion activity
        await mockDataService.addActivity({
          type: 'document_permanently_deleted',
          description: `Document "${document.title}" permanently deleted`,
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
}
