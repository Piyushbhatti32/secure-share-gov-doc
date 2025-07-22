// Import CryptoJS from CDN - will be loaded via script tag
// This module handles client-side encryption/decryption of documents

class DocumentEncryption {
  constructor() {
    this.keySize = 256;
    this.iterationCount = 1000;
  }

  // Generate a secure encryption key from user password + unique salt
  generateEncryptionKey(userPassword, documentSalt) {
    const salt = CryptoJS.enc.Hex.parse(documentSalt);
    const key = CryptoJS.PBKDF2(userPassword, salt, {
      keySize: this.keySize / 32,
      iterations: this.iterationCount
    });
    return key;
  }

  // Generate a random salt for each document
  generateSalt() {
    return CryptoJS.lib.WordArray.random(128/8).toString(CryptoJS.enc.Hex);
  }

  // Encrypt file content
  encryptDocument(fileArrayBuffer, userPassword) {
    try {
      // Generate unique salt for this document
      const salt = this.generateSalt();
      
      // Generate encryption key
      const key = this.generateEncryptionKey(userPassword, salt);
      
      // Generate random IV for this encryption
      const iv = CryptoJS.lib.WordArray.random(128/8);
      
      // Convert ArrayBuffer to WordArray
      const wordArray = CryptoJS.lib.WordArray.create(fileArrayBuffer);
      
      // Encrypt the document
      const encrypted = CryptoJS.AES.encrypt(wordArray, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Combine salt + iv + encrypted data
      const encryptedData = {
        salt: salt,
        iv: iv.toString(CryptoJS.enc.Hex),
        encrypted: encrypted.toString(),
        timestamp: new Date().toISOString()
      };
      
      // Convert to JSON string and then to ArrayBuffer for upload
      const jsonString = JSON.stringify(encryptedData);
      const encoder = new TextEncoder();
      const encryptedArrayBuffer = encoder.encode(jsonString);
      
      return {
        success: true,
        encryptedData: encryptedArrayBuffer,
        salt: salt,
        size: encryptedArrayBuffer.byteLength
      };
      
    } catch (error) {
      console.error('Encryption error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Decrypt file content
  decryptDocument(encryptedArrayBuffer, userPassword) {
    try {
      // Convert ArrayBuffer back to JSON
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(encryptedArrayBuffer);
      const encryptedData = JSON.parse(jsonString);
      
      // Regenerate the encryption key using stored salt
      const key = this.generateEncryptionKey(userPassword, encryptedData.salt);
      
      // Parse IV
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
      
      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Convert back to ArrayBuffer
      const typedArray = this.wordArrayToUint8Array(decrypted);
      
      return {
        success: true,
        decryptedData: typedArray.buffer,
        originalSize: typedArray.length
      };
      
    } catch (error) {
      console.error('Decryption error:', error);
      return {
        success: false,
        error: 'Failed to decrypt document. Invalid password or corrupted file.'
      };
    }
  }

  // Utility function to convert WordArray to Uint8Array
  wordArrayToUint8Array(wordArray) {
    const arrayOfWords = wordArray.hasOwnProperty('words') ? wordArray.words : [];
    const length = wordArray.hasOwnProperty('sigBytes') ? wordArray.sigBytes : arrayOfWords.length * 4;
    const uInt8Array = new Uint8Array(length);
    
    let index = 0;
    for (let i = 0; i < length; i++) {
      const word = arrayOfWords[i];
      uInt8Array[index++] = word >> 24;
      uInt8Array[index++] = (word >> 16) & 0xff;
      uInt8Array[index++] = (word >> 8) & 0xff;
      uInt8Array[index++] = word & 0xff;
    }
    return uInt8Array.subarray(0, length);
  }

  // Generate a secure document password based on user credentials
  generateDocumentPassword(userEmail, userUid) {
    // Combine user email + UID + a static secret for document encryption
    // In production, you might want to ask user for a separate document password
    const baseString = `${userEmail}:${userUid}:secure-doc-portal`;
    return CryptoJS.SHA256(baseString).toString();
  }

  // Validate encryption capability
  static isEncryptionAvailable() {
    return typeof CryptoJS !== 'undefined' && 
           typeof CryptoJS.AES !== 'undefined' && 
           typeof CryptoJS.PBKDF2 !== 'undefined';
  }
}

// Create global instance
const documentEncryption = new DocumentEncryption();

// Make available globally
window.DocumentEncryption = DocumentEncryption;
window.documentEncryption = documentEncryption;
