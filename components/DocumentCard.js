'use client';

import { useState } from 'react';
import Link from 'next/link';
import DocumentSharing from './documents/DocumentSharing';
import PDFPreview from './documents/PDFPreview';
import ConfirmDialog from './ui/ConfirmDialog';

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

// Utility function to format file size
const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default function DocumentCard({ document, onDelete, onRefresh }) {
  const [downloading, setDownloading] = useState(false);
  const [showSharing, setShowSharing] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const handleDelete = () => setConfirmOpen(true);
  const confirmDelete = () => { setConfirmOpen(false); onDelete(document.id); };
  const cancelDelete = () => setConfirmOpen(false);

  const handleDownload = async () => {
    if (!document.url) {
      alert('This document is not available for download');
      return;
    }

    try {
      setDownloading(true);
      
      // For PDFs, we'll use the preview component for secure download
      if (document.isPDF) {
        setShowPDFPreview(true);
        return;
      }

      // For non-PDF files, download directly
      const link = document.createElement('a');
      link.href = document.url;
      link.download = document.originalFileName || document.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => setShowSharing(true);

  const handleShareComplete = () => {
    setShowSharing(false);
    onRefresh?.();
  };

  const handleView = () => {
    if (document.isPDF) {
      setShowPDFPreview(true);
    } else {
      window.open(document.url, '_blank');
    }
  };

  const getDisplayFileName = () => {
    try {
      const raw = (document.originalFileName || (document.fileName ? document.fileName.split('/').pop() : document.title) || '').toString();
      let name = raw;
      // 1) Strip known upload prefix like "upload-<digits>-"
      name = name.replace(/^upload-\d+-/i, '');
      // 2) Remove trailing "_raw"
      name = name.replace(/_raw$/i, '');
      // 3) If there's an extension, remove suffix like _abcdef12 before extension
      name = name.replace(/^(.*?)(_[a-z0-9]{4,12})(\.[^./\\]+)$/i, '$1$3');
      // 4) If no extension case, also remove trailing _abcdef12
      name = name.replace(/_[a-z0-9]{4,12}$/i, '');
      // 5) Collapse multiple dashes/underscores introduced by cleanup
      name = name.replace(/--+/g, '-').replace(/__+/g, '_').replace(/-_+/g, '-').replace(/_-+/g, '_');
      return name;
    } catch {
      return document.title;
    }
  };

  return (
    <>
      <div className={`bg-black/40 backdrop-blur-sm rounded-xl border overflow-hidden hover:bg-black/60 transition-all duration-300 electric-border ${
        document.isOwner 
          ? 'border-blue-500/30' 
          : 'border-green-500/30'
      }`}>
        <div className="p-6">
          <div className="space-y-4">
            {/* Header with File Name on top and meta */}
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                {/* File Name on top */}
                <p
                  className="text-white font-semibold mb-1 whitespace-normal break-words"
                  title={getDisplayFileName()}
                >
                  {getDisplayFileName()}
                </p>
                <div className="flex items-center space-x-2 mb-1 min-w-0">
                  <h3
                    className="text-sm font-medium text-blue-200 truncate min-w-0 flex-1"
                    title={document.title}
                  >
                    {document.title}
                  </h3>
                  {document.isOwner ? (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
                      Owned
                    </span>
                  ) : (
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                      Shared
                    </span>
                  )}
                  {document.isPDF && (
                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full border border-red-500/30">
                      PDF
                    </span>
                  )}
                </div>
                <p className="text-sm text-blue-200 truncate max-w-full">
                  Type: {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                  {document.isPDF && document.pages && ` • ${document.pages} pages`}
                </p>
                {!document.isOwner && document.ownerId && (
                  <p className="text-sm text-green-200 mt-1">
                    Shared by: {document.ownerEmail || document.ownerId}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-sm text-blue-200">
                  {document.isOwner ? 'Created:' : 'Shared:'}
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
                  <p className="font-medium">{formatFileSize(document.fileSize)}</p>
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
                  <p className="text-xs text-blue-300">Access</p>
                  <p className="font-medium capitalize">{document.accessLevel}</p>
                </div>
              </div>
            </div>

            {/* Permissions for shared documents */}
            {!document.isOwner && document.permissions && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-sm text-green-200 font-medium mb-1">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {document.permissions.map((permission, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions Footer */}
        <div className="bg-black/20 px-6 py-4 border-t border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleView}
                className="relative group p-2 text-blue-400 hover:text-blue-200 hover:bg-blue-500/20 rounded-lg transition-colors"
                title={document.isPDF ? "Preview PDF" : "View Document"}
              >
                {document.isPDF ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              
              <button
                onClick={handleDownload}
                disabled={downloading || !document.url}
                className="relative group p-2 text-green-400 hover:text-green-200 hover:bg-green-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={document.isPDF ? "Download PDF" : "Download Document"}
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

              {/* Only show share button for owned documents */}
              {document.isOwner && (
                <button
                  onClick={handleShare}
                  className="relative group p-2 text-yellow-400 hover:text-yellow-200 hover:bg-yellow-500/20 rounded-lg transition-colors"
                  title="Share Document"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              )}

              {/* Only show delete button for owned documents */}
              {document.isOwner && (
                <button
                  onClick={handleDelete}
                  className="relative group p-2 text-red-400 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete Document"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
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

      {/* Document Sharing Modal */}
      <DocumentSharing 
        documentId={document.id}
        onShareComplete={handleShareComplete}
        open={showSharing}
        onClose={() => setShowSharing(false)}
      />

      {/* PDF Preview Modal */}
      {showPDFPreview && (
        <PDFPreview 
          document={document}
          onClose={() => setShowPDFPreview(false)}
        />
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete document?"
        message="This action cannot be undone. The file will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}
