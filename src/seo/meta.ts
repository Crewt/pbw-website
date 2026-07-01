import { config } from "../config";
import type { Course } from "../types";

// Shared SEO constants + per-route metadata. Used by both the dynamic SEO routes
// (sitemap/llms) and the server-side HTML meta injection (shell.ts).

export const SITE_NAME = "PBW – Beatrice Czekalla";
export const SITE_TITLE = "PBW – Beatrice Czekalla · Psychologische Beratung & Weiterbildung";
export const SITE_DESCRIPTION =
  "Psychologische Beratung & Weiterbildung von Beatrice Czekalla (PBW): Seminare und Kurse, um Perspektiven zu entdecken, zu entfalten und auszugestalten.";
export const DEFAULT_OG_IMAGE = "/og-default.png";

export interface PageMeta {
  title: string;
  description: string;
  image?: string;
}

// Absolute URL from a site-relative path, using SITE_URL from config.
export function absUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return config.siteUrl + (path.startsWith("/") ? path : "/" + path);
}

// Collapse whitespace and truncate for meta descriptions.
export function clip(text: string, max = 160): string {
  const s = (text || "").replace(/\s+/g, " ").trim();
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}

// Per-route meta for the static public pages. Order here is also the sitemap
// order. Seminar detail pages are built dynamically (see courseMeta).
export const ROUTE_META: Record<string, PageMeta> = {
  "/": { title: SITE_TITLE, description: SITE_DESCRIPTION },
  "/ueber-mich": {
    title: `Über mich | ${SITE_NAME}`,
    description:
      "Beatrice Czekalla – Psychologische Beratung & Weiterbildung. Mehr über Ansatz, Haltung und Werdegang.",
  },
  "/kurstermine": {
    title: `Kurstermine & Seminare | ${SITE_NAME}`,
    description:
      "Aktuelle Kurstermine und Seminare von PBW – Beatrice Czekalla. Themen, Termine und Anmeldung im Überblick.",
  },
  "/empfehlungen": {
    title: `Empfehlungen & Netzwerk | ${SITE_NAME}`,
    description: "Empfehlungen, Kolleg:innen und Zertifizierungen im Netzwerk von PBW – Beatrice Czekalla.",
  },
  "/kontakt": {
    title: `Kontakt | ${SITE_NAME}`,
    description:
      "Kontakt zu Beatrice Czekalla (PBW) – Psychologische Beratung & Weiterbildung. Nachricht schreiben oder Termin vereinbaren.",
  },
};

export const STATIC_PATHS = Object.keys(ROUTE_META);

// Meta for a seminar detail page, derived from the course.
export function courseMeta(c: Course): PageMeta {
  return {
    title: `${c.title} | ${SITE_NAME}`,
    description: clip(c.subtitle || c.description || SITE_DESCRIPTION),
    image: c.image || DEFAULT_OG_IMAGE,
  };
}
