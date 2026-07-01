import { useEffect } from "react";

export const SITE_NAME = "PBW – Beatrice Czekalla";
export const SITE_TITLE = "PBW – Beatrice Czekalla · Psychologische Beratung & Weiterbildung";
export const SITE_DESCRIPTION =
  "Psychologische Beratung & Weiterbildung von Beatrice Czekalla (PBW): Seminare und Kurse, um Perspektiven zu entdecken, zu entfalten und auszugestalten.";

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
}

function origin(): string {
  return typeof window !== "undefined" ? window.location.origin : "";
}

function absolutize(u?: string): string {
  const src = u || "/og-default.png";
  return /^https?:\/\//i.test(src) ? src : origin() + (src.startsWith("/") ? src : "/" + src);
}

// Per-page metadata for client-side navigation. React 19 hoists these tags into
// <head> and reconciles them on route changes. On first mount we drop any
// server-injected [data-seo-server] tags so we don't end up with duplicates.
export function Seo({ title, description, image, noindex }: SeoProps) {
  useEffect(() => {
    document.head.querySelectorAll("[data-seo-server]").forEach((el) => el.remove());
  }, []);

  const canonical = origin() + (typeof window !== "undefined" ? window.location.pathname : "/");
  const img = absolutize(image);

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex" /> : <link rel="canonical" href={canonical} />}
      <meta property="og:type" content="website" />
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
