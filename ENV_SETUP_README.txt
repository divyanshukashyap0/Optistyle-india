
================================================================================
OptiStyle - ENVIRONMENT CONFIGURATION GUIDE
================================================================================

This guide explains how to configure the application secrets (API Keys, Database Credentials).

⚠️ IMPORTANT ARCHITECTURE NOTE:
For LOCAL DEVELOPMENT, we use a SINGLE `.env` file in the project ROOT.
This is because both the Frontend (Vite) and Backend (Node.js) are run from the root directory.

================================================================================
1. LOCAL DEVELOPMENT SETUP (Laptop/PC)
================================================================================

Step 1: Create the File
   - Go to the project root folder.
   - Create a file named `.env` (no name, just extension).

Step 2: Add Variables
   - Copy the contents from `.env.example` into your new `.env` file.
   - You need to fill in BOTH Frontend and Backend keys in this single file for local testing.

Step 3: Required Variables Structure

   # --- FRONTEND KEYS (Must start with VITE_) ---
   VITE_API_URL=http://localhost:5000/api
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_RAZORPAY_KEY_ID=rzp_test_...

   # --- BACKEND KEYS (Secret - Never share) ---
   PORT=5000
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   GMAIL_SENDER=...
   GMAIL_CLIENT_ID=...
   GMAIL_CLIENT_SECRET=...
   GMAIL_REFRESH_TOKEN=...
   ADMIN_EMAIL=...

================================================================================
2. DEPLOYMENT SETUP (Production)
================================================================================

When deploying, you split the variables based on the host.

FRONTEND HOST (e.g., Netlify, Vercel):
   - Add ONLY the variables starting with `VITE_`.
   - Update `VITE_API_URL` to your live backend address (e.g., https://api.optistyle.com).

BACKEND HOST (e.g., Render, Railway, Heroku):
   - Add ONLY the Backend keys (PORT, FIREBASE_..., RAZORPAY_..., GMAIL_...).
   - Do not add VITE_ keys here (except maybe VITE_API_URL if needed for CORS).

================================================================================
3. TROUBLESHOOTING
================================================================================

1. "Firebase Admin Error":
   - Ensure `FIREBASE_PRIVATE_KEY` is wrapped in double quotes.
   - Ensure it contains `\n` characters, not actual line breaks.

2. "Variables are undefined":
   - Did you restart the server? `npm run dev` and `npm run server` must be restarted to load new keys.
   - Is the file named exactly `.env`?

3. "Vite keys not visible":
   - Ensure they start with `VITE_`.

================================================================================
