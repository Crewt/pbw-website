import "dotenv/config";
import path from "path";

// Centralised, typed view of the environment. Loaded once at import time.
// Defaults are dev-friendly; secrets (DB password, SESSION_SECRET) must come
// from .env — see .env.example.
// Absolute site origin for canonical/OG URLs, sitemap.xml and llms.txt. Guard the
// scheme so a bare host in SITE_URL (e.g. "pbw.barhelper.de") can't silently
// produce scheme-less, relative URLs across every SEO surface.
const rawSiteUrl = (process.env.SITE_URL ?? "https://pbw-ta.de").trim().replace(/\/+$/, "");
const resolvedSiteUrl = /^https?:\/\//i.test(rawSiteUrl) ? rawSiteUrl : `https://${rawSiteUrl}`;

// Browser origins allowed to call /api (CORS). Staging runs on pbw.barhelper.de
// until production goes live on pbw-ta.de — both must stay allowed.
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "https://pbw-ta.de,https://pbw.barhelper.de")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const config = {
  port: Number(process.env.PORT ?? 3042),
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "PBWUser",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "pbw",
  },
  // SMTP for contact-form notifications. `to` falls back to the From address
  // when CONTACT_TO is empty. See .env.example.
  mail: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "",
    to: (process.env.CONTACT_TO || process.env.SMTP_FROM) ?? "",
  },
  allowedOrigins,
  sessionSecret: process.env.SESSION_SECRET ?? "",
  cookieSecure: (process.env.COOKIE_SECURE ?? "false") === "true",
  // Absolute site origin (scheme-guarded above). Override per host via SITE_URL.
  siteUrl: resolvedSiteUrl,
  // Staging/dev flag: when true, every response gets X-Robots-Tag: noindex so a
  // mirror like pbw.barhelper.de can't get indexed and compete with production.
  seoNoindex: (process.env.SEO_NOINDEX ?? "false") === "true",
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

if (!config.mail.host || !config.mail.from) {
  console.warn(
    "[config] SMTP_HOST/SMTP_FROM not set — contact-form submissions will fail with 502 until you configure SMTP in .env."
  );
}
