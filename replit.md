# Noor Web — pnpm Monorepo

## Overview

Landing page + backend for the **Noor** Android app. Users can download the APK, read reviews, and submit their own. An admin panel lets the owner update the APK download link without redeploying.

## Stack

| Layer | Tech |
|---|---|
| Monorepo | pnpm workspaces |
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion |
| Backend | Express 5, Node.js 20 |
| Database | PostgreSQL + Drizzle ORM |
| App DB (reviews/config) | Firebase Firestore |
| Media | Cloudinary (uploads) |
| Validation | Zod, drizzle-zod |
| API codegen | Orval (OpenAPI → React Query hooks) |

## Running the project

```bash
pnpm install          # install all workspace deps
```

The **Run** button (or workflow "Start application") starts the landing page:

```bash
PORT=23378 BASE_PATH=/ pnpm --filter @workspace/noor-landing run dev
```

To start the API server separately:

```bash
pnpm --filter @workspace/api-server run dev
```

## Project structure

```
artifacts/
  noor-landing/       # React/Vite landing page (main app, port 23378)
  api-server/         # Express 5 API server
  mockup-sandbox/     # UI prototyping environment
lib/
  api-spec/           # OpenAPI spec + Orval codegen config
  api-client-react/   # Generated React Query hooks
  api-zod/            # Generated Zod schemas
  db/                 # Drizzle ORM schema + PostgreSQL connection
scripts/              # Workspace utility scripts
```

## Environment variables

| Variable | Where set | Purpose |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Replit shared env | Firebase project access |
| `VITE_CLOUDINARY_CLOUD_NAME` | Replit shared env | Cloudinary media uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Replit shared env | Cloudinary unsigned preset |
| `VITE_ADMIN_PIN` | Replit secret | PIN to access the `/admin` page |
| `SESSION_SECRET` | Replit secret | Express session signing |
| `DATABASE_URL` | Replit (auto) | PostgreSQL connection string |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | Replit secret | Push to GitHub |

## APK distribution

The APK download URL is stored in Firebase Firestore (`app_config/apk`). To update it:

1. Upload the new `.apk` to **GitHub Releases** on this repo
2. Copy the direct download URL (format: `https://github.com/seifkamel379-art/Noor-web/releases/download/vX.Y.Z/noor-app.apk`)
3. Go to `/admin` on the site, enter the admin PIN, paste the URL, and save

## Key files

- `artifacts/noor-landing/src/pages/Landing.tsx` — main landing page
- `artifacts/noor-landing/src/pages/Admin.tsx` — PIN-protected admin panel
- `artifacts/noor-landing/src/lib/firebase.ts` — Firestore helpers (APK URL, download count, reviews)
- `artifacts/noor-landing/src/lib/cloudinary.ts` — Cloudinary upload helper
- `lib/db/src/schema/` — Drizzle table definitions

## User preferences

- APK distribution via GitHub Releases (not Google Drive)
- Push changes to GitHub using `GITHUB_PERSONAL_ACCESS_TOKEN`
