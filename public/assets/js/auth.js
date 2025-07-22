import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    logAction('User Registered', { email });
    alert('Registration Successful! Please login to continue.');
    window.location.href = 'login.html';
  } catch (error) {
    logAction('Registration Failed', error);
    alert(error.message);
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    logAction('User Logged In', { email });
    window.location.href = 'dashboard.html';
  } catch (error) {
    logAction('Login Failed', error);
    alert(error.message);
  }
};

const signOutUser = async () => {
  try {
    await signOut(auth);
    logAction('User Logged Out');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
    logAction('Logout Failed', error);
  }
};

// Make functions available globally
window.register = register;
window.login = login;
window.signOut = signOutUser;
