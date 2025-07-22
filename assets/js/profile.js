import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

const showProfile = () => {
  const user = auth.currentUser;
  if (user) {
    document.getElementById('userProfile').innerHTML = `
      <div class="profile-info">
        <p><strong>Email:</strong> ${user.email || 'Not available'}</p>
        <p><strong>UID:</strong> ${user.uid}</p>
        <p><strong>Account Created:</strong> ${new Date(user.metadata.creationTime).toLocaleDateString()}</p>
        <p><strong>Last Login:</strong> ${new Date(user.metadata.lastSignInTime).toLocaleDateString()}</p>
      </div>`;
    logAction('Profile Loaded');
  } else {
    window.location.href = 'login.html';
  }
};

const copyUID = () => {
  const user = auth.currentUser;
  if (user) {
    navigator.clipboard.writeText(user.uid)
      .then(() => {
        alert('UID copied to clipboard!');
        logAction('UID Copied', { uid: user.uid });
      })
      .catch(err => {
        console.error('Could not copy UID:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = user.uid;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('UID copied to clipboard!');
        logAction('UID Copied (Fallback)', { uid: user.uid });
      });
  }
};

const showQRCode = () => {
  const user = auth.currentUser;
  if (user) {
    const qrData = JSON.stringify({
      uid: user.uid,
      email: user.email,
      type: 'gov_doc_share_profile'
    });
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=200x200&format=png`;
    
    // Create modal to show QR code
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); display: flex; justify-content: center;
      align-items: center; z-index: 10000;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 2rem; border-radius: 10px; text-align: center;">
        <h3>Your Profile QR Code</h3>
        <img src="${qrCodeUrl}" alt="Profile QR Code" style="margin: 1rem 0;">
        <p>Share this QR code with family members</p>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="padding: 0.5rem 1rem; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Close
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    logAction('QR Code Displayed', { uid: user.uid });
  }
};

// Check authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    showProfile();
  } else {
    window.location.href = 'login.html';
  }
});

window.copyUID = copyUID;
window.showQRCode = showQRCode;
window.onload = showProfile;
