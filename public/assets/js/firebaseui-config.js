import { auth, db } from './firebase-config.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Utility function for notifications
const showNotification = (message, type = 'info') => {
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
        phoneNumber: user.phoneNumber || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileComplete: false,
        authProvider: user.providerData[0]?.providerId || 'email',
        ...additionalData
      });
    } else {
      // Update last login
      await setDoc(userRef, {
        lastLoginAt: new Date().toISOString(),
        authProvider: user.providerData[0]?.providerId || 'email'
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
  }
};

// Log action function
const logAction = (action, details = {}) => {
  console.log(`[AUTH] ${action}:`, details);
};

// Initialize FirebaseUI Auth
let ui;

const initializeFirebaseUI = () => {
  if (!window.firebaseui) {
    console.error('FirebaseUI library not loaded');
    return null;
  }
  
  // Get or create a FirebaseUI Auth instance
  ui = window.firebaseui.auth.AuthUI.getInstance() || new window.firebaseui.auth.AuthUI(auth);
  
  return ui;
};

// FirebaseUI configuration
const getUIConfig = (redirectUrl = 'dashboard.html') => {
  return {
    callbacks: {
      signInSuccessWithAuthResult: async (authResult, redirectUrl) => {
        const user = authResult.user;
        
        try {
          // Create/update user profile
          await createUserProfile(user);
          
          // Log the successful sign-in
          logAction('User Signed In via FirebaseUI', { 
            email: user.email, 
            uid: user.uid,
            provider: authResult.additionalUserInfo?.providerId 
          });
          
          // Show success notification
          showNotification('Sign-in successful! Redirecting to dashboard...', 'success');
          
          // Redirect after a short delay
          setTimeout(() => {
            window.location.href = redirectUrl || 'dashboard.html';
          }, 1500);
          
          return false; // Prevents FirebaseUI from handling redirect
        } catch (error) {
          console.error('Error in sign-in callback:', error);
          showNotification('Sign-in succeeded but there was an error setting up your profile.', 'error');
          return false;
        }
      },
      signInFailure: (error) => {
        console.error('FirebaseUI sign-in error:', error);
        logAction('Sign-in Failed via FirebaseUI', { error: error.message });
        
        if (error.code !== 'firebaseui/anonymous-upgrade-merge-conflict') {
          showNotification('Sign-in failed. Please try again.', 'error');
        }
        return Promise.resolve();
      },
      uiShown: () => {
        // Hide any loading indicators when the UI is shown
        const loader = document.getElementById('loader');
        if (loader) {
          loader.style.display = 'none';
        }
      }
    },
    signInFlow: 'popup',
    signInSuccessUrl: redirectUrl,
    signInOptions: [
      // Email/password provider
      'password',
      // Phone provider
      {
        provider: 'phone',
        recaptchaParameters: {
          type: 'image',
          size: 'normal',
          badge: 'bottomleft'
        },
        defaultCountry: 'IN',
        defaultNationalNumber: '',
        loginHint: '+91XXXXXXXXXX'
      }
    ],
    // Terms of service and privacy policy URLs
    tosUrl: 'terms.html',
    privacyPolicyUrl: 'privacy.html'
  };
};

// Main function to start FirebaseUI
const startFirebaseUI = (containerId = '#firebaseui-auth-container') => {
  console.log('Starting FirebaseUI...');
  
  const ui = initializeFirebaseUI();
  if (!ui) {
    showNotification('Authentication system not ready. Please refresh the page.', 'error');
    return;
  }

  const config = getUIConfig();
  
  try {
    ui.start(containerId, config);
    console.log('FirebaseUI started successfully');
  } catch (error) {
    console.error('Error starting FirebaseUI:', error);
    showNotification('Failed to initialize authentication. Please refresh the page.', 'error');
  }
};

// Reset FirebaseUI
const resetFirebaseUI = () => {
  if (ui) {
    ui.reset();
  }
};

// Sign out function
const signOutUser = async () => {
  try {
    const user = auth.currentUser;
    await auth.signOut();
    
    logAction('User Logged Out', { uid: user?.uid });
    showNotification('You have been logged out successfully.', 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
    
  } catch (error) {
    console.error('Logout error:', error);
    logAction('Logout Failed', error);
    showNotification('Error logging out. Please try again.', 'error');
  }
};

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Check if the FirebaseUI container exists before auto-starting
    const container = document.getElementById('firebaseui-auth-container');
    if (container) {
      // Wait a bit for all scripts to load
      setTimeout(() => {
        startFirebaseUI();
      }, 500);
    }
  });
}

// Export functions for global use
window.startFirebaseUI = startFirebaseUI;
window.resetFirebaseUI = resetFirebaseUI;
window.signOutUser = signOutUser;
window.showNotification = showNotification;

export {
  startFirebaseUI,
  resetFirebaseUI,
  signOutUser,
  showNotification
};
