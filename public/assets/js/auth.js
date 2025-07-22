import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Utility function to show user-friendly notifications
const showNotification = (message, type = 'info') => {
  // Remove any existing notifications
  const existingNotification = document.querySelector('.auth-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `auth-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
    color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
    border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
    border-radius: 8px;
    padding: 15px;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
};

// Add CSS animation for notifications
if (!document.querySelector('#auth-notification-styles')) {
  const style = document.createElement('style');
  style.id = 'auth-notification-styles';
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .notification-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .notification-close {
      background: none;
      border: none;
      font-size: 18px;
      font-weight: bold;
      cursor: pointer;
      padding: 0;
      margin-left: auto;
    }
  `;
  document.head.appendChild(style);
}

// Enhanced error message mapping
const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email address is already registered. Please try logging in instead.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email address. Please check your email or register first.',
    'auth/wrong-password': 'Incorrect password. Please check your password and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
  };
  
  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};

// Show loading state
const setLoadingState = (buttonId, loading) => {
  const button = document.getElementById(buttonId) || document.querySelector(`button[onclick*="${buttonId}"]`);
  if (button) {
    if (loading) {
      button.disabled = true;
      button.dataset.originalText = button.textContent;
      button.innerHTML = '<span style="display: inline-flex; align-items: center; gap: 8px;">⏳ Processing...</span>';
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || button.textContent;
    }
  }
};

// Create user profile document
const createUserProfile = async (user, additionalData = {}) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileComplete: false,
        ...additionalData
      });
    } else {
      // Update last login
      await setDoc(userRef, {
        lastLoginAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
  }
};

const register = async (email, password) => {
  try {
    // Validate inputs
    if (!email || !password) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    if (password.length < 6) {
      showNotification('Password must be at least 6 characters long.', 'error');
      return;
    }

    setLoadingState('register', true);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile
    await createUserProfile(user);
    
    logAction('User Registered', { email, uid: user.uid });
    showNotification('🎉 Registration successful! Redirecting to login...', 'success');
    
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    
  } catch (error) {
    console.error('Registration error:', error);
    logAction('Registration Failed', { error: error.message, email });
    showNotification(getFirebaseErrorMessage(error.code), 'error');
  } finally {
    setLoadingState('register', false);
  }
};

const login = async (email, password) => {
  try {
    // Validate inputs
    if (!email || !password) {
      showNotification('Please enter both email and password.', 'error');
      return;
    }

    setLoadingState('login', true);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile
    await createUserProfile(user);
    
    logAction('User Logged In', { email, uid: user.uid });
    showNotification('✅ Login successful! Redirecting to dashboard...', 'success');
    
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
    
  } catch (error) {
    console.error('Login error:', error);
    logAction('Login Failed', { error: error.message, email });
    showNotification(getFirebaseErrorMessage(error.code), 'error');
  } finally {
    setLoadingState('login', false);
  }
};

const signOutUser = async () => {
  try {
    const user = auth.currentUser;
    await signOut(auth);
    
    logAction('User Logged Out', { uid: user?.uid });
    showNotification('👋 You have been logged out successfully.', 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
    
  } catch (error) {
    console.error('Logout error:', error);
    logAction('Logout Failed', error);
    showNotification('Error logging out. Please try again.', 'error');
  }
};

// Password strength checker
const checkPasswordStrength = (password) => {
  let strength = 0;
  const checks = {
    length: password.length >= 6,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password)
  };
  
  Object.values(checks).forEach(check => {
    if (check) strength++;
  });
  
  return { strength, checks };
};

// Form validation
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Make functions available globally
window.register = register;
window.login = login;
window.signOut = signOutUser;
window.checkPasswordStrength = checkPasswordStrength;
window.validateEmail = validateEmail;
window.showNotification = showNotification;
