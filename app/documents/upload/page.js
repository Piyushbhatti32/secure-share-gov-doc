'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBuildSafeUser } from '@/lib/hooks/useBuildSafeAuth';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import EnhancedFileUpload from '@/components/EnhancedFileUpload';
import CloudinaryConfigurationChecker from '@/components/CloudinaryConfigurationChecker';
import documentService from '@/lib/services/document-service';

export default function DocumentUploadPage() {
  const { user, isLoaded, isSignedIn } = useBuildSafeUser();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    tags: ''
  });
  
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [triggerUpload, setTriggerUpload] = useState(false);
  const savingRef = useRef(false);
  const lastSavedIdRef = useRef(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
  }, [isLoaded, isSignedIn, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    
    // Auto-fill title if empty
    if (!formData.title.trim()) {
      setFormData(prev => ({
        ...prev,
        title: selectedFile.name.split('.').slice(0, -1).join('.')
      }));
    }
  };

  const handleFileRemove = () => {
    setFile(null);
    setError(null);
  };

  const handleUploadComplete = async (uploadResult) => {
    try {
      console.log('Upload completed, saving document metadata...', uploadResult);
      
      const doc = uploadResult?.document || {};
      const resultId = doc?.cloudinaryId || uploadResult?.cloudinaryId || uploadResult?.documentId || uploadResult?.id;
      if (resultId && lastSavedIdRef.current === resultId) {
        console.log('⚠️ Duplicate handleUploadComplete detected for', resultId, '— skipping save');
        return;
      }
      if (savingRef.current) {
        console.log('⚠️ Save already in progress — skipping duplicate call');
        return;
      }
      savingRef.current = true;

      // Create document data with Cloudinary file info
      const documentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        // Align to API response shape
        fileName: doc.cloudinaryId, // Cloudinary public ID (preview for PDFs)
        originalFileName: doc.metadata?.originalName,
        fileSize: doc.metadata?.fileSize,
        fileType: doc.metadata?.format,
        status: 'active',
        r2Storage: true, // We'll keep this for compatibility
        cloudinaryId: doc.cloudinaryId,
        uploadedAt: doc.metadata?.uploadedAt
      };

      // Add document to document service
      const newDocument = await documentService.addDocument(documentData);

      if (newDocument) {
        lastSavedIdRef.current = resultId || newDocument?.id || Date.now();
        setSuccess('Document uploaded successfully to secure cloud storage!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          type: '',
          tags: ''
        });
        setFile(null);
        setTriggerUpload(false); // Reset trigger
        
        // Redirect to documents page after a short delay
        setTimeout(() => {
          try {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('refreshDocuments', '1');
            }
          } catch {}
          router.push('/documents');
        }, 3000);
      } else {
        setError('Failed to save document metadata');
      }
    } catch (err) {
      console.error('Error saving document:', err);
      setError(`Failed to save document: ${err.message}`);
    }
    finally {
      savingRef.current = false;
    }
  };

  const handleUploadError = (error) => {
    console.error('Upload error:', error);
    setError(`Upload failed: ${error.message}`);
    setTriggerUpload(false); // Reset trigger on error
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a document title');
      return;
    }

    if (!formData.type) {
      setError('Please select a document type');
      return;
    }

    // Clear any previous errors
    setError(null);
    setSuccess(null);
    
    // Trigger the upload in the EnhancedFileUpload component
    console.log('Form validated successfully, triggering upload...');
    setTriggerUpload(true);
  };



  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white electric-text mb-2">
            Upload Document
          </h1>
          <p className="text-blue-200">
            Upload and organize your important documents securely
          </p>
        </div>

        {/* Cloudinary Configuration Checker */}
        <div className="mb-8">
          <CloudinaryConfigurationChecker />
        </div>

        {/* Upload Form */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-8 corner-border corner-blue corner-normal radius-xl">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Enhanced File Upload */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Select File
              </label>
              <EnhancedFileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                acceptedTypes=".jpg,.jpeg,.png,.gif,.webp,.svg,.mp4,.webm,.ogg,.avi,.mov,.mp3,.wav,.aac,.txt,.csv,.html,.json,.xml"
                maxSize={50 * 1024 * 1024} // 50MB
                autoUpload={false}
                triggerUpload={triggerUpload}
              />
              <p className="text-xs text-blue-400 mt-2">
                💡 <strong>Note:</strong> Only images, video, audio, and text files are supported. PDFs and Office documents are <span className="text-red-400 font-semibold">not supported</span> by Cloudinary.
              </p>
            </div>



            {/* Document Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-blue-200 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-black/60 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent electric-focus corner-border corner-cyan corner-subtle radius-lg"
                placeholder="Enter document title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-blue-200 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-black/60 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent electric-focus corner-border corner-purple corner-subtle radius-lg"
                placeholder="Enter document description (optional)"
              />
            </div>

            {/* Document Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-blue-200 mb-2">
                Document Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-black/60 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent electric-focus corner-border corner-green corner-subtle radius-lg"
              >
                <option value="">Select document type</option>
                <option value="government">Government Document</option>
                <option value="personal">Personal Document</option>
                <option value="financial">Financial Document</option>
                <option value="legal">Legal Document</option>
                <option value="medical">Medical Document</option>
                <option value="educational">Educational Document</option>
                <option value="business">Business Document</option>
                <option value="creative">Creative Work</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-blue-200 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black/60 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent electric-focus corner-border corner-orange corner-subtle radius-lg"
                placeholder="e.g., important, government, identity, urgent"
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg corner-border corner-red corner-pulse radius-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg corner-border corner-green corner-glow radius-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Link
                href="/documents"
                className="px-6 py-3 border border-blue-500/50 text-blue-300 hover:text-blue-200 hover:border-blue-400 rounded-lg font-medium transition-all duration-300 corner-border corner-blue corner-subtle radius-lg"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={!file}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl electric-glow disabled:opacity-50 disabled:cursor-not-allowed corner-border corner-cyan corner-fast radius-lg"
              >
                Upload Document
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
