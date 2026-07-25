# FFXIV Glamour Maker 2 (Character Glamour)
A React + Vite application for previewing and organizing Final Fantasy XIV glamour sets offline. Featuring dynamic Cloudinary image generation and a massive offline-first item search database.

## Features
- **Offline-first Search:** Instantly search through ~40,000 localized items without waiting for server responses.
- **Dynamic Image Loading:** Automatically matches Korean item names with Cloudinary CDN.
- **Export / Share:** Render the HTML canvas into a downloadable or shareable image PNG.
- **Dye Preview:** Map two dye slots per item directly within the UI.
- **Multilingual:** UI and dye search support Korean, English, and Japanese.

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

This application is deployed via **Cloudflare Pages**.

Security headers and SPA routing are configured via `public/_headers` and `public/_redirects`.

1. Commit your changes and push to GitHub.
2. Cloudflare Pages will automatically trigger a build (`npm run build`) and deploy the app.

### Missing-item report security

Missing item images are reported through `POST /api/report-missing-item`. The
browser must never receive the Discord webhook URL.

Before deploying this endpoint:

1. Revoke any webhook that was previously configured as
   `VITE_DISCORD_WEBHOOK_URL`.
2. Create a replacement Discord webhook.
3. Configure the replacement in Cloudflare Pages as the encrypted, server-only
   environment binding `DISCORD_WEBHOOK_URL`.
4. Remove `VITE_DISCORD_WEBHOOK_URL` from every Cloudflare environment and local
   Vite environment file.
5. Configure a Cloudflare edge rate-limit rule for
   `/api/report-missing-item`, keyed by client IP. The recommended starting
   policy is 10 POST requests per minute with a 10-minute block period.

The endpoint rejects non-JSON, cross-origin, oversized, and invalid requests.
Its application validation is not a replacement for the edge rate-limit rule.

## Maintenance & Item Updates

When a new FFXIV patch drops and you need to add new items, read the included [UPDATING_ITEMS.md](./UPDATING_ITEMS.md) for the full guide.

**Quick reference:**
```bash
node scripts/makeKoItems.mjs  # 1. Update item database
npm run sync                   # 2. Sync new icons from XIVAPI → Cloudinary
git push                       # 3. Deploy
```

## Utility Scripts
All data extraction and upload tools are in the `/scripts` directory.
