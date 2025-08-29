'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import EnhancedFileUpload from '@/components/EnhancedFileUpload';
import mockDataService from '@/lib/services/mock-data-service';

export default function DocumentUploadPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    tags: ''
  });
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  const handleSubmit = async (e) => {
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

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = simulateUploadProgress();

      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('title', formData.title.trim());
      uploadFormData.append('description', formData.description.trim());
      uploadFormData.append('type', formData.type);
      uploadFormData.append('tags', formData.tags);

      // Upload file to R2 via API
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadResult = await uploadResponse.json();

      // Create document data with R2 file info
      const documentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        fileName: uploadResult.file.fileName,
        originalFileName: uploadResult.file.originalName,
        fileSize: uploadResult.file.size,
        fileType: uploadResult.file.type,
        status: 'active',
        r2Storage: true,
        uploadedAt: uploadResult.file.uploadedAt
      };

      // Add document to mock service
      const newDocument = await mockDataService.addDocument(documentData);

      if (newDocument) {
        setSuccess('Document uploaded successfully to secure cloud storage!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          type: '',
          tags: ''
        });
        setFile(null);
        
        // Redirect to documents page after a short delay
        setTimeout(() => {
          router.push('/documents');
        }, 3000);
      } else {
        setError('Failed to save document metadata');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(`Failed to upload document: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
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

        {/* Upload Form */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-8 corner-border corner-blue corner-normal radius-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enhanced File Upload */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Select File
              </label>
              <EnhancedFileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                acceptedTypes=".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.csv,.html,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z"
                maxSize={50 * 1024 * 1024} // 50MB
                disabled={uploading}
              />
            </div>

            {/* Upload Progress */}
            {uploading && uploadProgress > 0 && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg corner-border corner-cyan corner-fast radius-lg">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-blue-200">
                    <span>Uploading to secure cloud storage...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-blue-500/20 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300 corner-border corner-cyan corner-fast"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-blue-300 text-center">
                    {uploadProgress < 100 ? 'Encrypting and uploading...' : 'Finalizing upload...'}
                  </div>
                </div>
              </div>
            )}

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
                disabled={uploading || !file}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl electric-glow disabled:opacity-50 disabled:cursor-not-allowed corner-border corner-cyan corner-fast radius-lg"
              >
                {uploading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </div>
                ) : (
                  'Upload Document'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
