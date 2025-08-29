// Document encryption service
// This service works with the mock data service instead of Firebase

import mockDataService from './mock-data-service';

export class DocumentEncryptionService {
  /**
   * Encrypt a document
   */
  static async encryptDocument(documentId, userId, encryptionKey) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // In a real app, you would encrypt the actual file content
      // For now, we'll just mark it as encrypted
      const updatedDoc = await mockDataService.updateDocument(documentId, {
        encrypted: true,
        encryptedAt: new Date().toISOString(),
        encryptedBy: userId,
        encryptionMethod: 'AES-256',
        encryptionKeyHash: `hash_${encryptionKey}_${Date.now()}`
      });

      if (updatedDoc) {
        // Log the encryption activity
        await mockDataService.addActivity({
          type: 'document_encrypted',
          description: `Document "${document.title}" encrypted`,
          documentId,
          userId,
          timestamp: new Date()
        });
      }

      return updatedDoc;
    } catch (error) {
      console.error('Encrypt document error:', error);
      throw new Error('Failed to encrypt document');
    }
  }

  /**
   * Decrypt a document
   */
  static async decryptDocument(documentId, userId, decryptionKey) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      if (!document.encrypted) {
        throw new Error('Document is not encrypted');
      }

      // In a real app, you would verify the decryption key and decrypt the content
      // For now, we'll just mark it as decrypted
      const updatedDoc = await mockDataService.updateDocument(documentId, {
        encrypted: false,
        decryptedAt: new Date().toISOString(),
        decryptedBy: userId
      });

      if (updatedDoc) {
        // Log the decryption activity
        await mockDataService.addActivity({
          type: 'document_decrypted',
          description: `Document "${document.title}" decrypted`,
          documentId,
          userId,
          timestamp: new Date()
        });
      }

      return updatedDoc;
    } catch (error) {
      console.error('Decrypt document error:', error);
      throw new Error('Failed to decrypt document');
    }
  }

  /**
   * Get encryption status of a document
   */
  static async getEncryptionStatus(documentId) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      return {
        encrypted: document.encrypted || false,
        encryptionMethod: document.encryptionMethod || null,
        encryptedAt: document.encryptedAt || null,
        encryptedBy: document.encryptedBy || null
      };
    } catch (error) {
      console.error('Get encryption status error:', error);
      throw new Error('Failed to get encryption status');
    }
  }

  /**
   * Bulk encrypt multiple documents
   */
  static async bulkEncryptDocuments(documentIds, userId, encryptionKey) {
    try {
      const results = [];
      
      for (const docId of documentIds) {
        try {
          const result = await this.encryptDocument(docId, userId, encryptionKey);
          results.push({
            id: docId,
            success: true,
            message: 'Document encrypted successfully'
          });
        } catch (error) {
          results.push({
            id: docId,
            success: false,
            message: error.message
          });
        }
      }
      
      return {
        success: true,
        results,
        totalProcessed: documentIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      console.error('Bulk encrypt error:', error);
      throw new Error('Failed to bulk encrypt documents');
    }
  }
}
