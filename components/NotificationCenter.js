'use client';

import { useState, useEffect } from 'react';
import { getUserNotifications, markNotificationsAsRead, deleteNotifications } from '@/lib/services/notification-service';

export default function NotificationCenter({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const userNotifications = await getUserNotifications(userId);
      setNotifications(userNotifications);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markNotificationsAsRead(selectedNotifications);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          selectedNotifications.includes(notification.id)
            ? { ...notification, read: true }
            : notification
        )
      );
      setSelectedNotifications([]);
    } catch (err) {
      setError('Failed to mark notifications as read');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNotifications(selectedNotifications);
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification =>
          !selectedNotifications.includes(notification.id)
        )
      );
      setSelectedNotifications([]);
    } catch (err) {
      setError('Failed to delete notifications');
      console.error(err);
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case 'security':
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Security Alert
              </p>
              <p className="text-sm text-gray-500">
                {notification.data.message && notification.data.message.replace(/'/g, "&apos;")}
              </p>
            </div>
          </div>
        );
      case 'share':
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Document Shared
              </p>
              <p className="text-sm text-gray-500">
                {notification.data.message && notification.data.message.replace(/'/g, "&apos;")}
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Notification
              </p>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <p className="text-sm text-gray-500">{notification.data.message}</p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Notifications
        </h3>
        <div className="space-x-2">
          {selectedNotifications.length > 0 && (
            <>
              <button
                onClick={handleMarkAsRead}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Mark as Read
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
      {error && (
        <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <ul className="divide-y divide-gray-200">
        {notifications.length === 0 ? (
          <li className="px-4 py-5 sm:px-6">
            <p className="text-sm text-gray-500 text-center">
              No notifications to display
            </p>
          </li>
        ) : (
          notifications.map((notification) => (
            <li
              key={notification.id}
              className={`px-4 py-4 hover:bg-gray-50 ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => handleSelectNotification(notification.id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="ml-3 flex-grow">
                  {renderNotificationContent(notification)}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <p className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
