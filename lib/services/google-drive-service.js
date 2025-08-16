'use client';

import { auth as firebaseAuth } from '@/lib/firebase';

export const uploadFileToDrive = async (file, folderName = 'SecureDocShare') => {
  try {
    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided');
    }

    // Check authentication
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Get fresh ID token
    const token = await currentUser.getIdToken(true);
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderName', folderName);

    // Upload file
    let response;
    try {
      response = await fetch('/api/google-drive/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
    } catch (networkError) {
      console.error('Network error during upload:', networkError);
      throw new Error('Network error during file upload. Please check your connection.');
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Error parsing server response:', parseError);
      throw new Error('Invalid response from server');
    }

    // Handle errors
    if (!response.ok) {
      console.error('Upload error:', data);
      if (response.status === 401) {
        throw new Error(data.error || 'Authentication failed. Please reconnect your Google account.');
      } else {
        throw new Error(data.error || 'Failed to upload file');
      }
    }

    // Validate response
    if (!data.fileId || !data.viewLink) {
      console.error('Invalid server response:', data);
      throw new Error('Invalid response from server');
    }

    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
};
