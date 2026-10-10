import { useEffect } from "react";

// Mirrors src/seo/meta.ts on the server (titles/descriptions must match what the
// server injects, or the page flips after hydration) — keep both in sync.
export const SITE_NAME = "PBW – Beatrice Czekalla";
export const HOME_TITLE = "Beratung, Coaching & TA-Ausbildung bei Koblenz | PBW Czekalla";
export const SITE_DESCRIPTION =
  "Einzelberatung, Paarberatung, Coaching, Supervision und Ausbildung in Transaktionsanalyse (DGTA/EATA) bei Beatrice Czekalla in Vallendar bei Koblenz.";

// "<Titel> – Vallendar bei Koblenz | PBW", shortened when longer than ~65 chars.
export function courseTitle(title: string): string {
  const withPlace = `${title} – Vallendar bei Koblenz | PBW`;
  return withPlace.length <= 65 ? withPlace : `${title} | PBW Czekalla`;
}

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
  // Canonical path; defaults to the current path without a trailing slash.
  path?: string;
}

function origin(): string {
  return typeof window !== "undefined" ? window.location.origin : "";
}

function absolutize(u?: string): string {
  const src = u || "/og-default.png";
  return /^https?:\/\//i.test(src) ? src : origin() + (src.startsWith("/") ? src : "/" + src);
}

function currentPath(): string {
  const p = typeof window !== "undefined" ? window.location.pathname : "/";
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

// Per-page metadata for client-side navigation. React 19 hoists these tags into
// <head> and reconciles them on route changes. On first mount we drop any
// server-injected [data-seo-server] tags so we don't end up with duplicates.
export function Seo({ title, description, image, noindex, path }: SeoProps) {
  useEffect(() => {
    document.head.querySelectorAll("[data-seo-server]").forEach((el) => el.remove());
  }, []);

  const canonical = origin() + (path ?? currentPath());
  const img = absolutize(image);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex" /> : <link rel="canonical" href={canonical} />}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
    </>
  );
}
