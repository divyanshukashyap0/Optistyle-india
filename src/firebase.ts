
import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore"; // Added Firestore import
import { ENV } from './config/env';

const firebaseConfig = {
  apiKey: ENV.FIREBASE.API_KEY,
  authDomain: ENV.FIREBASE.AUTH_DOMAIN,
  projectId: ENV.FIREBASE.PROJECT_ID,
  storageBucket: ENV.FIREBASE.STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE.MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE.APP_ID
};

let auth: Auth | undefined;
let db: Firestore | undefined; // Added Firestore export

// Only initialize if we have a valid API key to avoid "auth/invalid-api-key" error
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined' && !firebaseConfig.apiKey.includes('placeholder')) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("🔥 Firebase Client Initialized");
  } catch (e) {
    console.error("Firebase Init Error:", e);
  }
} else {
  console.warn("⚠️ Firebase Auth/DB disabled. Missing or invalid VITE_FIREBASE_API_KEY in .env");
  // Mock implementations could go here to prevent crashes, but for now we handle null checks in context
}

export { auth, db };
