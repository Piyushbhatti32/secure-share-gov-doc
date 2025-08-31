import { Inter } from 'next/font/google';
import './globals.css';
import ClerkProviderWrapper from '@/components/ClerkProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

// Remove R2 environment checks and logs

export const metadata = {
  title: 'SecureShare - Secure Document Management',
  description: 'Upload, store, and share your important documents securely with family members.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.0/css/all.min.css" 
          integrity="sha512-..." 
          crossOrigin="anonymous" 
        />
      </head>
      <body className={inter.className}>
        <ClerkProviderWrapper>
          {children}
        </ClerkProviderWrapper>
      </body>
    </html>
  );
} 