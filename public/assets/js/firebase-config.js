// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCw1nHIUj06se1Pj5LSJAHj9qlcQB6qINc",
  authDomain: "share-gov-docs-213b7.firebaseapp.com",
  projectId: "share-gov-docs-213b7",
  storageBucket: "share-gov-docs-213b7.firebasestorage.app",
  messagingSenderId: "1022578410753",
  appId: "1:1022578410753:web:8f2927bbdc025cdc6e4700",
  measurementId: "G-3DZY2Q6TH7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { firebaseConfig, auth, db, storage, analytics };
