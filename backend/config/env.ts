
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const cwd = (process as any).cwd() as string;
const candidates =
  path.basename(cwd) === 'backend'
    ? [path.resolve(cwd, '.env'), path.resolve(cwd, '..', '.env')]
    : [path.resolve(cwd, 'backend', '.env'), path.resolve(cwd, '.env')];

const envPath = candidates.find((p) => fs.existsSync(p));
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

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
    PASSWORD: getEnv('GMAIL_APP_PASSWORD', false),
    SMTP_HOST: getEnv('SMTP_HOST', false),
    SMTP_PORT: getEnv('SMTP_PORT', false),
    ADMIN: getEnv('ADMIN_EMAIL', false, 'optistyle.india@gmail.com'),
  },

  // External APIs
  GOOGLE_MAPS_KEY: getEnv('GOOGLE_MAPS_API_KEY', false),
  AI_API_KEY: getEnv('AI_API_KEY', false),
  AI_BASE_URL: getEnv('AI_API_BASE_URL', false, 'https://api.deepseek.com/chat/completions'),
  AI_MODEL: getEnv('AI_MODEL', false, 'deepseek-chat'),
};

console.log(`✅ [Backend Config] Configuration loaded. Port: ${ENV.PORT}`);
