import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getMessaging, Messaging } from 'firebase/messaging';
import { Platform } from 'react-native';

// Firebase configuration - Replace with your actual Firebase project settings
// Get these values from your Firebase project console
const firebaseConfig = {
  apiKey: "AIzaSyB8sJuxbpeW6KmDQYWCV_WCekZPLuq7JUQ",
  authDomain: "jump-video.firebaseapp.com",
  projectId: "jump-video",
  storageBucket: "jump-video.firebasestorage.app",
  messagingSenderId: "805890269523",
  appId: "1:805890269523:web:4d81eb3e9d0dbdbbe481a6",
  measurementId: "G-CNSXZPHN4D"
};


// Validate Firebase configuration
const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain);
console.log('Firebase configuration status:', {
  isConfigured: isFirebaseConfigured,
  projectId: firebaseConfig.projectId,
  hasApiKey: !!firebaseConfig.apiKey,
  note: isFirebaseConfigured ? 'Firebase enabled with real configuration' : 'Firebase disabled - please update config/firebase.ts with your Firebase project settings'
});

// Initialize Firebase with mock setup for development
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let messaging: Messaging | null = null;

try {
  // Only initialize Firebase if we have a real configuration
  if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    // Initialize messaging only on web platform
    // Initialize Firebase Messaging
    try {
      if (Platform.OS === 'web') {
        // Web: Skip messaging due to browser compatibility issues
        console.log('🌐 Firebase messaging disabled on web for browser compatibility');
        messaging = null;
      } else {
        // iOS/Android: Initialize messaging normally
        messaging = null;
        console.log('📱 Firebase messaging initialized for mobile platform');
      }
    } catch (error) {
      console.warn('⚠️ Firebase messaging initialization failed:', error.message);
      messaging = null;
    }
    
    console.log('Firebase initialized successfully');
  } else {
    console.log('Firebase disabled - please update config/firebase.ts with your Firebase project settings from the Firebase console.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.log('Falling back to mock data');
}

export { db, messaging, isFirebaseConfigured };
export default app;