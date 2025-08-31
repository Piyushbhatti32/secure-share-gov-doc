'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBuildSafeUser } from '@/lib/hooks/useBuildSafeAuth';
import { getUserProfile, updateUserProfile } from '@/lib/services/user-service';
import Navbar from '@/components/Navbar';

export default function EncryptionPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [encryptionSettings, setEncryptionSettings] = useState({
    defaultEncryption: false,
    encryptionStrength: 'AES-256',
    autoEncryptSensitive: false,
    keyRotation: '30',
    backupEncryption: true
  });
  
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useBuildSafeUser();

  useEffect(() => {
    const load = async () => {
      if (!isLoaded) return;
      if (!isSignedIn) {
        router.push('/sign-in');
        return;
      }
      
      try {
        const userProfile = await getUserProfile(user.id);
        setProfile(userProfile);
        if (userProfile?.encryptionSettings) {
          setEncryptionSettings(userProfile.encryptionSettings);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load encryption settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router, isLoaded, isSignedIn, user]);

  const handleEncryptionSettingChange = async (key, value) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);
      
      if (!user?.id) return;

      const updatedSettings = {
        ...encryptionSettings,
        [key]: value
      };

      await updateUserProfile(user.id, {
        encryptionSettings: updatedSettings
      });

      setEncryptionSettings(updatedSettings);
      setProfile(prev => ({
        ...prev,
        encryptionSettings: updatedSettings
      }));
      
      setSuccess('Encryption settings updated successfully!');
    } catch (err) {
      console.error('Error updating encryption settings:', err);
      setError('Failed to update encryption settings');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">Loading encryption settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white electric-text mb-2">
            Encryption Settings
          </h1>
          <p className="text-blue-200">
            Configure document encryption and security preferences
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Encryption Settings */}
        <div className="space-y-6">
          {/* Default Encryption */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white electric-text">
                  Default Document Encryption
                </h3>
                <p className="text-blue-200 text-sm mt-1">
                  Automatically encrypt all new documents by default
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={encryptionSettings.defaultEncryption}
                  onChange={(e) => handleEncryptionSettingChange('defaultEncryption', e.target.checked)}
                  className="sr-only peer"
                  disabled={updating}
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
            
            {encryptionSettings.defaultEncryption && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-200 text-sm">
                  All new documents will be automatically encrypted with your chosen encryption strength.
                </p>
              </div>
            )}
          </div>

          {/* Encryption Strength */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <h3 className="text-lg font-semibold text-white electric-text mb-4">
              Encryption Algorithm Strength
            </h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-blue-200">
                Select encryption algorithm
              </label>
              <select
                value={encryptionSettings.encryptionStrength}
                onChange={(e) => handleEncryptionSettingChange('encryptionStrength', e.target.value)}
                disabled={updating}
                className="w-full px-4 py-3 bg-black/60 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent electric-focus disabled:opacity-50"
              >
                <option value="AES-128">AES-128 (Fast, Good Security)</option>
                <option value="AES-256">AES-256 (Recommended, High Security)</option>
                <option value="ChaCha20">ChaCha20 (Fast, High Security)</option>
              </select>
              <p className="text-blue-300 text-sm">
                Higher encryption strength provides better security but may impact performance.
              </p>
            </div>
          </div>

          {/* Auto-encrypt Sensitive */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white electric-text">
                  Auto-encrypt Sensitive Documents
                </h3>
                <p className="text-blue-200 text-sm mt-1">
                  Automatically detect and encrypt documents containing sensitive information
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={encryptionSettings.autoEncryptSensitive}
                  onChange={(e) => handleEncryptionSettingChange('autoEncryptSensitive', e.target.checked)}
                  className="sr-only peer"
                  disabled={updating}
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
          </div>

          {/* Key Rotation */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <h3 className="text-lg font-semibold text-white electric-text mb-4">
              Encryption Key Rotation
            </h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-blue-200">
                Rotate encryption keys every
              </label>
              <select
                value={encryptionSettings.keyRotation}
                onChange={(e) => handleEncryptionSettingChange('keyRotation', e.target.value)}
                disabled={updating}
                className="w-full px-4 py-3 bg-black/60 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent electric-focus disabled:opacity-50"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
                <option value="0">Never (Not recommended)</option>
              </select>
              <p className="text-blue-300 text-sm">
                Regular key rotation enhances security by limiting the impact of potential key compromises.
              </p>
            </div>
          </div>

          {/* Backup Encryption */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white electric-text">
                  Encrypt Backups
                </h3>
                <p className="text-blue-200 text-sm mt-1">
                  Encrypt all backup files and exports for additional security
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={encryptionSettings.backupEncryption}
                  onChange={(e) => handleEncryptionSettingChange('backupEncryption', e.target.checked)}
                  className="sr-only peer"
                  disabled={updating}
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setSuccess('Settings saved automatically as you make changes!')}
            disabled={updating}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl electric-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? 'Updating...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
} 