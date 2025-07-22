import { auth } from './firebase-config.js';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
  size: 'invisible',
  callback: (response) => {}
}, auth);

const sendOTP = async (phoneNumber) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
    window.confirmationResult = confirmationResult;
    logAction('OTP Sent', { phoneNumber });
  } catch (error) {
    logAction('OTP Error', error);
    alert(error.message);
  }
};

const verifyOTP = async (code) => {
  try {
    await window.confirmationResult.confirm(code);
    logAction('OTP Verified');
  } catch (error) {
    logAction('OTP Verification Failed', error);
    alert(error.message);
  }
};

window.sendOTP = sendOTP;
window.verifyOTP = verifyOTP;
