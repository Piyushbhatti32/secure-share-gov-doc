// Document service
// This service works with the mock data service instead of Firebase

import mockDataService from './mock-data-service';

export class DocumentService {
  /**
   * Get all documents for a user
   */
  static async getUserDocuments(userId, filters = {}) {
    try {
      let documents = await mockDataService.getDocuments(userId);
      
      // Apply filters
      if (filters.status) {
        documents = documents.filter(doc => doc.status === filters.status);
      }
      
      if (filters.type) {
        documents = documents.filter(doc => doc.type === filters.type);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        documents = documents.filter(doc => 
          doc.title.toLowerCase().includes(searchTerm) ||
          doc.description.toLowerCase().includes(searchTerm) ||
          doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      // Apply sorting
      if (filters.sortBy) {
        documents.sort((a, b) => {
          const aValue = a[filters.sortBy];
          const bValue = b[filters.sortBy];
          
          if (filters.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }
      
      return documents;
    } catch (error) {
      console.error('Get user documents error:', error);
      throw new Error('Failed to get user documents');
    }
  }

  /**
   * Get a single document by ID
   */
  static async getDocument(documentId) {
    try {
      return await mockDataService.getDocument(documentId);
    } catch (error) {
      console.error('Get document error:', error);
      throw new Error('Failed to get document');
    }
  }

  /**
   * Create a new document
   */
  static async createDocument(documentData, userId) {
    try {
      const document = await mockDataService.addDocument({
        ...documentData,
        userId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Log the creation activity
      await mockDataService.addActivity({
        type: 'document_created',
        description: `Document "${document.title}" created`,
        documentId: document.id,
        userId,
        timestamp: new Date()
      });

      return document;
    } catch (error) {
      console.error('Create document error:', error);
      throw new Error('Failed to create document');
    }
  }

  /**
   * Update an existing document
   */
  static async updateDocument(documentId, updates, userId) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      const updatedDoc = await mockDataService.updateDocument(documentId, {
        ...updates,
        updatedAt: new Date(),
        updatedBy: userId
      });

      if (updatedDoc) {
        // Log the update activity
        await mockDataService.addActivity({
          type: 'document_updated',
          description: `Document "${document.title}" updated`,
          documentId,
          userId,
          timestamp: new Date()
        });
      }

      return updatedDoc;
    } catch (error) {
      console.error('Update document error:', error);
      throw new Error('Failed to update document');
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId, userId) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      const success = await mockDataService.deleteDocument(documentId);
      
      if (success) {
        // Log the deletion activity
        await mockDataService.addActivity({
          type: 'document_deleted',
          description: `Document "${document.title}" deleted`,
          documentId,
          userId,
          timestamp: new Date()
        });
      }

      return success;
    } catch (error) {
      console.error('Delete document error:', error);
      throw new Error('Failed to delete document');
    }
  }

  /**
   * Get document statistics for a user
   */
  static async getDocumentStats(userId) {
    try {
      const documents = await mockDataService.getDocuments(userId);
      
      const stats = {
        total: documents.length,
        active: documents.filter(doc => doc.status === 'active').length,
        archived: documents.filter(doc => doc.status === 'archived').length,
        encrypted: documents.filter(doc => doc.encrypted).length,
        byType: {},
        totalSize: 0
      };

      // Count by type
      documents.forEach(doc => {
        const type = doc.type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
        
        // Calculate total size (convert string sizes to numbers)
        if (doc.size) {
          const sizeStr = doc.size.toString();
          if (sizeStr.includes('MB')) {
            stats.totalSize += parseFloat(sizeStr) * 1024 * 1024;
          } else if (sizeStr.includes('KB')) {
            stats.totalSize += parseFloat(sizeStr) * 1024;
          } else if (sizeStr.includes('B')) {
            stats.totalSize += parseFloat(sizeStr);
          }
        }
      });

      return stats;
    } catch (error) {
      console.error('Get document stats error:', error);
      throw new Error('Failed to get document statistics');
    }
  }
}
