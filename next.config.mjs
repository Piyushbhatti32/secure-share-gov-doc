// Load environment variables from .env.local
import { readFileSync } from 'fs';
import { join } from 'path';

// Read .env.local file manually
let envVars = {};
try {
  const envPath = join(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0 && !key.startsWith('#')) {
      const value = valueParts.join('=').trim();
      if (value) {
        envVars[key.trim()] = value;
      }
    }
  });
  console.log('Loaded environment variables:', Object.keys(envVars));
} catch (error) {
  console.warn('Could not read .env.local file:', error.message);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Load environment variables for build time
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    CLERK_SECRET_KEY: envVars.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY || '',
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: envVars.NEXT_PUBLIC_CLERK_SIGN_IN_URL || process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: envVars.NEXT_PUBLIC_CLERK_SIGN_UP_URL || process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: envVars.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/dashboard',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: envVars.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/dashboard',
    NEXT_PUBLIC_CLERK_FALLBACK_REDIRECT_URL: envVars.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/dashboard',
  },
  
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Remove problematic output: 'standalone' setting
  // output: 'standalone',
  
  images: {
    domains: [
      'images.clerk.dev',
      `${process.env.R2_ACCOUNT_ID || envVars.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    ],
    formats: ['image/avif', 'image/webp'],
  },

  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin'
        }
      ],
    },
  ],
};

export default nextConfig;
