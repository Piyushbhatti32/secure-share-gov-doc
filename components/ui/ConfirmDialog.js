'use client';

import React from 'react';

export default function ConfirmDialog({ open, title = 'Are you sure?', message = '', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, variant = 'danger' }) {
  if (!open) return null;

  const color = variant === 'danger' ? 'red' : variant === 'warning' ? 'yellow' : 'blue';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative w-full max-w-md mx-4 bg-black/90 border border-blue-500/30 rounded-xl shadow-xl p-6">
        <div className="flex items-start">
          <div className={`mt-1 mr-3 w-6 h-6 rounded-full bg-${color}-500/20 flex items-center justify-center border border-${color}-500/30`}>
            <span className={`text-${color}-400`}>!</span>
          </div>
          <div className="flex-1">
            <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
            {message && <p className="text-blue-200 text-sm">{message}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-blue-500/30 text-blue-200 hover:bg-blue-500/10 transition-colors">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded-lg bg-${color}-600 hover:bg-${color}-700 text-white transition-colors`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}


