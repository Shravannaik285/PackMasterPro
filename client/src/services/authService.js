import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../utils/firebaseConfig';

const USER_STORAGE_KEY = 'packmaster_user';
const TOKEN_STORAGE_KEY = 'packmaster_token';

/**
 * Get currently stored user profile from localStorage
 */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Perform real Google Sign-In via Firebase Authentication
 */
export const loginWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('Firebase is not yet configured. Please check your credentials in client/.env');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    const userProfile = {
      uid: user.uid,
      name: user.displayName || 'Packaging Manager',
      email: user.email,
      photoURL: user.photoURL,
      initials: user.displayName
        ? user.displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
        : 'SN',
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
    localStorage.setItem(TOKEN_STORAGE_KEY, idToken);
    window.dispatchEvent(new Event('authChange'));

    return { success: true, user: userProfile };
  } catch (error) {
    console.error('Firebase Google Sign-In Error:', error.code, error.message);

    // Provide student-friendly explanations for common Firebase error codes
    let userMessage = error.message;
    if (error.code === 'auth/unauthorized-domain') {
      userMessage = 'Domain not authorized in Firebase Console. Go to Firebase Console -> Authentication -> Settings -> Authorized domains -> Add "localhost".';
    } else if (error.code === 'auth/popup-closed-by-user') {
      userMessage = 'Sign-in popup was closed before finishing.';
    } else if (error.code === 'auth/popup-blocked') {
      userMessage = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    } else if (error.code === 'auth/operation-not-allowed') {
      userMessage = 'Google Sign-In is not enabled in Firebase. Go to Firebase Console -> Authentication -> Sign-in method -> Enable Google.';
    }

    throw new Error(userMessage);
  }
};

/**
 * Instant Demo Login (Matches avatar 'SN' from reference UI for offline viva tests)
 */
export const loginAsDemoUser = () => {
  const demoUser = {
    uid: 'demo_user_123',
    name: 'Suresh Nair',
    email: 'suresh.nair@business.in',
    initials: 'SN',
    photoURL: null,
    isDemo: true,
  };

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(demoUser));
  localStorage.setItem(TOKEN_STORAGE_KEY, 'demo-token');
  window.dispatchEvent(new Event('authChange'));

  return { success: true, user: demoUser };
};

/**
 * Sign out user from Firebase and clear local storage
 */
export const logoutUser = async () => {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning:', e.message);
    }
  }

  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.dispatchEvent(new Event('authChange'));
  return { success: true };
};

/**
 * Initialize Firebase Auth state listener to persist login across page reloads
 */
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const idToken = await user.getIdToken();
        const userProfile = {
          uid: user.uid,
          name: user.displayName || 'Packaging Manager',
          email: user.email,
          photoURL: user.photoURL,
          initials: user.displayName
            ? user.displayName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
            : 'SN',
        };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
        localStorage.setItem(TOKEN_STORAGE_KEY, idToken);
        window.dispatchEvent(new Event('authChange'));
      } catch (err) {
        console.warn('Error refreshing Firebase ID token:', err);
      }
    }
  });
}
