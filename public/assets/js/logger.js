import { db, auth } from './firebase-config.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const logAction = async (action, detail = {}) => {
  const logEntry = {
    action,
    detail,
    timestamp: new Date().toISOString(),
    userId: auth.currentUser ? auth.currentUser.uid : 'anonymous',
    userEmail: auth.currentUser ? auth.currentUser.email : null
  };
  
  // Log to console for debugging
  console.log(`[LOG] ${action}:`, detail);
  
  // Store in Firestore for audit trail
  try {
    await addDoc(collection(db, 'logs'), logEntry);
  } catch (error) {
    console.error('Failed to store log in Firestore:', error);
  }
};

window.logAction = logAction;
