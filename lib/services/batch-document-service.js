'use client';

import { db } from '@/lib/firebase';
import { writeBatch, doc } from 'firebase/firestore';
import { deleteDocument } from './document-service';

export const batchDeleteDocuments = async (documentIds, userId) => {
  try {
    const results = {
      success: [],
      failed: []
    };

    // Process in chunks of 10 to avoid overwhelming the system
    for (let i = 0; i < documentIds.length; i += 10) {
      const chunk = documentIds.slice(i, i + 10);
      const deletePromises = chunk.map(async (docId) => {
        try {
          await deleteDocument(docId, userId);
          results.success.push(docId);
        } catch (error) {
          results.failed.push({ id: docId, error: error.message });
        }
      });

      await Promise.all(deletePromises);
    }

    return results;
  } catch (error) {
    console.error('Error in batch delete:', error);
    throw error;
  }
};

export const batchUpdateDocuments = async (updates, userId) => {
  try {
    const results = {
      success: [],
      failed: []
    };

    // Process in chunks of 500 (Firestore batch limit)
    for (let i = 0; i < updates.length; i += 500) {
      const chunk = updates.slice(i, i + 500);
      const batch = writeBatch(db);

      chunk.forEach(({ documentId, data }) => {
        const docRef = doc(db, 'documents', documentId);
        batch.update(docRef, {
          ...data,
          lastModified: new Date()
        });
      });

      try {
        await batch.commit();
        results.success.push(...chunk.map(u => u.documentId));
      } catch (error) {
        results.failed.push(...chunk.map(u => ({
          id: u.documentId,
          error: error.message
        })));
      }
    }

    return results;
  } catch (error) {
    console.error('Error in batch update:', error);
    throw error;
  }
};
