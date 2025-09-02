'use client';

import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/lib/context/ToastContext';

export default function DocumentSharing({ documentId, onShareComplete, open = false, onClose = () => {} }) {
  const { user } = useUser();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [sharedWith, setSharedWith] = useState('');
  const [permissions, setPermissions] = useState(['read']);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    
    if (!sharedWith.trim()) {
      showError('Please enter user email or ID to share with');
      return;
    }

    setIsLoading(true);

    try {
      // Use base64 encoding for document IDs with slashes
      const encodedId = btoa(documentId);
      console.log('Sharing document with ID:', documentId, 'Base64:', encodedId);
      const response = await fetch(`/api/documents/${encodedId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sharedWith: sharedWith.trim(),
          permissions
        }),
      });

      let result;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch (e) {
          const text = await response.text().catch(() => '');
          throw new Error(text || 'Unexpected response from server');
        }
      } else {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Unexpected response from server');
      }

      if (result.success) {
        showSuccess('Document shared successfully!');
        setSharedWith('');
        onClose();
        if (onShareComplete) {
          onShareComplete();
        }
      } else {
        showError(result.error || 'Failed to share document');
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      showError('Failed to share document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnshare = async () => {
    setConfirmOpen(true);
  };

  const confirmUnshare = async () => {
    setConfirmOpen(false);
    try {
      setIsLoading(true);
      const encodedId = btoa(documentId);
      console.log('Unsharing document with ID:', documentId, 'Base64:', encodedId);
      const response = await fetch(`/api/documents/${encodedId}/share`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharedWith: sharedWith })
      });
      let result;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch (e) {
          const text = await response.text().catch(() => '');
          throw new Error(text || 'Unexpected response from server');
        }
      } else {
        const text = await response.text().catch(() => '');
        throw new Error(text || 'Unexpected response from server');
      }
      if (result.success) {
        showSuccess('Sharing removed');
        if (onShareComplete) onShareComplete();
      } else {
        showError(result.error || 'Failed to unshare');
      }
    } catch (e) {
      showError('Failed to unshare document');
    } finally {
      setIsLoading(false);
    }
  };
  const cancelUnshare = () => setConfirmOpen(false);

  const togglePermissions = (permission) => {
    setPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Share Document</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share with (Email or User ID)
            </label>
            <input
              type="text"
              value={sharedWith}
              onChange={(e) => setSharedWith(e.target.value)}
              placeholder="Enter email or user ID"
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="space-y-2">
              {['read', 'write', 'delete'].map((permission) => (
                <label key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={permissions.includes(permission)}
                    onChange={() => togglePermissions(permission)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 capitalize">{permission}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            >
              {isLoading ? 'Sharing...' : 'Share Document'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Only users with valid accounts can access shared documents. 
            The document will remain secure and isolated from other users.
          </p>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Remove sharing?"
        message="This will revoke access for all currently shared users."
        confirmText="Remove"
        cancelText="Cancel"
        variant="warning"
        onConfirm={confirmUnshare}
        onCancel={cancelUnshare}
      />
    </div>
  );
}
