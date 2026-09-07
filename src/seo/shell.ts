import fs from "fs/promises";
import path from "path";
import { config } from "../config";
import { getCourse } from "../repositories/courses.repo";
import { getSingle } from "../repositories/settings.repo";
import {
  ROUTE_META,
  NOINDEX_PATHS,
  courseMeta,
  absUrl,
  isCourseExpired,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_DESCRIPTION,
  type PageMeta,
} from "./meta";
import type { Course, Kontakt } from "../types";
import { renderBody } from "./prerender";

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

const KNOWS_ABOUT = [
  "Transaktionsanalyse",
  "Psychologische Beratung",
  "Weiterbildung",
  "Supervision",
  "Coaching",
];

async function safeKontakt(): Promise<Partial<Kontakt> | undefined> {
  try {
    return (await getSingle("kontakt")) as Partial<Kontakt>;
  } catch {
    return undefined;
  }
}

// Parse a free-text cost ("280,00 €") into a schema.org Offer. Non-numeric costs
// ("Auf Anfrage") yield null so offers is simply omitted.
function courseOffer(cost: string, url: string): object | null {
  const m = (cost || "").replace(/\./g, "").match(/\d+(?:,\d{1,2})?/);
  if (!m) return null;
  return {
    "@type": "Offer",
    price: m[0].replace(",", "."),
    priceCurrency: "EUR",
    category: "Seminar",
    availability: "https://schema.org/InStock",
    url,
  };
}

// One CourseInstance spanning the first→last dated Termin (i.e. a seminar run).
function courseInstance(c: Course): object | null {
  const dates = c.termine
    .map((t) => t.date)
    .filter(Boolean)
    .sort();
  if (!dates.length) return null;
  return {
    "@type": "CourseInstance",
    courseMode: "Onsite",
    startDate: dates[0],
    endDate: dates[dates.length - 1],
  };
}

function courseJsonLd(c: Course, description: string, canonical: string): object {
  const offers = courseOffer(c.cost, canonical);
  const instance = courseInstance(c);
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: c.title,
    description,
    url: canonical,
    ...(c.image ? { image: absUrl(c.image) } : {}),
    provider: { "@type": "Organization", name: SITE_NAME, url: config.siteUrl },
    ...(offers ? { offers } : {}),
    ...(instance ? { hasCourseInstance: instance } : {}),
  };
}

function organizationJsonLd(k?: Partial<Kontakt>): object {
  const contactPoint =
    k && (k.email || k.phone)
      ? {
          "@type": "ContactPoint",
          contactType: "customer service",
          ...(k.email ? { email: k.email } : {}),
          ...(k.phone ? { telephone: k.phone } : {}),
          areaServed: "DE",
          availableLanguage: "German",
        }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    name: SITE_NAME,
    alternateName: "PBW",
    url: config.siteUrl,
    logo: absUrl("/assets/logo.png"),
    image: absUrl(DEFAULT_OG_IMAGE),
    description: SITE_DESCRIPTION,
    areaServed: "DE",
    knowsAbout: KNOWS_ABOUT,
    founder: { "@type": "Person", name: "Beatrice Czekalla" },
    ...(k?.email ? { email: k.email } : {}),
    ...(k?.phone ? { telephone: k.phone } : {}),
    ...(contactPoint ? { contactPoint } : {}),
  };
}

function personJsonLd(k?: Partial<Kontakt>): object {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Beatrice Czekalla",
    url: absUrl("/ueber-mich"),
    jobTitle: "Psychologische Beraterin & Weiterbildnerin",
    worksFor: { "@type": "Organization", name: SITE_NAME, url: config.siteUrl },
    knowsAbout: KNOWS_ABOUT,
    image: absUrl("/assets/portrait.webp"),
    ...(k?.email ? { email: k.email } : {}),
  };
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
        // Past events stay reachable but are dropped from indexes (noindex + no
        // sitemap/llms entry) so stale seminars don't surface in search/AI.
        return {
          meta,
          noindex: isCourseExpired(c),
          jsonLd: courseJsonLd(c, meta.description, canonical),
        };
      }
    } catch {
      /* fall through to default meta */
    }
  }

  const key = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const meta = ROUTE_META[key] ?? ROUTE_META["/"];

  // Entity schema: Organization on the homepage, Person on the about page.
  if (key === "/" || key === "/ueber-mich") {
    const k = await safeKontakt();
    return { meta, noindex: false, jsonLd: key === "/" ? organizationJsonLd(k) : personJsonLd(k) };
  }

  return { meta, noindex: NOINDEX_PATHS.has(key) };
}

function buildBlock(pathname: string, r: Resolved): { title: string; block: string } {
  const canonical = absUrl(pathname);
  const image = absUrl(r.meta.image ?? DEFAULT_OG_IMAGE);
  const t = r.meta.title;
  const d = r.meta.description;

  const rows: string[] = [];
  // Preload the LCP hero image on the homepage so the browser fetches it in
  // parallel with the JS bundle instead of after React renders (big LCP win).
  if (pathname === "/") {
    rows.push(
      `<link rel="preload" as="image" href="/assets/hero4.webp" fetchpriority="high" data-seo-server />`
    );
  }
  rows.push(`<meta name="description" content="${esc(d)}" data-seo-server />`);
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
    // NB: no data-seo-server here — the client strips those on hydration, which
    // would remove the structured data from the DOM that Googlebot renders.
    const json = JSON.stringify(r.jsonLd).replace(/</g, "\\u003c");
    rows.push(`<script type="application/ld+json">${json}</script>`);
  }
  return { title: t, block: rows.join("\n    ") };
}

export interface RenderedShell {
  html: string;
  noindex: boolean;
}

export async function renderShell(pathname: string): Promise<RenderedShell> {
  const [html, r, body] = await Promise.all([
    loadShell(),
    resolveMeta(pathname),
    renderBody(pathname),
  ]);
  const { title, block } = buildBlock(pathname, r);
  const out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title data-seo-server>${esc(title)}</title>`)
    .replace("<!--seo-meta-->", block)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  return { html: out, noindex: r.noindex };
}
