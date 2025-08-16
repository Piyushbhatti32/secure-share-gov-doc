'use client';

export default function FAQ() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account & Registration</h2>
            <div className="space-y-4">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">How do I create an account?</h3>
                <p className="mt-2 text-gray-600">Click on the &quot;Get Started&quot; button on the homepage and follow the registration process. You&apos;ll need to provide your email address and create a secure password.</p>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">Is my account secure?</h3>
                <p className="mt-2 text-gray-600">Yes, we use industry-standard encryption and security measures to protect your account. We also offer two-factor authentication for additional security.</p>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">Can I change my email address?</h3>
                <p className="mt-2 text-gray-600">Yes, you can change your email address in your account settings. You&apos;ll need to verify the new email address before the change takes effect.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Documents & Storage</h2>
            <div className="space-y-4">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">What file types can I upload?</h3>
                <p className="mt-2 text-gray-600">We support most common document formats including PDF, Word (doc, docx), Excel (xls, xlsx), PowerPoint (ppt, pptx), and image files (jpg, png, gif).</p>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">How much storage do I get?</h3>
                <p className="mt-2 text-gray-600">Free accounts come with 5GB of storage. Premium accounts have higher storage limits and additional features.</p>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">How are my documents protected?</h3>
                <p className="mt-2 text-gray-600">All documents are encrypted both in transit and at rest. We use enterprise-grade security measures to ensure your documents remain private and secure.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sharing & Collaboration</h2>
            <div className="space-y-4">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">How do I share documents?</h3>
                <p className="mt-2 text-gray-600">Open the document you want to share, click the &quot;Share&quot; button, and enter the email address of the person you want to share with. You can set specific permissions for each person.</p>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">Can I revoke access to shared documents?</h3>
                <p className="mt-2 text-gray-600">Yes, you can revoke access at any time by going to the document&apos;s sharing settings and removing the person&apos;s access.</p>
              </div>
              
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900">Do recipients need an account?</h3>
                <p className="mt-2 text-gray-600">Yes, recipients need to create a free account to access shared documents. This helps us maintain security and track document access.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
