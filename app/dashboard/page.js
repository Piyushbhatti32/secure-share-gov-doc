'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { formatDate, formatRelativeTime } from '@/lib/utils/date-utils';
import { useBuildSafeUser } from '@/lib/hooks/useBuildSafeAuth';
import useSWR from 'swr';
import { jsonFetcher } from '@/lib/utils/fetcher';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useBuildSafeUser();
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [totalDocumentsCount, setTotalDocumentsCount] = useState(0);
  const [sharedDocumentsCount, setSharedDocumentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);
  const router = useRouter();

  const { data, isLoading, mutate } = useSWR(
    isLoaded && isSignedIn ? '/api/documents' : null,
    jsonFetcher,
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { router.push('/sign-in'); return; }
    fetchDashboardData();
  }, [isLoaded, isSignedIn, router, user, data]);

  const fetchDashboardData = async () => {
    try {
      if (recentDocuments.length === 0) setLoading(true);
      setActivityLoading(true);

      console.log('🔄 Fetching dashboard data...');

      // Fetch documents using the new secure API
      const result = data || (await jsonFetcher('/api/documents'));
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch documents');
      }

      // Combine owned and shared documents
      const ownedDocs = result.documents?.owned || [];
      const sharedDocs = result.documents?.shared || [];
      const allDocs = [...ownedDocs, ...sharedDocs].sort((a, b) => 
        new Date(b.uploadedAt || b.sharedAt) - new Date(a.uploadedAt || a.sharedAt)
      );

      console.log('📄 Documents fetched:', {
        owned: ownedDocs.length,
        shared: sharedDocs.length,
        total: allDocs.length
      });

      setRecentDocuments(allDocs.slice(0, 5)); // Show last 5 documents
      setTotalDocumentsCount(allDocs.length);
      setSharedDocumentsCount(sharedDocs.length);
      setRecentActivity([]); // For now, keep empty until activity service is implemented
      
      console.log('✅ Dashboard data updated:', {
        totalDocuments: allDocs.length,
        sharedDocuments: sharedDocs.length,
        recentDocuments: allDocs.slice(0, 5).length
      });
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setRecentDocuments([]);
      setTotalDocumentsCount(0);
      setSharedDocumentsCount(0);
      setRecentActivity([]);
    } finally {
      setLoading(false);
      setActivityLoading(false);
    }
  };

  if ((loading || isLoading) || !isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" color="white" className="mb-4" />
          <p className="text-blue-200">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white electric-text mb-2">
            Welcome back, {user?.fullName || user?.emailAddresses[0]?.emailAddress}!
          </h1>
          <p className="text-blue-200 text-sm sm:text-base">Here's what's happening with your documents today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4 sm:p-6 electric-border corner-border corner-blue corner-fast radius-xl">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center electric-glow flex-shrink-0">
                <i className="fa-solid fa-file-lines text-lg sm:text-xl text-white"></i>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-blue-200 text-xs sm:text-sm">Total Documents</p>
                <p className="text-xl sm:text-2xl font-bold text-white truncate">{totalDocumentsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-green-500/30 p-4 sm:p-6 electric-border corner-border corner-green corner-normal radius-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center electric-glow flex-shrink-0">
                <i className="fa-solid fa-share-nodes text-lg sm:text-xl text-white"></i>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-green-200 text-xs sm:text-sm">Shared</p>
                <p className="text-xl sm:text-2xl font-bold text-white truncate">{sharedDocumentsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 sm:p-6 electric-border corner-border corner-purple corner-slow radius-2xl">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center electric-glow flex-shrink-0">
                <i className="fa-solid fa-download text-lg sm:text-xl text-white"></i>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-purple-200 text-xs sm:text-sm">Downloads</p>
                <p className="text-xl sm:text-2xl font-bold text-white truncate">0</p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-yellow-500/30 p-4 sm:p-6 electric-border corner-border corner-cyan corner-very-slow radius-3xl">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center electric-glow flex-shrink-0">
                <i className="fa-solid fa-bell text-lg sm:text-xl text-white"></i>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-yellow-200 text-xs sm:text-sm">Notifications</p>
                <p className="text-xl sm:text-2xl font-bold text-white truncate">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Recent Documents */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4 sm:p-6 electric-border corner-border corner-blue corner-reverse radius-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white electric-text">Recent Documents</h2>
              <Link 
                href="/documents" 
                className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
              >
                View All
              </Link>
            </div>
            
            {recentDocuments.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <i className="fa-solid fa-file-lines text-3xl sm:text-4xl text-blue-400 mb-3 sm:mb-4"></i>
                <p className="text-blue-200 mb-3 sm:mb-4 text-sm sm:text-base">No documents yet</p>
                <Link 
                  href="/documents" 
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 electric-glow text-sm sm:text-base"
                >
                  Upload Your First Document
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 sm:p-4 bg-black/20 rounded-lg border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-file-lines text-white text-sm sm:text-base"></i>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm sm:text-base truncate">
                          {doc.name || doc.originalFileName || 'Untitled Document'}
                        </p>
                        <p className="text-blue-200 text-xs sm:text-sm">
                          {formatRelativeTime(doc.uploadedAt || doc.sharedAt || doc.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                    <Link 
                      href={`/documents/${doc.id}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-300 flex-shrink-0 ml-2"
                    >
                      <i className="fa-solid fa-up-right-from-square"></i>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4 sm:p-6 electric-border corner-border corner-cyan corner-bold radius-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white electric-text">Recent Activity</h2>
              <Link 
                href="/notifications" 
                className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
              >
                View All
              </Link>
            </div>
            
            {activityLoading ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
                <p className="text-blue-200 text-sm sm:text-base">Loading activity...</p>
              </div>
            ) : activityError ? (
              <div className="text-center py-6 sm:py-8">
                <i className="fa-solid fa-triangle-exclamation text-3xl sm:text-4xl text-red-400 mb-3 sm:mb-4"></i>
                <p className="text-red-200 text-sm sm:text-base">{activityError}</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <i className="fa-solid fa-clock-rotate-left text-3xl sm:text-4xl text-blue-400 mb-3 sm:mb-4"></i>
                <p className="text-blue-200 text-sm sm:text-base">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-black/20 rounded-lg border border-blue-500/20">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-info-circle text-white text-xs sm:text-sm"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs sm:text-sm truncate">{activity.description}</p>
                      <p className="text-blue-200 text-xs">{formatRelativeTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-black/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-4 sm:p-6 electric-border corner-border corner-purple corner-pulse radius-2xl">
          <h2 className="text-xl font-bold text-white electric-text mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <Link 
              href="/documents" 
              className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 rounded-lg border border-blue-500/30 transition-all duration-300 electric-border"
            >
              <i className="fa-solid fa-upload text-xl sm:text-2xl text-blue-400 flex-shrink-0"></i>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm sm:text-base">Upload Document</p>
                <p className="text-blue-200 text-xs sm:text-sm">Add new files to your collection</p>
              </div>
            </Link>
            
            <Link 
              href="/shared" 
              className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 rounded-lg border border-green-500/30 transition-all duration-300 electric-border"
            >
              <i className="fa-solid fa-share-nodes text-xl sm:text-2xl text-green-400 flex-shrink-0"></i>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm sm:text-base">Share Documents</p>
                <p className="text-green-200 text-xs sm:text-sm">Share with family members</p>
              </div>
            </Link>
            
            <Link 
              href="/security" 
              className="flex items-center space-x-3 p-3 sm:p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 rounded-lg border border-purple-500/30 transition-all duration-300 electric-border"
            >
              <i className="fa-solid fa-shield-halved text-xl sm:text-2xl text-purple-400 flex-shrink-0"></i>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium text-sm sm:text-base">Security Settings</p>
                <p className="text-purple-200 text-xs sm:text-sm">Manage your security preferences</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
