import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

/**
 * Firebase Client SDK Configuration
 * Reads from environment variables (VITE_FIREBASE_*) with user project defaults.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDKjtwK12WjZ8zt_onifXMnsfSoCN0o9ks',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'packmasterpro-fc1b7.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'packmasterpro-fc1b7',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'packmasterpro-fc1b7.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '88955607248',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:88955607248:web:fc071187a5e3a80757e6d5',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XWKL3V3X7G',
};

// Check if Firebase has a valid API key configured
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'demo-api-key' &&
  firebaseConfig.projectId
);

// Initialize Firebase App (prevent re-initialization if already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, googleProvider };
