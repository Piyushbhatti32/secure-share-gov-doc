'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
import { useState } from 'react';

export default function Navbar() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isLoaded) {
    return (
      <nav className="bg-black/80 backdrop-blur-sm border-b border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="w-32 h-8 bg-blue-500/20 rounded animate-pulse"></div>
            <div className="w-32 h-8 bg-blue-500/20 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-black/80 backdrop-blur-sm border-b border-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white electric-text">SecureDocShare</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isSignedIn && (
              <>
                <Link
                  href="/dashboard"
                  className="text-blue-200 hover:text-white transition-colors duration-300"
                >
                  Dashboard
                </Link>
                <Link
                  href="/documents"
                  className="text-blue-200 hover:text-white transition-colors duration-300"
                >
                  Documents
                </Link>
                <Link
                  href="/shared"
                  className="text-blue-200 hover:text-white transition-colors duration-300"
                >
                  Shared
                </Link>
                <Link
                  href="/security"
                  className="text-blue-200 hover:text-white transition-colors duration-300"
                >
                  Security
                </Link>
                {process.env.NODE_ENV === 'development' && (
                  <Link
                    href="/debug"
                    className="text-yellow-200 hover:text-yellow-100 transition-colors duration-300"
                  >
                    Debug
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <SignedIn>
              <UserButton afterSignOutUrl="/" appearance={{
                elements: {
                  userButtonAvatarBox: 'w-8 h-8',
                  userButtonTrigger: 'text-blue-200 hover:text-white',
                }
              }} />
            </SignedIn>
            <SignedOut>
              <div className="flex items-center space-x-4">
                <SignInButton mode="redirect" redirectUrl="/dashboard">
                  <button className="text-blue-200 hover:text-white transition-colors duration-300">Sign In</button>
                </SignInButton>
                <SignUpButton mode="redirect" redirectUrl="/dashboard">
                  <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl electric-glow">Sign Up</button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-blue-200 hover:text-white transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/90 backdrop-blur-sm border-t border-blue-500/30">
              {isSignedIn && (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-blue-200 hover:text-white hover:bg-blue-500/20 rounded-md transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/documents"
                    className="block px-3 py-2 text-blue-200 hover:text-white hover:bg-blue-500/20 rounded-md transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Documents
                  </Link>
                  <Link
                    href="/shared"
                    className="block px-3 py-2 text-blue-200 hover:text-white hover:bg-blue-500/20 rounded-md transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Shared
                  </Link>
                  <Link
                    href="/security"
                    className="block px-3 py-2 text-blue-200 hover:text-white hover:bg-blue-500/20 rounded-md transition-colors duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Security
                  </Link>
                  {process.env.NODE_ENV === 'development' && (
                    <Link
                      href="/debug"
                      className="block px-3 py-2 text-yellow-200 hover:text-yellow-100 hover:bg-yellow-500/20 rounded-md transition-colors duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Debug
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
