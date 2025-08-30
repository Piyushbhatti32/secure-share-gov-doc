'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getSharedDocuments, getDocumentsSharedBy } from '@/lib/services/share-service';
import { handleError } from '@/lib/utils/error-handler';
import Navbar from '@/components/Navbar';

export default function SharedDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [documentsSharedBy, setDocumentsSharedBy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (!isLoaded) return;
        const userEmail = user?.primaryEmailAddress?.emailAddress;
        if (!userEmail) return;

        const [sharedDocs, sharedByDocs] = await Promise.all([
          getSharedDocuments(userEmail),
          getDocumentsSharedBy(userEmail)
        ]);
        
        setDocuments(sharedDocs);
        setDocumentsSharedBy(sharedByDocs);
      } catch (err) {
        const errorDetails = handleError(err);
        setError(errorDetails.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [router, isLoaded, user]);

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

          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded">
              {error}
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
                          Shared by: {doc.sharedByEmail}
                        </p>
                        <p className="text-sm text-blue-200">
                          Shared on: {new Date(doc.sharedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => router.push(`/documents/${doc.id}`)}
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
                            Shared with: {doc.sharedWithEmails.join(', ')}
                          </p>
                          <p className="text-sm text-blue-200">
                            Permissions: {doc.permissions}
                          </p>
                          <p className="text-sm text-blue-200">
                            Shared on: {new Date(doc.sharedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => router.push(`/documents/${doc.documentId}`)}
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
          </div>
        </div>
      </main>
    </div>
  );
}
