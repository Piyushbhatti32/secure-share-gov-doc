'use client';

export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export const handleError = (error, defaultMessage = 'An error occurred') => {
  console.error(error);

  if (error instanceof ValidationError) {
    return {
      message: error.message,
      field: error.field,
      type: 'validation'
    };
  }

  // Firebase auth errors
  if (error.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        return {
          message: 'No user found with this email address',
          field: 'email',
          type: 'auth'
        };
      case 'auth/wrong-password':
        return {
          message: 'Incorrect password',
          field: 'password',
          type: 'auth'
        };
      case 'auth/email-already-in-use':
        return {
          message: 'Email address is already registered',
          field: 'email',
          type: 'auth'
        };
      case 'auth/weak-password':
        return {
          message: 'Password is too weak',
          field: 'password',
          type: 'auth'
        };
      default:
        return {
          message: error.message || defaultMessage,
          type: 'auth'
        };
    }
  }

  return {
    message: defaultMessage,
    type: 'unknown'
  };
};
