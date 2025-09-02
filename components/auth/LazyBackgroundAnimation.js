'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lazy load the heavy background animation
const BackgroundAnimation = dynamic(() => import('./BackgroundAnimation'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900" />,
});

export default function LazyBackgroundAnimation() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Only load animation after page is fully loaded and user has interacted
    const handleLoad = () => {
      // Wait for initial page load to complete
      setTimeout(() => {
        setShouldLoad(true);
      }, 2000); // 2 second delay for better performance
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (!shouldLoad) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-purple-900">
        {/* Simple static gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 animate-pulse" />
      </div>
    );
  }

  return <BackgroundAnimation />;
}
