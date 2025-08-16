'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDocument } from '@/lib/services/document-service';
import { getDocumentShares, shareDocument } from '@/lib/services/share-service';
import { handleError } from '@/lib/utils/error-handler';
import { validateEmail } from '@/lib/utils/form-validator';
import { auth } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import { use } from 'react';

export default function DocumentPage({ params }) {
  const documentId = use(params).id;
  const router = useRouter();
  const [document, setDocument] = useState(null);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
  const fetchData = async () => {
      try {
        // If firebase `auth` is available and there is no current user, redirect to login.
        // If `auth` is undefined (e.g. in some test environments), continue so tests can mock
        // document fetching.
        if (auth && !auth.currentUser) {
          router.push('/login');
          return;
        }

        if (!documentId) {
          setError('Invalid document ID');
          setLoading(false);
          return;
        }

        // Fetch document and shares in parallel
        const [doc, sharesList] = await Promise.all([
          getDocument(documentId),
          getDocumentShares(documentId)
        ]);

        if (mounted.current) {
          setDocument(doc);
          setShares(sharesList);
        }
  } catch (err) {
        const errorDetails = handleError(err);
        
        // Handle specific errors
  if (!mounted.current) return;

        if (errorDetails.message === 'Access denied') {
          setError('You do not have permission to view this document');
        } else if (errorDetails.message === 'Document not found') {
          setError('The document you are looking for does not exist');
        } else if (errorDetails.message === 'Authentication required') {
          router.push('/login');
          return;
        } else {
          setError(errorDetails.message);
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
    };

    fetchData();

    // mark mounted
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, [documentId, router]);

  const handleShare = async (e) => {
    e.preventDefault();
    setError(null);
    setSharing(true);

    try {
      validateEmail(shareEmail);
      await shareDocument(
        documentId,
        auth?.currentUser?.uid,
        shareEmail,
        ['view']
      );
      
      // Refresh shares list
      const sharesList = await getDocumentShares(documentId);
      if (mounted.current) {
        setShares(sharesList);
        setShareEmail('');
      }
    } catch (err) {
      const errorDetails = handleError(err);
      setError(errorDetails.message);
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <p className="text-gray-700">Document data is not available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {document.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Uploaded on {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">File Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{document.type}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Size</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {Math.round(document.size / 1024)} KB
                </dd>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Share Document</h4>
            <form onSubmit={handleShare} className="flex gap-4">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
              <button
                type="submit"
                disabled={sharing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {sharing ? 'Sharing...' : 'Share'}
              </button>
            </form>

            <h4 className="text-lg font-medium text-gray-900 mt-8 mb-4">Shared With</h4>
            {shares.length === 0 ? (
              <p className="text-sm text-gray-500">This document hasn&apos;t been shared with anyone yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {shares.map((share) => (
                  <li key={share.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {share.sharedWithEmail}
                        </p>
                        <p className="text-sm text-gray-500">
                          Shared on {new Date(share.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        {share.status === 'pending' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View Document
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
