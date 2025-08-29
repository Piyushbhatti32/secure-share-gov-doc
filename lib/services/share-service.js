// Share service for managing document sharing
// This service works with the mock data service instead of Firebase

import mockDataService from './mock-data-service';

export const SharePermission = {
  VIEW: 'view',
  EDIT: 'edit',
  DOWNLOAD: 'download',
  SHARE: 'share'
};

export const ShareStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired'
};

export const shareDocument = async (documentId, ownerId, sharedWith, permissions = [SharePermission.VIEW], expiresAt = null) => {
  try {
    const shareData = {
      documentId,
      ownerId,
      sharedWith,
      permissions,
      status: ShareStatus.PENDING,
      createdAt: new Date(),
      expiresAt
    };
    
    const share = await mockDataService.addShare(shareData);
    return share;
  } catch (error) {
    console.error('Error sharing document:', error);
    throw error;
  }
};

export const getDocumentShares = async (documentId) => {
  try {
    const shares = await mockDataService.getShares();
    return shares.filter(share => share.documentId === documentId);
  } catch (error) {
    console.error('Error fetching document shares:', error);
    throw error;
  }
};

export const getUserShares = async (userId) => {
  try {
    const shares = await mockDataService.getShares(userId);
    return shares;
  } catch (error) {
    console.error('Error fetching user shares:', error);
    throw error;
  }
};

export const updateSharePermissions = async (shareId, permissions) => {
  try {
    // In a real app, you would update the share in the database
    // For now, we'll just return success
    return true;
  } catch (error) {
    console.error('Error updating share permissions:', error);
    throw error;
  }
};

export const revokeShare = async (shareId) => {
  try {
    // In a real app, you would delete the share from the database
    // For now, we'll just return success
    return true;
  } catch (error) {
    console.error('Error revoking share:', error);
    throw error;
  }
};

export const acceptShare = async (shareId, userId) => {
  try {
    // In a real app, you would update the share status to accepted
    // For now, we'll just return success
    return true;
  } catch (error) {
    console.error('Error accepting share:', error);
    throw error;
  }
};

export const declineShare = async (shareId, userId) => {
  try {
    // In a real app, you would update the share status to declined
    // For now, we'll just return success
    return true;
  } catch (error) {
    console.error('Error declining share:', error);
    throw error;
  }
};

export const getSharedDocuments = async (userId) => {
  try {
    const shares = await mockDataService.getShares(userId);
    const sharedDocs = [];
    
    // In a real app, you would fetch the actual document data for each share
    // For now, we'll return the share information
    for (const share of shares) {
      if (share.ownerId !== userId) {
        sharedDocs.push({
          id: share.id,
          documentId: share.documentId,
          ownerId: share.ownerId,
          permissions: share.permissions,
          status: share.status,
          createdAt: share.createdAt,
          expiresAt: share.expiresAt
        });
      }
    }
    
    return sharedDocs;
  } catch (error) {
    console.error('Error fetching shared documents:', error);
    throw error;
  }
};

export const checkDocumentAccess = async (documentId, userId) => {
  try {
    const shares = await mockDataService.getShares(userId);
    const userShare = shares.find(share => share.documentId === documentId);
    
    if (!userShare) {
      return { hasAccess: false, permissions: [] };
    }
    
    return {
      hasAccess: true,
      permissions: userShare.permissions,
      status: userShare.status
    };
  } catch (error) {
    console.error('Error checking document access:', error);
    throw error;
  }
};
