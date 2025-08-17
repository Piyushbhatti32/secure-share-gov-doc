'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { validateFileType, validateFileSize } from '@/lib/utils/form-validator';
import { handleError } from '@/lib/utils/error-handler';
import { logActivity, ActivityType } from '@/lib/services/activity-service';
import { uploadFileToDrive } from '@/lib/services/google-drive-service';
import { 
  checkGoogleDriveConnection, 
  setGoogleDriveConnected,
  refreshGoogleDriveConnection 
} from '@/lib/services/google-drive-connection-service';
import Navbar from '@/components/Navbar';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'other',
    description: ''
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check Google Drive connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('Checking Google Drive connection...');
        const connectionStatus = await checkGoogleDriveConnection();
        console.log('Connection status:', connectionStatus);
        
        if (connectionStatus.connected) {
          setIsGoogleConnected(true);
          setError(null);
        } else if (connectionStatus.needsRefresh) {
          // Try to refresh the connection automatically
          try {
            console.log('Attempting to refresh connection...');
            await refreshGoogleDriveConnection();
            setIsGoogleConnected(true);
            setError(null);
          } catch (refreshError) {
            console.error('Refresh failed:', refreshError);
            setIsGoogleConnected(false);
            setError('Google Drive connection expired. Please reconnect.');
          }
        } else {
          setIsGoogleConnected(false);
          if (connectionStatus.error) {
            console.error('Connection error:', connectionStatus.error);
            setError(connectionStatus.error);
          }
        }
      } catch (error) {
        console.error('Error checking Google Drive connection:', error);
        setIsGoogleConnected(false);
        setError('Failed to check Google Drive connection');
      }
    };

    // Check connection status on page load
    checkConnection();

    // Also handle URL parameters for new connections
    const connected = searchParams.get('connected');
    const setup = searchParams.get('setup');
    const error = searchParams.get('error');

    if (connected === 'true') {
      setIsGoogleConnected(true);
      setError(null);
      
      // If this is a new setup, save the connection status
      if (setup === 'true') {
        setGoogleDriveConnected(true);
      }
    } else if (error) {
      setError(decodeURIComponent(error));
    }
  }, [searchParams]);

  const connectToGoogle = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('You must be logged in to connect to Google Drive');
        return;
      }
      
      // Get the Google OAuth URL from the backend
      const response = await fetch(`/api/auth/google?userId=${currentUser.uid}`);
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Failed to get Google authentication URL');
      }
    } catch (error) {
      console.error('Error connecting to Google:', error);
      setError('Failed to initiate Google Drive connection');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      try {
        validateFileType(selectedFile);
        validateFileSize(selectedFile);
        setFile(selectedFile);
        setError(null);

        // Create preview URL
        const previewUrl = URL.createObjectURL(selectedFile);
        setPreview(previewUrl);
        
        // Auto-fill name if empty
        if (!formData.name) {
          setFormData(prev => ({
            ...prev,
            name: selectedFile.name.replace(/\.[^/.]+$/, '')
          }));
        }
      } catch (err) {
        setError(err.message);
        setFile(null);
        setPreview(null);
      }
    }
  };



  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!isGoogleConnected) {
      setError('Please connect your Google Drive account first');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Get the current user
    const currentUser = auth.currentUser;

    try {
      setUploadStatus('Preparing upload...');
      
      // Upload to Google Drive
      const driveResponse = await uploadFileToDrive(file);
      
      setUploadStatus('File uploaded successfully');

      setUploadStatus('Saving document information...');
      const { viewLink: downloadURL, fileId } = driveResponse;

      // Prepare document metadata
      const documentData = {
        name: formData.name || file.name.replace(/\.[^/.]+$/, ''),
        type: formData.type || 'other',
        description: formData.description || '',
        fileType: file.type,
        size: file.size,
        url: downloadURL,
        createdAt: new Date(),
        userId: auth.currentUser.uid,
        status: 'active',
        uploadedAt: new Date(),
        lastModified: new Date(),
        lastAccessed: new Date(),
        downloads: 0,
        sharedCount: 0,
        isShared: false
      };

      // Add document metadata to Firestore
      await addDoc(collection(db, 'documents'), documentData);

      router.push('/documents');
    } catch (err) {
      const errorDetails = handleError(err);
      setError(errorDetails.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="card-header">
            <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
            <p className="mt-1 text-sm text-gray-600">
              Upload your government documents securely
            </p>
          </div>

          <div className="card-body">
            {!isGoogleConnected && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fab fa-google text-blue-400"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Sign in with Google to automatically connect your Google Drive account and upload documents securely.
                    </p>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={connectToGoogle}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <i className="fab fa-google mr-2"></i>
                        Sign in with Google
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isGoogleConnected && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-check-circle text-green-400"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Google Drive is connected and ready for secure document uploads.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleUpload} id="uploadForm" className="space-y-6">
            <div className="w-full">
              <label className="form-label" htmlFor="file">
                Document File (PDF only)
              </label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-500 transition-colors duration-200"
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) {
                    handleFileChange({ target: { files: [droppedFile] } });
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add('border-primary-500');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('border-primary-500');
                }}
              >
                <div className="space-y-1 text-center">
                  {preview ? (
                    <div className="flex flex-col items-center">
                      <embed
                        src={preview}
                        type="application/pdf"
                        className="w-full h-48 mb-4 rounded border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file"
                          className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-700"
                        >
                          <span>Click to upload</span>
                          <input
                            id="file"
                            name="file"
                            type="file"
                            accept=".pdf"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Document Details */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Document Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="type" className="form-label">
                  Document Type
                </label>
                <select
                  id="type"
                  required
                  className="form-input"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="aadhar">Aadhar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="passport">Passport</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  rows="3"
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                ></textarea>
              </div>
            </div>
            </form>

            <div className="card-footer flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="uploadForm"
                disabled={loading || !file || !isGoogleConnected}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                    {uploadStatus}
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload mr-2"></i>
                    Upload Document
                  </>
                )}
              </button>
            </div>

            {/* Upload Progress */}
            {loading && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{uploadStatus}</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
