'use client';

import { generateEncryptionKey, encryptData, decryptData, generateIV } from '@/lib/utils/encryption';
import { collection, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Encrypt document metadata
export const encryptDocumentMetadata = async (documentId, metadata) => {
  try {
    const { key, iv } = await generateEncryptionKey();
    
    // Convert metadata to string for encryption
    const metadataString = JSON.stringify(metadata);
    
    // Encrypt the metadata
    const { encrypted, iv: encryptedIv } = await encryptData(metadataString, key, iv);
    
    // Update document with encrypted metadata
    const docRef = doc(db, 'documents', documentId);
    await updateDoc(docRef, {
      encryptedMetadata: {
        data: encrypted,
        iv: encryptedIv,
      },
      isEncrypted: true
    });

    return {
      key: await exportKey(key),
      iv: encryptedIv
    };
  } catch (error) {
    console.error('Error encrypting document metadata:', error);
    throw new Error('Failed to encrypt document metadata');
  }
};

// Decrypt document metadata
export const decryptDocumentMetadata = async (documentId, keyString, iv, encryptedData) => {
  try {
    // Import the key
    const key = await importKey(keyString);
    
    // Decrypt the metadata
    const decryptedMetadata = await decryptData(encryptedData, key, iv);
    
    return JSON.parse(decryptedMetadata);
  } catch (error) {
    console.error('Error decrypting document metadata:', error);
    throw new Error('Failed to decrypt document metadata');
  }
};

// Export a CryptoKey to a string for storage
async function exportKey(key) {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import a CryptoKey from a string
async function importKey(keyString) {
  const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

// Store encryption keys securely for a user
export const storeEncryptionKeys = async (userId, documentId, encryptionData) => {
  try {
    const docRef = doc(collection(db, 'documentKeys'), `${userId}_${documentId}`);
    await setDoc(docRef, {
      userId,
      documentId,
      key: encryptionData.key,
      iv: encryptionData.iv,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error storing encryption keys:', error);
    throw new Error('Failed to store encryption keys');
  }
};

// Retrieve encryption keys for a document
export const getEncryptionKeys = async (userId, documentId) => {
  try {
    const docRef = doc(collection(db, 'documentKeys'), `${userId}_${documentId}`);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Encryption keys not found');
    }
    
    return docSnap.data();
  } catch (error) {
    console.error('Error retrieving encryption keys:', error);
    throw new Error('Failed to retrieve encryption keys');
  }
};

// Encrypt an existing document
export const encryptExistingDocument = async (documentId, userId) => {
  try {
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    const documentData = docSnap.data();
    
    // Generate new encryption key
    const { key, iv } = await generateEncryptionKey();
    
    // Encrypt the document content
    const contentString = JSON.stringify(documentData.content || {});
    const { encrypted, iv: encryptedIv } = await encryptData(contentString, key, iv);
    
    // Update document with encrypted content
    await updateDoc(docRef, {
      content: encrypted,
      encryptionIv: encryptedIv,
      isEncrypted: true,
      encryptedAt: new Date().toISOString()
    });

    // Store the encryption key
    await storeEncryptionKeys(userId, documentId, {
      key: await exportKey(key),
      iv: encryptedIv
    });

    return { success: true };
  } catch (error) {
    console.error('Error encrypting existing document:', error);
    throw new Error('Failed to encrypt document');
  }
};

// Decrypt an existing document
export const decryptExistingDocument = async (documentId, userId) => {
  try {
    // Get the encryption keys
    const keys = await getEncryptionKeys(userId, documentId);
    
    // Get the document
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    const documentData = docSnap.data();
    
    if (!documentData.isEncrypted) {
      return documentData.content;
    }

    // Import the key
    const key = await importKey(keys.key);
    
    // Decrypt the content
    const decryptedContent = await decryptData(documentData.content, key, documentData.encryptionIv);
    
    return JSON.parse(decryptedContent);
  } catch (error) {
    console.error('Error decrypting existing document:', error);
    throw new Error('Failed to decrypt document');
  }
};

// Check if a document is encrypted
export const isDocumentEncrypted = async (documentId) => {
  try {
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return false;
    }

    return docSnap.data().isEncrypted || false;
  } catch (error) {
    console.error('Error checking document encryption status:', error);
    return false;
  }
};

// Remove encryption from a document
export const removeDocumentEncryption = async (documentId, userId) => {
  try {
    // Get the decrypted content
    const decryptedContent = await decryptExistingDocument(documentId, userId);
    
    // Update document to remove encryption
    const docRef = doc(db, 'documents', documentId);
    await updateDoc(docRef, {
      content: decryptedContent,
      isEncrypted: false,
      encryptionIv: null,
      encryptedAt: null
    });

    // Remove stored encryption keys
    const keysRef = doc(collection(db, 'documentKeys'), `${userId}_${documentId}`);
    await updateDoc(keysRef, {
      deletedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing document encryption:', error);
    throw new Error('Failed to remove document encryption');
  }
};

// Bulk encrypt multiple documents
export const bulkEncryptDocuments = async (documentIds, userId) => {
  const results = [];
  
  for (const docId of documentIds) {
    try {
      const result = await encryptExistingDocument(docId, userId);
      results.push({ documentId: docId, ...result });
    } catch (error) {
      results.push({ 
        documentId: docId, 
        success: false, 
        message: error.message 
      });
    }
  }
  
  return results;
};
