'use client';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logActivity, ActivityType } from './activity-service';

export const archiveDocument = async (documentId, userId) => {
  try {
    const docRef = doc(db, 'documents', documentId);
    
    await updateDoc(docRef, {
      status: 'archived',
      archivedAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });

    await logActivity(userId, ActivityType.ARCHIVE, { documentId });
    return true;
  } catch (error) {
    console.error('Error archiving document:', error);
    throw error;
  }
};

export const batchArchiveDocuments = async (documentIds, userId) => {
  try {
    const results = {
      success: [],
      failed: []
    };

    // Process in chunks of 10 to avoid overwhelming the system
    for (let i = 0; i < documentIds.length; i += 10) {
      const chunk = documentIds.slice(i, i + 10);
      const archivePromises = chunk.map(async (docId) => {
        try {
          await archiveDocument(docId, userId);
          results.success.push(docId);
        } catch (error) {
          results.failed.push({ id: docId, error: error.message });
        }
      });

      await Promise.all(archivePromises);
    }

    return results;
  } catch (error) {
    console.error('Error in batch archive:', error);
    throw error;
  }
};
