import { Request, Response, NextFunction } from "express";
import { config } from "../config";

// CORS for /api against a fixed allowlist (config.allowedOrigins). Echoes the
// request Origin when allowed rather than "*", because the frontend sends
// credentials ("credentials: include"). Unknown origins get no CORS headers —
// the browser then blocks them; same-origin and server-to-server are untouched.
export function cors(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;

  if (origin && config.allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  // Answer preflight immediately (headers above already applied when allowed).
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}
