import { Request, Response, NextFunction } from "express";

// Fields whose values must never appear in logs. Includes secrets AND personal
// data (DSGVO/GDPR): contact-form fields (name, email, phone, message, subject)
// must not be written to logs in clear text.
const REDACT = new Set([
  "password",
  "passwort",
  "token",
  "authorization",
  // PII
  "email",
  "e-mail",
  "mail",
  "phone",
  "telefon",
  "tel",
  "name",
  "message",
  "nachricht",
  "subject",
  "betreff",
]);
const MAX_VALUE_LEN = 200;
const MAX_DEPTH = 4;

// Serialize a value for the log, redacting matching keys recursively so PII and
// secrets nested inside objects/arrays are masked too. Returns a compact string.
function redactValue(value: unknown, depth: number): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value !== "object") {
    let v = typeof value === "string" ? value : String(value);
    if (v.length > MAX_VALUE_LEN) v = v.slice(0, MAX_VALUE_LEN) + "…";
    return v;
  }
  if (depth >= MAX_DEPTH) return "…";
  if (Array.isArray(value)) {
    return "[" + value.map((el) => redactValue(el, depth + 1)).join(", ") + "]";
  }
  const parts: string[] = [];
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (REDACT.has(key.toLowerCase())) {
      parts.push(`${key}=<redacted>`);
    } else {
      parts.push(`${key}=${redactValue(val, depth + 1)}`);
    }
  }
  return "{" + parts.join(" ") + "}";
}

// Compact one-line summary of a JSON body: keys with truncated values,
// secrets and PII redacted (recursively). Only used for mutating requests.
function bodySummary(body: unknown): string {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return body && typeof body === "object" ? redactValue(body, 0) : "";
  }
  const parts: string[] = [];
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (REDACT.has(key.toLowerCase())) {
      parts.push(`${key}=<redacted>`);
      continue;
    }
    parts.push(`${key}=${redactValue(value, 1)}`);
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
