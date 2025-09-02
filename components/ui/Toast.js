'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const typeStyles = {
    success: 'bg-green-600 border-green-400 text-white',
    error: 'bg-red-600 border-red-400 text-white',
    warning: 'bg-yellow-400 border-yellow-500 text-black',
    info: 'bg-blue-600 border-blue-400 text-white'
  };

  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toastContent = (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${typeStyles[type]}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <span className="text-lg">{iconMap[type]}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="flex-shrink-0 ml-3">
          <button
            onClick={handleClose}
            className="text-current hover:opacity-70 transition-opacity duration-200"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal for proper z-index handling
  if (typeof window !== 'undefined') {
    return createPortal(toastContent, document.body);
  }

  return toastContent;
};

export default Toast;
