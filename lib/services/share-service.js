// Share service with localStorage persistence for document sharing
class ShareService {
  constructor() {
    this.storageKey = 'secure-docs-shares';
    this.isBrowser = typeof window !== 'undefined';
    this.shares = [];
    if (this.isBrowser) {
      this.shares = this.loadShares();
    }
  }

  loadShares() {
    if (!this.isBrowser) return [];
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading shares from localStorage:', error);
      return [];
    }
  }

  saveShares() {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.shares));
    } catch (error) {
      console.error('Error saving shares to localStorage:', error);
    }
  }

  // Share a document with users
  async shareDocument(documentId, sharedWithEmails, permissions = 'read', sharedByEmail) {
    try {
      const shareId = Date.now().toString();
      const shareRecord = {
        id: shareId,
        documentId,
        sharedWithEmails: Array.isArray(sharedWithEmails) ? sharedWithEmails : [sharedWithEmails],
        permissions,
        sharedByEmail,
        sharedAt: new Date().toISOString(),
        status: 'active'
      };

      this.shares.push(shareRecord);
      this.saveShares();

      return shareRecord;
    } catch (error) {
      console.error('Share document error:', error);
      throw new Error('Failed to share document');
    }
  }

  // Get shared documents for a user
  async getSharedDocuments(userEmail) {
    try {
      if (!this.isBrowser) return [];

      // Get all documents from the document service
      const documentService = (await import('./document-service')).default;
      const allDocuments = await documentService.getDocuments();

      // Find shares where this user is the recipient
      const userShares = this.shares.filter(share => 
        share.status === 'active' && 
        share.sharedWithEmails.includes(userEmail)
      );

      // Map shares to documents with sharing information
      const sharedDocuments = userShares.map(share => {
        const document = allDocuments.find(doc => 
          doc.public_id === share.documentId || 
          doc.fileName === share.documentId ||
          doc.id === share.documentId
        );

        if (document) {
          return {
            id: share.id,
            documentId: share.documentId,
            name: document.title || document.display_name || document.original_filename || 'Untitled Document',
            sharedByEmail: share.sharedByEmail,
            sharedAt: share.sharedAt,
            permissions: share.permissions,
            status: share.status,
            // Include document details for display
            fileName: document.fileName || document.public_id,
            fileType: document.fileType || document.format,
            fileSize: document.fileSize || document.bytes,
            uploadedAt: document.uploadedAt || document.created_at
          };
        }
        return null;
      }).filter(Boolean);

      return sharedDocuments;
    } catch (error) {
      console.error('Get shared documents error:', error);
      throw new Error('Failed to get shared documents');
    }
  }

  // Get documents shared by a user
  async getDocumentsSharedBy(userEmail) {
    try {
      if (!this.isBrowser) return [];

      const documentService = (await import('./document-service')).default;
      const allDocuments = await documentService.getDocuments();

      const sharedByUser = this.shares.filter(share => 
        share.status === 'active' && 
        share.sharedByEmail === userEmail
      );

      return sharedByUser.map(share => {
        const document = allDocuments.find(doc => 
          doc.public_id === share.documentId || 
          doc.fileName === share.documentId ||
          doc.id === share.documentId
        );

        if (document) {
          return {
            id: share.id,
            documentId: share.documentId,
            name: document.title || document.display_name || document.original_filename || 'Untitled Document',
            sharedWithEmails: share.sharedWithEmails,
            sharedAt: share.sharedAt,
            permissions: share.permissions,
            status: share.status,
            fileName: document.fileName || document.public_id,
            fileType: document.fileType || document.format,
            fileSize: document.fileSize || document.bytes,
            uploadedAt: document.uploadedAt || document.created_at
          };
        }
        return null;
      }).filter(Boolean);
    } catch (error) {
      console.error('Get documents shared by error:', error);
      throw new Error('Failed to get documents shared by user');
    }
  }

  // Update sharing permissions
  async updateSharingPermissions(shareId, permissions) {
    try {
      const share = this.shares.find(s => s.id === shareId);
      if (!share) {
        throw new Error('Share not found');
      }

      share.permissions = permissions;
      share.updatedAt = new Date().toISOString();
      this.saveShares();

      return share;
    } catch (error) {
      console.error('Update sharing permissions error:', error);
      throw new Error('Failed to update sharing permissions');
    }
  }

  // Remove sharing access
  async removeSharingAccess(shareId) {
    try {
      const share = this.shares.find(s => s.id === shareId);
      if (!share) {
        throw new Error('Share not found');
      }

      share.status = 'removed';
      share.removedAt = new Date().toISOString();
      this.saveShares();

      return share;
    } catch (error) {
      console.error('Remove sharing access error:', error);
      throw new Error('Failed to remove sharing access');
    }
  }

  // Check if a document is shared with a user
  async isDocumentSharedWith(documentId, userEmail) {
    try {
      return this.shares.some(share => 
        share.documentId === documentId && 
        share.sharedWithEmails.includes(userEmail) && 
        share.status === 'active'
      );
    } catch (error) {
      console.error('Check sharing access error:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const shareService = new ShareService();

// Export the singleton instance and individual methods for backward compatibility
export default shareService;

export const shareDocument = (documentId, sharedWithEmails, permissions, sharedByEmail) => 
  shareService.shareDocument(documentId, sharedWithEmails, permissions, sharedByEmail);

export const getSharedDocuments = (userEmail) => 
  shareService.getSharedDocuments(userEmail);

export const getDocumentsSharedBy = (userEmail) => 
  shareService.getDocumentsSharedBy(userEmail);

export const updateSharingPermissions = (shareId, permissions) => 
  shareService.updateSharingPermissions(shareId, permissions);

export const removeSharingAccess = (shareId) => 
  shareService.removeSharingAccess(shareId);

export const isDocumentSharedWith = (documentId, userEmail) => 
  shareService.isDocumentSharedWith(documentId, userEmail);
