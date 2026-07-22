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
import { apiLogger } from "./middleware/log";

const app = express();
app.use(express.json({ limit: "2mb" }));
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

// ---- SEO/GEO (dynamic, DB-backed) ----
// robots.txt, sitemap.xml, llms.txt, llms-full.txt — must come before the static
// middleware and SPA catch-all so these non-file paths aren't served the shell.
app.use(seoRouter);

// ---- Static files ----
// Built SPA bundles under /app/, then the public/ dir for /assets, /uploads and
// the generated favicons/manifest. Both use index:false so "/" (and any dir)
// falls through to the SPA catch-all below, where renderShell injects SEO meta —
// otherwise express.static would serve the raw dist/index.html for "/".
app.use(express.static(config.spaDir, { index: false }));
app.use(express.static(config.publicDir, { index: false }));

// ---- SPA fallback ----
// Any non-API path without a matching static file gets the SPA shell (so React
// Router can render it), with per-route SEO meta injected server-side. If meta
// injection fails for any reason, fall back to the raw shell so the app loads.
app.get("*", async (req, res) => {
  try {
    const { html, noindex } = await renderShell(req.path);
    // Per-route noindex (admin, past events) via header so it survives client
    // rendering — Googlebot honours X-Robots-Tag regardless of JS execution.
    if (noindex) res.setHeader("X-Robots-Tag", "noindex");
    res.type("html").send(html);
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
