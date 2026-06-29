import crypto from "crypto";
import type { Request, Response } from "express";
import { config } from "../config";

// Stateless admin session: a signed, HttpOnly cookie carrying { uid, exp },
// HMAC-SHA256 over the payload with SESSION_SECRET. No session store needed.

const COOKIE = "pbw_admin";
const MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 days

function hmac(payload: string): string {
  return crypto.createHmac("sha256", config.sessionSecret).update(payload).digest("base64url");
}

export function signToken(uid: number): string {
  const payload = Buffer.from(JSON.stringify({ uid, exp: Date.now() + MAX_AGE_SEC * 1000 })).toString(
    "base64url"
  );
  return `${payload}.${hmac(payload)}`;
}

export function verifyToken(token: string | undefined): number | null {
  if (!token || !config.sessionSecret) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = hmac(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const obj = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof obj.uid !== "number" || typeof obj.exp !== "number") return null;
    if (Date.now() > obj.exp) return null;
    return obj.uid;
  } catch {
    return null;
  }
}

export function parseCookies(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  const header = req.headers.cookie;
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (k) out[k] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

export function getSessionUid(req: Request): number | null {
  return verifyToken(parseCookies(req)[COOKIE]);
}

export function setSessionCookie(res: Response, uid: number): void {
  const parts = [`${COOKIE}=${signToken(uid)}`, "HttpOnly", "Path=/", "SameSite=Lax", `Max-Age=${MAX_AGE_SEC}`];
  if (config.cookieSecure) parts.push("Secure");
  res.append("Set-Cookie", parts.join("; "));
}

export function clearSessionCookie(res: Response): void {
  const parts = [`${COOKIE}=`, "HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=0"];
  if (config.cookieSecure) parts.push("Secure");
  res.append("Set-Cookie", parts.join("; "));
}
