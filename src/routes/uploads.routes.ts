import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { requireAuth } from "../auth/middleware";
import { config } from "../config";

// Stores uploads on disk under public/uploads/ with a random filename; the API
// returns the web path (e.g. "/uploads/ab12….jpg") which the caller saves in DB.

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadsDir),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || "").toLowerCase().replace(/[^a-z0-9.]/g, "");
    cb(null, crypto.randomBytes(12).toString("hex") + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new Error("Nicht unterstützter Dateityp."));
  },
});

export const uploadsRouter = Router();

uploadsRouter.post("/", requireAuth, (req, res) => {
  upload.single("file")(req, res, (err: any) => {
    if (err) {
      res.status(400).json({ error: err.message || "Upload fehlgeschlagen." });
      return;
    }
    const f = (req as any).file;
    if (!f) {
      res.status(400).json({ error: "Keine Datei empfangen." });
      return;
    }
    res.json({ url: "/uploads/" + f.filename, name: f.originalname });
  });
});
