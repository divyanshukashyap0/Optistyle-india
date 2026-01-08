
// src/config/env.ts

/**
 * Validated Environment Variables for Frontend
 * All access to import.meta.env should go through this file.
 */

const getEnv = (key: keyof ImportMetaEnv, required: boolean = false, fallback: string = ''): string => {
  const value = import.meta.env[key];
  if (!value) {
    if (required) {
      console.warn(`⚠️ [Frontend Config] Missing recommended environment variable: ${key}. Some features may not work.`);
    }
    return fallback;
  }
  return value;
};

export const ENV = {
  // API URL
  API_URL: getEnv('VITE_API_URL', true, 'http://localhost:5000/api'),

  // Firebase Config
  FIREBASE: {
    API_KEY: getEnv('VITE_FIREBASE_API_KEY', true),
    AUTH_DOMAIN: getEnv('VITE_FIREBASE_AUTH_DOMAIN', true),
    PROJECT_ID: getEnv('VITE_FIREBASE_PROJECT_ID', true),
    STORAGE_BUCKET: getEnv('VITE_FIREBASE_STORAGE_BUCKET', true),
    MESSAGING_SENDER_ID: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', true),
    APP_ID: getEnv('VITE_FIREBASE_APP_ID', true),
  },

  // Razorpay
  RAZORPAY: {
    KEY_ID: getEnv('VITE_RAZORPAY_KEY_ID', true),
  },
};

// Log initialization status
const missingKeys: string[] = [];
if (!ENV.FIREBASE.API_KEY) missingKeys.push('VITE_FIREBASE_API_KEY');
if (!ENV.RAZORPAY.KEY_ID) missingKeys.push('VITE_RAZORPAY_KEY_ID');

if (missingKeys.length > 0) {
  console.groupCollapsed('⚠️ OptiStyle Config Warning');
  console.log('Some features will be disabled due to missing keys:');
  missingKeys.forEach(k => console.log(`- ${k}`));
  console.log('See .env.example for setup instructions.');
  console.groupEnd();
} else {
  console.log('✅ OptiStyle Config Loaded');
}
