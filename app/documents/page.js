'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import DocumentCard from '@/components/DocumentCard';
import { useUser } from '@clerk/nextjs';

export default function DocumentsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    fetchDocuments();
  }, [isLoaded, isSignedIn, router]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Failed to fetch documents');
      const result = await response.json();
      // Map Cloudinary resources to expected document fields
      const docs = (result.documents || []).map((doc) => ({
        id: doc.asset_id || doc.public_id,
        title: doc.context?.custom?.title || doc.public_id.split('/').pop(),
        description: doc.context?.custom?.description || '',
        type: doc.context?.custom?.type || doc.resource_type,
        tags: doc.tags || [],
        fileName: doc.public_id,
        originalFileName: doc.context?.custom?.original_filename || doc.public_id.split('/').pop(),
        fileSize: doc.bytes,
        fileType: doc.format,
        status: 'active',
        r2Storage: true,
        cloudinaryId: doc.public_id,
        uploadedAt: doc.created_at,
        url: doc.secure_url,
        format: doc.format,
        width: doc.width,
        height: doc.height,
        createdAt: doc.created_at,
        updatedAt: doc.created_at,
      }));
      setDocuments(docs);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (public_id) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;
    try {
      setLoading(true);
      const response = await fetch('/api/documents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Failed to delete document');
      await fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
