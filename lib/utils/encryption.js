'use client';

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;
const ITERATIONS = 100000;

/**
 * Generates a cryptographic key from a password using PBKDF2
 * @param {string} password - The password to derive the key from
 * @param {Uint8Array} [salt] - Optional salt for key derivation
 * @returns {Promise<{ key: CryptoKey, salt: Uint8Array }>} The derived key and salt
 */
export async function deriveKeyFromPassword(password, salt = null) {
  // Generate salt if not provided
  if (!salt) {
    salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  }

  // Convert password to buffer
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);

  // Import password as raw key material
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive key using PBKDF2
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: KEY_LENGTH
    },
    true,
    ['encrypt', 'decrypt']
  );

  return { key, salt };
}

/**
 * Generates a random encryption key and IV
 * @returns {Promise<{ key: CryptoKey, iv: Uint8Array }>}
 */
export async function generateEncryptionKey() {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: KEY_LENGTH
    },
    true,
    ['encrypt', 'decrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  return { key, iv };
}

/**
 * Generates a random initialization vector
 * @returns {Uint8Array} The generated IV
 */
export function generateIV() {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Encrypts data using AES-GCM
 * @param {string} data - The data to encrypt
 * @param {CryptoKey} key - The encryption key
 * @param {Uint8Array} [iv] - Optional initialization vector
 * @returns {Promise<{ encrypted: string, iv: string }>}
 */
export async function encryptData(data, key, iv = null) {
  if (!iv) {
    iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  }

  const enc = new TextEncoder();
  const dataBuffer = enc.encode(data);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    dataBuffer
  );

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

/**
 * Decrypts data using AES-GCM
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {CryptoKey} key - The decryption key
 * @param {string} iv - Base64 encoded initialization vector
 * @returns {Promise<string>}
 */
export async function decryptData(encryptedData, key, iv) {
  const encryptedArray = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const ivArray = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivArray
    },
    key,
    encryptedArray
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/**
 * Hash a value using SHA-256
 * @param {string} value - The value to hash
 * @returns {Promise<string>} The hex encoded hash
 */
export async function hashValue(value) {
  const enc = new TextEncoder();
  const data = enc.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates a password against security requirements
 * @param {string} password - The password to validate
 * @returns {boolean} True if password meets requirements
 */
export function validatePassword(password) {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
}

/**
 * Generates a sharing key for document sharing
 * @returns {string} A random sharing key
 */
export function generateSharingKey() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '').slice(0, 32);
}
