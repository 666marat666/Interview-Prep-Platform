<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Interview Prep Platform (Vue 3 + Vite)

This app is a Vue 3 rewrite of the original React version and runs entirely in the browser.

Note: A simple password gate is enabled in the UI and Go functions. The password is hardcoded to `marat007!`.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create `.env.local` and set your Gemini key for the Go proxy:
   `GEMINI_API_KEY=your-key-here`
   Optional model overrides (defaults shown in `.env.example`):
   `GEMINI_MODEL_QUESTION`, `GEMINI_MODEL_EVAL`
   Client-side `VITE_*` vars are no longer required once the proxy is used.
3. Start the local Go API (new terminal):
   `npm run dev:api`
4. Start the Vite dev server:
   `npm run dev`

### Local Mock Mode

If you want to run without real Gemini calls, set:
`GEMINI_MOCK=1`
in `.env.local`. The Go API will return deterministic mock responses.

### One-command local mock

Use:
`npm run dev:mock`
This starts the Go API and Vite together with `GEMINI_MOCK=1`.

## Deploy to Vercel

1. Import the repo into Vercel.
2. Set environment variables (server-side):
   - `GEMINI_API_KEY` = your Gemini API key
   - Optional: `GEMINI_MODEL_QUESTION`, `GEMINI_MODEL_EVAL`
3. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`

Note: `VITE_*` variables are exposed to the client bundle. This app proxies Gemini through Go serverless functions under `/api`, so only server-side env vars are needed. If you add/update env vars in Vercel, redeploy to apply them.
