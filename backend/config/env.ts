
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend directory
// We use process.cwd() to locate .env in the root of the backend folder, avoiding __dirname TS issues
// Using type assertion for process to avoid TS errors if @types/node isn't perfectly matched in context
dotenv.config({ path: path.resolve((process as any).cwd(), '.env') });

const getEnv = (key: string, required: boolean = false, fallback: string = ''): string => {
  const value = process.env[key];
  if (!value) {
    if (required) {
      console.error(`❌ [Backend Config] Missing REQUIRED environment variable: ${key}`);
      // We don't throw here to allow partial startup, but functionality will break.
      return fallback;
    }
    console.warn(`⚠️ [Backend Config] Missing optional variable: ${key}. Related features may be disabled.`);
    return fallback;
  }
  return value;
};

export const ENV = {
  PORT: getEnv('PORT', false, '5000'),
  
  // Firebase Admin
  FIREBASE: {
    PROJECT_ID: getEnv('FIREBASE_PROJECT_ID', true),
    CLIENT_EMAIL: getEnv('FIREBASE_CLIENT_EMAIL', true),
    PRIVATE_KEY: getEnv('FIREBASE_PRIVATE_KEY', true).replace(/\\n/g, '\n'), // Handle escaped newlines
  },

  // Payment
  RAZORPAY: {
    KEY_ID: getEnv('RAZORPAY_KEY_ID', true),
    KEY_SECRET: getEnv('RAZORPAY_KEY_SECRET', true),
  },

  // Email (OAuth)
  EMAIL: {
    CLIENT_ID: getEnv('GMAIL_CLIENT_ID', false),
    CLIENT_SECRET: getEnv('GMAIL_CLIENT_SECRET', false),
    REFRESH_TOKEN: getEnv('GMAIL_REFRESH_TOKEN', false),
    SENDER: getEnv('GMAIL_SENDER', false),
    ADMIN: getEnv('ADMIN_EMAIL', false, 'admin@optistyle.com'),
  },

  // External APIs
  GOOGLE_MAPS_KEY: getEnv('GOOGLE_MAPS_API_KEY', false),
  AI_API_KEY: getEnv('AI_API_KEY', false),
  AI_BASE_URL: getEnv('AI_API_BASE_URL', false, 'https://api.deepseek.com/chat/completions'),
  AI_MODEL: getEnv('AI_MODEL', false, 'deepseek-chat'),
};

console.log(`✅ [Backend Config] Configuration loaded. Port: ${ENV.PORT}`);
