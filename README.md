
# 👓 OptiStyle - Deployment Master Guide

This repository contains the full source code for the OptiStyle Eyewear Platform.
It includes a **React Frontend** and a **Node.js/Express Backend** in a single repository.

---

## 🚀 1. Quick Start (Local Machine)

**Prerequisites:** Node.js v18+ installed.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:**
    - Rename `.env.example` to `.env`.
    - Fill in the keys (Razorpay, Firebase).
    - Ensure `VITE_API_URL=http://localhost:5000/api`.

3.  **Start Backend:**
    Open Terminal #1:
    ```bash
    npm run server
    ```
    *Output should say: "Backend running on http://localhost:5000"*

4.  **Start Frontend:**
    Open Terminal #2:
    ```bash
    npm run dev
    ```
    *Output will give a link: http://localhost:5173*

---

## 🌐 2. Deployment Guide (Production)

You must deploy the Frontend and Backend to separate services.

### Part A: Deploy Backend (Render / Railway)

We deploy the backend first to get the Live API URL.

1.  Create a new Web Service on **Render**.
2.  Connect this GitHub repository.
3.  **Settings:**
    - **Runtime:** Node
    - **Build Command:** `npm install && npm run build:backend`
    - **Start Command:** `npm run start:backend`
4.  **Environment Variables:**
    - Copy all Backend keys from `.env` (PORT, FIREBASE_..., RAZORPAY_...).
    - *Note:* Do NOT include `VITE_` keys here.
5.  Deploy. Copy the **Service URL** (e.g., `https://optistyle-api.onrender.com`).

### Part B: Deploy Frontend (Netlify / Vercel)

1.  Create a new Site on **Netlify**.
2.  Connect this GitHub repository.
3.  **Settings:**
    - **Build Command:** `npm run build`
    - **Publish Directory:** `dist`
4.  **Environment Variables:**
    - Copy all `VITE_` keys from `.env`.
    - **CRITICAL:** Update `VITE_API_URL` to the Backend URL from Part A (e.g., `https://optistyle-api.onrender.com/api`).
5.  Deploy.

---

## 🛠️ 3. Troubleshooting

**Frontend blank screen?**
Check browser console. If `import.meta.env` errors appear, you forgot to add Environment Variables in Netlify settings.

**Backend crashes on deploy?**
Check Render logs.
- If "Firebase Init Error": Your Private Key might be missing quotes or newlines.
- If "Cannot find module": Ensure `npm run build:backend` ran successfully.

**CORS Errors?**
Ensure the Backend variable `CORS_ORIGIN` (if set) includes your Netlify URL, or default CORS settings are permissive.

**Typescript Errors?**
Run `npm run build` locally to catch errors before pushing code.

