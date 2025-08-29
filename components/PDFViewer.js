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

        // Get signed download URL from API
        const response = await fetch(`/api/download/${fileName}`);
        if (!response.ok) {
          throw new Error('Failed to load document');
        }

        const data = await response.json();
        setPdfUrl(data.downloadUrl);
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
          <p className="text-red-200">{error}</p>
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
          <p className="text-yellow-300 text-lg font-medium">No document URL available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white electric-text">{title}</h2>
        <p className="text-blue-200 text-sm">Document loaded from secure cloud storage</p>
      </div>
      
      <div className="bg-black/20 rounded-lg border border-blue-500/30 overflow-hidden">
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          width="100%"
          height="600px"
          className="border-0"
          title={title}
        />
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm text-blue-200">
        <span>Secure R2 Storage</span>
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

