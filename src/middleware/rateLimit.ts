import { Request, Response, NextFunction, RequestHandler } from "express";

// Minimal in-memory, per-IP rate limiter — enough to blunt spam bursts on the
// public contact endpoint without pulling in a dependency or shared store.
// (Single-process pm2; a restart resets the counters, which is fine here.)
interface Options {
  windowMs: number;
  max: number;
  // Optional: derive the throttle key from the request. Defaults to client IP.
  // Lets callers key by something more specific (e.g. IP + username on login)
  // without changing the default per-IP behaviour of existing callers.
  keyGenerator?: (req: Request) => string;
}

export function rateLimit({ windowMs, max, keyGenerator }: Options): RequestHandler {
  // key -> timestamps (ms) of hits inside the current window.
  const hits = new Map<string, number[]>();

  // Occasionally drop stale entries so the map can't grow unbounded.
  let lastSweep = Date.now();
  const sweep = (now: number) => {
    if (now - lastSweep < windowMs) return;
    lastSweep = now;
    for (const [key, times] of hits) {
      const fresh = times.filter((t) => now - t < windowMs);
      if (fresh.length) hits.set(key, fresh);
      else hits.delete(key);
    }
  };

  const defaultKey = (req: Request) => req.ip || req.socket.remoteAddress || "unknown";
  const keyOf = keyGenerator ?? defaultKey;

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    sweep(now);

    const key = keyOf(req);
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      res.status(429).json({ error: "Zu viele Anfragen. Bitte später erneut versuchen." });
      return;
    }

    recent.push(now);
    hits.set(key, recent);
    next();
  };
}
