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

const app = express();
app.use(express.json({ limit: "2mb" }));

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

// ---- Static files ----
// Built SPA (index.html + hashed bundles under /app/). Then the legacy public/
// dir for /assets, /uploads and any not-yet-migrated .html pages. index:false
// so "/" falls through to the SPA shell below instead of public/index.html.
app.use(express.static(config.spaDir));
app.use(express.static(config.publicDir, { index: false }));

// ---- SPA fallback ----
// Any non-API path without a matching static file gets the SPA shell, so React
// Router can render it (public pages at / and admin deep links under /admin).
app.get("*", (_req, res) => {
  res.sendFile(path.join(config.spaDir, "index.html"));
});

// ---- Error handler: DB-connection problems -> 503, else 500 ----
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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
    console.error("[db]", code, err.sqlMessage || err.message);
    res.status(503).json({ error: "Datenbank nicht erreichbar oder nicht eingerichtet." });
    return;
  }
  console.error("[error]", err);
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
