# MovieVerse – Vercel Deployment Guide

This guide walks you through deploying **MovieVerse** to [Vercel](https://vercel.com) with full-stack support (React 19 Vite frontend + Node.js/Express serverless backend).

---

## 🌟 How the Vercel Deployment Works

MovieVerse is configured as a **unified full-stack monorepo** on Vercel:
- **Frontend**: The React 19 Vite application builds into `frontend/dist` and is served via Vercel's global Edge CDN.
- **Backend**: The Express application runs as a **Vercel Serverless Function** via [`api/index.js`](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/api/index.js).
- **Routing**: [`vercel.json`](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/vercel.json) rewrites:
  - All `/api/*` calls directly to the serverless function.
  - All client routes (`/watchlist`, `/movie/:id`, etc.) to `/index.html` to prevent 404 errors on page reload.

---

## 🚀 Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push Code to GitHub / GitLab / Bitbucket
Ensure your latest code with `package.json`, `vercel.json`, and `api/index.js` is committed and pushed to your repository:
```bash
git add .
git commit -m "Configure MovieVerse for Vercel deployment"
git push origin main
```

### Step 2: Import Project into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** ➜ **"Project"**.
3. Select and import your `MovieVerse` repository.

### Step 3: Configure Build & Output Settings
Vercel will detect the project automatically from `vercel.json` and `package.json`:
- **Framework Preset**: `Vite` (or `Other`)
- **Root Directory**: `./` (leave as default root)
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`

### Step 4: Add Environment Variables
Before clicking deploy, expand the **"Environment Variables"** section in Vercel and add:

| Key | Example / Description | Required? |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/MovieVerse` | **Yes** |
| `JWT_SECRET` | A secure random string (e.g. `your_long_random_jwt_secret`) | **Yes** |
| `TMDB_API_KEY` | Your 32-character TMDB API v3 key | **Yes** |
| `FRONTEND_URL` | Your production Vercel URL (e.g. `https://movie-verse.vercel.app`) | *Optional* |

> [!IMPORTANT]
> **MongoDB Atlas Network Access**:
> Since Vercel Serverless Functions use dynamic IP addresses across AWS regions, ensure your MongoDB Atlas cluster allows connections from anywhere:
> 1. In MongoDB Atlas, go to **Network Access**.
> 2. Click **Add IP Address**.
> 3. Select **Allow Access From Anywhere** (`0.0.0.0/0`) and save.

### Step 5: Click Deploy
Click **"Deploy"**. Vercel will install dependencies, build the Vite frontend, package the serverless function, and give you a live production URL!

---

## ⚡ Option 2: Deploy via Vercel CLI

If you prefer deploying from your command line:

1. **Install Vercel CLI globally**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project root**:
   ```bash
   vercel
   ```
   Follow the prompts (accept default settings for root directory `./`).

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

5. **Set Environment Variables via CLI**:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add TMDB_API_KEY
   ```

---

## 🔄 Option 3: Separate Frontend & Backend Deployments (Alternative)

If you ever wish to deploy the frontend on Vercel and the backend on Render/Railway/Heroku:
1. Deploy your backend to Render or Railway.
2. In Vercel, set **Root Directory** to `frontend`.
3. In Vercel Environment Variables, add:
   - `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com/api`
4. The fallback [`frontend/vercel.json`](file:///c:/Users/mopad/OneDrive/Attachments/Desktop/MERN/MovieVerse/frontend/vercel.json) will automatically handle SPA client routing.

---

## 🛠️ Verification & Troubleshooting Checklist

- [x] **Page Refresh (SPA Routing)**: Refreshing `/watchlist` or `/movie/12345` loads the view without 404 errors.
- [x] **Backend Health Check**: Visiting `https://your-app.vercel.app/api` returns `MovieVerse API is running...`.
- [x] **Database Connection**: User registration and login succeed without timeout errors (Mongoose connections are cached).
- [x] **TMDB Integration**: Popular movies load on the home screen and search functions without exposing the TMDB API key.
