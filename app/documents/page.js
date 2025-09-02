'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DocumentCard from '@/components/DocumentCard';
import { useBuildSafeUser } from '@/lib/hooks/useBuildSafeAuth';
import useSWR from 'swr';
import { jsonFetcher } from '@/lib/utils/fetcher';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DocumentsPage() {
  const { user, isLoaded, isSignedIn } = useBuildSafeUser();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data, isLoading, mutate, error: swrError } = useSWR(
    isLoaded && isSignedIn ? '/api/documents' : null,
    jsonFetcher,
    { revalidateOnFocus: true, revalidateOnMount: true, keepPreviousData: true }
  );
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    if (isLoaded && isSignedIn) fetchDocuments();
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    try {
      if (typeof window !== 'undefined') {
        const flag = sessionStorage.getItem('refreshDocuments');
        if (flag === '1') {
          sessionStorage.removeItem('refreshDocuments');
          mutate();
          fetchDocuments();
        }
      }
    } catch {}
  }, [isLoaded, isSignedIn, mutate]);

  const fetchDocuments = async () => {
    try {
      if (documents.length === 0) setLoading(true);
      const result = data || (await jsonFetcher('/api/documents'));
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch documents');
      }

      // Combine owned and shared documents
      const ownedDocs = (result.documents?.owned || []).map((doc) => ({
        id: doc.id,
        title: doc.name || doc.id.split('/').pop(),
        description: 'Your document',
        type: doc.format || 'document',
        tags: ['owned'],
        fileName: doc.id,
        originalFileName: doc.name || doc.id.split('/').pop(),
        fileSize: doc.size,
        fileType: doc.format,
        status: 'active',
        r2Storage: false,
        cloudinaryId: doc.id,
        uploadedAt: doc.uploadedAt,
        url: doc.url,
        format: doc.format,
        width: null,
        height: null,
        createdAt: doc.uploadedAt,
        updatedAt: doc.uploadedAt,
        isOwner: true,
        accessLevel: 'owner'
      }));

      const sharedDocs = (result.documents?.shared || []).map((doc) => ({
        id: doc.id,
        title: doc.name || doc.id.split('/').pop(),
        description: `Shared by ${doc.ownerEmail || doc.ownerId}`,
        type: doc.format || 'document',
        tags: ['shared'],
        fileName: doc.id,
        originalFileName: doc.name || doc.id.split('/').pop(),
        fileSize: doc.size,
        fileType: doc.format,
        status: 'active',
        r2Storage: false,
        cloudinaryId: doc.id,
        uploadedAt: doc.sharedAt || doc.uploadedAt,
        url: doc.url,
        format: doc.format,
        width: null,
        height: null,
        createdAt: doc.sharedAt || doc.uploadedAt,
        updatedAt: doc.sharedAt || doc.uploadedAt,
        isOwner: false,
        accessLevel: 'shared',
        ownerId: doc.ownerId,
        permissions: doc.permissions || ['read']
      }));

      // Combine, de-duplicate by id, and sort by creation date (newest first)
      const byId = new Map();
      [...ownedDocs, ...sharedDocs].forEach(doc => {
        if (!byId.has(doc.id)) {
          byId.set(doc.id, doc);
        }
      });
      const allDocs = Array.from(byId.values()).sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setDocuments(allDocs);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      // optimistic UI: remove immediately
      setDocuments(prev => prev.filter(d => d.id !== documentId));
      const response = await fetch('/api/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to delete document');
      mutate();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
      mutate();
    } finally {
      setLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" color="white" className="mb-4" />
          <p className="text-blue-200">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={fetchDocuments}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white electric-text mb-2">
              My Documents
            </h1>
            <p className="text-blue-200">
              Manage and organize your important documents securely
            </p>
          </div>
          <Link 
            href="/documents/upload"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl electric-glow"
          >
            Upload Document
          </Link>
        </div>

        {/* Document Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">
              {documents.filter(doc => doc.isOwner).length}
            </div>
            <div className="text-gray-300 text-sm">Owned Documents</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">
              {documents.filter(doc => !doc.isOwner).length}
            </div>
            <div className="text-gray-300 text-sm">Shared Documents</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-purple-400">
              {documents.length}
            </div>
            <div className="text-gray-300 text-sm">Total Documents</div>
          </div>
        </div>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No documents yet</h3>
            <p className="text-blue-200 mb-6">
              Start by uploading your first document to get organized
            </p>
            <Link 
              href="/documents/upload"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Upload Your First Document
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDelete={handleDeleteDocument}
                onRefresh={fetchDocuments}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
