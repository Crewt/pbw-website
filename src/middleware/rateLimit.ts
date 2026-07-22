import { Request, Response, NextFunction, RequestHandler } from "express";

// Minimal in-memory, per-IP rate limiter — enough to blunt spam bursts on the
// public contact endpoint without pulling in a dependency or shared store.
// (Single-process pm2; a restart resets the counters, which is fine here.)
interface Options {
  windowMs: number;
  max: number;
}

export function rateLimit({ windowMs, max }: Options): RequestHandler {
  // ip -> timestamps (ms) of hits inside the current window.
  const hits = new Map<string, number[]>();

  // Occasionally drop stale entries so the map can't grow unbounded.
  let lastSweep = Date.now();
  const sweep = (now: number) => {
    if (now - lastSweep < windowMs) return;
    lastSweep = now;
    for (const [ip, times] of hits) {
      const fresh = times.filter((t) => now - t < windowMs);
      if (fresh.length) hits.set(ip, fresh);
      else hits.delete(ip);
    }
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    sweep(now);

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      res.status(429).json({ error: "Zu viele Anfragen. Bitte später erneut versuchen." });
      return;
    }

    recent.push(now);
    hits.set(ip, recent);
    next();
  };
}
