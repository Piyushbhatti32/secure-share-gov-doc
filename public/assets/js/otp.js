import { auth } from './firebase-config.js';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Global variable to track recaptcha initialization
let recaptchaInitialized = false;

// Initialize recaptcha with better error handling
const initializeRecaptcha = () => {
  try {
    if (recaptchaInitialized || !document.getElementById('recaptcha-container')) {
      return;
    }

    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: (response) => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        showNotification('reCAPTCHA expired. Please try again.', 'error');
      }
    }, auth);
    
    recaptchaInitialized = true;
    console.log('reCAPTCHA initialized successfully');
    
  } catch (error) {
    console.error('reCAPTCHA initialization error:', error);
    // Don't show notification here - will be handled in sendOTP when user actually tries
    return false;
  }
  return true;
};

// Don't initialize automatically - only initialize when actually needed
// This prevents unnecessary error messages on page load

const sendOTP = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      showNotification('Please provide a valid phone number.', 'error');
      return;
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!/^\+91\d{10}$/.test(cleanPhone)) {
      showNotification('Please enter a valid Indian phone number (10 digits).', 'error');
      return;
    }

    // Check if recaptcha is initialized
    if (!window.recaptchaVerifier) {
      initializeRecaptcha();
      if (!window.recaptchaVerifier) {
        showNotification('Phone verification is not available. Please use email login.', 'error');
        return;
      }
    }

    showNotification('📱 Sending OTP to your phone...', 'info');

    const confirmationResult = await signInWithPhoneNumber(auth, cleanPhone, window.recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    
    logAction('OTP Sent', { phoneNumber: cleanPhone });
    showNotification('📩 OTP sent successfully! Please check your phone and enter the 6-digit code.', 'success');
    
    // Enable OTP input field if it exists
    const otpInput = document.getElementById('otp');
    if (otpInput) {
      otpInput.disabled = false;
      otpInput.focus();
    }
    
  } catch (error) {
    console.error('OTP send error:', error);
    logAction('OTP Error', { error: error.message, phoneNumber });
    
    let errorMessage = 'Failed to send OTP. ';
    
    if (error.code === 'auth/configuration-not-found') {
      errorMessage = 'Phone authentication is not configured. Please contact support or use email login.';
    } else if (error.code === 'auth/invalid-phone-number') {
      errorMessage = 'Invalid phone number format. Please enter a valid Indian phone number.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many attempts. Please try again later or use email login.';
    } else if (error.code === 'auth/captcha-check-failed') {
      errorMessage = 'reCAPTCHA verification failed. Please refresh the page and try again.';
    } else {
      errorMessage += error.message;
    }
    
    showNotification(errorMessage, 'error');
    
    // Reset recaptcha on error
    try {
      if (window.recaptchaVerifier) {
        await window.recaptchaVerifier.clear();
        recaptchaInitialized = false;
        setTimeout(() => initializeRecaptcha(), 1000);
      }
    } catch (resetError) {
      console.error('Error resetting reCAPTCHA:', resetError);
    }
  }
};

const verifyOTP = async (code) => {
  try {
    if (!code) {
      showNotification('Please enter the 6-digit OTP code.', 'error');
      return;
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      showNotification('Please enter a valid 6-digit OTP code.', 'error');
      return;
    }

    if (!window.confirmationResult) {
      showNotification('Please request an OTP first.', 'error');
      return;
    }

    showNotification('🔍 Verifying OTP...', 'info');

    const result = await window.confirmationResult.confirm(code);
    const user = result.user;
    
    logAction('OTP Verified', { uid: user.uid });
    showNotification('✅ Phone number verified successfully!', 'success');
    
    // Redirect based on current page
    setTimeout(() => {
      const currentPage = window.location.pathname;
      if (currentPage.includes('register')) {
        showNotification('🎉 Registration successful! Redirecting to dashboard...', 'success');
        window.location.href = 'dashboard.html';
      } else {
        showNotification('🔐 Login successful! Redirecting to dashboard...', 'success');
        window.location.href = 'dashboard.html';
      }
    }, 1500);
    
  } catch (error) {
    console.error('OTP verification error:', error);
    logAction('OTP Verification Failed', { error: error.message });
    
    let errorMessage = 'OTP verification failed. ';
    
    if (error.code === 'auth/invalid-verification-code') {
      errorMessage = 'Invalid OTP code. Please check and try again.';
    } else if (error.code === 'auth/code-expired') {
      errorMessage = 'OTP has expired. Please request a new code.';
    } else {
      errorMessage += error.message;
    }
    
    showNotification(errorMessage, 'error');
  }
};

// Helper function to clear OTP state
const clearOTPState = () => {
  window.confirmationResult = null;
  const otpInput = document.getElementById('otp');
  if (otpInput) {
    otpInput.value = '';
    otpInput.disabled = true;
  }
};

// Export functions
window.sendOTP = sendOTP;
window.verifyOTP = verifyOTP;
window.clearOTPState = clearOTPState;
