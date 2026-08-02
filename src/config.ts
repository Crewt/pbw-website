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

// Runtime mode. Anything other than an explicit "development" is treated as a
// hardened deployment (staging/production): Secure cookies on by default and a
// hard SESSION_SECRET check below. NODE_ENV unset -> treated as non-development
// so a forgotten env can't silently downgrade security on a real server.
const nodeEnv = (process.env.NODE_ENV ?? "").trim().toLowerCase();
const isDevelopment = nodeEnv === "development";

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
  // Secure flag on the admin session cookie. An explicit COOKIE_SECURE env still
  // wins (either direction); otherwise it defaults ON everywhere except local
  // development, so a production deploy that forgets COOKIE_SECURE still gets a
  // Secure cookie instead of silently shipping it over plain HTTP.
  // A blank COOKIE_SECURE= is treated as unset (falls back to the default)
  // rather than as an explicit "false", so an empty env value can't silently
  // downgrade production to an insecure cookie.
  cookieSecure:
    process.env.COOKIE_SECURE?.trim()
      ? process.env.COOKIE_SECURE.trim() === "true"
      : !isDevelopment,
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

// SESSION_SECRET must be present and long enough to make cookie HMACs
// non-guessable. In development we tolerate a weak/empty secret with a warning
// so `npm run dev` works out of the box; on any real deployment (non-development)
// a missing or too-short secret is fatal — better to fail loudly at boot than to
// serve forgeable admin sessions.
const MIN_SESSION_SECRET_LEN = 32;
if (!config.sessionSecret || config.sessionSecret.length < MIN_SESSION_SECRET_LEN) {
  const msg = `[config] SESSION_SECRET must be set and at least ${MIN_SESSION_SECRET_LEN} characters — generate one with: openssl rand -hex 32`;
  if (isDevelopment) {
    console.warn(`${msg}. Admin sessions are insecure until you fix this (dev only).`);
  } else {
    console.error(`${msg}. Refusing to start.`);
    process.exit(1);
  }
}

if (!config.mail.host || !config.mail.from) {
  console.warn(
    "[config] SMTP_HOST/SMTP_FROM not set — contact-form submissions will fail with 502 until you configure SMTP in .env."
  );
}
