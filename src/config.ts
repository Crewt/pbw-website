import "dotenv/config";
import path from "path";

// Centralised, typed view of the environment. Loaded once at import time.
// Defaults are dev-friendly; secrets (DB password, SESSION_SECRET) must come
// from .env — see .env.example.
export const config = {
  port: Number(process.env.PORT ?? 3042),
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "PBWUser",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "pbw",
  },
  sessionSecret: process.env.SESSION_SECRET ?? "",
  cookieSecure: (process.env.COOKIE_SECURE ?? "false") === "true",
  // Absolute site origin used for canonical/OG URLs, sitemap.xml and llms.txt.
  // Override on the dev box via SITE_URL so those URLs point at the right host.
  siteUrl: (process.env.SITE_URL ?? "https://pbw-ta.de").replace(/\/+$/, ""),
  // dist/ sits next to public/ at the project root, so ".." from __dirname.
  publicDir: path.join(__dirname, "..", "public"),
  uploadsDir: path.join(__dirname, "..", "public", "uploads"),
  // Built React SPA (Vite output) — serves the whole site (public + /admin).
  spaDir: path.join(__dirname, "..", "frontend", "dist"),
} as const;

if (!config.sessionSecret) {
  console.warn(
    "[config] SESSION_SECRET is empty — set it in .env (openssl rand -hex 32). Admin sessions are insecure until you do."
  );
}
