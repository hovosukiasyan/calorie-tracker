# Calorie Tracker (PWA)

A privacy-first calorie tracker built with Next.js App Router, Dexie (IndexedDB), and Recharts. All data stays on your device and works offline.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build & Production

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push the repo to GitHub.
2. Create a new Vercel project from the repo.
3. Use the default Next.js build settings.
4. Deploy.

## Add to Home Screen

- **iOS (Safari)**: Tap Share → “Add to Home Screen.”
- **Android (Chrome)**: Tap the menu → “Install app.”

## Offline & Local Storage

- Data is stored locally in IndexedDB using Dexie.
- The service worker caches the app shell for offline usage.
- Clearing browser storage or uninstalling the PWA will remove your data.

## PWA Icons

Placeholder icons live in `public/icons/`. Replace them with your own PNG or SVG assets if desired.
