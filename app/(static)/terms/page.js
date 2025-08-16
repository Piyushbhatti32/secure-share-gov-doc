'use client';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="bg-white shadow rounded-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing or using SecureDocShare, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use License</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Permission is granted to temporarily access the materials (information or software) on SecureDocShare&apos;s website for personal, non-commercial transitory viewing only.
              </p>
              <p>This license shall automatically terminate if you violate any of these restrictions and may be terminated by SecureDocShare at any time.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use the service in compliance with all applicable laws</li>
              <li>Not upload any illegal or harmful content</li>
              <li>Not attempt to breach or circumvent security measures</li>
              <li>Not interfere with other users&apos; access to the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Service Availability</h2>
            <p className="text-gray-600">
              We strive to provide uninterrupted service, but we do not guarantee that the service will be available at all times. We reserve the right to modify, suspend, or discontinue the service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Intellectual Property</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                The service and its original content, features, and functionality are owned by SecureDocShare and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-600">
              In no event shall SecureDocShare be liable for any damages arising out of the use or inability to use the materials on the website, even if SecureDocShare has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Governing Law</h2>
            <p className="text-gray-600">
              These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these terms of service at any time. We will notify users of any material changes by posting the new terms of service on this page.
            </p>
            <p className="mt-4 text-sm text-gray-500">Last Updated: August 16, 2025</p>
          </section>
        </div>
      </div>
    </div>
  );
}
