# Dynamic IT — Production Deployment Guide

This guide covers deploying **Dynamic IT** for real commercial clients using either:
- **Option A (Recommended Unified Cloud Deployment)**: Single Web Service on **Render** or **Railway** + **MongoDB Atlas** + **Cloudinary**
- **Option B (Split Frontend/Backend Deployment)**: **Vercel / Netlify** (Frontend) + **Render / Railway** (Backend API) + **MongoDB Atlas**

---

## 1. Set Up Production Database (MongoDB Atlas)

1. Create a free or dedicated cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with **Read and write to any database** permissions.
3. Under **Network Access**, whitelist your cloud host IP (or `0.0.0.0/0` for Render/Railway dynamic IPs).
4. Copy your connection string:
   ```text
   mongodb+srv://<db_user>:<db_password>@cluster0.xxxxx.mongodb.net/dynamic_it?retryWrites=true&w=majority
   ```

---

## 2. Set Up Persistent File Storage (Cloudinary)

Cloud servers use ephemeral disks, so configure [Cloudinary](https://cloudinary.com/) so client reference uploads (PDF, JPG, PNG, DOCX) persist permanently:
1. Sign up for a free Cloudinary account.
2. Copy your **Cloud Name**, **API Key**, and **API Secret** from the Cloudinary Dashboard.

---

## 3. Option A — Unified Deployment on Render / Railway (Easiest)

Because `backend/server.js` is configured to serve `frontend/dist` automatically when `SERVE_FRONTEND=true` (or `NODE_ENV=production`), you can deploy both the React frontend and Express API as one service on the same domain (avoiding cross-domain third-party cookie restrictions):

1. Push this repository to GitHub.
2. In **Render**, click **New + → Blueprint** (which reads `render.yaml`) or **New Web Service**:
   - **Build Command**:
     ```bash
     npm --prefix backend install && npm --prefix frontend install && npm --prefix frontend run build
     ```
   - **Start Command**:
     ```bash
     npm --prefix backend start
     ```
3. Set the following **Environment Variables**:
   ```env
   NODE_ENV=production
   SERVE_FRONTEND=true
   MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dynamic_it?retryWrites=true&w=majority
   JWT_SECRET=<generate-a-64-character-random-secret>
   CLIENT_URL=https://your-production-domain.com
   COOKIE_SAMESITE=lax
   SEED_DEMO_DATA=false
   ADMIN_EMAIL=admin@your-domain.com
   ADMIN_INITIAL_PASSWORD=<your-strong-admin-password>
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>
   ```
4. On first boot, the server automatically seeds the 6 core digital agency services and your initial Administrator account (`ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD`) without creating any fake demo customers.

---

## 4. Option B — Split Deployment (Vercel Frontend + Render Backend)

If you host the frontend on **Vercel** (`https://dynamicit.com`) and the backend on **Render** (`https://api.dynamicit.com`):

### Backend Environment Variables (Render)
- Set `CLIENT_URL=https://dynamicit.com,https://www.dynamicit.com`
- Set `COOKIE_SAMESITE=none` (required for cross-origin HTTPS cookies)
- Set `SERVE_FRONTEND=false`

### Frontend Environment Variables (Vercel)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  ```env
  VITE_API_URL=https://api.dynamicit.com/api
  VITE_DEMO_MODE=false
  ```
- `frontend/vercel.json` and `frontend/public/_redirects` are already included to handle client-side React Router navigation.
