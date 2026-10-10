import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { config } from "./config";
import { ping } from "./db";
import { authRouter } from "./routes/auth.routes";
import { coursesRouter } from "./routes/courses.routes";
import { contentRouter } from "./routes/content.routes";
import { uploadsRouter } from "./routes/uploads.routes";
import { adminRouter } from "./routes/admin.routes";
import { contactRouter } from "./routes/contact.routes";
import { seoRouter } from "./routes/seo.routes";
import { renderShell } from "./seo/shell";
import { ROUTE_META, RENAMED_PATHS, coursePath } from "./seo/meta";
import { getCourse } from "./repositories/courses.repo";
import { apiLogger } from "./middleware/log";
import { cors } from "./middleware/cors";

// Parse TRUST_PROXY into the value Express expects. See the comment at its use
// site. Undefined/empty -> 1 (trust the single front proxy, preserving the
// previous hard-coded default).
function parseTrustProxy(raw: string | undefined): number | boolean | string {
  const v = (raw ?? "").trim();
  if (v === "") return 1;
  if (v === "true") return true;
  if (v === "false") return false;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : v;
}

// Content-Security-Policy for the app documents (SPA shell + SSR HTML + API).
//
// Design notes / justification:
//  - default-src 'self': everything defaults to same-origin.
//  - script-src 'self': our own JS is the external Vite bundle ('self'). JSON-LD
//    (<script type="application/ld+json">) is inert data and not gated by
//    script-src. No inline script is emitted: the Vite module-preload polyfill is
//    disabled (build.modulePreload.polyfill = false in frontend/vite.config.ts),
//    so 'unsafe-inline' is intentionally NOT present here. If code-splitting is
//    ever added, keep that polyfill disabled (or emit a nonce) so this stays valid.
//  - style-src 'self' 'unsafe-inline' + fonts.googleapis.com: React/Tailwind emit
//    inline style attributes, and the Google Fonts stylesheet is injected at
//    runtime after consent (frontend consent flow).
//  - font-src adds fonts.gstatic.com for those same Google Fonts.
//  - img-src 'self' data: blob: https:: OG/asset images are same-origin; https:/
//    data: keep author-supplied and inline images working; blob: is required by
//    the admin image cropper (react-easy-crop), which previews the picked file
//    via URL.createObjectURL() — a blob: URL — before upload.
//  - frame-src www.google.com: the Kontakt page embeds a Google Maps iframe
//    (loaded only after consent). Without this the map would be blocked.
//    *.cleverreach.com is added so the Kontakt page can embed the externally
//    hosted CleverReach newsletter signup form in an iframe (loaded only after
//    the visitor clicks the newsletter button).
//  - object-src 'none', base-uri 'self', frame-ancestors 'none', form-action
//    'self': block plugins, <base> injection, clickjacking (redundant with
//    X-Frame-Options) and off-site form posts.
const APP_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  "frame-src https://www.google.com https://maps.google.com https://*.cleverreach.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

// Locked-down CSP for user-uploaded files (/uploads). If an attacker manages to
// upload an HTML/SVG file and a victim opens it directly, this neutralises it:
// nothing loads and the document is sandboxed (no scripts, no same-origin). This
// only governs uploads served as the top-level document — images embedded via
// <img src="/uploads/..."> in the app are governed by the app's img-src instead.
const UPLOADS_CSP = "default-src 'none'; sandbox; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // HSTS only makes sense once the site is actually served over HTTPS. We reuse
  // config.cookieSecure as the HTTPS/production indicator so HSTS and the Secure
  // cookie flag stay in lockstep and we never send HSTS over plain-HTTP dev.
  if (config.cookieSecure) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  res.setHeader(
    "Content-Security-Policy",
    req.path.startsWith("/uploads") ? UPLOADS_CSP : APP_CSP
  );

  next();
}

const app = express();
app.disable("x-powered-by");

// Query string of the request ("" or "?…"), carried over on SEO redirects.
function queryString(req: Request): string {
  const i = req.originalUrl.indexOf("?");
  return i >= 0 ? req.originalUrl.slice(i) : "";
}

// Behind pm2/Nginx: trust the proxy so req.ip / X-Forwarded-For reflect the real
// client IP (used by the contact-form rate limiter and API logging).
//
// SECURITY: enabling this makes Express BELIEVE the X-Forwarded-For header. That
// is only safe when (a) a reverse proxy (e.g. Nginx) sits in front and
// OVERWRITES X-Forwarded-For with the true client IP, and (b) the Node process
// is NOT reachable directly from the internet. If the app were exposed directly,
// any client could spoof X-Forwarded-For and bypass the rate limiter / poison
// the logs. The hop count is configurable via TRUST_PROXY:
//   - a number ("1", "2") = number of proxies to trust (default 1),
//   - "true"/"false" = trust all / trust none,
//   - anything else = passed through to Express (e.g. a subnet like "10.0.0.0/8").
app.set("trust proxy", parseTrustProxy(process.env.TRUST_PROXY));

// Baseline security headers on every response (API, static, SPA shell, errors).
// Implemented inline in the style of the hand-rolled cors/rateLimit middleware
// so we don't pull in helmet for a handful of static headers.
app.use(securityHeaders);

// Global JSON body limit. Uploads go through multer (see uploads.routes.ts), not
// JSON, so no JSON route needs megabytes — content saves are text-only. 512kb is
// well beyond any real payload (courses, about text, referenzen) while capping
// abuse of the parser. Bump this only if a genuinely large JSON route appears.
app.use(express.json({ limit: "512kb" }));
app.use("/api", cors);
app.use("/api", apiLogger);

// Staging/dev: keep the whole mirror out of every index (search + AI). An HTTP
// header can't be stripped by the SPA's client-side meta reconciliation the way
// a <meta robots> tag can, so this reliably noindexes pbw.barhelper.de.
if (config.seoNoindex) {
  app.use((_req, res, next) => {
    res.setHeader("X-Robots-Tag", "noindex");
    next();
  });
}

// Uploaded files land here; make sure it exists before multer writes to it.
fs.mkdirSync(config.uploadsDir, { recursive: true });

// ---- API ----
app.use("/api/auth", authRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/content", contentRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/contact", contactRouter);

// Unknown /api paths return JSON (not the SPA/static fallback).
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Nicht gefunden." });
});

// ---- Trailing slash ----
// "/kurstermine/" and "/kurstermine" would otherwise be two indexable URLs.
// Leading slashes/backslashes are collapsed so "//evil.com/" can't become an
// open redirect to "//evil.com".
app.use((req, res, next) => {
  if ((req.method === "GET" || req.method === "HEAD") && req.path.length > 1 && req.path.endsWith("/")) {
    const clean = "/" + req.path.replace(/^[/\\]+/, "").replace(/\/+$/, "");
    res.redirect(301, clean + queryString(req));
    return;
  }
  next();
});

// ---- SEO/GEO (dynamic, DB-backed) ----
// robots.txt, sitemap.xml, llms.txt, llms-full.txt — must come before the static
// middleware and SPA catch-all so these non-file paths aren't served the shell.
app.use(seoRouter);

// ---- Legacy URL redirects ----
// The old static site used one .htm page per topic (kontakt.htm,
// selbsterfahrungsseminar.htm, …) and the prototype used .html files; search
// engines and external listings still link to them. 301 each to its new route:
// explicit map first, then a same-named page or seminar, else the homepage.
// Also catches /index.html, which express.static would serve as a raw shell.
const LEGACY_REDIRECTS: Record<string, string> = {
  "/index.htm": "/",
  "/index.html": "/",
  "/mainpage.html": "/",
  "/seminar.html": "/kurstermine",
  "/admin.html": "/admin",
};
app.get(/\.html?$/i, async (req, res) => {
  const lower = req.path.toLowerCase();
  let target = LEGACY_REDIRECTS[lower];
  if (!target) {
    const name = lower.replace(/^\/+/, "").replace(/\.html?$/, "");
    if (RENAMED_PATHS[`/${name}`]) {
      target = RENAMED_PATHS[`/${name}`];
    } else if (ROUTE_META[`/${name}`]) {
      target = `/${name}`;
    } else if (/^[a-z0-9-]+$/.test(name)) {
      const course = await getCourse(name).catch(() => null);
      if (course) target = coursePath(course);
    }
  }
  res.redirect(301, target ?? "/");
});

// ---- Static files ----
// Built SPA bundles under /app/, then the public/ dir for /assets, /uploads and
// the generated favicons/manifest. Both use index:false so "/" (and any dir)
// falls through to the SPA catch-all below, where renderShell injects SEO meta —
// otherwise express.static would serve the raw dist/index.html for "/".
// Caching: Vite bundles under /app/ carry a content hash in the file name, so
// they can be cached forever. Uploads get random names on upload (30 days);
// everything else in public/ (logo, favicons, manifest) may change in place.
const ONE_YEAR_IMMUTABLE = "public, max-age=31536000, immutable";
app.use(
  express.static(config.spaDir, {
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.startsWith(path.join(config.spaDir, "app") + path.sep)) {
        res.setHeader("Cache-Control", ONE_YEAR_IMMUTABLE);
      }
    },
  })
);
app.use(
  express.static(config.publicDir, {
    index: false,
    maxAge: "1d",
    setHeaders: (res, filePath) => {
      if (filePath.startsWith(config.uploadsDir + path.sep)) {
        res.setHeader("Cache-Control", "public, max-age=2592000");
      }
    },
  })
);

// Missing files must not fall through to the HTML shell: a 200 text/html for
// /assets/foo.png or /app/old-bundle.js is a soft 404 for crawlers (and breaks
// stale bundle loads silently).
app.use((req, res, next) => {
  if (/^\/(app|assets|uploads)\//.test(req.path) || /\.[a-z0-9]{2,5}$/i.test(req.path)) {
    res.status(404).type("text/plain").send("Nicht gefunden.");
    return;
  }
  next();
});

// ---- SPA fallback ----
// Any non-API path without a matching static file gets the SPA shell (so React
// Router can render it), with per-route SEO meta injected server-side. Unknown
// routes get a real 404 (React renders its not-found page); non-canonical
// seminar/page URLs are 301'd. If meta injection fails for any reason, fall
// back to the raw shell so the app loads.
app.get("*", async (req, res) => {
  try {
    const r = await renderShell(req.path);
    if ("redirect" in r) {
      res.redirect(301, r.redirect + queryString(req));
      return;
    }
    // Per-route noindex (admin, past events, 404) via header so it survives
    // client rendering — Googlebot honours X-Robots-Tag regardless of JS execution.
    if (r.noindex) res.setHeader("X-Robots-Tag", "noindex");
    res.status(r.status).type("html").send(r.html);
  } catch (e) {
    console.error("[shell]", e);
    res.sendFile(path.join(config.spaDir, "index.html"));
  }
});

// ---- Error handler: DB-connection problems -> 503, else 500 ----
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const code = err && err.code;
  const dbDown = [
    "ECONNREFUSED",
    "PROTOCOL_CONNECTION_LOST",
    "ER_ACCESS_DENIED_ERROR",
    "ENOTFOUND",
    "ETIMEDOUT",
    "ER_BAD_DB_ERROR",
    "ER_NO_SUCH_TABLE",
  ].includes(code);
  if (dbDown) {
    console.error("[db]", req.method, req.path, code, err.sqlMessage || err.message);
    res.status(503).json({ error: "Datenbank nicht erreichbar oder nicht eingerichtet." });
    return;
  }
  // Client errors raised by middleware (e.g. 400 for a malformed %-escape in the
  // URL from express.static) keep their status instead of becoming a 500.
  const status = Number(err?.status ?? err?.statusCode);
  if (status >= 400 && status < 500) {
    if (req.path.startsWith("/api")) res.status(status).json({ error: "Ungültige Anfrage." });
    else res.status(status).type("text/plain").send("Ungültige Anfrage.");
    return;
  }
  console.error("[error]", req.method, req.path, err);
  res.status(500).json({ error: "Interner Serverfehler." });
});

app.listen(config.port, () => {
  console.log(`PBW server running on http://localhost:${config.port}  (admin: /admin)`);
  ping()
    .then(() => console.log(`[db] connected to '${config.db.database}' as '${config.db.user}'`))
    .catch((e) =>
      console.warn(
        `[db] NOT reachable: ${e.code || e.message} — API calls will return 503 until you run db/schema.sql and set .env.`
      )
    );
});
