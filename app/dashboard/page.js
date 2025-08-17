'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { formatDate, formatRelativeTime } from '@/lib/utils/date-utils';
import { ActivityIcons, logActivity, ActivityType } from '@/lib/services/activity-service';

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to extract browser information from user agent
const getBrowserInfo = (userAgent) => {
  if (!userAgent || userAgent === 'unknown') return 'Unknown';
  
  // Simple browser detection
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  
  // Device detection
  if (userAgent.includes('Mobile')) return 'Mobile Browser';
  if (userAgent.includes('Tablet')) return 'Tablet Browser';
  
  return 'Browser';
};

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      fetchRecentData(user.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchRecentData = async (userId) => {
    try {
      // Fetch recent documents
      const docsQuery = query(
        collection(db, 'documents'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const docsSnapshot = await getDocs(docsQuery);
      const docs = docsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentDocuments(docs);

      // Fetch recent activity - try to get more activities
      try {
        const activityQuery = query(
          collection(db, 'activities'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(10) // Show more activities for better visibility
        );
        const activitySnapshot = await getDocs(activityQuery);
        const activities = activitySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentActivity(activities);
        setActivityError(null);
      } catch (activityError) {
        console.error('Error fetching activities:', activityError);
        setActivityError(activityError.message);
        // If there's an index error, try without ordering
        if (activityError.code === 'failed-precondition' && activityError.message.includes('index')) {
          try {
            const simpleActivityQuery = query(
              collection(db, 'activities'),
              where('userId', '==', userId),
              limit(10)
            );
            const simpleActivitySnapshot = await getDocs(simpleActivityQuery);
            const simpleActivities = simpleActivitySnapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              }))
              .sort((a, b) => {
                if (!a.timestamp || !b.timestamp) return 0;
                return b.timestamp.toDate ? b.timestamp.toDate() - a.timestamp.toDate() : 0;
              });
            setRecentActivity(simpleActivities);
            setActivityError(null);
          } catch (fallbackError) {
            console.error('Fallback activity fetch failed:', fallbackError);
            setRecentActivity([]);
          }
        } else {
          setRecentActivity([]);
        }
      } finally {
        setActivityLoading(false);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        setRecentDocuments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <i className="fas fa-circle-notch fa-spin text-4xl text-primary-600 mb-4"></i>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-100 to-slate-200 min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName || 'User'}!
          </h1>
          <p className="text-gray-600">
            Manage your government documents securely and efficiently.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <Link href="/documents/upload" className="block">
              <div className="text-primary-600 mb-3">
                <i className="fas fa-upload text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
              <p className="text-gray-600 text-sm">
                Upload and securely store your important documents.
              </p>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <Link href="/documents" className="block">
              <div className="text-primary-600 mb-3">
                <i className="fas fa-folder text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">My Documents</h3>
              <p className="text-gray-600 text-sm">
                View and manage your uploaded documents.
              </p>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <Link href="/documents/share" className="block">
              <div className="text-primary-600 mb-3">
                <i className="fas fa-share-alt text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Share Documents</h3>
              <p className="text-gray-600 text-sm">
                Share documents with family members securely.
              </p>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <Link href="/security" className="block">
              <div className="text-primary-600 mb-3">
                <i className="fas fa-shield-alt text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Security Settings</h3>
              <p className="text-gray-600 text-sm">
                Manage 2FA, encryption, and security preferences.
              </p>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <Link href="/notifications" className="block">
              <div className="text-primary-600 mb-3">
                <i className="fas fa-bell text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Notifications</h3>
              <p className="text-gray-600 text-sm">
                View security alerts and activity notifications.
              </p>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <Link href="/profile" className="block">
              <div className="text-primary-600 mb-3">
                <i className="fas fa-user-cog text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
              <p className="text-gray-600 text-sm">
                Update your profile and preferences.
              </p>
            </Link>
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {recentActivity.filter(a => a.type === 'UPLOAD').length}
              </div>
              <div className="text-sm text-gray-600">Uploads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {recentActivity.filter(a => a.type === 'SHARE').length}
              </div>
              <div className="text-sm text-gray-600">Shares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {recentActivity.filter(a => a.type === 'DOWNLOAD').length}
              </div>
              <div className="text-sm text-gray-600">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {recentActivity.filter(a => a.type === 'LOGIN').length}
              </div>
              <div className="text-sm text-gray-600">Logins</div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Documents */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Documents</h2>
              <Link href="/documents" className="text-primary-600 hover:text-primary-800">
                View All
              </Link>
            </div>
            {recentDocuments.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentDocuments.map((doc) => (
                  <li key={doc.id} className="py-3">
                    <Link href={`/documents/${doc.id}`} className="block hover:bg-gray-50">
                      <div className="flex items-center">
                        <i className="fas fa-file-alt text-primary-600 mr-3"></i>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatRelativeTime(doc.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent documents</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => fetchRecentData(user?.uid)}
                  className="text-primary-600 hover:text-primary-800 text-sm"
                  title="Refresh activities"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
                <Link href="/notifications" className="text-primary-600 hover:text-primary-800 text-sm">
                  View All
                </Link>
              </div>
            </div>
            {activityLoading ? (
              <div className="text-center py-8">
                <i className="fas fa-circle-notch fa-spin text-primary-600 text-xl mb-2"></i>
                <p className="text-gray-500">Loading activities...</p>
              </div>
            ) : activityError ? (
              <div className="text-center py-8">
                <div className="text-red-400 mb-2">
                  <i className="fas fa-exclamation-triangle text-3xl"></i>
                </div>
                <p className="text-red-600 mb-2">Error loading activities</p>
                <p className="text-gray-500 text-sm">{activityError}</p>
                <button 
                  onClick={() => {
                    setActivityError(null);
                    setActivityLoading(true);
                    fetchRecentData(user?.uid);
                  }}
                  className="mt-3 text-primary-600 hover:text-primary-800 text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : recentActivity.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="py-4">
                    <div className="flex items-start space-x-3">
                      {/* Activity Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'DELETE' ? 'bg-red-100' :
                        activity.type === 'UPLOAD' ? 'bg-green-100' :
                        activity.type === 'SHARE' ? 'bg-blue-100' :
                        activity.type === 'ARCHIVE' ? 'bg-yellow-100' :
                        activity.type === 'RESTORE' ? 'bg-indigo-100' :
                        activity.type === 'DOWNLOAD' ? 'bg-purple-100' :
                        activity.type === 'RECEIVE' ? 'bg-teal-100' :
                        activity.type === 'LOGIN' ? 'bg-emerald-100' :
                        activity.type === 'LOGOUT' ? 'bg-orange-100' :
                        activity.type === 'PROFILE_UPDATE' ? 'bg-pink-100' :
                        'bg-gray-100'
                      }`}>
                        <div className={`${
                          activity.type === 'DELETE' ? 'text-red-600' :
                          activity.type === 'UPLOAD' ? 'text-green-600' :
                          activity.type === 'SHARE' ? 'text-blue-600' :
                          activity.type === 'ARCHIVE' ? 'text-yellow-600' :
                          activity.type === 'RESTORE' ? 'text-indigo-600' :
                          activity.type === 'DOWNLOAD' ? 'text-purple-600' :
                          activity.type === 'RECEIVE' ? 'text-teal-600' :
                          activity.type === 'LOGIN' ? 'text-emerald-600' :
                          activity.type === 'LOGOUT' ? 'text-orange-600' :
                          activity.type === 'PROFILE_UPDATE' ? 'text-pink-600' :
                          'text-gray-600'
                        }`}>
                          <i className={`fas fa-${ActivityIcons[activity.type] || 'circle'}`}></i>
                        </div>
                      </div>
                      
                      {/* Activity Details */}
                      <div className="flex-grow min-w-0">
                        {/* Main Activity Description */}
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <p className="text-sm font-medium text-gray-900 leading-tight">
                              {activity.description}
                            </p>
                            
                            {/* Additional Details */}
                            {activity.details && (
                              <div className="mt-2 space-y-1">
                                {/* File Information */}
                                {activity.details.fileName && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <i className="fas fa-file-alt mr-1"></i>
                                    <span className="truncate">{activity.details.fileName}</span>
                                    {activity.details.fileSize && (
                                      <span className="ml-2 text-gray-500">
                                        ({formatFileSize(activity.details.fileSize)})
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {/* Document Type */}
                                {activity.details.documentType && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <i className="fas fa-tag mr-1"></i>
                                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                                      {activity.details.documentType}
                                    </span>
                                  </div>
                                )}
                                
                                {/* Sharing Details */}
                                {activity.details.sharedWith && (
                                  <div className="flex items-center text-xs text-gray-600">
                                    <i className="fas fa-users mr-1"></i>
                                    <span>Shared with {activity.details.sharedWith}</span>
                                  </div>
                                )}
                                
                                {/* IP Address */}
                                {activity.details.ipAddress && activity.details.ipAddress !== 'unknown' && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <i className="fas fa-globe mr-1"></i>
                                    <span>IP: {activity.details.ipAddress}</span>
                                  </div>
                                )}
                                
                                {/* User Agent (Browser/Device) */}
                                {activity.details.userAgent && activity.details.userAgent !== 'unknown' && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <i className="fas fa-desktop mr-1"></i>
                                    <span className="truncate" title={activity.details.userAgent}>
                                      {getBrowserInfo(activity.details.userAgent)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Timestamp */}
                          <div className="flex-shrink-0 ml-2">
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                              {formatRelativeTime(activity.timestamp)}
                            </p>
                            <p className="text-xs text-gray-400 whitespace-nowrap">
                              {formatDate(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Links */}
                        <div className="flex items-center space-x-3 mt-2">
                          {activity.details?.documentId && (
                            <Link 
                              href={`/documents/${activity.details.documentId}`}
                              className="text-xs text-primary-600 hover:text-primary-800 flex items-center"
                            >
                              <i className="fas fa-eye mr-1"></i>
                              View Document
                            </Link>
                          )}
                          
                          {activity.details?.downloadUrl && (
                            <a 
                              href={activity.details.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-green-600 hover:text-green-800 flex items-center"
                            >
                              <i className="fas fa-download mr-1"></i>
                              Download
                            </a>
                          )}
                          
                          {activity.type === 'SHARE' && activity.details?.shareId && (
                            <Link 
                              href={`/shared/${activity.details.shareId}`}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <i className="fas fa-external-link-alt mr-1"></i>
                              View Share
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <i className="fas fa-history text-3xl"></i>
                </div>
                <p className="text-gray-500">No recent activity</p>
                <p className="text-gray-400 text-sm mt-1">Your activities will appear here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
