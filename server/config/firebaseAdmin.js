const admin = require('firebase-admin');

/**
 * Initializes the Firebase Admin SDK.
 * Supports:
 * 1. Full Service Account credential (if private key & client email are provided)
 * 2. Project ID initialization (validates ID tokens for project 'packmasterpro-fc1b7')
 */
const projectId = process.env.FIREBASE_PROJECT_ID || 'packmasterpro-fc1b7';

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin SDK Initialized with Service Account');
    } else {
      admin.initializeApp({
        projectId: projectId,
      });
      console.log(`✅ Firebase Admin SDK Initialized for Project: ${projectId}`);
    }
  } catch (error) {
    console.error('❌ Firebase Admin SDK Initialization Error:', error.message);
  }
}

module.exports = admin;
