'use client';

import { useState } from 'react';
import Link from 'next/link';

// Utility function to format dates
const formatDate = (timestamp) => {
  if (!timestamp) return 'Not available';
  
  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return 'Invalid Date';
  }
};

export default function DocumentCard({ document, onDelete }) {
  const [downloading, setDownloading] = useState(false);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      onDelete(document.fileName);
    }
  };

  const handleDownload = async () => {
    if (!document.fileName || !document.r2Storage) {
      alert('This document is not available for download');
      return;
    }

    try {
      setDownloading(true);
      
      // Get download URL from API
      const response = await fetch(`/api/download?file=${encodeURIComponent(document.fileName)}`);
      if (!response.ok) {
        throw new Error('Failed to generate download link');
      }
      
      const data = await response.json();
      
      // Open download URL in new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 overflow-hidden hover:bg-black/60 transition-all duration-300 electric-border">
      <div className="p-6">
        <div className="space-y-4">
          {/* Header with Title and Creation Date */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white electric-text">
                {document.title}
              </h3>
              <p className="text-sm text-blue-200 mt-1">
                Type: {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200">
                Created:
              </p>
              <p className="text-sm font-medium text-white">
                {formatDate(document.createdAt)}
              </p>
            </div>
          </div>

          {/* Document Description */}
          <div className="text-blue-200 text-sm">
            {document.description}
          </div>

          {/* Document Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <div>
                <p className="text-xs text-blue-300">Status</p>
                <p className="font-medium capitalize">{document.status}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-blue-200">
              <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></div>
              <div>
                <p className="text-xs text-blue-300">Size</p>
                <p className="font-medium">{document.size}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-blue-200">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <div>
                <p className="text-xs text-blue-300">Updated</p>
                <p className="font-medium">{formatDate(document.updatedAt)}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-blue-200">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <div>
                <p className="text-xs text-blue-300">Tags</p>
                <p className="font-medium">{document.tags?.slice(0, 2).join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions Footer */}
      <div className="bg-black/20 px-6 py-4 border-t border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/documents/${document.id}`}
              className="relative group p-2 text-blue-400 hover:text-blue-200 hover:bg-blue-500/20 rounded-lg transition-colors"
              title="View Document"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </Link>
            <Link
              href={`/documents/${document.id}/edit`}
              className="relative group p-2 text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/20 rounded-lg transition-colors"
              title="Edit Document"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            <button
              onClick={handleDownload}
              disabled={downloading || !document.r2Storage}
              className="relative group p-2 text-green-400 hover:text-green-200 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={document.r2Storage ? "Download Document" : "Document not available for download"}
            >
              {downloading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
            </button>
            <button
              onClick={() => window.open('#', '_blank')}
              className="relative group p-2 text-yellow-400 hover:text-yellow-200 hover:bg-yellow-500/20 rounded-lg transition-colors"
              title="Share Document"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="relative group p-2 text-red-400 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-colors"
              title="Delete Document"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          
          {/* Status Badge */}
          <div className={`text-xs font-medium px-3 py-1 rounded-full ${
            document.status === 'active' 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : document.status === 'archived'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
