# TabDesk

Full-screen, animated tablet tools: **Timer** (countdown / stopwatch / pomodoro), **Calendar** and **To-do**, with a new theme every day.

## Run

```bash
npm install
npm run dev      # http://localhost:5173 (also exposed on your LAN for the tablet)
npm run build && npm run preview
```

Open on the tablet and use **Add to Home Screen / Install app** for true full screen (PWA, `display: fullscreen`), or tap the full-screen button.

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`.

1. Push this folder to a GitHub repo (branch `main`).
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. The site is published at `https://<user>.github.io/<repo>/`. The base path is set automatically through `BASE_PATH`.

## PWA

Installable and works offline (vite-plugin-pwa, auto-update service worker). Icons in `public/` are generated from `public/icon.svg`. After changing the SVG, regenerate them with `npm run generate-pwa-assets`.

## Stack

React 18 + TypeScript + Vite · Framer Motion · Tailwind CSS · Zustand (persisted to localStorage) · date-fns · lucide-react · vite-plugin-pwa

## Structure

- `src/lib/themes.ts` – theme list and `themeForDate` (daily rotation). Add a theme by appending to `THEMES`.
- `src/apps/registry.ts` – tool registry. Add a new tool by adding an entry here.
- `src/components` – launcher, app shell (circular reveal + dock), theme picker, animated background.
