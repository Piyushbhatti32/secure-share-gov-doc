import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Clone the response to add security headers
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://*.googleapis.com https://*.google.com https://*.firebaseio.com;"
  );

  // Rate limiting could be added here

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/documents/:path*',
  ],
};
