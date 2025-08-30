'use client';

import { useState, useEffect } from 'react';

export default function CloudinaryConfigurationChecker() {
  const [status, setStatus] = useState({
    loading: true,
    configured: false,
    cloudName: '',
    uploadPreset: '',
    hasApiKey: false,
    hasApiSecret: false
  });

  useEffect(() => {
    checkCloudinaryStatus();
  }, []);

  const checkCloudinaryStatus = async () => {
    try {
      const response = await fetch('/api/cloudinary-status');
      const data = await response.json();
      setStatus({
        loading: false,
        ...data
      });
    } catch (error) {
      console.error('Failed to check Cloudinary status:', error);
      setStatus({
        loading: false,
        configured: false,
        cloudName: '',
        uploadPreset: '',
        hasApiKey: false,
        hasApiSecret: false
      });
    }
  };

  if (status.loading) {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400 mr-3"></div>
          <div className="text-yellow-200">Checking Cloudinary configuration...</div>
        </div>
      </div>
    );
  }

  if (status.configured) {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-green-400 mr-3">☁️</div>
            <div>
              <p className="text-green-200 font-medium">Cloudinary Storage Configured</p>
              <p className="text-green-300 text-sm">
                Cloud: {status.cloudName} • Preset: {status.uploadPreset}
              </p>
            </div>
          </div>
          <div className="text-green-400">✅</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-red-400 mr-3">⚠️</div>
          <div>
            <p className="text-red-200 font-medium">Cloudinary Storage Not Configured</p>
            <p className="text-red-300 text-sm">
              Uploads will not work until Cloudinary is properly configured
            </p>
            <div className="mt-2 text-xs text-red-400 space-y-1">
              {!status.cloudName && <div>• Missing Cloud Name</div>}
              {!status.uploadPreset && <div>• Missing Upload Preset</div>}
              {!status.hasApiKey && <div>• Missing API Key</div>}
              {!status.hasApiSecret && <div>• Missing API Secret</div>}
            </div>
          </div>
        </div>
        <div className="text-red-400">❌</div>
      </div>
    </div>
  );
}
