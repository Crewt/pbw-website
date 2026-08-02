import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The SPA runs on :5173 in dev and talks to the existing Express backend on :3042.
// Proxying /api and /uploads keeps requests same-origin, so no CORS change is needed
// on the backend and the app can use relative URLs (e.g. fetch("/api/courses")).
export default defineConfig({
  // Single SPA served at the domain root (public site + /admin). Bundles go to
  // /app/ so they don't collide with the legacy /assets images.
  base: "/",
  // modulePreload.polyfill=false stops Vite from injecting an inline polyfill
  // script into index.html, which keeps the backend CSP at a strict
  // script-src 'self' (no 'unsafe-inline'). Native modulepreload is supported
  // in all current browsers.
  build: { assetsDir: "app", modulePreload: { polyfill: false } },
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3042",
      "/uploads": "http://localhost:3042",
      "/assets": "http://localhost:3042",
      // Root-level generated icons/manifest + dynamic SEO routes live on the
      // backend; proxy them so they resolve during dev too (regex key).
      "^/(favicon\\.ico|favicon\\.svg|favicon-\\d+x\\d+\\.png|apple-touch-icon\\.png|web-app-manifest-\\d+x\\d+\\.png|site\\.webmanifest|og-default\\.png|robots\\.txt|sitemap\\.xml|llms\\.txt|llms-full\\.txt)$":
        "http://localhost:3042",
    },
  },
});
