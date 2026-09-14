# RetainCurve — Spaced Repetition Revision Tracker

A full-stack web application implementing the Hermann Ebbinghaus **Forgetting Curve (1-3-7-14-30 day spaced repetition rule)** with MongoDB Atlas integration.

## 📁 Repository Structure
- `backend/` — Node.js, Express, Mongoose (MongoDB Atlas), Node-Cron daily reminder
- `frontend/` — React 19, Vite 8, Lucide icons, Canvas-confetti, Vanilla CSS theme engine

## 🚀 Local Development

### 1. Backend
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## 🌐 Production Deployment

### Backend (Render.com)
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node server.js`
- Environment Variables:
  - `MONGODB_URI`: Your MongoDB Atlas URI
  - `JWT_SECRET`: Secret key for JWT authentication
  - `PORT`: `5000`

### Frontend (Vercel / Netlify)
- Root Directory: `frontend` (or Base Directory in Netlify)
- Build Command: `npm run build`
- Output / Publish Directory: `dist`
- Environment Variable:
  - `VITE_API_URL`: Your Render backend URL + `/api` (e.g., `https://retaincurve-api.onrender.com/api`)
