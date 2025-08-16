'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateQRCodeData } from '@/lib/utils/2fa';

export default function TwoFactorSetup({ secret, email, onVerify, onCancel }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const qrCodeData = generateQRCodeData(secret, email);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setVerifying(true);

    try {
      await onVerify(verificationCode);
      setShowBackupCodes(true);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (showBackupCodes) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Save Your Backup Codes
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Keep these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </p>
          </div>
          <div className="mt-5">
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <code className="text-gray-700">{code}</code>
                  {index < backupCodes.length - 1 && <div className="border-b border-gray-200 w-full mx-2"></div>}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(backupCodes.join('\n'));
              }}
              className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Copy to Clipboard
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-3 ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Print Codes
            </button>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Set Up Two-Factor Authentication
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Scan this QR code with your authenticator app (like Google Authenticator or Authy).
          </p>
        </div>
        <div className="mt-5 flex justify-center">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <QRCodeSVG value={qrCodeData} size={200} />
          </div>
        </div>
        <div className="mt-5 max-w-xl text-sm text-gray-500">
          <p>
            Can&apos;t scan the code? Enter this key manually in your authenticator app:
          </p>
          <code className="mt-2 block bg-gray-50 p-2 rounded font-mono">
            {secret}
          </code>
        </div>
        <form onSubmit={handleVerify} className="mt-5">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          <div className="sm:flex sm:items-center">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="code" className="sr-only">
                Verification Code
              </label>
              <input
                type="text"
                name="code"
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-4 sm:flex-shrink-0">
              <button
                type="submit"
                disabled={verifying || verificationCode.length !== 6}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {verifying ? 'Verifying...' : 'Verify & Enable'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="mt-3 sm:mt-0 sm:ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
