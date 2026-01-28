# Calorie Tracker (PWA)

Calorie Tracker is an offline-first, installable Next.js 15 (App Router) PWA for tracking daily calories with local-only data storage via IndexedDB (Dexie). It works on desktop and mobile and remains usable without a network connection.

## Features
- Onboarding wizard to calculate BMR, TDEE, and daily targets.
- Daily logging with editable entries and macro support.
- History and analytics dashboards with charts.
- Local-only data storage with export/import and reset tools.
- Installable PWA with offline shell support.

## Getting Started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Build & Run

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push your repository to GitHub.
2. Import the repo in Vercel.
3. Use the default Next.js build settings.
4. After deployment, open the site and install it as a PWA.

## Add to Home Screen

**iOS (Safari)**
1. Open the app URL.
2. Tap the share icon.
3. Tap **Add to Home Screen**.

**Android (Chrome)**
1. Open the app URL.
2. Tap the three-dot menu.
3. Tap **Install app** / **Add to Home screen**.

## Local Storage Notes

- Data is stored locally in IndexedDB (Dexie) in your browser.
- Clearing site data or browser storage will delete your entries.
- Use **Settings → Export JSON** to back up your data.

## PWA Icons

Place your production app icons in:
- `public/icons/icon-192x192.png`
- `public/icons/icon-512x512.png`

Replace the placeholder images with your own branding.
