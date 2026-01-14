<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Interview Prep Platform (Vue 3 + Vite)

This app is a Vue 3 rewrite of the original React version and runs entirely in the browser.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create `.env.local` and set your Gemini key:
   `VITE_GEMINI_API_KEY=your-key-here`
   Optional model overrides (defaults shown in `.env.example`):
   `VITE_GEMINI_MODEL_SUBTASKS`, `VITE_GEMINI_MODEL_QUESTION`, `VITE_GEMINI_MODEL_EVAL`
3. Start the dev server:
   `npm run dev`

## Deploy to Vercel

1. Import the repo into Vercel.
2. Set an environment variable:
   - `VITE_GEMINI_API_KEY` = your Gemini API key
3. Build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`

Note: `VITE_*` variables are exposed to the client bundle. If you need to keep the key private, move the Gemini calls to a serverless function.
