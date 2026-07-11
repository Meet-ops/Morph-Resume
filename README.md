# AI Resume Checker

An AI-powered resume optimization platform that parses uploaded resumes, generates an ATS (Applicant Tracking System) compatibility score using Google Gemini, and suggests stronger, industry-relevant wording — with version history so users can track improvements over time.

> **App Link:** https://morph-resume-two.vercel.app

---

## Features

- **Resume Upload & Parsing** — accepts resume files and extracts structured content server-side (`pdf-parse`).
- **AI-Powered ATS Scoring** — sends parsed content to Google Gemini 2.5 Flash to generate an ATS compatibility score.
- **Smart Suggestions** — detects generic/basic wording and recommends professional, keyword-optimized phrasing to improve ATS matching.
- **Resume Version History** — stores and retrieves past versions so users can compare iterations over time.
- **Secure Auth** — JWT-based authentication delivered via HTTP-only cookies (in progress).

---

## Tech Stack

### Frontend (`/Frontend/AiResumeChecker`)
- **React 19** + **Vite 8**
- **Tailwind CSS 4** + **shadcn/ui**
- **Axios** (with `withCredentials` for cookie-based auth)
- **TanStack React Query** — server-state caching/fetching
- **React Router DOM** — client-side routing

### Backend (`/Backend`)
- **Node.js** (CommonJS, engine `>=20`) + **Express**
- **MongoDB** with **Mongoose**
- **@google/genai** — Google Gemini SDK (model: `gemini-2.5-flash`)
- **pdf-parse** — resume text extraction
- **JWT** — auth token signing/verification
- **CORS** — dynamic origin allow-list, `credentials: true`

---

## Project Structure

```
.
├── Backend/
│   ├── src/
│   │   ├── config/         # env.js, db.js, cors.js, etc.
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express route definitions
│   │   ├── controllers/    # Route handler logic
│   │   ├── middleware/     # auth, error handling, etc.
│   │   └── server.js       # App entry point
│   ├── package.json
│   └── .env                # not committed
│
└── Frontend/
    └── AiResumeChecker/
        ├── src/
        │   ├── components/ # UI components (incl. shadcn/ui)
        │   ├── lib/         # apiClient.js (Axios instance), utils
        │   ├── pages/       # Route-level views
        │   └── main.jsx
        ├── vite.config.js  # Dev proxy: /api → localhost:5000
        ├── package.json
        └── .env             # not committed
```

---

## Prerequisites

- Node.js **v20+**
- npm
- A MongoDB Atlas cluster (or local MongoDB instance) — see the [deployment guide](./mern-production-deployment-plan.md) for Atlas setup
- A Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))

---

## Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <repo-name>
```

### 2. Backend setup
```bash
cd Backend
npm install
```

Create a `.env` file in `/Backend` (see [Environment Variables](#environment-variables) below), then start the dev server:
```bash
npm start
```
The API will run on `http://localhost:5000` (or your configured `PORT`).

### 3. Frontend setup
```bash
cd Frontend/AiResumeChecker
npm install
npm run dev
```
The app will run on Vite's default dev port (typically `http://localhost:5173`), with `/api` requests proxied to `http://localhost:5000` automatically via `vite.config.js` — no `.env` needed for the API URL in local dev.

---

## Environment Variables

### Backend — `/Backend/.env`
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
COOKIE_NAME=arr_token
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=gemini-2.5-flash
```

> ⚠️ **Note:** ensure `env.js` reads `process.env.PORT` (not `process.env.POST`) — a fixed typo that otherwise silently ignores the assigned port in production.

### Frontend — `/Frontend/AiResumeChecker/.env`
```env
# Leave unset in local dev — Vite's proxy handles /api automatically.
# Set only in production (see deployment guide):
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## Building for Production

**Frontend:**
```bash
cd Frontend/AiResumeChecker
npm run build      # outputs static files to /dist
npm run preview    # optional: sanity-check the build locally
```

**Backend:**
```bash
cd Backend
NODE_ENV=production npm start
```

For full hosting recommendations, MongoDB Atlas setup, CORS/cookie configuration for cross-domain auth, and exact deploy steps for Render/Vercel, see **[`mern-production-deployment-plan.md`](./mern-production-deployment-plan.md)**.

---

## Roadmap

- [x] Resume upload & parsing API
- [x] Gemini-based ATS scoring
- [x] Wording suggestion engine
- [x] Resume version history endpoints
- [ ] Authentication (JWT + HTTP-only cookies) — in progress
- [ ] Improved resume file-handling
- [ ] Frontend integration for auth-gated routes

---

## License

Add your preferred license here (e.g. MIT).
