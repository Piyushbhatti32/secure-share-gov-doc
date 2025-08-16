'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getSharedDocuments } from '@/lib/services/share-service';
import { handleError } from '@/lib/utils/error-handler';
import Navbar from '@/components/Navbar';

export default function SharedDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSharedDocuments = async () => {
      try {
        const userEmail = auth.currentUser?.email;
        if (!userEmail) {
          router.push('/login');
          return;
        }

        const sharedDocs = await getSharedDocuments(userEmail);
        setDocuments(sharedDocs);
      } catch (err) {
        const errorDetails = handleError(err);
        setError(errorDetails.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedDocuments();
  }, [router]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-primary-600 mb-4"></i>
            <p className="text-gray-600">Loading shared documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="card-header flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shared Documents</h1>
              <p className="text-sm text-gray-500">Documents shared with you by other users</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {documents.length === 0 ? (
            <div className="card-body text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <i className="fas fa-folder-open text-4xl"></i>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No shared documents</h3>
              <p className="mt-1 text-sm text-gray-500">
                No documents have been shared with you yet.
              </p>
            </div>
          ) : (
            <div className="card-body">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 truncate">
                          {doc.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          Shared by: {doc.sharedByEmail}
                        </p>
                        <p className="text-sm text-gray-500">
                          Shared on: {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => router.push(`/documents/${doc.id}`)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <i className="fas fa-external-link-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
