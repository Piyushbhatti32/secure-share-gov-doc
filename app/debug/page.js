'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';

export default function DebugPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [cloudinaryStatus, setCloudinaryStatus] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      return;
    }

    runTests();
  }, [isLoaded, isSignedIn]);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test Cloudinary status
      const cloudinaryResponse = await fetch('/api/cloudinary-status');
      results.cloudinaryStatus = await cloudinaryResponse.json();

      // Test Cloudinary integration
      const testResponse = await fetch('/api/test-cloudinary');
      results.cloudinaryTest = await testResponse.json();

      // Test download API with the actual uploaded file
      const downloadResponse = await fetch('/api/download?file=secure-docs/Black%20White%20Grayscale%20Portfolio%20Presentation');
      results.downloadTest = await downloadResponse.json();

    } catch (error) {
      console.error('Test error:', error);
      results.error = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">Running diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white electric-text mb-8">
          Debug & Diagnostics
        </h1>

        <div className="space-y-6">
          {/* Cloudinary Status */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <h2 className="text-xl font-semibold text-white electric-text mb-4">
              Cloudinary Configuration
            </h2>
            <pre className="text-green-200 text-sm overflow-auto">
              {JSON.stringify(cloudinaryStatus, null, 2)}
            </pre>
          </div>

          {/* Cloudinary Test */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <h2 className="text-xl font-semibold text-white electric-text mb-4">
              Cloudinary Integration Test
            </h2>
            <pre className="text-green-200 text-sm overflow-auto">
              {JSON.stringify(testResults.cloudinaryTest, null, 2)}
            </pre>
          </div>

          {/* Download API Test */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <h2 className="text-xl font-semibold text-white electric-text mb-4">
              Download API Test
            </h2>
            <pre className="text-green-200 text-sm overflow-auto">
              {JSON.stringify(testResults.downloadTest, null, 2)}
            </pre>
          </div>

          {/* Error Display */}
          {testResults.error && (
            <div className="bg-red-500/10 rounded-lg border border-red-500/30 p-6">
              <h2 className="text-xl font-semibold text-red-300 mb-4">Error</h2>
              <p className="text-red-200">{testResults.error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={runTests}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
            >
              Run Tests Again
            </button>
            <button
              onClick={() => window.location.href = '/documents'}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300"
            >
              Back to Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
