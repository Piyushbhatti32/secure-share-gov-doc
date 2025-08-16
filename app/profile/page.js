'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { updateUser, getUserProfile } from '@/lib/services/user-service';
import { handleError } from '@/lib/utils/error-handler';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [securityPreferences, setSecurityPreferences] = useState({
    defaultEncryption: false,
    twoFactorAuth: false,
    notifyOnLogin: false,
    notifyOnShare: true
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
        // Load security preferences if they exist
        if (userProfile.securityPreferences) {
          setSecurityPreferences(userProfile.securityPreferences);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUpdating(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        router.push('/login');
        return;
      }

      // Include security preferences in the update
      const formData = new FormData(e.target);
      const updateData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        securityPreferences: {
          defaultEncryption: securityPreferences.defaultEncryption,
          twoFactorAuth: securityPreferences.twoFactorAuth,
          notifyOnLogin: securityPreferences.notifyOnLogin,
          notifyOnShare: securityPreferences.notifyOnShare
        }
      };
      const updates = {
        displayName: formData.get('displayName'),
        jobTitle: formData.get('jobTitle'),
        department: formData.get('department'),
        organization: formData.get('organization'),
      };

      await updateUser(userId, updates);
      setProfile(prev => ({ ...prev, ...updates }));
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
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="card-header">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-sm text-gray-500">Update your profile information</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="card-body space-y-6">
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                className="form-input bg-gray-100"
                value={auth.currentUser?.email || ''}
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label htmlFor="displayName" className="form-label">Display Name</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                className="form-input"
                defaultValue={profile?.displayName || ''}
                required
              />
            </div>

            <div>
              <label htmlFor="jobTitle" className="form-label">Job Title</label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                className="form-input"
                defaultValue={profile?.jobTitle || ''}
              />
            </div>

            <div>
              <label htmlFor="department" className="form-label">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                className="form-input"
                defaultValue={profile?.department || ''}
              />
            </div>

            <div>
              <label htmlFor="organization" className="form-label">Organization</label>
              <input
                type="text"
                id="organization"
                name="organization"
                className="form-input"
                defaultValue={profile?.organization || ''}
              />
            </div>

            {/* Security Settings Link */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security & Privacy</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Security Settings</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Manage two-factor authentication, encryption, and notification preferences
                    </p>
                  </div>
                  <Link
                    href="/security"
                    className="btn btn-primary btn-sm"
                  >
                    <i className="fas fa-shield-alt mr-2"></i>
                    Manage Security
                  </Link>
                </div>
              </div>
            </div>

            <div className="card-footer flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="btn btn-primary"
              >
                {updating ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                    Updating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2"></i>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
