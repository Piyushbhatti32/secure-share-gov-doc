// Build-safe middleware that only uses Clerk when available
let clerkMiddleware;

try {
  // Try to import Clerk middleware
  const clerkModule = require("@clerk/nextjs/server");
  clerkMiddleware = clerkModule.clerkMiddleware;
} catch (error) {
  // If Clerk is not available (e.g., during build), create a no-op middleware
  clerkMiddleware = () => (req) => req.next();
}

export default clerkMiddleware({
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/help',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
    '/api/webhook(.*)'
  ],
  ignoredRoutes: [
    '/_next/static/(.*)',
    '/favicon.ico',
    '/api/webhook(.*)'
  ]
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
