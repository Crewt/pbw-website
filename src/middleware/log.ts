import { Request, Response, NextFunction } from "express";

// Fields whose values must never appear in logs.
const REDACT = new Set(["password", "passwort", "token", "authorization"]);
const MAX_VALUE_LEN = 200;

// Compact one-line summary of a JSON body: keys with truncated values,
// secrets redacted. Only used for mutating requests and errors.
function bodySummary(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const parts: string[] = [];
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (REDACT.has(key.toLowerCase())) {
      parts.push(`${key}=<redacted>`);
      continue;
    }
    let v = typeof value === "string" ? value : JSON.stringify(value);
    if (v === undefined) v = "undefined";
    if (v.length > MAX_VALUE_LEN) v = v.slice(0, MAX_VALUE_LEN) + "…";
    parts.push(`${key}=${v}`);
  }
  return parts.join(" ");
}

// Request logger for /api: one line per request on finish, with body summary
// for mutations; warn/error level for 4xx/5xx so failed admin saves and
// contact submissions stand out in the pm2 logs.
export function apiLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const mutation = req.method !== "GET" && req.method !== "HEAD";
    const summary = mutation ? bodySummary(req.body) : "";
    const line =
      `[api] ${new Date().toISOString()} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)` +
      (summary ? `  body: ${summary}` : "");
    if (res.statusCode >= 500) console.error(line);
    else if (res.statusCode >= 400) console.warn(line);
    else console.log(line);
  });
  next();
}
