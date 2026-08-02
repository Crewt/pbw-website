import crypto from "crypto";
import type { Request, Response } from "express";
import { config } from "../config";
import { getTokenVersion } from "../repositories/admin.repo";

// Stateless-ish admin session: a signed, HttpOnly cookie carrying { uid, v, exp },
// HMAC-SHA256 over the payload with SESSION_SECRET. `v` is the user's token_version
// at sign time; verification re-checks it against the DB so logout (which bumps the
// version) invalidates every outstanding token server-side. This adds one small
// indexed lookup per authenticated request, which is fine for an admin panel.

const COOKIE = "pbw_admin";
const MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 days

function hmac(payload: string): string {
  return crypto.createHmac("sha256", config.sessionSecret).update(payload).digest("base64url");
}

export function signToken(uid: number, tokenVersion: number): string {
  const payload = Buffer.from(
    JSON.stringify({ uid, v: tokenVersion, exp: Date.now() + MAX_AGE_SEC * 1000 })
  ).toString("base64url");
  return `${payload}.${hmac(payload)}`;
}

// Async because it consults the DB for the current token_version. Returns the uid
// for a valid, non-revoked token, otherwise null.
export async function verifyToken(token: string | undefined): Promise<number | null> {
  if (!token || !config.sessionSecret) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = hmac(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let obj: any;
  try {
    obj = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof obj.uid !== "number" || typeof obj.v !== "number" || typeof obj.exp !== "number") {
    return null;
  }
  if (Date.now() > obj.exp) return null;

  // Reject tokens whose version no longer matches the DB (logout / forced revoke),
  // or whose user no longer exists. Fail closed on DB errors.
  try {
    const current = await getTokenVersion(obj.uid);
    if (current == null || current !== obj.v) return null;
  } catch {
    return null;
  }
  return obj.uid;
}

export function parseCookies(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  const header = req.headers.cookie;
  if (!header) return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (!k) continue;
    const raw = part.slice(i + 1).trim();
    // A malformed percent-encoding (e.g. "%zz") makes decodeURIComponent throw;
    // skip that single cookie rather than 500 the whole request.
    try {
      out[k] = decodeURIComponent(raw);
    } catch {
      continue;
    }
  }
  return out;
}

export async function getSessionUid(req: Request): Promise<number | null> {
  return verifyToken(parseCookies(req)[COOKIE]);
}

export function setSessionCookie(res: Response, uid: number, tokenVersion: number): void {
  const parts = [
    `${COOKIE}=${signToken(uid, tokenVersion)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${MAX_AGE_SEC}`,
  ];
  if (config.cookieSecure) parts.push("Secure");
  res.append("Set-Cookie", parts.join("; "));
}

export function clearSessionCookie(res: Response): void {
  const parts = [`${COOKIE}=`, "HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=0"];
  if (config.cookieSecure) parts.push("Secure");
  res.append("Set-Cookie", parts.join("; "));
}
