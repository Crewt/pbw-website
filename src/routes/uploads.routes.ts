import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import sharp from "sharp";
import { requireAuth } from "../auth/middleware";
import { config } from "../config";

// Uploads are stored on disk under public/uploads/ with a random filename; the
// API returns the web path (e.g. "/uploads/ab12….webp") which the caller saves
// in DB. Raster images are re-encoded to optimized WebP; SVG/PDF pass through.

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

// Mime types we re-encode to WebP. GIF/WebP are decoded with animation kept.
const RASTER = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new Error("Nicht unterstützter Dateityp."));
  },
});

function randomName(ext: string): string {
  return crypto.randomBytes(12).toString("hex") + ext;
}

export const uploadsRouter = Router();

uploadsRouter.post("/", requireAuth, (req, res) => {
  upload.single("file")(req, res, async (err: any) => {
    if (err) {
      res.status(400).json({ error: err.message || "Upload fehlgeschlagen." });
      return;
    }
    const f = (req as any).file;
    if (!f) {
      res.status(400).json({ error: "Keine Datei empfangen." });
      return;
    }

    try {
      if (RASTER.has(f.mimetype)) {
        // Convert to optimized WebP: auto-orient from EXIF, cap the dimensions
        // (the client already crops) and drop metadata via the re-encode.
        const animated = f.mimetype === "image/gif" || f.mimetype === "image/webp";
        const filename = randomName(".webp");
        await sharp(f.buffer, { animated })
          .rotate()
          .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(path.join(config.uploadsDir, filename));
        res.json({ url: "/uploads/" + filename, name: f.originalname });
      } else {
        // SVG / PDF: store as-is, keeping the sanitized original extension.
        const ext = (path.extname(f.originalname) || "").toLowerCase().replace(/[^a-z0-9.]/g, "");
        const filename = randomName(ext);
        await fs.writeFile(path.join(config.uploadsDir, filename), f.buffer);
        res.json({ url: "/uploads/" + filename, name: f.originalname });
      }
    } catch (e: any) {
      res.status(400).json({ error: e?.message || "Bildverarbeitung fehlgeschlagen." });
    }
  });
});
