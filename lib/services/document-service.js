'use client';

import { collection, addDoc, getDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { logActivity, ActivityType } from './activity-service';

export const uploadDocument = async (file, userId, metadata = {}, shouldEncrypt = false) => {
  try {
    // Upload to Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName) {
      throw new Error('Cloudinary cloud name is not configured');
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    if (uploadPreset) {
      formData.append('upload_preset', uploadPreset);
    }

    const resp = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error?.message || 'Cloudinary upload failed');
    }

    const downloadURL = data.secure_url || data.url;

    // Add document metadata to Firestore
    const docData = {
      name: file.name,
      type: file.type,
      size: file.size,
      url: downloadURL,
      cloudinary_public_id: data.public_id,
      userId,
      metadata: shouldEncrypt ? {} : metadata, // Only store metadata if not encrypting
      createdAt: new Date().toISOString(),
      status: 'active',
      isEncrypted: shouldEncrypt
    };

    const docRef = await addDoc(collection(db, 'documents'), docData);

    // If encryption is enabled, encrypt the metadata
    if (shouldEncrypt && Object.keys(metadata).length > 0) {
      const { encryptDocumentMetadata, storeEncryptionKeys } = await import('./document-encryption-service');
      const encryptionData = await encryptDocumentMetadata(docRef.id, metadata);
      await storeEncryptionKeys(userId, docRef.id, encryptionData);
    }

    await logActivity(userId, ActivityType.UPLOAD, { documentId: docRef.id, documentName: file.name });
    
    return docRef.id;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

export const getDocument = async (documentId) => {
  try {
    // Validate input
    if (!documentId) {
      throw new Error('Document ID is required');
    }

    // Get the document
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);

    // Update last accessed time
    await updateDoc(docRef, {
      lastAccessed: new Date()
    });
    
    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    const documentData = docSnap.data();

    // Check if user has access to the document
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('Authentication required');
    }

    // Check if user owns the document or if it's shared with them
    const isOwner = documentData.userId === userId;
    if (!isOwner) {
      // Check if document is shared with the user
      const shareQuery = query(
        collection(db, 'shares'),
        where('documentId', '==', documentId),
        where('sharedWithEmail', '==', auth.currentUser.email)
      );
      
      const shareSnap = await getDocs(shareQuery);
      const hasAccess = !shareSnap.empty;

      if (!hasAccess) {
        throw new Error('Access denied');
      }
    }
    
    return {
      id: docSnap.id,
      ...documentData
    };
  } catch (error) {
    console.error('Error fetching document:', error);
    if (error.message === 'Document not found' || 
        error.message === 'Access denied' ||
        error.message === 'Authentication required' ||
        error.message === 'Document ID is required') {
      throw error;
    }
    throw new Error('Error accessing document');
  }
};

export const incrementDownloadCount = async (documentId) => {
  try {
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        downloads: (docSnap.data().downloads || 0) + 1,
        lastAccessed: new Date()
      });
    }
  } catch (error) {
    console.error('Error incrementing download count:', error);
    throw error;
  }
};

export const deleteDocument = async (documentId, userId) => {
  try {
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    // For inactive documents or when the user is the owner, allow deletion
    if (docSnap.data().status === 'inactive' || docSnap.data().userId === userId) {
      const docData = docSnap.data();

      // If document has a Cloudinary public_id, delete it from Cloudinary first
      if (docData.cloudinary_public_id) {
        try {
          const deleteResp = await fetch('/api/cloudinary/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              public_id: docData.cloudinary_public_id,
              userId
            }),
          });

          if (!deleteResp.ok) {
            const error = await deleteResp.json();
            throw new Error(error.message || 'Failed to delete from Cloudinary');
          }
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
          // Continue with Firestore deletion even if Cloudinary fails
          // This prevents orphaned Firestore documents if Cloudinary is temporarily down
        }
      }

      // Delete from Firestore
      await deleteDoc(docRef);
      
      // Delete related shares
      const sharesQuery = query(collection(db, 'shares'), where('documentId', '==', documentId));
      const sharesSnapshot = await getDocs(sharesQuery);
      const deletePromises = sharesSnapshot.docs.map(shareDoc => deleteDoc(shareDoc.ref));

      await logActivity(userId, ActivityType.DELETE, { documentId });
      return true;
    } else {
      throw new Error('Not authorized to delete this document');
    }
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

export const getUserDocuments = async (userId) => {
  try {
    const q = query(
      collection(db, 'documents'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user documents:', error);
    throw error;
  }
};

export const updateDocument = async (documentId, updates, userId) => {
  try {
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    // Verify ownership
    if (docSnap.data().userId !== userId) {
      throw new Error('Not authorized to edit this document');
    }

    await updateDoc(docRef, {
      ...updates,
      lastModified: new Date(),
    });
    
    await logActivity(userId, ActivityType.PROFILE_UPDATE, { documentId });
    return { id: documentId, ...updates };
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

// Delete document function is defined above
