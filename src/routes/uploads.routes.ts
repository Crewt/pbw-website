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
// in DB. Raster images are re-encoded to optimized WebP; PDF passes through.
//
// SECURITY: The stored file extension is derived from a fixed MIME->extension
// whitelist below, NEVER from the client-supplied originalname. Because uploads
// are served same-origin, active content (notably SVG, which can execute
// script) is not accepted at all — image/svg+xml is deliberately excluded from
// ALLOWED. If SVG support is ever required it must be either sanitized
// server-side (e.g. DOMPurify) or served with Content-Disposition: attachment.

// Fixed MIME -> extension whitelist. The extension is chosen from the (multer-
// validated) mimetype only; the client-controlled filename never influences it.
const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
};

const ALLOWED = new Set(Object.keys(MIME_EXT));

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
      // Log internal detail server-side; return a generic message to the client.
      console.warn("[upload] rejected:", err?.message || err);
      res.status(400).json({ error: "Upload fehlgeschlagen." });
      return;
    }
    const f = (req as any).file;
    if (!f) {
      res.status(400).json({ error: "Keine Datei empfangen." });
      return;
    }

    // Extension comes from the MIME whitelist only, never from originalname.
    const ext = MIME_EXT[f.mimetype];
    if (!ext) {
      res.status(400).json({ error: "Nicht unterstützter Dateityp." });
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
        console.log(`[upload] ${f.originalname} ${f.size}B -> /uploads/${filename}`);
        res.json({ url: "/uploads/" + filename, name: f.originalname });
      } else {
        // PDF: store as-is under a whitelisted extension. Verify the magic
        // bytes so a mislabeled/non-PDF payload can't be stored as ".pdf".
        if (f.mimetype === "application/pdf") {
          const header = f.buffer.subarray(0, 5).toString("latin1");
          if (header !== "%PDF-") {
            res.status(400).json({ error: "Nicht unterstützter Dateityp." });
            return;
          }
        }
        const filename = randomName(ext);
        await fs.writeFile(path.join(config.uploadsDir, filename), f.buffer);
        console.log(`[upload] ${f.originalname} ${f.size}B -> /uploads/${filename}`);
        res.json({ url: "/uploads/" + filename, name: f.originalname });
      }
    } catch (e: any) {
      // Log the real error server-side; keep the client message generic.
      console.error("[upload] processing failed:", e?.message || e);
      res.status(400).json({ error: "Bildverarbeitung fehlgeschlagen." });
    }
  });
});
