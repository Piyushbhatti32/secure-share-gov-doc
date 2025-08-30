'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import documentService from '@/lib/services/document-service';
import { formatDate } from '@/lib/utils/date-utils';
import PDFViewer from '@/components/PDFViewer';

export default function DocumentViewPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id;
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    fetchDocument();
  }, [isLoaded, isSignedIn, router, documentId]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const doc = await documentService.getDocument(documentId);
      if (doc) {
        setDocument(doc);
      } else {
        setError('Document not found');
      }
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await documentService.deleteDocument(documentId);
        router.push('/documents');
      } catch (err) {
        console.error('Error deleting document:', err);
        setError('Failed to delete document');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error || 'Document not found'}</p>
            <button 
              onClick={() => router.push('/documents')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Back to Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white electric-text mb-2">
              {document.title}
            </h1>
            <p className="text-blue-200">
              {document.description}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/documents/${documentId}/edit`}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors duration-300"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Document Details */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white electric-text mb-4">
                Document Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-200">Type:</span>
                  <span className="text-white capitalize">{document.type}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-blue-200">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    document.status === 'active' 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : document.status === 'archived'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-blue-200">Size:</span>
                  <span className="text-white">{document.size}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-blue-200">Created:</span>
                  <span className="text-white">{formatDate(document.createdAt, 'datetime')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-blue-200">Last Updated:</span>
                  <span className="text-white">{formatDate(document.updatedAt, 'datetime')}</span>
                </div>
              </div>
            </div>

            {/* Tags and Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white electric-text mb-4">
                Tags & Categories
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-blue-200">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {document.tags && document.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <h4 className="text-md font-medium text-white mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => window.open('#', '_blank')}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-300"
                    >
                      Download Document
                    </button>
                    <button
                      onClick={() => window.open('#', '_blank')}
                      className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors duration-300"
                    >
                      Share Document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        {document.r2Storage && document.fileName ? (
          <div className="mb-8">
            <PDFViewer 
              fileName={document.fileName} 
              title={document.title}
            />
          </div>
        ) : (
          <div className="mb-8">
            <div className="bg-yellow-500/10 rounded-lg border border-yellow-500/30 p-8 text-center">
              <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">Document File Not Available</h3>
              <p className="text-yellow-200 mb-4">
                This document doesn't have an associated file uploaded yet.
              </p>
              <Link
                href={`/documents/${documentId}/edit`}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
              >
                Upload File
              </Link>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/documents"
            className="px-6 py-3 border border-blue-500/50 text-blue-300 hover:text-blue-200 hover:border-blue-400 rounded-lg font-medium transition-all duration-300 electric-border"
          >
            ← Back to Documents
          </Link>
          
          <Link
            href={`/documents/${documentId}/edit`}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl electric-glow"
          >
            Edit Document
          </Link>
        </div>
      </div>
    </div>
  );
}
