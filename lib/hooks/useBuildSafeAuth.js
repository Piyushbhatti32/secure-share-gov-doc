'use client';

import { useUser, useAuth } from '@clerk/nextjs';

// Hook that safely handles authentication during build time
export function useBuildSafeUser() {
  try {
    return useUser();
  } catch (error) {
    // During build time or when Clerk is not available
    return {
      user: null,
      isLoaded: true,
      isSignedIn: false,
      isSignedOut: true,
      primaryEmailAddress: null,
      fullName: null,
      emailAddresses: []
    };
  }
}

export function useBuildSafeAuth() {
  try {
    return useAuth();
  } catch (error) {
    // During build time or when Clerk is not available
    return {
      userId: null,
      isLoaded: true,
      isSignedIn: false,
      isSignedOut: true
    };
  }
}

