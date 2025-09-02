import { auth } from '@clerk/nextjs/server';
import DocumentStorageService from '@/lib/services/documentStorage';

/**
 * Middleware to verify document access permissions
 * @param {string} documentId - Document ID to check
 * @param {string} userId - User ID requesting access
 * @returns {Object} - Access verification result
 */
export async function verifyDocumentAccess(documentId, userId) {
  try {
    if (!userId || !documentId) {
      return {
        hasAccess: false,
        reason: 'Missing user ID or document ID'
      };
    }

    const storageService = new DocumentStorageService();
    
    // Check if user owns the document
    const userDocuments = await storageService.getUserDocuments(userId);
    const isOwner = userDocuments.some(doc => doc.id === documentId);
    
    if (isOwner) {
      return {
        hasAccess: true,
        accessLevel: 'owner',
        permissions: ['read', 'write', 'delete', 'share']
      };
    }

    // Check if document is shared with user
    const sharedDocuments = await storageService.getSharedDocuments(userId);
    const isShared = sharedDocuments.some(doc => doc.id === documentId);
    
    if (isShared) {
      const sharedDoc = sharedDocuments.find(doc => doc.id === documentId);
      return {
        hasAccess: true,
        accessLevel: 'shared',
        permissions: sharedDoc.permissions || ['read'],
        ownerId: sharedDoc.ownerId
      };
    }

    // No access
    return {
      hasAccess: false,
      reason: 'Document not found or access denied'
    };

  } catch (error) {
    console.error('Document access verification error:', error);
    return {
      hasAccess: false,
      reason: 'Error verifying access'
    };
  }
}

/**
 * Middleware to verify document ownership
 * @param {string} documentId - Document ID to check
 * @param {string} userId - User ID requesting access
 * @returns {boolean} - True if user owns the document
 */
export async function verifyDocumentOwnership(documentId, userId) {
  try {
    if (!userId || !documentId) {
      return false;
    }

    const storageService = new DocumentStorageService();
    const userDocuments = await storageService.getUserDocuments(userId);
    
    return userDocuments.some(doc => doc.id === documentId);

  } catch (error) {
    console.error('Document ownership verification error:', error);
    return false;
  }
}

/**
 * Middleware to check if user can share document
 * @param {string} documentId - Document ID to check
 * @param {string} userId - User ID requesting to share
 * @returns {boolean} - True if user can share the document
 */
export async function canShareDocument(documentId, userId) {
  try {
    if (!userId || !documentId) {
      return false;
    }

    // Only document owners can share
    return await verifyDocumentOwnership(documentId, userId);

  } catch (error) {
    console.error('Document sharing permission check error:', error);
    return false;
  }
}

/**
 * Middleware to check if user can delete document
 * @param {string} documentId - Document ID to check
 * @param {string} userId - User ID requesting to delete
 * @returns {boolean} - True if user can delete the document
 */
export async function canDeleteDocument(documentId, userId) {
  try {
    if (!userId || !documentId) {
      return false;
    }

    // Only document owners can delete
    return await verifyDocumentOwnership(documentId, userId);

  } catch (error) {
    console.error('Document deletion permission check error:', error);
    return false;
  }
}
