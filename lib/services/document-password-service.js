// Document password service
// This service works with the mock data service instead of Firebase

import mockDataService from './mock-data-service';

export class DocumentPasswordService {
  constructor() {
    // In-memory storage for document passwords (in a real app, this would be encrypted)
    this.passwords = new Map();
  }

  /**
   * Set a password for a document
   */
  async setDocumentPassword(documentId, userId, password) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // In a real app, you would encrypt the password before storing
      const passwordData = {
        documentId,
        userId,
        password: `encrypted_${password}_${Date.now()}`, // Mock encryption
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.passwords.set(documentId, passwordData);

      // Log the password set activity
      await mockDataService.addActivity({
        type: 'document_password_set',
        description: `Password set for document "${document.title}"`,
        documentId,
        userId,
        timestamp: new Date()
      });

      return { success: true, message: 'Password set successfully' };
    } catch (error) {
      console.error('Set document password error:', error);
      throw new Error('Failed to set document password');
    }
  }

  /**
   * Get a document's password
   */
  async getDocumentPassword(documentId, userId) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      const passwordData = this.passwords.get(documentId);
      if (!passwordData) {
        throw new Error('No password set for this document');
      }

      // In a real app, you would decrypt the password
      const decryptedPassword = passwordData.password.replace(/^encrypted_/, '').replace(/_\d+$/, '');

      return {
        documentId,
        hasPassword: true,
        password: decryptedPassword,
        createdAt: passwordData.createdAt,
        updatedAt: passwordData.updatedAt
      };
    } catch (error) {
      console.error('Get document password error:', error);
      throw new Error('Failed to get document password');
    }
  }

  /**
   * Update a document's password
   */
  async updateDocumentPassword(documentId, userId, newPassword) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      const existingPassword = this.passwords.get(documentId);
      if (!existingPassword) {
        throw new Error('No password set for this document');
      }

      // Update the password
      const updatedPasswordData = {
        ...existingPassword,
        password: `encrypted_${newPassword}_${Date.now()}`, // Mock encryption
        updatedAt: new Date().toISOString()
      };

      this.passwords.set(documentId, updatedPasswordData);

      // Log the password update activity
      await mockDataService.addActivity({
        type: 'document_password_updated',
        description: `Password updated for document "${document.title}"`,
        documentId,
        userId,
        timestamp: new Date()
      });

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Update document password error:', error);
      throw new Error('Failed to update document password');
    }
  }

  /**
   * Remove a document's password
   */
  async removeDocumentPassword(documentId, userId) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      const existingPassword = this.passwords.get(documentId);
      if (!existingPassword) {
        throw new Error('No password set for this document');
      }

      // Remove the password
      this.passwords.delete(documentId);

      // Log the password removal activity
      await mockDataService.addActivity({
        type: 'document_password_removed',
        description: `Password removed from document "${document.title}"`,
        documentId,
        userId,
        timestamp: new Date()
      });

      return { success: true, message: 'Password removed successfully' };
    } catch (error) {
      console.error('Remove document password error:', error);
      throw new Error('Failed to remove document password');
    }
  }

  /**
   * Check if a document has a password
   */
  async hasDocumentPassword(documentId) {
    try {
      const document = await mockDataService.getDocument(documentId);
      if (!document) {
        return false;
      }

      return this.passwords.has(documentId);
    } catch (error) {
      console.error('Check document password error:', error);
      return false;
    }
  }

  /**
   * Get all documents with passwords for a user
   */
  async getDocumentsWithPasswords(userId) {
    try {
      const documents = await mockDataService.getDocuments(userId);
      const documentsWithPasswords = [];

      for (const doc of documents) {
        if (this.passwords.has(doc.id)) {
          const passwordData = this.passwords.get(doc.id);
          documentsWithPasswords.push({
            ...doc,
            hasPassword: true,
            passwordSetAt: passwordData.createdAt,
            passwordUpdatedAt: passwordData.updatedAt
          });
        }
      }

      return documentsWithPasswords;
    } catch (error) {
      console.error('Get documents with passwords error:', error);
      throw new Error('Failed to get documents with passwords');
    }
  }
}

// Export a singleton instance
export const documentPasswordService = new DocumentPasswordService();
