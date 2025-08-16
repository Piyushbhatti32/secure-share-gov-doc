'use client';

export const validateEmail = (email) => {
  // Trim the email to remove any whitespace
  const trimmedEmail = email?.trim();

  // Basic format check
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail || !basicEmailRegex.test(trimmedEmail)) {
    throw new Error('Please enter a valid email address');
  }

  // More detailed validation
  const [localPart, domain] = trimmedEmail.split('@');

  // Check local part length (max 64 characters)
  if (localPart.length > 64) {
    throw new Error('Email username part is too long');
  }

  // Check domain length (max 255 characters)
  if (domain.length > 255) {
    throw new Error('Email domain part is too long');
  }

  // Check for valid characters in local part and domain
  const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!validEmailRegex.test(trimmedEmail)) {
    throw new Error('Email contains invalid characters');
  }

  // Additional security checks
  if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    throw new Error('Email contains consecutive dots or starts/ends with a dot');
  }

  return true;
};

export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
    throw new Error(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    );
  }
  
  return true;
};

export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters long');
  }
  return true;
};

export const validateFileType = (file, allowedTypes = ['application/pdf']) => {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
  return true;
};

export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size must not exceed ${maxSizeMB}MB`);
  }
  return true;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  if (!phone || !phoneRegex.test(phone)) {
    throw new Error('Phone number must be 10 digits');
  }
  return true;
};

export const validateAadhar = (aadhar) => {
  const aadharRegex = /^[0-9]{12}$/;
  if (!aadhar || !aadharRegex.test(aadhar)) {
    throw new Error('Aadhar number must be 12 digits');
  }
  return true;
};
