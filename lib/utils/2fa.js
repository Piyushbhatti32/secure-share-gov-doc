'use client';

// Generate a TOTP secret
export const generateTOTPSecret = () => {
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
};

// Generate current TOTP code
export const generateTOTP = async (secret, window = 0) => {
  const time = Math.floor(Date.now() / 30000) + window; // 30-second window
  
  // Convert time to buffer
  const timeBuffer = new TextEncoder().encode(time.toString());
  const secretBuffer = Uint8Array.from(atob(secret), c => c.charCodeAt(0));
  
  // Create HMAC key
  const key = await crypto.subtle.importKey(
    'raw',
    secretBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  // Generate HMAC
  const signature = await crypto.subtle.sign('HMAC', key, timeBuffer);
  const signatureArray = new Uint8Array(signature);
  
  // Get offset
  const offset = signatureArray[signatureArray.length - 1] & 0xf;
  
  // Generate code
  const code = ((signatureArray[offset] & 0x7f) << 24) |
               ((signatureArray[offset + 1] & 0xff) << 16) |
               ((signatureArray[offset + 2] & 0xff) << 8) |
               (signatureArray[offset + 3] & 0xff);
  
  return (code % 1000000).toString().padStart(6, '0');
};

// Verify TOTP code
export const verifyTOTP = async (secret, code) => {
  // Check current and adjacent windows
  for (let window = -1; window <= 1; window++) {
    const generatedCode = await generateTOTP(secret, window);
    if (generatedCode === code) {
      return true;
    }
  }
  return false;
};

// Generate QR code data for authenticator apps
export const generateQRCodeData = (secret, email, issuer = 'SecureShare') => {
  const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${encodeURIComponent(secret)}&issuer=${encodeURIComponent(issuer)}`;
  return otpauth;
};

// Generate backup codes
export const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    const code = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
};

// Hash backup codes for storage
export const hashBackupCodes = async (codes) => {
  const hashedCodes = [];
  for (const code of codes) {
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    hashedCodes.push(hashHex);
  }
  return hashedCodes;
};

// Verify a backup code
export const verifyBackupCode = async (code, hashedCodes) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedCode = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashedCodes.includes(hashedCode);
};
