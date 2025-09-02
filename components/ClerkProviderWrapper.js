'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import LoadingSpinner from "./ui/LoadingSpinner";
import ErrorBoundary from "./ui/ErrorBoundary";

export default function ClerkProviderWrapper({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [clerkError, setClerkError] = useState(null);

  useEffect(() => {
    // Check Clerk configuration
    const checkClerkConfig = () => {
      try {
        const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
        
        if (!publishableKey || 
            publishableKey.includes('placeholder') || 
            publishableKey.includes('dummy')) {
          setClerkError('Clerk configuration is missing or invalid');
        }
      } catch (error) {
        setClerkError('Failed to load Clerk configuration');
      } finally {
        setIsLoading(false);
      }
    };

    checkClerkConfig();
  }, []);

  // Check if we're in a build environment or if Clerk key is missing/invalid
  const isBuildTime = process.env.NODE_ENV === 'production' && 
    (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
     process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder') ||
     process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('dummy'));
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" color="white" className="mb-4" />
          <p className="text-white text-lg">Loading SecureDocShare...</p>
        </div>
      </div>
    );
  }

  if (clerkError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-red-500/30 p-8 max-w-2xl text-center">
          <div className="text-red-400 text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Authentication Service Unavailable
          </h1>
          <p className="text-red-200 mb-6">
            {clerkError}. Please check your configuration or contact support.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isBuildTime) {
    // During build time, render children without Clerk provider
    // This prevents Clerk from trying to validate invalid keys during build
    return <>{children}</>;
  }

  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
        {children}
      </ClerkProvider>
    </ErrorBoundary>
  );
}
