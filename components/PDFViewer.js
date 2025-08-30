'use client';

import { useState, useEffect } from 'react';

export default function PDFViewer({ fileName, title = "Document Viewer" }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fileName) {
      setError('No file specified');
      setLoading(false);
      return;
    }

    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get Cloudinary file URL from API
        const response = await fetch(`/api/download?file=${encodeURIComponent(fileName)}`);
        if (!response.ok) {
          throw new Error('Failed to load document');
        }

        const data = await response.json();
        setPdfUrl(data.url);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load document. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [fileName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-black/20 rounded-lg border border-blue-500/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-200">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-500/10 rounded-lg border border-red-500/30">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-red-300 text-lg font-medium mb-2">Error Loading Document</p>
          <p className="text-red-200 mb-4">{error}</p>
                  <div className="text-sm text-red-200">
          <p>This could be due to:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Cloudinary not being configured</li>
            <li>File not existing in Cloudinary</li>
            <li>Network connectivity issues</li>
            <li>File name encoding issues</li>
          </ul>
          <p className="mt-2 text-xs text-red-300">
            File: {fileName}
          </p>
        </div>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-96 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
        <div className="text-center">
          <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-yellow-300 text-lg font-medium mb-2">No document URL available</p>
          <p className="text-yellow-200 text-sm mb-4">
            The document file could not be loaded from Cloudinary.
          </p>
          {/* Mock PDF Viewer for Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-black/20 rounded-lg border border-blue-500/30 p-8 max-w-md mx-auto">
              <h4 className="text-blue-300 font-medium mb-3">Development Preview</h4>
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-blue-200 text-sm">Mock PDF Document</p>
                <p className="text-gray-400 text-xs mt-2">File: {fileName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white electric-text">{title}</h2>
        <p className="text-blue-200 text-sm">Cloudinary Storage</p>
      </div>
      
      <div className="bg-black/20 rounded-lg border border-blue-500/30 overflow-hidden">
        {/* Check if it's an image file */}
        {pdfUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
          <div className="flex items-center justify-center p-8">
            <img
              src={pdfUrl}
              alt={title}
              className="max-w-full max-h-96 object-contain rounded-lg"
              style={{ maxHeight: '600px' }}
            />
          </div>
        ) : (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            width="100%"
            height="600px"
            className="border-0"
            title={title}
          />
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-blue-200">
        <span>Cloudinary Storage</span>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          Open in new tab
        </a>
      </div>
    </div>
  );
}

