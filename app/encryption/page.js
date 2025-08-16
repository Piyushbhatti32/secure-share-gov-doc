'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getUserProfile, updateUser } from '@/lib/services/user-service';
import { handleError } from '@/lib/utils/error-handler';
import Navbar from '@/components/Navbar';

export default function EncryptionPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [encryptionSettings, setEncryptionSettings] = useState({
    defaultEncryption: false,
    encryptionStrength: 'AES-256',
    autoEncryptSensitive: false
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          router.push('/login');
          return;
        }

        const userProfile = await getUserProfile(user.uid);
        setProfile(userProfile);
        if (userProfile.encryptionSettings) {
          setEncryptionSettings(userProfile.encryptionSettings);
        }
      } catch (err) {
        const errorDetails = handleError(err);
        setError(errorDetails.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleEncryptionSettingChange = async (key, value) => {
    try {
      setUpdating(true);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        router.push('/login');
        return;
      }

      const updatedSettings = {
        ...encryptionSettings,
        [key]: value
      };

      await updateUser(userId, {
        encryptionSettings: updatedSettings
      });

      setEncryptionSettings(updatedSettings);
      setProfile(prev => ({
        ...prev,
        encryptionSettings: updatedSettings
      }));
    } catch (err) {
      const errorDetails = handleError(err);
      setError(errorDetails.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-primary-600 mb-4"></i>
            <p className="text-gray-600">Loading encryption settings...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Encryption Settings</h1>
          <p className="text-gray-600 mt-2">Configure document encryption and security preferences</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Default Encryption */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Default Encryption</h2>
              <p className="text-sm text-gray-500">Automatically encrypt new documents</p>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Enable Default Encryption</h3>
                  <p className="text-sm text-gray-500">
                    All new documents will be encrypted by default
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={encryptionSettings.defaultEncryption}
                    onChange={(e) => handleEncryptionSettingChange('defaultEncryption', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <i className="fas fa-info-circle text-blue-500 mt-0.5 mr-2"></i>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">How it works:</p>
                    <p className="mt-1">
                      When enabled, all new documents will be automatically encrypted using AES-256 encryption. 
                      You can still choose to disable encryption for specific documents during upload.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Encryption Strength */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Encryption Strength</h2>
              <p className="text-sm text-gray-500">Choose the encryption algorithm</p>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <label htmlFor="encryptionStrength" className="block text-sm font-medium text-gray-700 mb-2">
                    Encryption Algorithm
                  </label>
                  <select
                    id="encryptionStrength"
                    value={encryptionSettings.encryptionStrength}
                    onChange={(e) => handleEncryptionSettingChange('encryptionStrength', e.target.value)}
                    className="form-select"
                  >
                    <option value="AES-256">AES-256 (Recommended)</option>
                    <option value="AES-192">AES-192</option>
                    <option value="AES-128">AES-128</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Higher bit strength provides better security but may impact performance
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <i className="fas fa-shield-alt text-green-500 mt-0.5 mr-2"></i>
                    <div className="text-sm text-green-700">
                      <p className="font-medium">AES-256 Encryption</p>
                      <p className="mt-1">
                        Military-grade encryption that provides excellent security for your sensitive documents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-encrypt Sensitive Documents */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Smart Encryption</h2>
              <p className="text-sm text-gray-500">Automatically detect and encrypt sensitive content</p>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Auto-encrypt Sensitive Documents</h3>
                  <p className="text-sm text-gray-500">
                    Automatically encrypt documents containing sensitive information
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={encryptionSettings.autoEncryptSensitive}
                    onChange={(e) => handleEncryptionSettingChange('autoEncryptSensitive', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-yellow-500 mt-0.5 mr-2"></i>
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Sensitive Content Detection:</p>
                    <ul className="mt-1 list-disc list-inside">
                      <li>Personal identification numbers</li>
                      <li>Financial information</li>
                      <li>Medical records</li>
                      <li>Legal documents</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Encryption Summary */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold text-gray-900">Encryption Summary</h2>
              <p className="text-sm text-gray-500">Current encryption status</p>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Default encryption</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    encryptionSettings.defaultEncryption
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {encryptionSettings.defaultEncryption ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Encryption algorithm</span>
                  <span className="text-sm font-medium text-gray-900">
                    {encryptionSettings.encryptionStrength}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Smart encryption</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    encryptionSettings.autoEncryptSensitive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {encryptionSettings.autoEncryptSensitive ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Encrypted documents</span>
                  <span className="text-sm font-medium text-gray-900">
                    {profile?.encryptedDocumentCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 