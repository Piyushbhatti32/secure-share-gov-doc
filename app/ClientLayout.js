'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

const publicPaths = [
  '/',
  '/sign-in',
  '/sign-up',
  '/help',
  '/contact',
  '/faq',
  '/privacy',
  '/terms'
];

export default function ClientLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    
    // Check if current path is a public path or starts with sign-in/sign-up
    const isPublicPath = publicPaths.includes(pathname) || 
                        pathname.startsWith('/sign-in') || 
                        pathname.startsWith('/sign-up');
    
    if (isSignedIn && isPublicPath) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, pathname, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return children;
}
