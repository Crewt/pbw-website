import type { About, Bilder, ContactPayload, Content, Course, CoursePayload, Kontakt } from "./types";

// Relative base: proxied to :3042 in dev (vite.config.ts), same-origin in prod.
const API_BASE = "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const opts: RequestInit = { method, credentials: "include", headers: {} };
  if (body !== undefined) {
    (opts.headers as Record<string, string>)["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await parseBody(res);
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error ?? `Fehler ${res.status}`;
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

export async function uploadFile(file: File): Promise<{ url: string; name: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/api/uploads`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const data = await parseBody(res);
  if (!res.ok) {
    const msg = (data as { error?: string } | null)?.error ?? `Upload fehlgeschlagen (${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return data as { url: string; name: string };
}

// ---- Auth ----
export const getMe = () => request<{ authed: boolean }>("GET", "/api/auth/me");
export const login = (username: string, password: string) =>
  request<{ ok: boolean; username: string }>("POST", "/api/auth/login", { username, password });
export const logout = () => request<{ ok: boolean }>("POST", "/api/auth/logout");

// ---- Courses ----
export const getCourses = () => request<Course[]>("GET", "/api/courses");
export const getCourse = (idOrSlug: string) =>
  request<Course>("GET", `/api/courses/${encodeURIComponent(idOrSlug)}`);
export const saveCourse = (c: CoursePayload) =>
  c.id ? request<Course>("PUT", `/api/courses/${c.id}`, c) : request<Course>("POST", "/api/courses", c);
export const deleteCourse = (id: string) => request<{ ok: boolean }>("DELETE", `/api/courses/${id}`);

// ---- Content collections ----
export const getContent = () => request<Content>("GET", "/api/content");
export const saveContentItem = (coll: string, item: Record<string, unknown> & { id?: string }) =>
  item.id
    ? request<Record<string, unknown>>("PUT", `/api/content/${coll}/${item.id}`, item)
    : request<Record<string, unknown>>("POST", `/api/content/${coll}`, item);
export const deleteContentItem = (coll: string, id: string) =>
  request<{ ok: boolean }>("DELETE", `/api/content/${coll}/${id}`);
export const moveContentItem = (coll: string, id: string, dir: -1 | 1) =>
  request<{ ok: boolean }>("POST", `/api/content/${coll}/${id}/move`, { dir });

// ---- Singletons ----
export const saveKontakt = (obj: Kontakt) => request<Kontakt>("PUT", "/api/content/single/kontakt", obj);
export const saveAbout = (obj: About) => request<About>("PUT", "/api/content/single/about", obj);
export const saveBilder = (obj: Partial<Bilder>) => request<Bilder>("PUT", "/api/content/single/bilder", obj);

// ---- Admin ----
export const resetSeed = () => request<{ ok: boolean }>("POST", "/api/admin/reset");

// ---- Contact form (public) ----
export const submitContact = (p: ContactPayload) =>
  request<{ ok: boolean }>("POST", "/api/contact", p);
