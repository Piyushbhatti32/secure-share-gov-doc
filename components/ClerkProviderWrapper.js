'use client';

import { ClerkProvider } from "@clerk/nextjs";

export default function ClerkProviderWrapper({ children }) {
  // Check if we're in a build environment or if Clerk key is missing/invalid
  const isBuildTime = process.env.NODE_ENV === 'production' && 
    (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
     process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder') ||
     process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('dummy'));
  
  if (isBuildTime) {
    // During build time, render children without Clerk provider
    // This prevents Clerk from trying to validate invalid keys during build
    return <>{children}</>;
  }

  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
