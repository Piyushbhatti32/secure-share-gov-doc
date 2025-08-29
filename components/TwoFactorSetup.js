'use client';

import { useState } from 'react';

export default function TwoFactorSetup() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleEnable2FA = async () => {
    try {
      setIsVerifying(true);
      setError(null);
      
      // Simulate API call to enable 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEnabled(true);
      setSuccess('Two-factor authentication has been enabled successfully!');
    } catch (err) {
      setError('Failed to enable two-factor authentication');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setIsVerifying(true);
      setError(null);
      
      // Simulate API call to disable 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsEnabled(false);
      setSuccess('Two-factor authentication has been disabled');
    } catch (err) {
      setError('Failed to disable two-factor authentication');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Verification code verified successfully!');
      setVerificationCode('');
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white electric-text">
            Two-Factor Authentication
          </h3>
          <p className="text-blue-200 text-sm mt-1">
            Add an extra layer of security to your account
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={isEnabled ? handleDisable2FA : handleEnable2FA}
            className="sr-only peer"
            disabled={isVerifying}
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
        </label>
      </div>

      {isEnabled ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-200 text-sm">
                Two-factor authentication is now enabled for your account.
              </span>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-200 mb-2">Setup Instructions:</h4>
            <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
              <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>Scan the QR code or enter the setup key manually</li>
              <li>Enter the 6-digit code from your app to verify</li>
            </ol>
          </div>

          {/* Mock QR Code Placeholder */}
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-white/10 border border-blue-500/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                </svg>
                <p className="text-blue-200 text-sm">QR Code Placeholder</p>
                <p className="text-blue-300 text-xs">In a real app, this would show the actual QR code</p>
              </div>
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerifyCode} className="space-y-3">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-blue-200 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-4 py-2 bg-black/60 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent electric-focus"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying || !verificationCode.trim()}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        </div>
      ) : (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-yellow-200 text-sm">
              Two-factor authentication is currently disabled. Enable it to add an extra layer of security.
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="mt-4 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
    </div>
  );
}
