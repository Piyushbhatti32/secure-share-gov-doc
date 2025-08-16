'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getUserProfile, updateUser } from '@/lib/services/user-service';
import { handleError } from '@/lib/utils/error-handler';
import Navbar from '@/components/Navbar';
import TwoFactorSetup from '@/components/TwoFactorSetup';
import DocumentPasswordManager from '@/components/DocumentPasswordManager';
import Link from 'next/link';

export default function SecurityPage() {
  const [profile, setProfile] = useState(null);
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
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('Security page: useEffect started');
    console.log('Security page: Current auth state:', auth.currentUser);
    
    // Check Firebase configuration
    console.log('Security page: Firebase config check');
    console.log('Security page: Firebase app:', auth.app);
    console.log('Security page: Firebase auth domain:', auth.app.options.authDomain);
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Security page: Auth state changed', user ? `User logged in: ${user.email}` : 'No user');
      console.log('Security page: User object:', user);
      
      setAuthChecked(true);
      
      try {
        if (!user) {
          console.log('Security page: No user, redirecting to login');
          router.push('/login');
          return;
        }

        console.log('Security page: Getting user profile for', user.uid);
        const userProfile = await getUserProfile(user.uid);
        console.log('Security page: User profile loaded', userProfile);
        setProfile(userProfile);
        if (userProfile.securityPreferences) {
          setSecurityPreferences(userProfile.securityPreferences);
        }
      } catch (err) {
        console.error('Security page: Error loading profile', err);
        console.error('Security page: Error details:', {
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        const errorDetails = handleError(err);
        setError(errorDetails.message);
      } finally {
        console.log('Security page: Setting loading to false');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Don't render anything until auth is checked
  if (!authChecked) {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-primary-600 mb-4"></i>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSecurityPreferenceChange = async (key, value) => {
    try {
      setUpdating(true);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        router.push('/login');
        return;
      }

      const updatedPreferences = {
        ...securityPreferences,
        [key]: value
      };

      // If enabling 2FA, show setup modal
      if (key === 'twoFactorAuth' && value && !profile?.twoFactorAuth?.enabled) {
        setShow2FASetup(true);
        return;
      }

      await updateUser(userId, {
        securityPreferences: updatedPreferences
      });

      setSecurityPreferences(updatedPreferences);
      setProfile(prev => ({
        ...prev,
        securityPreferences: updatedPreferences
      }));
    } catch (err) {
      const errorDetails = handleError(err);
      setError(errorDetails.message);
    } finally {
      setUpdating(false);
    }
  };

  const handle2FAVerification = async (verificationCode) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        router.push('/login');
        return;
      }

      // Update user with 2FA enabled
      await updateUser(userId, {
        'twoFactorAuth.enabled': true,
        'twoFactorAuth.verifiedAt': new Date().toISOString()
      });

      setProfile(prev => ({
        ...prev,
        twoFactorAuth: {
          ...prev.twoFactorAuth,
          enabled: true,
          verifiedAt: new Date().toISOString()
        }
      }));

      setShow2FASetup(false);
    } catch (err) {
      throw new Error('2FA verification failed');
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-primary-600 mb-4"></i>
            <p className="text-gray-600">Loading security settings...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we load your security preferences</p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback if profile is null but not loading
  if (!profile) {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-yellow-600 mb-4"></i>
            <p className="text-gray-600">Unable to load profile</p>
            <p className="text-sm text-gray-500 mt-2">Please try refreshing the page or contact support</p>
            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <Navbar />
      

      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account security and privacy preferences</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Two-Factor Authentication */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Authenticator App</h3>
                  <p className="text-sm text-gray-500">
                    {profile?.twoFactorAuth?.enabled 
                      ? 'Two-factor authentication is enabled'
                      : 'Use an authenticator app to generate verification codes'
                    }
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile?.twoFactorAuth?.enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile?.twoFactorAuth?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              {!profile?.twoFactorAuth?.enabled ? (
                <button
                  onClick={() => handleSecurityPreferenceChange('twoFactorAuth', true)}
                  disabled={updating}
                  className="btn btn-primary"
                >
                  <i className="fas fa-shield-alt mr-2"></i>
                  Enable 2FA
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">
                    <i className="fas fa-check-circle mr-1"></i>
                    Two-factor authentication is active
                  </p>
                  <button
                    onClick={() => handleSecurityPreferenceChange('twoFactorAuth', false)}
                    disabled={updating}
                    className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Disable 2FA
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Password Management */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Password Management</h2>
              <p className="text-sm text-gray-500">Manage document passwords and encryption</p>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Document Encryption</h3>
                  <p className="text-sm text-gray-500">
                    Add password protection to your sensitive documents
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Default encryption for new documents</span>
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
                  <i className="fas fa-key mr-2"></i>
                  Manage Document Passwords
                </button>

                <Link
                  href="/encryption"
                  className="btn btn-outline block text-center"
                >
                  <i className="fas fa-lock mr-2"></i>
                  Encryption Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Notification Preferences</h2>
              <p className="text-sm text-gray-500">Control when you receive notifications</p>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Login notifications</span>
                    <p className="text-xs text-gray-500">Get notified when someone logs into your account</p>
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
                    <span className="text-sm font-medium text-gray-700">Document share notifications</span>
                    <p className="text-xs text-gray-500">Get notified when documents are shared with you</p>
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
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Security Summary</h2>
              <p className="text-sm text-gray-500">Overview of your account security</p>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Email verification</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i className="fas fa-check mr-1"></i>
                    Verified
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Two-factor authentication</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile?.twoFactorAuth?.enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <i className={`fas fa-${profile?.twoFactorAuth?.enabled ? 'check' : 'exclamation-triangle'} mr-1`}></i>
                    {profile?.twoFactorAuth?.enabled ? 'Enabled' : 'Recommended'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Last login</span>
                  <span className="text-sm text-gray-500">
                    {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2FA Setup Modal */}
        {show2FASetup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <TwoFactorSetup
                  secret={profile?.twoFactorAuth?.secret}
                  email={auth.currentUser?.email}
                  onVerify={handle2FAVerification}
                  onCancel={() => setShow2FASetup(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Password Manager Modal */}
        {showPasswordManager && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <DocumentPasswordManager
                  documentId={null}
                  userId={auth.currentUser?.uid}
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