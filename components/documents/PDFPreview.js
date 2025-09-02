'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/lib/context/ToastContext';

export default function PDFPreview({ document, onClose }) {
  const { user } = useUser();
  const { showSuccess, showError } = useToast();
  const [signedUrls, setSignedUrls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'download'

  useEffect(() => {
    if (document?.isPDF) {
      generateSignedUrls();
    } else {
      setLoading(false);
    }
  }, [document]);

  const generateSignedUrls = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/documents/${document.id}/signed-urls?expiresIn=3600`);
      if (!response.ok) {
        throw new Error('Failed to generate secure URLs');
      }

      const result = await response.json();
      if (result.success) {
        setSignedUrls(result.signedUrls);
        setTotalPages(document.pages || 1);
      } else {
        throw new Error(result.error || 'Failed to generate secure URLs');
      }
    } catch (error) {
      console.error('Error generating signed URLs:', error);
      showError('Failed to load document preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!signedUrls?.downloadUrl) {
      showError('Download URL not available');
      return;
    }

    try {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = signedUrls.downloadUrl;
      link.download = document.originalFileName || document.name || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess('Download started');
    } catch (error) {
      console.error('Download error:', error);
      showError('Failed to download document');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const generateThumbnailUrl = (page = 1) => {
    if (!signedUrls?.previewUrl) return null;
    
    // Transform PDF to image thumbnail
    return `${signedUrls.previewUrl}?page=${page}&width=300&height=400&format=png&quality=80`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Generating secure preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!document?.isPDF) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Preview</h3>
            <p className="text-gray-600 mb-4">This document type doesn't support preview.</p>
            <div className="flex space-x-3">
              <button
                onClick={handleDownload}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Download
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {document.name || document.originalFileName}
            </h3>
            <p className="text-sm text-gray-500">
              {document.isPDF ? 'PDF Document' : document.format} • {totalPages} pages
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode('download')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'download'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Download
              </button>
            </div>
          </div>

          {viewMode === 'preview' ? (
            /* Preview Mode */
            <div className="space-y-4">
              {/* Page Navigation */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* PDF Preview */}
              <div className="flex justify-center">
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                  {signedUrls?.previewUrl ? (
                    <img
                      src={generateThumbnailUrl(currentPage)}
                      alt={`Page ${currentPage}`}
                      className="max-w-full max-h-[60vh] object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : (
                    <div className="w-80 h-96 bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-500">Preview not available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 overflow-x-auto py-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex-shrink-0 w-16 h-20 border-2 rounded-md overflow-hidden ${
                        currentPage === page
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={generateThumbnailUrl(page)}
                        alt={`Page ${page}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Download Mode */
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Download Document</h4>
                <p className="text-gray-600 mb-4">
                  Download the complete PDF document. The download link will expire in 1 hour for security.
                </p>
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Secure access • Expires in 1 hour
            </span>
            <span>
              {signedUrls?.expiresAt && (
                `Expires: ${new Date(signedUrls.expiresAt).toLocaleTimeString()}`
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
