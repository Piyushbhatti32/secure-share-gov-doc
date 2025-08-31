'use client';

import { useState, useEffect } from 'react';
import { useBuildSafeAuth } from '@/lib/hooks/useBuildSafeAuth';
import Navbar from '@/components/Navbar';
import NotificationCenter from '@/components/NotificationCenter';

export default function NotificationsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId, isLoaded } = useBuildSafeAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) return; // Clerk middleware handles redirects
    setUser({ uid: userId });
    setLoading(false);
  }, [isLoaded, userId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-180px)]">
          <div className="text-center">
            <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary-600 mb-4"></i>
            <p className="text-gray-600">Loading notifications...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with your account activity and security alerts</p>
        </div>

        <div className="card">
          <NotificationCenter userId={user?.uid} />
        </div>
      </main>
    </div>
  );
} 