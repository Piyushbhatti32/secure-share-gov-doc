'use client';

import { useState, useCallback } from 'react';

export default function EnhancedFileUpload({ 
  onFileSelect, 
  onFileRemove, 
  acceptedTypes = "*",
  maxSize = 50 * 1024 * 1024, // 50MB default
  className = "",
  disabled = false
}) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [validation, setValidation] = useState({
    scanning: false,
    scanned: false,
    secure: false,
    error: null
  });

  const validateFile = async (selectedFile) => {
    setValidation({
      scanning: true,
      scanned: false,
      secure: false,
      error: null
    });

    // Simulate security scanning
    await new Promise(resolve => setTimeout(resolve, 1500));

    // File size validation
    if (selectedFile.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(0);
      setValidation({
        scanning: false,
        scanned: true,
        secure: false,
        error: `File size must be less than ${maxSizeMB}MB`
      });
      return false;
    }

    // File type validation (if specific types are specified)
    if (acceptedTypes !== "*") {
      const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.some(type => 
        type.startsWith('.') ? fileExtension === type.slice(1) : selectedFile.type === type
      )) {
        setValidation({
          scanning: false,
          scanned: true,
          secure: false,
          error: `File type not supported. Allowed: ${allowedTypes.join(', ')}`
        });
        return false;
      }
    }

    // Security scan simulation (90% success rate for demo)
    const isSecure = Math.random() > 0.1;
    
    if (!isSecure) {
      setValidation({
        scanning: false,
        scanned: true,
        secure: false,
        error: 'Security scan failed. File appears to be potentially unsafe.'
      });
      return false;
    }

    setValidation({
      scanning: false,
      scanned: true,
      secure: true,
      error: null
    });

    return true;
  };

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    const isValid = await validateFile(selectedFile);
    if (isValid) {
      setFile(selectedFile);
      onFileSelect?.(selectedFile);
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
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
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
    setFile(null);
    setValidation({
      scanning: false,
      scanned: false,
      secure: false,
      error: null
    });
    onFileRemove?.();
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag & Drop Zone */}
      <div 
        className={`relative border-2 border-dashed rounded-xl transition-all duration-300 ${
          dragActive 
            ? 'border-green-400/70 bg-green-500/10 scale-105' 
            : 'border-blue-500/30 hover:border-blue-400/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          {/* Upload Icon */}
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center">
            {dragActive ? (
              <div className="text-green-400 text-4xl animate-bounce">📤</div>
            ) : (
              <div className="text-blue-400 text-4xl">📁</div>
            )}
          </div>

          {/* Upload Text */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-blue-200">
              {dragActive ? 'Drop your file here!' : 'Upload a file'}
            </p>
            <p className="text-sm text-blue-300">
              Drag and drop your file here, or{' '}
              <label 
                htmlFor="file-upload" 
                className="text-blue-400 hover:text-blue-300 cursor-pointer underline"
              >
                browse files
              </label>
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
            disabled={disabled}
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

      {/* File Selected & Valid */}
      {file && validation.scanned && validation.secure && (
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
