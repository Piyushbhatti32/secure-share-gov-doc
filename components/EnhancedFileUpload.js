'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export default function EnhancedFileUpload({ 
  onFileSelect, 
  onFileRemove, 
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  acceptedTypes = "*",
  maxSize = 50 * 1024 * 1024, // 50MB default
  className = "",
  disabled = false,
  autoUpload = false,
  triggerUpload = false // New prop for manual trigger
}) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validation, setValidation] = useState({
    scanning: false,
    scanned: false,
    secure: false,
    error: null
  });
  const [uploadStatus, setUploadStatus] = useState({
    status: 'idle', // idle, uploading, success, error
    message: '',
    details: null
  });

  const abortControllerRef = useRef(null);
  const triggerConsumedRef = useRef(false);
  const startingUploadRef = useRef(false);
  const lastCompleteIdRef = useRef(null);

  const validateFile = async (selectedFile) => {
    setValidation({
      scanning: true,
      scanned: false,
      secure: false,
      error: null
    });

    try {
      // File size validation
      if (selectedFile.size > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
        throw new Error(`File size must be less than ${maxSizeMB}MB`);
      }

      // File type validation (if specific types are specified)
      if (acceptedTypes !== "*") {
        const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
        
        const isValidType = allowedTypes.some(type => {
          if (type.startsWith('.')) {
            return fileExtension === type.slice(1);
          }
          return selectedFile.type === type || selectedFile.type === '';
        });
        
        if (!isValidType) {
          throw new Error(`File type not supported. Allowed: ${allowedTypes.join(', ')}`);
        }
      }

      // Security checks
      const fileName = selectedFile.name.toLowerCase();
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.ps1'];
      const hasDangerousExtension = dangerousExtensions.some(ext => fileName.endsWith(ext));
      
      if (hasDangerousExtension) {
        throw new Error('Executable files are not allowed for security reasons.');
      }

      // File content validation (basic)
      if (selectedFile.size === 0) {
        throw new Error('File appears to be empty.');
      }

      // Simulate security scanning (in real app, this would call a security service)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setValidation({
        scanning: false,
        scanned: true,
        secure: true,
        error: null
      });

      return true;
    } catch (error) {
      setValidation({
        scanning: false,
        scanned: true,
        secure: false,
        error: error.message
      });
      return false;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.warn('No file selected for upload.');
      return;
    }
    if (!validation.secure) {
      console.warn('File validation failed. Cannot upload.');
      return;
    }

    try {
      if (startingUploadRef.current) {
        console.log('⚠️ Upload already starting, skipping duplicate trigger');
        return;
      }
      startingUploadRef.current = true;
      await uploadFile(file); // Call uploadFile for single file upload
    } catch (error) {
      console.error('Upload failed:', error);
      onUploadError?.(error);
    }
  };

  const uploadFile = async (selectedFile, metadata = {}) => {
    if (!selectedFile) return;

    return new Promise((resolve, reject) => {
      setUploading(true);
      setUploadProgress(0);
      setUploadStatus({
        status: 'uploading',
        message: 'Preparing upload...',
        details: null
      });

      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      Object.keys(metadata).forEach(key => {
        if (metadata[key] !== undefined && metadata[key] !== '') {
          formData.append(key, metadata[key]);
        }
      });

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setUploadProgress(percent);
          onUploadProgress?.(percent);
        }
      };

      xhr.onload = () => {
        setUploading(false);
        startingUploadRef.current = false;
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(100);
          setUploadStatus({
            status: 'success',
            message: 'Upload completed successfully!',
            details: xhr.response
          });
          try {
            const result = JSON.parse(xhr.response);
            const resultId = result?.document?.cloudinaryId || result?.cloudinaryId || result?.documentId || result?.id;
            if (resultId && lastCompleteIdRef.current === resultId) {
              console.log('⚠️ Duplicate upload completion detected, ignoring callback for', resultId);
            } else {
              lastCompleteIdRef.current = resultId || Date.now();
              onUploadComplete?.(result);
            }
            resolve(result);
          } catch (e) {
            onUploadError?.(e);
            reject(e);
          }
        } else {
          setUploadStatus({
            status: 'error',
            message: `Upload failed: ${xhr.statusText}`,
            details: xhr.response
          });
          onUploadError?.(xhr.statusText);
          reject(new Error(xhr.statusText));
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        startingUploadRef.current = false;
        setUploadStatus({
          status: 'error',
          message: 'Upload failed: Network error',
          details: null
        });
        onUploadError?.(new Error('Network error'));
        reject(new Error('Network error'));
      };

      // Support abort
      abortControllerRef.current = {
        abort: () => xhr.abort()
      };

      xhr.send(formData);
    });
  };

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    const isValid = await validateFile(selectedFile);
    if (isValid) {
      setFile(selectedFile);
      onFileSelect?.(selectedFile);
      
      // Auto-upload if enabled
      if (autoUpload) {
        await uploadFile(selectedFile);
      }
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      await handleFileSelect(selectedFile);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      await handleFileSelect(selectedFile);
    }
  }, []);

  const handleRemoveFile = () => {
    // Cancel ongoing upload if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setFile(null);
    setUploadProgress(0);
    setUploadStatus({
      status: 'idle',
      message: '',
      details: null
    });
    setValidation({
      scanning: false,
      scanned: false,
      secure: false,
      error: null
    });
    lastCompleteIdRef.current = null;
    onFileRemove?.();
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('text')) return '📝';
    if (fileType.includes('word') || fileType.includes('document')) return '📘';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return '📦';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('video')) return '🎬';
    return '📁';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'uploading': return 'blue';
      default: return 'blue';
    }
  };

  // Watch for triggerUpload prop changes
  useEffect(() => {
    console.log('🔍 triggerUpload changed:', triggerUpload);
    console.log('🔍 Current state:', { file: !!file, uploading, validationSecure: validation.secure });
    
    if (triggerUpload && file && validation.secure && !triggerConsumedRef.current) {
      if (!uploading) {
        console.log('🚀 Triggering upload from parent...');
        triggerConsumedRef.current = true;
        handleUpload();
      } else {
        console.log('⚠️ Upload already in progress, ignoring trigger');
      }
    } else if (triggerUpload) {
      console.log('⚠️ Cannot trigger upload:', {
        hasFile: !!file,
        isUploading: uploading,
        isSecure: validation.secure
      });
    }
    // Reset consumption when triggerUpload turns false
    if (!triggerUpload) {
      triggerConsumedRef.current = false;
    }
  }, [triggerUpload, file, uploading, validation.secure]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag & Drop Zone */}
      <div 
        className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
          dragActive 
            ? 'border-green-400/70 bg-green-500/10 scale-105' 
            : 'border-blue-500/30 hover:border-blue-400/50'
        } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                 onDragEnter={handleDrag}
         onDragLeave={handleDrag}
         onDragOver={handleDragOver}
         onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          {/* Upload Icon */}
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center">
            {dragActive ? (
              <div className="text-green-400 text-4xl animate-bounce">📤</div>
            ) : uploading ? (
              <div className="text-blue-400 text-4xl animate-spin">⏳</div>
            ) : (
              <div className="text-blue-400 text-4xl">📁</div>
            )}
          </div>

          {/* Upload Text */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-blue-200">
              {dragActive ? 'Drop your file here!' : 
               uploading ? 'Upload in progress...' : 'Upload a file'}
            </p>
            <p className="text-sm text-blue-300">
              {uploading ? 'Please wait while we upload your file' :
               'Drag and drop your file here, or '}
              {!uploading && (
                <label 
                  htmlFor="file-upload" 
                  className="text-blue-400 hover:text-blue-300 cursor-pointer underline"
                >
                  browse files
                </label>
              )}
            </p>
            <p className="text-xs text-blue-400">
              {acceptedTypes === "*" 
                ? "All file types supported" 
                : `Supported: ${acceptedTypes}`
              } • Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            id="file-upload"
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            accept={acceptedTypes}
            disabled={disabled || uploading}
          />
        </div>

        {/* Drag Overlay */}
        {dragActive && (
          <div className="absolute inset-0 bg-green-500/10 rounded-xl flex items-center justify-center">
            <div className="text-green-400 text-6xl animate-pulse">🎯</div>
          </div>
        )}
      </div>

      {/* File Validation Status */}
      {validation.scanning && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg corner-border corner-yellow corner-pulse radius-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400 mr-3"></div>
            <div>
              <p className="text-yellow-200 font-medium">Scanning file...</p>
              <p className="text-yellow-300 text-sm">Checking security and validating format</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg corner-border corner-cyan corner-fast radius-lg">
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-blue-200">
              <span>{uploadStatus.message}</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-blue-500/20 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300 corner-border corner-cyan corner-fast"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-blue-300">
                {uploadProgress < 100 ? 'Encrypting and uploading...' : 'Finalizing upload...'}
              </div>
              <button
                onClick={cancelUpload}
                className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-400/30 hover:border-red-400/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Status */}
      {uploadStatus.status !== 'idle' && !uploading && (
        <div className={`p-4 bg-${getStatusColor(uploadStatus.status)}-500/10 border border-${getStatusColor(uploadStatus.status)}-500/20 rounded-lg corner-border corner-${getStatusColor(uploadStatus.status)} ${uploadStatus.status === 'success' ? 'corner-glow' : 'corner-pulse'} radius-lg`}>
          <div className="flex items-center">
            <div className={`text-${getStatusColor(uploadStatus.status)}-400 mr-3`}>
              {uploadStatus.status === 'success' ? '✅' : '❌'}
            </div>
            <div>
              <p className={`text-${getStatusColor(uploadStatus.status)}-200 font-medium`}>
                {uploadStatus.status === 'success' ? 'Upload Complete' : 'Upload Failed'}
              </p>
              <p className={`text-${getStatusColor(uploadStatus.status)}-300 text-sm`}>
                {uploadStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File Selected & Valid */}
      {file && validation.scanned && validation.secure && !uploading && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg corner-border corner-green corner-glow radius-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getFileIcon(file.type)}</div>
              <div>
                <p className="text-green-200 font-medium">{file.name}</p>
                <p className="text-green-300 text-sm">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-green-300 bg-green-500/20 px-2 py-1 rounded-full">
                Secure ✓
              </span>
              <button
                onClick={handleRemoveFile}
                className="text-green-400 hover:text-green-300 p-1 rounded-full hover:bg-green-500/20 transition-colors"
                title="Remove file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Validation Error */}
      {validation.error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg corner-border corner-red corner-pulse radius-lg">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <p className="text-red-200 font-medium">Validation Failed</p>
              <p className="text-red-300 text-sm">{validation.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* File Type Preview */}
      {file && (
        <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-300">
            <span>File Type:</span>
            <span className="font-mono bg-blue-500/20 px-2 py-1 rounded">
              {file.type || 'Unknown'}
            </span>
            <span>•</span>
            <span>Size:</span>
            <span className="font-mono bg-blue-500/20 px-2 py-1 rounded">
              {formatFileSize(file.size)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
