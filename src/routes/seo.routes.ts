import { Router } from "express";
import { listCourses } from "../repositories/courses.repo";
import { listCollection } from "../repositories/content.repo";
import { getSingle } from "../repositories/settings.repo";
import { absUrl, SITE_TITLE, SITE_DESCRIPTION, STATIC_PATHS } from "../seo/meta";
import { config } from "../config";
import type { Course } from "../types";

// Dynamic robots.txt / sitemap.xml / llms.txt / llms-full.txt. All read live DB
// data, so adding/editing/deleting a course is reflected on the next request —
// no regeneration step. DB errors degrade to static content instead of 503 so
// crawlers always get a valid response. Mounted before static + SPA catch-all.

export const seoRouter = Router();

function xmlEscape(s: string): string {
  return s.replace(
    /[<>&'"]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!
  );
}

function isoDate(v?: string): string | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10);
}

async function safeCourses(): Promise<Course[]> {
  try {
    return await listCourses();
  } catch {
    return [];
  }
}

// ---- robots.txt (no DB dependency) ----
seoRouter.get("/robots.txt", (_req, res) => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api/",
    "",
    `Sitemap: ${absUrl("/sitemap.xml")}`,
    "",
  ].join("\n");
  res.type("text/plain; charset=utf-8").send(body);
});

// ---- sitemap.xml ----
seoRouter.get("/sitemap.xml", async (_req, res) => {
  const courses = await safeCourses();
  const urls: { loc: string; lastmod?: string }[] = [];
  for (const p of STATIC_PATHS) urls.push({ loc: absUrl(p) });
  for (const c of courses) urls.push({ loc: absUrl(`/seminar/${c.slug}`), lastmod: isoDate(c.updatedAt) });

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>\n` +
          (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : "") +
          `  </url>`
      )
      .join("\n") +
    `\n</urlset>\n`;
  res.type("application/xml; charset=utf-8").send(body);
});

// ---- llms.txt (concise index) ----
seoRouter.get("/llms.txt", async (_req, res) => {
  const courses = await safeCourses();
  const L: string[] = [];
  L.push(`# ${SITE_TITLE}`, "");
  L.push(`> ${SITE_DESCRIPTION}`, "");
  L.push("## Seiten");
  L.push(`- [Startseite](${absUrl("/")})`);
  L.push(`- [Über mich](${absUrl("/ueber-mich")}): Ansatz, Haltung und Werdegang von Beatrice Czekalla.`);
  L.push(`- [Kurstermine](${absUrl("/kurstermine")}): Alle aktuellen Kurse und Seminare mit Terminen.`);
  L.push(`- [Empfehlungen](${absUrl("/empfehlungen")}): Netzwerk, Kolleg:innen und Zertifizierungen.`);
  L.push(`- [Kontakt](${absUrl("/kontakt")}): Kontaktmöglichkeiten und Anfrage.`);
  L.push("", "## Kurse & Seminare");
  if (!courses.length) L.push("- (derzeit keine Kurse veröffentlicht)");
  for (const c of courses) {
    const sub = c.subtitle ? `: ${c.subtitle}` : "";
    L.push(`- [${c.title}](${absUrl(`/seminar/${c.slug}`)})${sub}`);
  }
  L.push("");
  res.type("text/plain; charset=utf-8").send(L.join("\n"));
});

// ---- llms-full.txt (full corpus) ----
seoRouter.get("/llms-full.txt", async (_req, res) => {
  let courses: Course[] = [];
  let kontakt: Record<string, string> = { email: "", phone: "" };
  let kollegen: any[] = [];
  let zertifikate: any[] = [];
  try {
    [courses, kontakt, kollegen, zertifikate] = await Promise.all([
      listCourses(),
      getSingle("kontakt"),
      listCollection("kollegen"),
      listCollection("zertifikate"),
    ]);
  } catch {
    /* degrade to whatever defaults are set above */
  }

  const L: string[] = [];
  L.push(`# ${SITE_TITLE}`, "");
  L.push(`> ${SITE_DESCRIPTION}`, "");
  L.push(`Website: ${config.siteUrl}`);
  if (kontakt.email) L.push(`E-Mail: ${kontakt.email}`);
  if (kontakt.phone) L.push(`Telefon: ${kontakt.phone}`);
  L.push("", "## Kurse & Seminare", "");
  if (!courses.length) L.push("(derzeit keine Kurse veröffentlicht)", "");
  for (const c of courses) {
    L.push(`### ${c.title}`);
    L.push(`URL: ${absUrl(`/seminar/${c.slug}`)}`);
    if (c.subtitle) L.push(c.subtitle);
    L.push("");
    if (c.description) L.push(c.description, "");
    if (c.cost) L.push(`Kosten: ${c.cost}`);
    const termine = c.termine.filter((t) => t.date || t.time);
    if (termine.length) {
      L.push("Termine:");
      for (const t of termine) L.push(`- ${[t.date, t.time].filter(Boolean).join(" ")}`);
    }
    if (c.includes.length) {
      L.push("Inhalte:");
      for (const it of c.includes) L.push(`- ${it}`);
    }
    if (c.enables.length) {
      L.push("Das ermöglicht Ihnen:");
      for (const en of c.enables) L.push(`- ${en}`);
    }
    L.push("");
  }

  if (kollegen.length || zertifikate.length) {
    L.push("## Netzwerk & Empfehlungen", "");
    if (kollegen.length) {
      L.push("Kolleg:innen:");
      for (const k of kollegen) {
        const parts = [k.name, k.role].filter(Boolean).join(" — ");
        L.push(`- ${parts}${k.link ? ` (${k.link})` : ""}`);
      }
      L.push("");
    }
    if (zertifikate.length) {
      L.push("Zertifikate & Institute:");
      for (const z of zertifikate) {
        const head = [z.name, z.badge].filter(Boolean).join(" — ");
        L.push(`- ${head}${z.description ? `: ${z.description}` : ""}`);
      }
      L.push("");
    }
  }

  res.type("text/plain; charset=utf-8").send(L.join("\n"));
});
