'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';

export default function DocumentSecurityPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    encryptionEnabled: true,
    sessionTimeout: 30,
    auditLogging: true,
    ipRestriction: false,
    allowedIPs: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Load security settings (mock data for now)
    loadSecuritySettings();
  }, [isLoaded, isSignedIn, router]);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch from an API
      // For now, we'll use the default state
      setLoading(false);
    } catch (err) {
      console.error('Error loading security settings:', err);
      setError('Failed to load security settings');
      setLoading(false);
    }
  };

  const handleSettingChange = (setting, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleIPAdd = (ip) => {
    if (ip && !securitySettings.allowedIPs.includes(ip)) {
      setSecuritySettings(prev => ({
        ...prev,
        allowedIPs: [...prev.allowedIPs, ip]
      }));
    }
  };

  const handleIPRemove = (ipToRemove) => {
    setSecuritySettings(prev => ({
      ...prev,
      allowedIPs: prev.allowedIPs.filter(ip => ip !== ipToRemove)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // In a real app, this would save to an API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSuccess('Security settings updated successfully');
    } catch (err) {
      console.error('Error saving security settings:', err);
      setError('Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200">Loading security settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white electric-text mb-2">
            Document Security Settings
          </h1>
          <p className="text-blue-200">
            Configure security settings for your documents and account
          </p>
        </div>

        {/* Security Settings Form */}
        <div className="space-y-8">
          {/* Two-Factor Authentication */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white electric-text">
                  Two-Factor Authentication
                </h3>
                <p className="text-blue-200 text-sm">
                  Add an extra layer of security to your account
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorEnabled}
                  onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {securitySettings.twoFactorEnabled && (
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-200 text-sm">
                  Two-factor authentication is enabled. You'll need to enter a code from your authenticator app when signing in.
                </p>
              </div>
            )}
          </div>

          {/* Document Encryption */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white electric-text">
                  Document Encryption
                </h3>
                <p className="text-blue-200 text-sm">
                  Encrypt your documents for enhanced security
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.encryptionEnabled}
                  onChange={(e) => handleSettingChange('encryptionEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {securitySettings.encryptionEnabled && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-200 text-sm">
                  Document encryption is enabled. All your documents are encrypted at rest and in transit.
                </p>
              </div>
            )}
          </div>

          {/* Session Timeout */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <h3 className="text-lg font-semibold text-white electric-text mb-4">
              Session Timeout
            </h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-blue-200">
                Auto-logout after inactivity (minutes)
              </label>
              <select
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-black/60 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent electric-focus"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={0}>Never (until browser close)</option>
              </select>
            </div>
          </div>

          {/* Audit Logging */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white electric-text">
                  Audit Logging
                </h3>
                <p className="text-blue-200 text-sm">
                  Log all document access and modifications
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.auditLogging}
                  onChange={(e) => handleSettingChange('auditLogging', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* IP Restrictions */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white electric-text">
                  IP Address Restrictions
                </h3>
                <p className="text-blue-200 text-sm">
                  Restrict access to specific IP addresses
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.ipRestriction}
                  onChange={(e) => handleSettingChange('ipRestriction', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {securitySettings.ipRestriction && (
              <div className="mt-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter IP address (e.g., 192.168.1.1)"
                    className="flex-1 px-4 py-2 bg-black/60 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent electric-focus"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleIPAdd(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder*="IP address"]');
                      if (input && input.value) {
                        handleIPAdd(input.value);
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-300"
                  >
                    Add
                  </button>
                </div>
                
                {securitySettings.allowedIPs.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-blue-200 text-sm">Allowed IP addresses:</p>
                    <div className="flex flex-wrap gap-2">
                      {securitySettings.allowedIPs.map((ip, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                        >
                          {ip}
                          <button
                            onClick={() => handleIPRemove(ip)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-6 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl electric-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Security Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
