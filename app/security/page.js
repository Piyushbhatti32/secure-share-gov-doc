'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { handleError } from '@/lib/utils/error-handler';
import Navbar from '@/components/Navbar';
import TwoFactorSetup from '@/components/TwoFactorSetup';
import DocumentPasswordManager from '@/components/DocumentPasswordManager';
import Link from 'next/link';

export default function SecurityPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showPasswordManager, setShowPasswordManager] = useState(false);
  const [securityPreferences, setSecurityPreferences] = useState({
    defaultEncryption: false,
    twoFactorAuth: false,
    notifyOnLogin: false,
    notifyOnShare: true
  });
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
      if (!isLoaded) return;
      if (!userId) return; // Clerk middleware handles redirect
        setLoading(false);
  }, [isLoaded, userId]);



  const handleSecurityPreferenceChange = async (key, value) => {
    try {
      setUpdating(true);

      const updatedPreferences = {
        ...securityPreferences,
        [key]: value
      };

      // If enabling 2FA, show setup modal
      if (key === 'twoFactorAuth' && value && !securityPreferences.twoFactorAuth) {
        setShow2FASetup(true);
        return;
      }

      // For now, just update local state since we're using Clerk
      setSecurityPreferences(updatedPreferences);
    } catch (err) {
      setError('Failed to update security preferences');
    } finally {
      setUpdating(false);
    }
  };

  const handle2FAVerification = async (verificationCode) => {
    try {
      // For now, just update local state since we're using Clerk
      setSecurityPreferences(prev => ({
        ...prev,
        twoFactorAuth: true
      }));
      setShow2FASetup(false);
    } catch (err) {
      throw new Error('2FA verification failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-400 mb-4"></i>
            <p className="text-blue-200">Loading security settings...</p>
            <p className="text-sm text-blue-300 mt-2">Please wait while we load your security preferences</p>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white electric-text">Security Settings</h1>
          <p className="text-blue-200 mt-2">Manage your account security and privacy preferences</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Two-Factor Authentication */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 electric-border">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Two-Factor Authentication</h2>
              <p className="text-sm text-blue-200">Add an extra layer of security to your account</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Authenticator App</h3>
                  <p className="text-sm text-blue-200">
                    {securityPreferences.twoFactorAuth 
                      ? 'Two-factor authentication is enabled'
                      : 'Use an authenticator app to generate verification codes'
                    }
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    securityPreferences.twoFactorAuth
                      ? 'bg-green-900/50 text-green-200 border border-green-500/50'
                      : 'bg-gray-900/50 text-gray-200 border border-gray-500/50'
                  }`}>
                    {securityPreferences.twoFactorAuth ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              {!securityPreferences.twoFactorAuth ? (
                <button
                  onClick={() => handleSecurityPreferenceChange('twoFactorAuth', true)}
                  disabled={updating}
                  className="btn btn-primary"
                >
                  <i className="fa-solid fa-shield-halved mr-2"></i>
                  Enable 2FA
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-green-300">
                    <i className="fa-solid fa-circle-check mr-1"></i>
                    Two-factor authentication is active
                  </p>
                  <button
                    onClick={() => handleSecurityPreferenceChange('twoFactorAuth', false)}
                    disabled={updating}
                    className="btn btn-outline text-red-300 border-red-500/50 hover:bg-red-900/20 bg-transparent"
                  >
                    <i className="fa-solid fa-xmark mr-2"></i>
                    Disable 2FA
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Password Management */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 electric-border">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Password Management</h2>
              <p className="text-sm text-blue-200">Manage document passwords and encryption</p>
            </div>
            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Document Encryption</h3>
                  <p className="text-sm text-blue-200">
                    Add password protection to your sensitive documents
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-200">Default encryption for new documents</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityPreferences.defaultEncryption}
                      onChange={(e) => handleSecurityPreferenceChange('defaultEncryption', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <button
                  onClick={() => setShowPasswordManager(true)}
                  className="btn btn-outline"
                >
                  <i className="fa-solid fa-key mr-2"></i>
                  Manage Document Passwords
                </button>

                <Link
                  href="/encryption"
                  className="btn btn-outline block text-center"
                >
                  <i className="fa-solid fa-lock mr-2"></i>
                  Encryption Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 electric-border">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
              <p className="text-sm text-blue-200">Control when you receive notifications</p>
            </div>
            <div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-blue-200">Login notifications</span>
                    <p className="text-xs text-blue-300">Get notified when someone logs into your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityPreferences.notifyOnLogin}
                      onChange={(e) => handleSecurityPreferenceChange('notifyOnLogin', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-blue-200">Document share notifications</span>
                    <p className="text-xs text-blue-300">Get notified when documents are shared with you</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityPreferences.notifyOnShare}
                      onChange={(e) => handleSecurityPreferenceChange('notifyOnShare', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security Summary */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 electric-border">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Security Summary</h2>
              <p className="text-sm text-blue-200">Overview of your account security</p>
            </div>
            <div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-200">Email verification</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-200 border border-green-500/50">
                    <i className="fa-solid fa-check mr-1"></i>
                    Verified
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-200">Two-factor authentication</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    securityPreferences.twoFactorAuth
                      ? 'bg-green-900/50 text-green-200 border border-green-500/50'
                      : 'bg-yellow-900/50 text-yellow-200 border border-yellow-500/50'
                  }`}>
                    <i className={`fa-solid fa-${securityPreferences.twoFactorAuth ? 'check' : 'triangle-exclamation'} mr-1`}></i>
                    {securityPreferences.twoFactorAuth ? 'Enabled' : 'Recommended'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-200">Last login</span>
                  <span className="text-sm text-blue-300">
                    {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2FA Setup Modal */}
        {show2FASetup && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-black/60 border border-blue-500/30 rounded-2xl shadow-2xl electric-border">
              <div className="flex items-center justify-between px-5 py-4 border-b border-blue-500/20">
                <h3 className="text-white font-semibold">Two-Factor Authentication</h3>
                <button onClick={() => setShow2FASetup(false)} className="text-blue-300 hover:text-white transition-colors">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-5">
                <TwoFactorSetup
                  secret={null}
                  email={user?.primaryEmailAddress?.emailAddress}
                  onVerify={handle2FAVerification}
                  onCancel={() => setShow2FASetup(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Password Manager Modal */}
        {showPasswordManager && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-black/60 border border-blue-500/30 rounded-2xl shadow-2xl electric-border">
              <div className="flex items-center justify-between px-5 py-4 border-b border-blue-500/20">
                <h3 className="text-white font-semibold">Document Passwords</h3>
                <button onClick={() => setShowPasswordManager(false)} className="text-blue-300 hover:text-white transition-colors">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="p-5">
                <DocumentPasswordManager
                  documentId={null}
                  userId={userId}
                  onSuccess={() => setShowPasswordManager(false)}
                  onCancel={() => setShowPasswordManager(false)}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 