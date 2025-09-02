'use client';

import { useEffect, useState } from 'react';

export default function PerformanceOptimizer() {
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        const metrics = {
          pageLoadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
          domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
          firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
          timestamp: new Date().toISOString()
        };

        setPerformanceMetrics(metrics);

        // Log performance metrics to console
        console.group('🚀 Performance Metrics');
        console.log('Page Load Time:', metrics.pageLoadTime, 'ms');
        console.log('DOM Content Loaded:', metrics.domContentLoaded, 'ms');
        console.log('First Paint:', metrics.firstPaint, 'ms');
        console.log('First Contentful Paint:', metrics.firstContentfulPaint, 'ms');
        console.groupEnd();

        // Warn if performance is poor
        if (metrics.pageLoadTime > 3000) {
          console.warn('⚠️ Page load time is slow (>3s). Consider optimization.');
        }
        if (metrics.firstContentfulPaint > 1500) {
          console.warn('⚠️ First contentful paint is slow (>1.5s). Consider optimization.');
        }
      }
    };

    // Measure performance after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !performanceMetrics) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="font-bold mb-1">Performance</div>
      <div>Load: {performanceMetrics.pageLoadTime?.toFixed(0)}ms</div>
      <div>FCP: {performanceMetrics.firstContentfulPaint?.toFixed(0)}ms</div>
    </div>
  );
}
