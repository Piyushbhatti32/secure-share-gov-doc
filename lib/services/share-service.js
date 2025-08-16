'use client';

import { collection, addDoc, getDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createNotification } from './notification-service';
import { logActivity } from './activity-service';

import { 
  generateEncryptionKey, 
  encryptData, 
  generateSharingKey,
  hashValue 
} from '@/lib/utils/encryption';

export const shareDocument = async (documentId, sharedByUserId, sharedWithEmail, permissions = ['view']) => {
  try {
    // Generate encryption keys for this share
    const { key, iv } = generateEncryptionKey();
    const shareKey = generateSharingKey();
    
    // Hash the email for verification
    const emailHash = hashValue(sharedWithEmail.toLowerCase().trim());
    
    // Encrypt the share key
    const { encrypted: encryptedKey, authTag, iv: keyIv } = encryptData(
      JSON.stringify({ key: key.toString('base64'), iv: iv.toString('base64') }),
      Buffer.from(shareKey, 'base64'),
      iv
    );

    // Create share record with encryption details
    const shareRef = await addDoc(collection(db, 'shares'), {
      documentId,
      sharedByUserId,
      sharedWithEmail,
      emailHash,
      permissions,
      status: 'pending',
      createdAt: new Date().toISOString(),
      encryption: {
        key: encryptedKey,
        authTag,
        iv: keyIv,
        algorithm: 'aes-256-gcm'
      }
    });

    // Update document share status and count
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        isShared: true,
        sharedCount: (docSnap.data().sharedCount || 0) + 1,
        lastModified: new Date()
      });
    }

    // Create notification for shared user
    await createNotification(
      sharedByUserId,
      'Document Shared',
      `You have shared a document with ${sharedWithEmail}`,
      'info'
    );

    await logActivity(sharedByUserId, 'share', documentId);

    return shareRef.id;
  } catch (error) {
    console.error('Error sharing document:', error);
    throw error;
  }
};

export const getDocumentShares = async (documentId) => {
  try {
    const q = query(
      collection(db, 'shares'),
      where('documentId', '==', documentId)
    );
    
    const snapshot = await getDocs(q);
    // Guard in case tests or environments mock getDocs but return undefined/null
    if (!snapshot || !snapshot.docs) {
      return [];
    }
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching document shares:', error);
    throw error;
  }
};

export const getSharedDocuments = async (userEmail) => {
  try {
    // Get all shares for this user
    const sharesQuery = query(
      collection(db, 'shares'),
      where('sharedWithEmail', '==', userEmail)
    );
    
    const sharesSnapshot = await getDocs(sharesQuery);
    const shares = sharesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get all documents that have been shared
    const documents = await Promise.all(
      shares.map(async share => {
        const docRef = doc(db, 'documents', share.documentId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          return null;
        }

        return {
          id: docSnap.id,
          ...docSnap.data(),
          sharedBy: share.sharedByUserId,
          sharedOn: share.createdAt,
          permissions: share.permissions
        };
      })
    );

    // Filter out any null documents (in case they were deleted)
    return documents.filter(doc => doc !== null);
  } catch (error) {
    console.error('Error fetching shared documents:', error);
    throw error;
  }
};

export const updateShare = async (shareId, updates) => {
  try {
    const shareRef = doc(db, 'shares', shareId);
    await updateDoc(shareRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating share:', error);
    throw error;
  }
};

export const revokeShare = async (shareId, userId) => {
  try {
    const shareRef = doc(db, 'shares', shareId);
    const shareDoc = await getDoc(shareRef);
    
    if (!shareDoc.exists()) {
      throw new Error('Share not found');
    }
    
    const shareData = shareDoc.data();
    
    await deleteDoc(shareRef);
    
    await createNotification(
      userId,
      'Share Revoked',
      `Access revoked for document shared with ${shareData.sharedWithEmail}`,
      'warning'
    );

    await logActivity(userId, 'revoke_share', shareData.documentId);
  } catch (error) {
    console.error('Error revoking share:', error);
    throw error;
  }
};
