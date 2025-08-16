'use client';

import Link from 'next/link';

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Help Center</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">How to Create an Account</h3>
                <p className="mt-2 text-gray-600">To create an account, click on the &quot;Get Started&quot; button and follow the registration process. You&apos;ll need to provide your email address and create a password.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Uploading Documents</h3>
                <p className="mt-2 text-gray-600">Navigate to the Documents section and click on the &quot;Upload&quot; button. You can drag and drop files or browse to select them from your computer.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Sharing Documents</h3>
                <p className="mt-2 text-gray-600">Open any document and click the &quot;Share&quot; button. Enter the email address of the person you want to share with and set their access permissions.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Common Issues</h2>
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Forgot Password</h3>
                <p className="mt-2 text-gray-600">Click on the &quot;Forgot Password&quot; link on the login page. Enter your email address to receive password reset instructions.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Document Access Issues</h3>
                <p className="mt-2 text-gray-600">If you can&apos;t access a shared document, ensure you&apos;re logged in and have been granted the proper permissions by the document owner.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional Resources</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <ul className="space-y-4">
                <li>
                  <Link href="/faq" className="text-primary-600 hover:text-primary-700">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-primary-600 hover:text-primary-700">
                    Contact Support Team
                  </Link>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
