'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { handleError } from '@/lib/utils/error-handler';
import Navbar from '@/components/Navbar';
import useSWR from 'swr';
import { jsonFetcher } from '@/lib/utils/fetcher';

export default function SharedDocumentsPage() {
  const [error, setError] = useState(null);
  const [manageSharingModal, setManageSharingModal] = useState({ open: false, document: null });
  const [newShareEmail, setNewShareEmail] = useState('');
  const [newSharePermissions, setNewSharePermissions] = useState('read');
  const [addingShare, setAddingShare] = useState(false);
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const { data, isLoading, error: swrError, mutate } = useSWR(
    isLoaded && user ? '/api/documents' : null,
    jsonFetcher,
    { revalidateOnFocus: true, revalidateOnMount: true }
  );

  const handleAddSharing = async () => {
    if (!newShareEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    if (!manageSharingModal.document) {
      alert('No document selected');
      return;
    }

    setAddingShare(true);

    try {
      // Encode the document ID for the API
      const encodedDocumentId = btoa(manageSharingModal.document.id);
      
      const response = await fetch(`/api/documents/${encodedDocumentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sharedWith: newShareEmail,
          permissions: newSharePermissions
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to share document');
      }

      const result = await response.json();
      console.log('Share result:', result);

      // Reset form and close modal
      setNewShareEmail('');
      setNewSharePermissions('read');
      setManageSharingModal({ open: false, document: null });
      
      // Refresh the data
      mutate();
      
      alert('Document shared successfully!');
    } catch (error) {
      console.error('Error sharing document:', error);
      alert(`Failed to share document: ${error.message}`);
    } finally {
      setAddingShare(false);
    }
  };

  const documents = data?.documents?.shared || [];
  // Only show owned documents that have actually been shared (have sharing tags)
  const documentsSharedBy = (data?.documents?.owned || []).filter(doc => 
    doc.tags && (doc.tags.includes('isShared') || doc.tags.some(tag => tag.startsWith('sharedWith')))
  );
  const loading = isLoading;

  // Debug logging
  console.log('Shared page data:', data);
  console.log('Shared documents:', documents);
  console.log('Documents shared by user:', documentsSharedBy);
  console.log('All owned documents:', data?.documents?.owned);
  
  // Additional debugging for the categorization issue
  if (data?.documents?.owned) {
    console.log('Total owned documents:', data.documents.owned.length);
    console.log('Owned documents with sharing tags:', data.documents.owned.filter(doc => doc.tags && doc.tags.includes('isShared')));
    console.log('Owned documents with any sharing tags:', data.documents.owned.filter(doc => doc.tags && doc.tags.some(tag => tag.startsWith('sharedWith'))));
    console.log('All owned documents details:', data.documents.owned.map(doc => ({ 
      id: doc.id, 
      ownerId: doc.ownerId, 
      userId: doc.userId, 
      tags: doc.tags,
      hasTags: !!doc.tags,
      tagCount: doc.tags ? doc.tags.length : 0
    })));
  }
  if (documents.length > 0) {
    console.log('Shared documents owner IDs:', documents.map(doc => ({ id: doc.id, ownerId: doc.ownerId, tags: doc.tags })));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-400 mb-4"></i>
            <p className="text-blue-200">Loading shared documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 electric-border">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white electric-text">Shared Documents</h1>
              <p className="text-sm text-blue-200">Documents shared with you by other users</p>
            </div>
          </div>

          {(error || swrError) && (
            <div className="mb-4 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded">
              {error || swrError?.message || 'Failed to load shared documents'}
            </div>
          )}

          {documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-blue-400">
                <i className="fa-solid fa-folder-open text-4xl"></i>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-white">No shared documents</h3>
              <p className="mt-1 text-sm text-blue-200">
                No documents have been shared with you yet.
              </p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className="bg-black/20 p-4 rounded-lg border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 electric-border"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-white truncate">
                          {doc.name}
                        </h2>
                                                  <p className="text-sm text-blue-200">
                            Shared by: {doc.ownerEmail || doc.ownerId || 'Unknown'}
                          </p>
                        <p className="text-sm text-blue-200">
                          Shared on: {new Date(doc.sharedAt || doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => {
                            // Open the actual Cloudinary document URL
                            const cloudinaryUrl = `https://res.cloudinary.com/do1nyayei/image/upload/v1756829268/${doc.id}`;
                            window.open(cloudinaryUrl, '_blank');
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                        >
                          <i className="fa-solid fa-up-right-from-square"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Shared By You */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white electric-text">Documents You've Shared</h2>
                <p className="text-sm text-blue-200">Documents you've shared with other users</p>
              </div>
            </div>

            {documentsSharedBy.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-blue-400">
                  <i className="fa-solid fa-share-alt text-4xl"></i>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">No shared documents</h3>
                <p className="mt-1 text-sm text-blue-200">
                  You haven't shared any documents yet.
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {documentsSharedBy.map(doc => (
                    <div
                      key={doc.id}
                      className="bg-black/20 p-4 rounded-lg border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 electric-border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-semibold text-white truncate">
                            {doc.name}
                          </h2>
                          <p className="text-sm text-blue-200">
                            Shared with: {doc.sharedWithEmails?.join(', ') || 'Unknown'}
                          </p>
                          <p className="text-sm text-blue-200">
                            Permissions: {Array.isArray(doc.permissions) ? doc.permissions.join(', ') : doc.permissions || 'read'}
                          </p>
                          <p className="text-sm text-blue-200">
                            Shared on: {new Date(doc.sharedAt || doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4 flex space-x-2">
                          <button
                            onClick={() => {
                              // Open the actual Cloudinary document URL
                              const cloudinaryUrl = `https://res.cloudinary.com/do1nyayei/image/upload/v1756829268/${doc.id}`;
                              window.open(cloudinaryUrl, '_blank');
                            }}
                            className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                            title="View Document"
                          >
                            <i className="fa-solid fa-up-right-from-square"></i>
                          </button>
                          <button
                            onClick={() => {
                              setManageSharingModal({ open: true, document: doc });
                            }}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
                            title="Manage Sharing"
                          >
                            <i className="fa-solid fa-share-nodes"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Manage Sharing Modal */}
      {manageSharingModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 border border-blue-500/30 rounded-xl p-6 w-full max-w-2xl mx-4 electric-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white electric-text">Manage Sharing</h3>
              <button
                onClick={() => setManageSharingModal({ open: false, document: null })}
                className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
                <h4 className="text-lg font-medium text-white mb-2">
                  {manageSharingModal.document?.name}
                </h4>
                <p className="text-sm text-blue-200">
                  Document ID: {manageSharingModal.document?.id}
                </p>
              </div>

              <div>
                <h4 className="text-md font-medium text-white mb-3">Current Sharing</h4>
                <div className="bg-black/20 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">
                        {manageSharingModal.document?.sharedWithEmails?.join(', ') || 'No one'}
                      </p>
                      <p className="text-sm text-blue-200">
                        Permissions: {Array.isArray(manageSharingModal.document?.permissions) 
                          ? manageSharingModal.document.permissions.join(', ') 
                          : manageSharingModal.document?.permissions || 'read'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implement revoke sharing
                        alert('Revoke sharing functionality coming soon!');
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors duration-300"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-white mb-3">Add New Sharing</h4>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={newShareEmail}
                    onChange={(e) => setNewShareEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300/50 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <select 
                    value={newSharePermissions}
                    onChange={(e) => setNewSharePermissions(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-blue-500/30 rounded-lg text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="read">Read Only</option>
                    <option value="comment">Comment</option>
                    <option value="edit">Edit</option>
                  </select>
                  <button 
                    onClick={handleAddSharing}
                    disabled={addingShare || !newShareEmail.trim()}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-300"
                  >
                    {addingShare ? (
                      <span className="flex items-center justify-center">
                        <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                        Adding...
                      </span>
                    ) : (
                      'Add Sharing'
                    )}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setManageSharingModal({ open: false, document: null });
                    setNewShareEmail('');
                    setNewSharePermissions('read');
                  }}
                  className="flex-1 px-4 py-2 border border-blue-500/50 text-blue-300 hover:text-blue-200 hover:border-blue-400 rounded-lg font-medium transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
