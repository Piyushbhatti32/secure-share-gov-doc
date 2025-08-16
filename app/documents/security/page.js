'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { handleError } from '@/lib/utils/error-handler';
import { encryptExistingDocument, bulkEncryptDocuments } from '@/lib/services/document-encryption-service';
import { getUserDocuments } from '@/lib/services/document-service';
import Navbar from '@/components/Navbar';

export default function SecurityManagementPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [encrypting, setEncrypting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (!auth.currentUser) {
          router.push('/login');
          return;
        }

        const docs = await getUserDocuments(auth.currentUser.uid);
        setDocuments(docs);
      } catch (err) {
        const errorDetails = handleError(err);
        setError(errorDetails.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [router]);

  const handleSelectDocument = (docId) => {
    setSelectedDocs(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      }
      return [...prev, docId];
    });
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === documents.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(documents.map(doc => doc.id));
    }
  };

  const handleEncrypt = async () => {
    if (selectedDocs.length === 0) {
      setError('Please select at least one document to encrypt');
      return;
    }

    setError(null);
    setSuccess(null);
    setEncrypting(true);

    try {
      const results = await bulkEncryptDocuments(selectedDocs, auth.currentUser.uid);
      
      // Check results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      let message = '';
      if (successful.length > 0) {
        message += `Successfully encrypted ${successful.length} document(s). `;
      }
      if (failed.length > 0) {
        message += `Failed to encrypt ${failed.length} document(s).`;
      }

      setSuccess(message);
      
      // Refresh document list
      const updatedDocs = await getUserDocuments(auth.currentUser.uid);
      setDocuments(updatedDocs);
      setSelectedDocs([]);
    } catch (err) {
      const errorDetails = handleError(err);
      setError(errorDetails.message);
    } finally {
      setEncrypting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Document Security Management
            </h2>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between mb-4">
              <button
                type="button"
                onClick={handleSelectAll}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {selectedDocs.length === documents.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                type="button"
                onClick={handleEncrypt}
                disabled={encrypting || selectedDocs.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {encrypting ? 'Encrypting...' : 'Encrypt Selected'}
              </button>
            </div>

            <div className="mt-2">
              <ul className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <li key={doc.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedDocs.includes(doc.id)}
                          onChange={() => handleSelectDocument(doc.id)}
                          disabled={doc.isEncrypted}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Type: {doc.type} • Size: {Math.round(doc.size / 1024)} KB
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {doc.isEncrypted ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Encrypted
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Not Encrypted
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
