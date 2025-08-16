'use client';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logActivity } from './activity-service';

export const restoreDocument = async (documentId, userId) => {
  try {
    const docRef = doc(db, 'documents', documentId);
    
    await updateDoc(docRef, {
      status: 'active',
      restoredAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });

    await logActivity(userId, 'restore', documentId);
    return true;
  } catch (error) {
    console.error('Error restoring document:', error);
    throw error;
  }
};

export const batchRestoreDocuments = async (documentIds, userId) => {
  try {
    const results = {
      success: [],
      failed: []
    };

    // Process in chunks of 10 to avoid overwhelming the system
    for (let i = 0; i < documentIds.length; i += 10) {
      const chunk = documentIds.slice(i, i + 10);
      const restorePromises = chunk.map(async (docId) => {
        try {
          await restoreDocument(docId, userId);
          results.success.push(docId);
        } catch (error) {
          results.failed.push({ id: docId, error: error.message });
        }
      });

      await Promise.all(restorePromises);
    }

    return results;
  } catch (error) {
    console.error('Error in batch restore:', error);
    throw error;
  }
};
