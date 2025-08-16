'use client';

import { db } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { deriveKeyFromPassword, encryptData, decryptData, validatePassword } from '@/lib/utils/encryption';

export async function encryptWithPassword(documentId, userId, password) {
  try {
    if (!validatePassword(password)) {
      throw new Error('Password does not meet security requirements');
    }

    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    const docData = docSnap.data();

    if (docData.userId !== userId) {
      throw new Error('Unauthorized operation');
    }

    if (docData.isPasswordProtected) {
      throw new Error('Document is already password protected');
    }

    // Generate key from password with salt
    const { key, salt } = await deriveKeyFromPassword(password);

    // Encrypt the document content
    const { encrypted, iv } = await encryptData(docData.content, key);

    // Update the document
    await updateDoc(docRef, {
      content: encrypted,
      isPasswordProtected: true,
      encryptionSalt: btoa(String.fromCharCode(...salt)),
      encryptionIv: iv,
      lastModified: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error encrypting document:', error);
    throw new Error('Failed to encrypt document with password');
  }
}

export async function verifyDocumentPassword(documentId, password) {
  try {
    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    const docData = docSnap.data();
    
    if (!docData.isPasswordProtected) {
      throw new Error('Document is not password protected');
    }

    // Regenerate key from password using stored salt
    const salt = Uint8Array.from(atob(docData.encryptionSalt), c => c.charCodeAt(0));
    const { key } = await deriveKeyFromPassword(password, salt);

    // Try to decrypt (will throw if password is wrong)
    try {
      const decrypted = await decryptData(
        docData.content,
        key,
        docData.encryptionIv
      );
      return { valid: true, content: decrypted };
    } catch (error) {
      return { valid: false, error: 'Incorrect password' };
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    throw error;
  }
}

export async function changeDocumentPassword(documentId, userId, currentPassword, newPassword) {
  try {
    if (!validatePassword(newPassword)) {
      throw new Error('New password does not meet security requirements');
    }

    // First verify the current password
    const verifyResult = await verifyDocumentPassword(documentId, currentPassword);
    if (!verifyResult.valid) {
      throw new Error('Current password is incorrect');
    }

    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    const docData = docSnap.data();

    if (docData.userId !== userId) {
      throw new Error('Unauthorized operation');
    }

    // Generate new key from new password
    const { key, salt } = await deriveKeyFromPassword(newPassword);

    // Re-encrypt the content with the new key
    const { encrypted, iv } = await encryptData(verifyResult.content, key);

    // Update the document with new encryption
    await updateDoc(docRef, {
      content: encrypted,
      encryptionSalt: btoa(String.fromCharCode(...salt)),
      encryptionIv: iv,
      lastModified: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

export async function removePasswordProtection(documentId, userId, currentPassword) {
  try {
    // First verify the current password
    const verifyResult = await verifyDocumentPassword(documentId, currentPassword);
    if (!verifyResult.valid) {
      throw new Error('Current password is incorrect');
    }

    const docRef = doc(db, 'documents', documentId);
    const docSnap = await getDoc(docRef);
    const docData = docSnap.data();

    if (docData.userId !== userId) {
      throw new Error('Unauthorized operation');
    }

    // Update the document - store content without encryption
    await updateDoc(docRef, {
      content: verifyResult.content,
      isPasswordProtected: false,
      encryptionSalt: null,
      encryptionIv: null,
      lastModified: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error removing password protection:', error);
    throw error;
  }
}
