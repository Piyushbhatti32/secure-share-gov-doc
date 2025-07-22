import { auth } from './firebase-config.js';

// Check Firebase configuration status
const checkFirebaseConfiguration = async () => {
  const configStatus = {
    emailAuth: true,
    phoneAuth: false,
    firestore: true,
    storage: true
  };

  try {
    // Test phone auth configuration
    // We don't actually try to send OTP, just check if the configuration exists
    const testDiv = document.createElement('div');
    testDiv.id = 'test-recaptcha-container';
    testDiv.style.display = 'none';
    document.body.appendChild(testDiv);

    const { RecaptchaVerifier } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const testVerifier = new RecaptchaVerifier('test-recaptcha-container', {
      size: 'invisible'
    }, auth);

    // If we reach here, phone auth is likely configured
    configStatus.phoneAuth = true;
    
    // Clean up test elements
    await testVerifier.clear();
    document.body.removeChild(testDiv);

  } catch (error) {
    console.warn('Phone authentication not configured:', error.message);
    
    // Clean up test elements
    const testDiv = document.getElementById('test-recaptcha-container');
    if (testDiv) {
      document.body.removeChild(testDiv);
    }
  }

  return configStatus;
};

// Update UI based on configuration status
const updateUIBasedOnConfig = async () => {
  const config = await checkFirebaseConfiguration();
  
  // Hide phone auth options if not configured
  if (!config.phoneAuth) {
    // Hide mobile login toggle buttons
    const mobileToggleButtons = document.querySelectorAll('[data-method="mobile"]');
    mobileToggleButtons.forEach(button => {
      button.style.display = 'none';
    });

    // Hide mobile login sections
    const mobileLoginSections = document.querySelectorAll('#mobile-login, #mobile-register');
    mobileLoginSections.forEach(section => {
      section.style.display = 'none';
    });

    // Update toggle containers to only show email option
    const toggleContainers = document.querySelectorAll('.toggle-container');
    toggleContainers.forEach(container => {
      const emailButton = container.querySelector('[data-method="email"]');
      if (emailButton) {
        emailButton.style.width = '100%';
        emailButton.textContent = '📧 Email Login/Registration';
      }
    });

    // Store config status for other modules to check
    window.firebaseConfig = config;
  }

  console.log('Firebase Configuration Status:', config);
  return config;
};

// Initialize configuration checker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(updateUIBasedOnConfig, 1000);
});

// Export for use in other modules
window.checkFirebaseConfiguration = checkFirebaseConfiguration;
window.updateUIBasedOnConfig = updateUIBasedOnConfig;
