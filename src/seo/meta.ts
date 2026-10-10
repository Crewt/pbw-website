import { config } from "../config";
import type { Course, Kontakt } from "../types";

// Shared SEO constants + per-route metadata. Used by both the dynamic SEO routes
// (sitemap/llms) and the server-side HTML meta injection (shell.ts).
// NB: the page titles/descriptions are mirrored in the React pages (<Seo …>) —
// keep both in sync when changing them.

export const SITE_NAME = "PBW – Beatrice Czekalla";
export const SITE_TITLE = "PBW – Beatrice Czekalla · Psychologische Beratung & Weiterbildung";
export const HOME_TITLE = "Beratung, Coaching & TA-Ausbildung bei Koblenz | PBW Czekalla";
export const SITE_DESCRIPTION =
  "Einzelberatung, Paarberatung, Coaching, Supervision und Ausbildung in Transaktionsanalyse (DGTA/EATA) bei Beatrice Czekalla in Vallendar bei Koblenz.";
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

// Practice address. Not part of the CMS (Admin → Kontakt holds e-mail, phone
// and social links only), so it is fixed here; mirrored in frontend
// site/lib/address.ts. E-mail and phone always come from the CMS.
export const ADDRESS = { street: "Düppelstraße 9c", zip: "56179", city: "Vallendar" };
export const ADDRESS_LINE = `${ADDRESS.street}, ${ADDRESS.zip} ${ADDRESS.city}`;

// German phone number -> E.164 ("0261 / 123456", "+49 (0) 261 123456" ->
// "+49261123456"). Returns "" when nothing usable is left.
export function toE164(phone?: string): string {
  let d = (phone || "").replace(/\(0\)/g, "").replace(/[^\d+]/g, "");
  if (!d) return "";
  if (d.startsWith("00")) d = "+" + d.slice(2);
  else if (d.startsWith("0")) d = "+49" + d.slice(1);
  else if (!d.startsWith("+")) d = "+49" + d;
  return d;
}

// Per-route meta for the static public pages. Order here is also the sitemap
// order. Seminar detail pages are built dynamically (see courseMeta).
export const ROUTE_META: Record<string, PageMeta> = {
  "/": { title: HOME_TITLE, description: SITE_DESCRIPTION },
  "/ueber-mich": {
    title: "Beatrice Czekalla – Beratung, Coaching & Supervision (TA) | PBW",
    description:
      "Beatrice Czekalla: Master im Coaching, transaktionsanalytische Lehrtrainerin und Lehrsupervisorin (u. S.). Ansatz, Haltung und Werdegang – PBW in Vallendar.",
  },
  "/kurstermine": {
    title: "Kurstermine: Seminare & TA-Ausbildung in Vallendar | PBW",
    description:
      "Aktuelle Termine für Seminare, Einführungskurs und Ausbildung in Transaktionsanalyse bei PBW – Beatrice Czekalla in Vallendar bei Koblenz. Mit Kosten und Anmeldung.",
  },
  "/kooperationen": {
    title: "Kooperation & Netzwerk: DGTA, EATA, EASC | PBW Czekalla",
    description:
      "Fachverbände (DGTA, EATA, EASC), geschätzte Kolleg:innen und empfohlene Ressourcen zur Transaktionsanalyse – das Netzwerk von PBW – Beatrice Czekalla.",
  },
  "/kontakt": {
    title: "Kontakt – PBW Beatrice Czekalla in Vallendar bei Koblenz",
    description: `Kontakt zu Beatrice Czekalla (PBW), ${ADDRESS_LINE}: Nachricht schreiben, anrufen oder ein Erstgespräch vereinbaren.`,
  },
  "/impressum": {
    title: `Impressum | ${SITE_NAME}`,
    description: "Impressum und Anbieterkennzeichnung von PBW – Beatrice Czekalla.",
  },
  "/datenschutz": {
    title: `Datenschutzerklärung | ${SITE_NAME}`,
    description:
      "Datenschutzerklärung von PBW – Beatrice Czekalla: Verantwortliche, Hosting & E-Mail, Server-Logfiles, Cookies & Einwilligung, Google Fonts, Google Maps, Kontaktformular, Newsletter (CleverReach) und Ihre Rechte.",
  },
};

export const NOT_FOUND_META: PageMeta = {
  title: `Seite nicht gefunden | ${SITE_NAME}`,
  description: "Die angeforderte Seite existiert nicht (mehr).",
};

// Legal pages: kept in ROUTE_META (so they still get correct server-side meta),
// but excluded from the sitemap and served with noindex — no SEO value, and we
// don't want them competing with the real content in search.
export const NOINDEX_PATHS = new Set<string>(["/impressum", "/datenschutz"]);

export const STATIC_PATHS = Object.keys(ROUTE_META);

// "<Titel> – Vallendar bei Koblenz | PBW", or a shorter form when that would
// exceed ~65 characters (Google truncates beyond that).
export function courseTitle(title: string): string {
  const withPlace = `${title} – Vallendar bei Koblenz | PBW`;
  return withPlace.length <= 65 ? withPlace : `${title} | PBW Czekalla`;
}

export function courseDescription(c: Course): string {
  return clip(c.subtitle || c.description || `${c.title} bei PBW – Beatrice Czekalla in Vallendar bei Koblenz.`);
}

// Meta for a seminar detail page, derived from the course.
export function courseMeta(c: Course): PageMeta {
  return {
    title: courseTitle(c.title),
    description: courseDescription(c),
    image: c.image || DEFAULT_OG_IMAGE,
  };
}

// Counselling offers (Einzelberatung, Coaching, Supervision, …) share the course
// table with seminars. They are the ones linked from the homepage service cards;
// an Ausbildungskurs is always a course. Drives Service vs Course schema.
export function isServiceOffer(c: Course): boolean {
  return c.homepageSlots.length > 0 && !c.isAusbildungskurs;
}

// Public URL of a course: counselling offers live at the top level
// ("/einzelberatung"), everything else under "/kurstermine/<slug>".
// Mirrored in frontend/src/site/lib/coursePath.ts — keep both in sync.
export function coursePath(c: Course): string {
  const slug = encodeURIComponent(c.slug || c.id);
  return isServiceOffer(c) ? `/${slug}` : `/kurstermine/${slug}`;
}

// Renamed static pages: old path -> new path (301).
export const RENAMED_PATHS: Record<string, string> = {
  "/empfehlungen": "/kooperationen",
};

// A course is "expired" once every dated Termin lies in the past. Courses with
// no dated Termin (ongoing programmes, "auf Anfrage") are never treated as
// expired. Used to drop past events from the sitemap/llms feeds and noindex them.
export function isCourseExpired(c: Course, now: Date = new Date()): boolean {
  const dates = c.termine.map((t) => t.date).filter(Boolean);
  if (!dates.length) return false;
  const today = now.toISOString().slice(0, 10);
  return dates.every((d) => d < today);
}
