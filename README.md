<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# CyberCypher

An interactive cyberpunk-themed web component and asset hub featuring responsive previews, a sandbox editor, syntax-highlighted code export, dynamic palette synchronization, and Gemini AI-powered enhancements.

View your app in AI Studio: https://ai.studio/apps/432619ce-1d53-4f61-ace8-a8f2962e12a1

## Features

- **6 cyberpunk UI components** — buttons, cards, loaders, inputs, and interactive effects
- **Live sandbox** — tweak parameters and preview instantly
- **Code export** — copy or download standalone HTML/CSS/JS packages
- **Palette creator** — build, save, and sync custom neon themes
- **Gemini AI integration** — AI palette synthesis, parameter suggestions, and code enhancement
- **PWA support** — installable with offline caching

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your Gemini API key in [`.env.local`](.env.local):
   ```
   GEMINI_API_KEY=your_key_here
   ```
   Get a key from [Google AI Studio](https://aistudio.google.com/apikey).

3. Start the full stack (API server + Vite dev server):
   ```bash
   npm run dev:full
   ```
   Or run separately:
   ```bash
   npm run dev:server   # Express + Gemini API on :3001
   npm run dev          # Vite frontend on :3000
   ```

4. Open http://localhost:3000

## Production

```bash
npm run build
npm start
```

Serves the built app and API from port 3001 (configurable via `PORT`).

## AI Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/health` | Server and Gemini status |
| `POST /api/generate-palette` | AI neon theme synthesis |
| `POST /api/enhance-code` | AI code comments and polish |
| `POST /api/suggest-params` | AI sandbox parameter suggestions |
