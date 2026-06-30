import type { Content, Course } from "./types";

// Relative base URL: proxied to :3042 in dev (see vite.config.ts), same-origin in
// production. Override with VITE_API_URL later only if the API moves to another host.
const API_BASE = "";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    // The backend returns { error: string } for known failures (e.g. 503 when the DB
    // is unreachable). Surface that message; fall back to the status code otherwise.
    let message = `Anfrage fehlgeschlagen (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // no JSON body — keep the status-based message
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export function getCourses(): Promise<Course[]> {
  return getJSON<Course[]>("/api/courses");
}

export function getContent(): Promise<Content> {
  return getJSON<Content>("/api/content");
}
