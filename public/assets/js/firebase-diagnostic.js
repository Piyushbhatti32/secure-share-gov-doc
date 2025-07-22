// Firebase Diagnostic Script
console.log('🔧 Firebase Diagnostic Script Starting...');

// Check if Firebase modules are available
const checkFirebaseAvailability = () => {
    console.log('📋 Firebase Availability Check:');
    
    // Check if FirebaseUI is loaded
    if (typeof window.firebaseui !== 'undefined') {
        console.log('✅ FirebaseUI is loaded');
    } else {
        console.error('❌ FirebaseUI is NOT loaded');
    }
    
    // Check if Firebase auth is available
    if (window.auth) {
        console.log('✅ Firebase Auth is available');
    } else {
        console.error('❌ Firebase Auth is NOT available');
    }
    
    // Check the container
    const container = document.getElementById('firebaseui-auth-container');
    if (container) {
        console.log('✅ Auth container found:', container);
        console.log('Container content:', container.innerHTML || '(empty)');
    } else {
        console.error('❌ Auth container NOT found');
    }
};

// Run diagnostics after DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(checkFirebaseAvailability, 1000);
    });
} else {
    setTimeout(checkFirebaseAvailability, 1000);
}

// Simple fallback UI if FirebaseUI fails to load
const createFallbackUI = () => {
    const container = document.getElementById('firebaseui-auth-container');
    if (!container) return;
    
    container.innerHTML = `
        <div style="text-align: center; padding: 20px; border: 2px dashed #ccc; border-radius: 8px;">
            <h3 style="color: #666; margin-bottom: 15px;">🔧 Authentication System Loading...</h3>
            <p style="color: #666; margin-bottom: 20px;">
                If this message persists, there might be a configuration issue.
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px; max-width: 300px; margin: 0 auto;">
                <button id="reload-firebase" onclick="window.location.reload()" 
                        style="padding: 10px 20px; background: #2d5aa0; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🔄 Reload Page
                </button>
                <a href="mailto:support@example.com" 
                   style="padding: 10px 20px; background: #6b7280; color: white; text-decoration: none; border-radius: 4px; display: block;">
                    📧 Contact Support
                </a>
            </div>
        </div>
    `;
};

// Export for global access
window.checkFirebaseAvailability = checkFirebaseAvailability;
window.createFallbackUI = createFallbackUI;

export { checkFirebaseAvailability, createFallbackUI };
