'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Header/Navigation */}
      <nav className="gov-header">
        <div className="bg-slate-800 text-white py-2 px-4 text-center text-sm">
          Government of India | Digital Document Management Portal
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <div className="emblem relative w-[50px] h-[50px]">
                <Image 
                  src="/icon.svg" 
                  alt="SecureDocShare Logo" 
                  width={50} 
                  height={50}
                  priority
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SecureDocShare</h1>
                <p className="text-sm text-gray-600">Digital Document Management</p>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/login" className="nav-link">Login</Link>
              <Link href="/register" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Secure Digital Document Management Made Simple
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Store, manage, and share your important documents securely. 
                Experience the convenience of digital document management with 
                enterprise-grade security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="btn btn-primary btn-lg">
                  Get Started
                </Link>
                <Link href="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="relative h-[400px]">
              <Image
                src="/file.svg"
                alt="Document Management Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-slate-50">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-shield-alt text-2xl text-primary-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Storage
              </h3>
              <p className="text-gray-600">
                Enterprise-grade encryption and secure cloud storage for your sensitive documents.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-slate-50">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-share-alt text-2xl text-primary-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Sharing
              </h3>
              <p className="text-gray-600">
                Share documents securely with other users while maintaining full control.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-slate-50">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-history text-2xl text-primary-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Version Control
              </h3>
              <p className="text-gray-600">
                Track document history and maintain multiple versions with ease.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px]">
              <Image
                src="/globe.svg"
                alt="Global Access Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose SecureDocShare?
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-600">
                    <strong className="text-gray-900">24/7 Access:</strong> Secure access to your documents anytime, anywhere
                  </span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-600">
                    <strong className="text-gray-900">Enhanced Security:</strong> Advanced encryption and access controls
                  </span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-600">
                    <strong className="text-gray-900">Easy Organization:</strong> Smart categorization and search capabilities
                  </span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                  <span className="text-gray-600">
                    <strong className="text-gray-900">Activity Tracking:</strong> Comprehensive audit trails and notifications
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 text-primary-100">
            Join thousands of users who trust SecureDocShare for their document management needs.
          </p>
          <Link href="/register" className="btn btn-white btn-lg">
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <p className="text-slate-300">
                SecureDocShare is a secure platform for managing and sharing important documents digitally.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-slate-300 hover:text-white">Login</Link></li>
                <li><Link href="/register" className="text-slate-300 hover:text-white">Register</Link></li>
                <li><Link href="/documents" className="text-slate-300 hover:text-white">Documents</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-slate-300 hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="text-slate-300 hover:text-white">Contact Us</Link></li>
                <li><Link href="/faq" className="text-slate-300 hover:text-white">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-slate-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-slate-300 hover:text-white">Terms of Service</Link></li>
                <li><Link href="/security" className="text-slate-300 hover:text-white">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-300">
            <p>&copy; {new Date().getFullYear()} SecureDocShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
