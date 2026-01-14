import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Safely access env to prevent crash if import.meta.env is undefined
const meta = (import.meta as any) || {};
const env = meta.env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

let auth: Auth | undefined;

// Only initialize if we have a valid API key to avoid "auth/invalid-api-key" error
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined') {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (e) {
    console.error("Firebase Init Error:", e);
  }
} else {
  console.warn("VITE_FIREBASE_API_KEY is missing. Firebase Authentication will be disabled.");
}

export { auth };