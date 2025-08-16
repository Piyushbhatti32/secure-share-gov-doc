'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import {
  checkGoogleDriveConnection,
  disconnectGoogleDrive,
  refreshGoogleDriveConnection
} from '@/lib/services/google-drive-connection-service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faCheckCircle, faTimes, faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { faGoogleDrive } from '@fortawesome/free-brands-svg-icons';

export default function GoogleDriveStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        const connectionStatus = await checkGoogleDriveConnection();

        if (connectionStatus.connected) {
          setIsConnected(true);
          setError(null);
        } else if (connectionStatus.needsRefresh) {
          // Try to refresh the connection automatically
          try {
            await refreshGoogleDriveConnection();
            setIsConnected(true);
            setError(null);
          } catch (refreshError) {
            setIsConnected(false);
            setError('Connection expired');
          }
        } else {
          setIsConnected(false);
          setError(connectionStatus.error);
        }
      } catch (error) {
        console.error('Error checking Google Drive connection:', error);
        setIsConnected(false);
        setError('Connection check failed');
      } finally {
        setIsLoading(false);
      }
    };

    // Check connection status when component mounts
    checkConnection();

    // Set up interval to check connection status periodically
    const interval = setInterval(checkConnection, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleDisconnect = async () => {
    try {
      await disconnectGoogleDrive();
      setIsConnected(false);
      setError(null);
    } catch (error) {
      console.error('Error disconnecting Google Drive:', error);
      setError('Failed to disconnect');
    }
  };

  const handleReconnect = async () => {
    try {
      await refreshGoogleDriveConnection();
      setIsConnected(true);
      setError(null);
    } catch (error) {
      console.error('Error reconnecting Google Drive:', error);
      setError('Failed to reconnect');
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('You must be logged in to connect to Google Drive');
        setConnecting(false);
        return;
      }
      // Get the Google OAuth URL from the backend
      const response = await fetch(`/api/auth/google?userId=${currentUser.uid}`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to get Google authentication URL');
      }
    } catch (error) {
      alert('Failed to initiate Google Drive connection');
    } finally {
      setConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <FontAwesomeIcon icon={faCircleNotch} spin />
        <span>Checking Drive...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-green-600">
          <FontAwesomeIcon icon={faGoogleDrive} />
          <span className="text-sm font-medium">Drive Connected</span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-xs text-gray-500 hover:text-red-600 transition-colors"
          title="Disconnect Google Drive"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1 text-red-600">
        <FontAwesomeIcon icon={faGoogleDrive} />
        <span className="text-sm font-medium">Drive Disconnected</span>
      </div>
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="text-xs text-blue-600 hover:text-blue-800 transition-colors border border-blue-200 rounded px-2 py-1 ml-2"
        title="Connect Google Drive"
      >
        {connecting ? (
          <span><FontAwesomeIcon icon={faCircleNotch} spin className="mr-1" />Connecting...</span>
        ) : (
          <span><FontAwesomeIcon icon={faGoogleDrive} className="mr-1" />Connect</span>
        )}
      </button>
      {error && (
        <button
          onClick={handleReconnect}
          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          title="Reconnect Google Drive"
        >
          <FontAwesomeIcon icon={faSyncAlt} />
        </button>
      )}
    </div>
  );
}
