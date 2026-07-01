import fs from "fs/promises";
import path from "path";
import { config } from "../config";
import { getCourse } from "../repositories/courses.repo";
import { ROUTE_META, courseMeta, absUrl, DEFAULT_OG_IMAGE, SITE_NAME, type PageMeta } from "./meta";

// Server-side meta injection for the SPA shell. The built index.html carries a
// default <title> and a <!--seo-meta--> placeholder; renderShell() rewrites the
// title and fills the placeholder with per-route description/canonical/OG/JSON-LD
// so crawlers and social scrapers get correct metadata on first paint. Injected
// tags carry data-seo-server so the client can drop them after hydration.

let shellCache: string | null = null;

async function loadShell(): Promise<string> {
  if (shellCache == null) {
    shellCache = await fs.readFile(path.join(config.spaDir, "index.html"), "utf8");
  }
  return shellCache;
}

function esc(s: string): string {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

interface Resolved {
  meta: PageMeta;
  noindex: boolean;
  jsonLd?: object;
}

async function resolveMeta(pathname: string): Promise<Resolved> {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return { meta: { title: `Admin | ${SITE_NAME}`, description: "" }, noindex: true };
  }

  const m = pathname.match(/^\/seminar\/([^/]+)\/?$/);
  if (m) {
    try {
      const c = await getCourse(decodeURIComponent(m[1]));
      if (c) {
        const meta = courseMeta(c);
        const canonical = absUrl(`/seminar/${c.slug}`);
        const jsonLd = {
          "@context": "https://schema.org",
          "@type": "Course",
          name: c.title,
          description: meta.description,
          url: canonical,
          ...(c.image ? { image: absUrl(c.image) } : {}),
          provider: { "@type": "Organization", name: SITE_NAME, url: config.siteUrl },
        };
        return { meta, noindex: false, jsonLd };
      }
    } catch {
      /* fall through to default meta */
    }
  }

  const key = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return { meta: ROUTE_META[key] ?? ROUTE_META["/"], noindex: false };
}

function buildBlock(pathname: string, r: Resolved): { title: string; block: string } {
  const canonical = absUrl(pathname);
  const image = absUrl(r.meta.image ?? DEFAULT_OG_IMAGE);
  const t = r.meta.title;
  const d = r.meta.description;

  const rows: string[] = [`<meta name="description" content="${esc(d)}" data-seo-server />`];
  rows.push(
    r.noindex
      ? `<meta name="robots" content="noindex" data-seo-server />`
      : `<link rel="canonical" href="${esc(canonical)}" data-seo-server />`
  );
  rows.push(`<meta property="og:type" content="website" data-seo-server />`);
  rows.push(`<meta property="og:site_name" content="${esc(SITE_NAME)}" data-seo-server />`);
  rows.push(`<meta property="og:title" content="${esc(t)}" data-seo-server />`);
  rows.push(`<meta property="og:description" content="${esc(d)}" data-seo-server />`);
  rows.push(`<meta property="og:url" content="${esc(canonical)}" data-seo-server />`);
  rows.push(`<meta property="og:image" content="${esc(image)}" data-seo-server />`);
  rows.push(`<meta name="twitter:card" content="summary_large_image" data-seo-server />`);
  rows.push(`<meta name="twitter:title" content="${esc(t)}" data-seo-server />`);
  rows.push(`<meta name="twitter:description" content="${esc(d)}" data-seo-server />`);
  rows.push(`<meta name="twitter:image" content="${esc(image)}" data-seo-server />`);
  if (r.jsonLd) {
    // Escape "<" so a stray "</script>" in content can't break out of the tag.
    const json = JSON.stringify(r.jsonLd).replace(/</g, "\\u003c");
    rows.push(`<script type="application/ld+json" data-seo-server>${json}</script>`);
  }
  return { title: t, block: rows.join("\n    ") };
}

export async function renderShell(pathname: string): Promise<string> {
  const html = await loadShell();
  const r = await resolveMeta(pathname);
  const { title, block } = buildBlock(pathname, r);
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title data-seo-server>${esc(title)}</title>`)
    .replace("<!--seo-meta-->", block);
}
