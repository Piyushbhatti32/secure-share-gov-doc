import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    
    let userMessage = 'An unexpected error occurred. Please try again.';
    
    if (error?.response?.status === 422) {
      userMessage = 'Validation error. Please check your input and try again.';
    } else if (error?.response?.status === 401) {
      userMessage = 'Authentication required. Please sign in again.';
    } else if (error?.response?.status === 403) {
      userMessage = 'Access denied. You don\'t have permission for this action.';
    } else if (error?.response?.status === 404) {
      userMessage = 'Resource not found. Please check the URL and try again.';
    } else if (error?.response?.status >= 500) {
      userMessage = 'Server error. Please try again later.';
    } else if (error?.message) {
      userMessage = error.message;
    }
    
    setError({
      message: userMessage,
      originalError: error,
      context,
      timestamp: new Date().toISOString()
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async (asyncFunction, context = '') => {
    try {
      setIsLoading(true);
      clearError();
      const result = await asyncFunction();
      return result;
    } catch (error) {
      handleError(error, context);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling
  };
}
