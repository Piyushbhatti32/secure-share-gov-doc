'use client';

import Link from 'next/link';
import BackgroundAnimation from '@/components/auth/BackgroundAnimation';
import SignUpHeader from '@/components/auth/SignUpHeader';
import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Animation */}
      <BackgroundAnimation />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Main Card */}
          <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-blue-500/30 shadow-2xl overflow-hidden">
            {/* Electric Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 rounded-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            
            {/* Header */}
            <SignUpHeader />

            {/* Sign Up Form */}
            <div className="relative p-8">
              {/* Electric particles around form */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                <div className="absolute top-8 right-8 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                <div className="absolute top-12 left-12 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
              </div>

              <SignUpForm />
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="text-blue-300 hover:text-blue-200 transition-colors duration-300 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


