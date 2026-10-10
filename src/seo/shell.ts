import fs from "fs/promises";
import path from "path";
import { config } from "../config";
import { getCourse, listCourses } from "../repositories/courses.repo";
import { getContentBundle } from "../repositories/content.repo";
import {
  ROUTE_META,
  NOINDEX_PATHS,
  NOT_FOUND_META,
  courseMeta,
  coursePath,
  RENAMED_PATHS,
  absUrl,
  isCourseExpired,
  isServiceOffer,
  ADDRESS,
  toE164,
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
//
// It also decides the HTTP status (404 for unknown routes), redirects
// non-canonical seminar/static URLs (case, id instead of slug) and embeds the
// page's API data (#pbw-data) so React renders the final layout on first mount
// instead of a loading state (layout shift).

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

// JSON for an inline <script> block. Escaping "<" keeps a stray "</script>" in
// content from breaking out of the tag.
function inlineJson(v: unknown): string {
  return JSON.stringify(v).replace(/</g, "\\u003c");
}

type ContentBundle = Awaited<ReturnType<typeof getContentBundle>>;

// Seed for the client's React Query cache (see frontend main.tsx). Keys mirror
// the query keys: ["content"], ["courses"], ["course", slug].
interface InitialData {
  content?: ContentBundle;
  courses?: Course[];
  course?: { slug: string; data: Course };
}

interface PageResolution {
  meta: PageMeta;
  noindex: boolean;
  status: 200 | 404;
  canonicalPath: string;
  jsonLd?: object;
  preloadImage?: string;
  data?: InitialData;
}

type Resolution = PageResolution | { redirect: string };

const KNOWS_ABOUT = [
  "Transaktionsanalyse",
  "Psychologische Beratung",
  "Weiterbildung",
  "Supervision",
  "Coaching",
];

const ORG_ID = () => absUrl("/#organization");
const PERSON_ID = () => absUrl("/#person");

async function safeContent(): Promise<ContentBundle | undefined> {
  try {
    return await getContentBundle();
  } catch {
    return undefined;
  }
}

async function safeCourses(): Promise<Course[] | undefined> {
  try {
    return await listCourses();
  } catch {
    return undefined;
  }
}

function withHttps(url: string): string {
  const u = (url || "").trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function postalAddress(): object {
  return {
    "@type": "PostalAddress",
    streetAddress: ADDRESS.street,
    postalCode: ADDRESS.zip,
    addressLocality: ADDRESS.city,
    addressCountry: "DE",
  };
}

const areaServed = () => ({ "@type": "City", name: ADDRESS.city });

// Parse a free-text cost ("280,00 €") into a schema.org Offer. Non-numeric costs
// ("Auf Anfrage") yield null so offers is simply omitted.
function priceOffer(cost: string, url: string): object | null {
  const m = (cost || "").replace(/\./g, "").match(/\d+(?:,\d{1,2})?/);
  if (!m) return null;
  return {
    "@type": "Offer",
    price: m[0].replace(",", "."),
    priceCurrency: "EUR",
    category: "Paid",
    availability: "https://schema.org/InStock",
    url,
  };
}

// One CourseInstance spanning the first→last dated Termin (i.e. a seminar run).
function courseInstance(c: Course): object | null {
  const dated = c.termine.filter((t) => t.date);
  if (!dated.length) return null;
  const starts = dated.map((t) => t.date).sort();
  const ends = dated.map((t) => t.endDate || t.date).sort();
  return {
    "@type": "CourseInstance",
    courseMode: "Onsite",
    startDate: starts[0],
    endDate: ends[ends.length - 1],
    inLanguage: "de",
    location: { "@type": "Place", name: ADDRESS.city, address: postalAddress() },
    instructor: { "@type": "Person", "@id": PERSON_ID(), name: "Beatrice Czekalla" },
  };
}

function offerJsonLd(c: Course, description: string, canonical: string): object {
  const offers = priceOffer(c.cost, canonical);
  const image = c.image ? { image: absUrl(c.image) } : {};
  const provider = { "@type": "Organization", "@id": ORG_ID(), name: SITE_NAME, url: config.siteUrl };

  // Counselling formats (Einzelberatung, Coaching, …) are services, not courses.
  if (isServiceOffer(c)) {
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      name: c.title,
      serviceType: c.title,
      description,
      url: canonical,
      ...image,
      provider,
      areaServed: areaServed(),
      ...(offers ? { offers } : {}),
    };
  }

  const instance = courseInstance(c);
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: c.title,
    description,
    url: canonical,
    inLanguage: "de",
    ...image,
    provider,
    ...(offers ? { offers } : {}),
    ...(instance ? { hasCourseInstance: instance } : {}),
  };
}

function organizationNode(k?: Partial<Kontakt>): object {
  const email = k?.email?.trim();
  const telephone = toE164(k?.phone);
  return {
    "@type": "ProfessionalService",
    "@id": ORG_ID(),
    name: SITE_NAME,
    alternateName: "PBW",
    url: config.siteUrl,
    logo: absUrl("/assets/logo.png"),
    image: absUrl(DEFAULT_OG_IMAGE),
    description: SITE_DESCRIPTION,
    address: postalAddress(),
    areaServed: areaServed(),
    knowsAbout: KNOWS_ABOUT,
    founder: { "@id": PERSON_ID() },
    ...(email ? { email } : {}),
    ...(telephone ? { telephone } : {}),
    ...(email || telephone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            ...(email ? { email } : {}),
            ...(telephone ? { telephone } : {}),
            areaServed: "DE",
            availableLanguage: "German",
          },
        }
      : {}),
  };
}

function personNode(content?: ContentBundle): object {
  const k = content?.kontakt;
  const sameAs = [withHttps(k?.instagramUrl ?? ""), withHttps(k?.linkedinUrl ?? "")].filter(Boolean);
  // Memberships are the Zertifikate entries badged "Mitglied" (DGTA, EATA, …).
  const memberOf = (content?.zertifikate ?? [])
    .filter((z: any) => /mitglied/i.test(z.badge ?? ""))
    .map((z: any) => ({ "@type": "Organization", name: z.name, ...(z.link ? { url: z.link } : {}) }));
  return {
    "@type": "Person",
    "@id": PERSON_ID(),
    name: "Beatrice Czekalla",
    url: absUrl("/ueber-mich"),
    jobTitle: "Psychologische Beraterin & Weiterbildnerin",
    worksFor: { "@id": ORG_ID() },
    knowsAbout: KNOWS_ABOUT,
    image: absUrl(content?.about?.image || "/assets/portrait.webp"),
    hasCredential: [
      { "@type": "EducationalOccupationalCredential", name: "Master im Coaching", credentialCategory: "degree" },
      {
        "@type": "EducationalOccupationalCredential",
        name: "Transaktionsanalytische Lehrtrainerin und Lehrsupervisorin (u. S.)",
        credentialCategory: "certification",
      },
    ],
    ...(memberOf.length ? { memberOf } : {}),
    ...(k?.email ? { email: k.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

function websiteNode(): object {
  return {
    "@type": "WebSite",
    "@id": absUrl("/#website"),
    url: config.siteUrl,
    name: SITE_NAME,
    inLanguage: "de",
    publisher: { "@id": ORG_ID() },
  };
}

function graph(...nodes: object[]): object {
  return { "@context": "https://schema.org", "@graph": nodes };
}

function notFound(): PageResolution {
  return { meta: NOT_FOUND_META, noindex: true, status: 404, canonicalPath: "/" };
}

async function resolveCourse(pathname: string, rawSlug: string): Promise<Resolution> {
  let requested: string;
  try {
    requested = decodeURIComponent(rawSlug);
  } catch {
    return notFound();
  }
  const [c, content] = await Promise.all([getCourse(requested), safeContent()]);
  if (!c) return { ...notFound(), data: content ? { content } : undefined };
  const canonicalPath = coursePath(c);
  // Legacy /seminar/ URLs, the wrong prefix, case variants and /<id> resolve to
  // the same course — send them to the one canonical URL.
  if (pathname !== canonicalPath) return { redirect: canonicalPath };
  const meta = courseMeta(c);
  return {
    meta,
    // Past events stay reachable but are dropped from indexes (noindex + no
    // sitemap/llms entry) so stale seminars don't surface in search/AI.
    noindex: isCourseExpired(c),
    status: 200,
    canonicalPath,
    jsonLd: offerJsonLd(c, meta.description, absUrl(canonicalPath)),
    data: { content, course: { slug: c.slug, data: c } },
  };
}

async function resolve(pathname: string): Promise<Resolution> {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return {
      meta: { title: `Admin | ${SITE_NAME}`, description: "" },
      noindex: true,
      status: 200,
      canonicalPath: pathname,
    };
  }

  // Renamed pages (e.g. /empfehlungen -> /kooperationen) keep old links alive.
  const renamed = RENAMED_PATHS[pathname.toLowerCase()];
  if (renamed) return { redirect: renamed };

  const meta = ROUTE_META[pathname];
  if (!meta) {
    const lower = pathname.toLowerCase();
    if (lower !== pathname && ROUTE_META[lower]) return { redirect: lower };
    // Course pages: "/<slug>" (counselling offers), "/kurstermine/<slug>" and the
    // legacy "/seminar/<slug>". Static pages above always win over a slug.
    const m = pathname.match(/^\/(?:(?:seminar|kurstermine)\/)?([^/]+)$/i);
    if (m) return resolveCourse(pathname, m[1]);
    const content = await safeContent();
    return { ...notFound(), data: content ? { content } : undefined };
  }

  const needsCourses = pathname === "/" || pathname === "/kurstermine";
  const [content, courses] = await Promise.all([
    safeContent(),
    needsCourses ? safeCourses() : Promise.resolve(undefined),
  ]);
  const data: InitialData = { content, courses };
  const page: PageResolution = {
    // The contact page's description names the address from the CMS.
    meta,
    noindex: NOINDEX_PATHS.has(pathname),
    status: 200,
    canonicalPath: pathname,
    data,
  };

  // Entity schema: WebSite + business + person on the homepage, the business
  // (address/NAP) on the contact page, the person on the about page.
  if (pathname === "/") {
    page.jsonLd = graph(websiteNode(), organizationNode(content?.kontakt), personNode(content));
    // Preload the LCP hero image (the CMS one, falling back to the bundled
    // default exactly like Hero.tsx) so it downloads in parallel with the JS.
    page.preloadImage = content?.bilder?.hero || "/assets/hero4.webp";
  } else if (pathname === "/kontakt") {
    page.jsonLd = graph(organizationNode(content?.kontakt));
  } else if (pathname === "/ueber-mich") {
    page.jsonLd = graph(personNode(content));
  }
  return page;
}

function buildBlock(r: PageResolution): { title: string; block: string } {
  const canonical = absUrl(r.canonicalPath);
  const image = absUrl(r.meta.image ?? DEFAULT_OG_IMAGE);
  const t = r.meta.title;
  const d = r.meta.description;

  const rows: string[] = [];
  if (r.preloadImage) {
    rows.push(
      `<link rel="preload" as="image" href="${esc(r.preloadImage)}" fetchpriority="high" data-seo-server />`
    );
  }
  rows.push(`<meta name="description" content="${esc(d)}" data-seo-server />`);
  rows.push(
    r.noindex
      ? `<meta name="robots" content="noindex" data-seo-server />`
      : `<link rel="canonical" href="${esc(canonical)}" data-seo-server />`
  );
  rows.push(`<meta property="og:type" content="website" data-seo-server />`);
  rows.push(`<meta property="og:locale" content="de_DE" data-seo-server />`);
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
    // NB: no data-seo-server here — the client strips those on hydration, which
    // would remove the structured data from the DOM that Googlebot renders.
    rows.push(`<script type="application/ld+json">${inlineJson(r.jsonLd)}</script>`);
  }
  return { title: t, block: rows.join("\n    ") };
}

export type RenderedShell =
  | { redirect: string }
  | { html: string; noindex: boolean; status: 200 | 404 };

export async function renderShell(pathname: string): Promise<RenderedShell> {
  const [html, r] = await Promise.all([loadShell(), resolve(pathname)]);
  if ("redirect" in r) return r;
  const body = r.status === 200 ? await renderBody(pathname) : "";
  const { title, block } = buildBlock(r);
  // Inert JSON (not executed, so CSP script-src 'self' is unaffected); read once
  // by the client to seed its query cache.
  const data = r.data ? `<script type="application/json" id="pbw-data">${inlineJson(r.data)}</script>` : "";
  const out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title data-seo-server>${esc(title)}</title>`)
    .replace("<!--seo-meta-->", block)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>${data}`);
  return { html: out, noindex: r.noindex, status: r.status };
}
