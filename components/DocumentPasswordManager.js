'use client';

import { useState } from 'react';
import ConfirmDialog from './ui/ConfirmDialog';

export default function DocumentPasswordManager() {
  const [passwords, setPasswords] = useState([
    { id: 1, documentName: 'Aadhaar Card', password: 'Aadhaar@1234', isVisible: false },
    { id: 2, documentName: 'PAN Card', password: 'Pan#7890', isVisible: false },
    { id: 3, documentName: 'Driving License', password: 'DL@2025!', isVisible: false }
  ]);
  
  const [newPassword, setNewPassword] = useState({
    documentName: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const togglePasswordVisibility = (id) => {
    setPasswords(prev => prev.map(pwd => 
      pwd.id === id ? { ...pwd, isVisible: !pwd.isVisible } : pwd
    ));
  };

  const handleAddPassword = (e) => {
    e.preventDefault();
    
    if (!newPassword.documentName.trim()) {
      setError('Please enter a document name');
      return;
    }
    
    if (!newPassword.password.trim()) {
      setError('Please enter a password');
      return;
    }
    
    if (newPassword.password !== newPassword.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const newPwd = {
      id: Date.now(),
      documentName: newPassword.documentName.trim(),
      password: newPassword.password,
      isVisible: false
    };

    setPasswords(prev => [...prev, newPwd]);
    setNewPassword({ documentName: '', password: '', confirmPassword: '' });
    setShowAddForm(false);
    setSuccess('Password added successfully!');
    setError(null);
  };

  const [confirmState, setConfirmState] = useState({ open: false, id: null });
  const handleDeletePassword = (id) => setConfirmState({ open: true, id });
  const confirmDelete = () => {
    setPasswords(prev => prev.filter(pwd => pwd.id !== confirmState.id));
    setSuccess('Password deleted successfully!');
    setConfirmState({ open: false, id: null });
  };
  const cancelDelete = () => setConfirmState({ open: false, id: null });

  const handleEditPassword = (id, newPassword) => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setPasswords(prev => prev.map(pwd => 
      pwd.id === id ? { ...pwd, password: newPassword } : pwd
    ));
    setSuccess('Password updated successfully!');
    setError(null);
  };

  return (
    <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-blue-500/30 p-6 w-full shadow-2xl electric-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white electric-text flex items-center">
            <i className="fa-solid fa-key text-blue-400 mr-2"></i>
            Document Passwords
          </h3>
          <p className="text-blue-200 text-sm mt-1">
            Manage passwords for your encrypted documents
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl electric-glow"
        >
          {showAddForm ? 'Cancel' : 'Add Password'}
        </button>
      </div>

      {/* Add Password Form */}
      {showAddForm && (
        <form onSubmit={handleAddPassword} className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="documentName" className="block text-sm font-medium text-blue-200 mb-1">
                Document Name
              </label>
              <input
                type="text"
                id="documentName"
                value={newPassword.documentName}
                onChange={(e) => setNewPassword(prev => ({ ...prev, documentName: e.target.value }))}
                placeholder="e.g., Aadhaar Card"
                className="w-full px-3 py-2 bg-black/60 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent electric-focus"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={newPassword.password}
                onChange={(e) => setNewPassword(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
                className="w-full px-3 py-2 bg-black/60 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent electric-focus"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-200 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={newPassword.confirmPassword}
                onChange={(e) => setNewPassword(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm password"
                className="w-full px-3 py-2 bg-black/60 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent electric-focus"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl electric-glow"
            >
              Add Password
            </button>
          </div>
        </form>
      )}

      {/* Passwords List */}
      <div className="space-y-3">
        {passwords.map((pwd) => (
          <div key={pwd.id} className="flex items-center justify-between p-4 bg-black/20 border border-blue-500/20 rounded-xl hover:border-blue-400/40 transition-all duration-300">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-blue-500/30 flex items-center justify-center">
                <i className="fa-solid fa-file-lines text-blue-300"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{pwd.documentName}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type={pwd.isVisible ? 'text' : 'password'}
                    value={pwd.password}
                    onChange={(e) => handleEditPassword(pwd.id, e.target.value)}
                    className="bg-transparent border-none text-blue-200 font-mono text-sm focus:outline-none"
                    readOnly={!pwd.isVisible}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => togglePasswordVisibility(pwd.id)}
                title={pwd.isVisible ? 'Hide' : 'Show'}
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white transition-colors"
              >
                <i className={`fa-solid ${pwd.isVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard && navigator.clipboard.writeText(pwd.password)}
                title="Copy"
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-copy"></i>
              </button>
              <button
                type="button"
                onClick={() => handleDeletePassword(pwd.id)}
                title="Delete"
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {passwords.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-blue-200">No passwords stored yet</p>
          <p className="text-blue-300 text-sm">Add your first document password to get started</p>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title="Delete password?"
        message="This will permanently remove the stored password."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Messages */}
      {error && (
        <div className="mt-4 bg-red-900/40 border border-red-500/40 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 bg-green-900/40 border border-green-500/40 text-green-200 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
    </div>
  );
}
