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
  build: { assetsDir: "app" },
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3042",
      "/uploads": "http://localhost:3042",
      "/assets": "http://localhost:3042",
    },
  },
});
