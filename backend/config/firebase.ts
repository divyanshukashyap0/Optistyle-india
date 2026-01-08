
import admin from 'firebase-admin';
import { ENV } from './env.ts';

// Construct service account from env vars
const getServiceAccount = () => {
  return {
    projectId: ENV.FIREBASE.PROJECT_ID,
    clientEmail: ENV.FIREBASE.CLIENT_EMAIL,
    privateKey: ENV.FIREBASE.PRIVATE_KEY,
  };
};

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

const mockDb = {
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => undefined }),
      set: async () => console.warn("DB Write Ignored (Mock)"),
      update: async () => console.warn("DB Update Ignored (Mock)"),
      delete: async () => console.warn("DB Delete Ignored (Mock)"),
    }),
    where: () => ({ limit: () => ({ get: async () => ({ empty: true, docs: [] }) }) }),
    orderBy: () => ({ get: async () => ({ docs: [] }) }),
    add: async () => ({ id: 'mock-id' }),
    get: async () => ({ empty: true, docs: [], forEach: () => {} }),
  }),
  runTransaction: async (fn: any) => { console.warn("Transaction Ignored (Mock)"); return null; }
} as unknown as admin.firestore.Firestore;

const mockAuth = {
  verifyIdToken: async () => { throw new Error("Auth Not Configured"); },
  getUser: async () => ({ uid: 'mock', email: 'mock@test.com' }),
} as unknown as admin.auth.Auth;

if (!admin.apps.length) {
  try {
    const serviceAccount = getServiceAccount();
    
    // Strict check for required fields before attempting init
    if (serviceAccount.projectId?.length > 2 && serviceAccount.clientEmail?.length > 2 && serviceAccount.privateKey?.length > 10) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.projectId}.appspot.com` 
      });
      console.log("🔥 Firebase Admin Initialized Successfully");
      db = admin.firestore();
      auth = admin.auth();
    } else {
      console.warn("⚠️ [Firebase] Credentials missing or invalid in .env. Using Mock DB to keep server alive.");
      db = mockDb;
      auth = mockAuth;
    }
  } catch (error) {
    console.error("❌ Firebase Admin Init Error:", error);
    db = mockDb;
    auth = mockAuth;
  }
} else {
    // If app already exists (hot reload)
    db = admin.firestore();
    auth = admin.auth();
}

export { db, auth };
