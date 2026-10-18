import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

/**
 * Firebase Client SDK Configuration
 * Reads from environment variables (VITE_FIREBASE_*) with user project defaults.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA7D-n0dm8lIpTAiWhNkCakHmq9EunPkLQ',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'packmasterpro-243c1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'packmasterpro-243c1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'packmasterpro-243c1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '925446501306',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:925446501306:web:886525904b6233188b6383',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-2WPYQDCC9J',
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
