import { listCourses, getCourse } from "../repositories/courses.repo";
import { getSingle } from "../repositories/settings.repo";
import { listCollection } from "../repositories/content.repo";
import { isCourseExpired, SITE_DESCRIPTION } from "./meta";
import type { Course } from "../types";

// Server-side content for the SPA shell body. React (createRoot) replaces #root
// on mount, so this block is what crawlers, AI bots and the first paint see —
// giving them real page content (headings, seminar text, dates, prices, links)
// instead of an empty <div id="root">. Built from the same DB data as the llms
// feeds. renderBody never throws: on any error it degrades to an empty string so
// the app still loads. Content is lightly styled inline so the pre-hydration
// moment reads cleanly; the whole block is discarded once React takes over.

function esc(s: unknown): string {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

function ul(items: string[]): string {
  const li = items.filter(Boolean).map((i) => `<li>${esc(i)}</li>`).join("");
  return li ? `<ul>${li}</ul>` : "";
}

// Minimal scoped styling so the first-paint content is readable (navy headings,
// centred column) without duplicating the app's full Tailwind styles.
const STYLE = `<style>[data-seo-ssr]{max-width:1040px;margin:0 auto;padding:2.5rem 1.25rem;font-family:Inter,system-ui,-apple-system,sans-serif;color:#1a1a1a;line-height:1.6}[data-seo-ssr] h1{font-size:2rem;line-height:1.15;margin:.4rem 0 .6rem;color:#001f3c}[data-seo-ssr] h2{font-size:1.2rem;margin:1.6rem 0 .4rem;color:#001f3c}[data-seo-ssr] img{width:100%;height:auto;max-height:360px;object-fit:cover;border-radius:14px;margin-bottom:1.25rem}[data-seo-ssr] a{color:#0b6b4f}[data-seo-ssr] .kicker{text-transform:uppercase;letter-spacing:.08em;font-size:.78rem;color:#5a6472;font-weight:600}[data-seo-ssr] ul{padding-left:1.1rem;margin:.3rem 0}</style>`;

function wrap(inner: string): string {
  return `<div data-seo-ssr>${STYLE}${inner}</div>`;
}

function courseLinks(courses: Course[]): string {
  const items = courses.map((c) => {
    const sub = c.subtitle ? ` – ${esc(c.subtitle)}` : "";
    return `<li><a href="/seminar/${esc(c.slug)}">${esc(c.title)}</a>${sub}</li>`;
  });
  return items.length ? `<ul>${items.join("")}</ul>` : "";
}

async function activeCourses(): Promise<Course[]> {
  try {
    return (await listCourses()).filter((c) => !isCourseExpired(c));
  } catch {
    return [];
  }
}

async function homeBody(): Promise<string> {
  const courses = await activeCourses();
  return wrap(
    `<img src="/assets/hero-office.webp" alt="Ruhiger Beratungsraum" width="1200" height="800" />` +
      `<p class="kicker">Psychologische Beratung &amp; Weiterbildung</p>` +
      `<h1>Wachstum durch bewusste Veränderung</h1>` +
      `<p>${esc(SITE_DESCRIPTION)}</p>` +
      `<p><a href="/kurstermine">Zu den Kursterminen</a></p>` +
      (courses.length ? `<h2>Kurse &amp; Seminare</h2>${courseLinks(courses)}` : "")
  );
}

async function seminarBody(slug: string): Promise<string> {
  let c: Course | null = null;
  try {
    c = await getCourse(slug);
  } catch {
    c = null;
  }
  if (!c) return "";
  const termine = c.termine
    .filter((t) => t.date || t.time)
    .map((t) => [t.date, t.time].filter(Boolean).join(" "));
  return wrap(
    (c.image ? `<img src="${esc(c.image)}" alt="${esc(c.title)}" />` : "") +
      `<h1>${esc(c.title)}</h1>` +
      (c.subtitle ? `<p class="kicker">${esc(c.subtitle)}</p>` : "") +
      (c.description ? `<p>${esc(c.description)}</p>` : "") +
      (c.cost ? `<p><strong>Kosten:</strong> ${esc(c.cost)}</p>` : "") +
      (termine.length ? `<h2>Termine</h2>${ul(termine)}` : "") +
      (c.includes.length ? `<h2>Inhalte</h2>${ul(c.includes)}` : "") +
      (c.enables.length ? `<h2>Das ermöglicht Ihnen</h2>${ul(c.enables)}` : "")
  );
}

async function kurstermineBody(): Promise<string> {
  const courses = await activeCourses();
  const items = courses.map((c) => {
    const next = c.termine.map((t) => t.date).filter(Boolean).sort()[0];
    const when = next ? ` <em>(ab ${esc(next)})</em>` : "";
    return `<li><a href="/seminar/${esc(c.slug)}">${esc(c.title)}</a>${when}</li>`;
  });
  return wrap(
    `<h1>Kurstermine &amp; Seminare</h1>` +
      `<p>Aktuelle Kurstermine und Seminare von PBW – Beatrice Czekalla.</p>` +
      (items.length ? `<ul>${items.join("")}</ul>` : "<p>Derzeit keine Kurse veröffentlicht.</p>")
  );
}

async function empfehlungenBody(): Promise<string> {
  let kollegen: any[] = [];
  let zertifikate: any[] = [];
  try {
    [kollegen, zertifikate] = await Promise.all([
      listCollection("kollegen"),
      listCollection("zertifikate"),
    ]);
  } catch {
    /* degrade */
  }
  const koll = kollegen.map((k) => [k.name, k.role].filter(Boolean).join(" — "));
  const zert = zertifikate.map((z) => [z.name, z.description].filter(Boolean).join(": "));
  return wrap(
    `<h1>Empfehlungen &amp; Netzwerk</h1>` +
      `<p>Kolleg:innen, Netzwerk und Zertifizierungen von PBW – Beatrice Czekalla.</p>` +
      (koll.length ? `<h2>Kolleg:innen</h2>${ul(koll)}` : "") +
      (zert.length ? `<h2>Zertifikate &amp; Institute</h2>${ul(zert)}` : "")
  );
}

async function kontaktBody(): Promise<string> {
  let k: any = {};
  try {
    k = await getSingle("kontakt");
  } catch {
    k = {};
  }
  return wrap(
    `<h1>Kontakt</h1>` +
      `<p>Kontakt zu Beatrice Czekalla (PBW) – Psychologische Beratung &amp; Weiterbildung.</p>` +
      (k.email ? `<p><strong>E-Mail:</strong> ${esc(k.email)}</p>` : "") +
      (k.phone ? `<p><strong>Telefon:</strong> ${esc(k.phone)}</p>` : "")
  );
}

function ueberMichBody(): string {
  return wrap(
    `<img src="/assets/portrait.webp" alt="Beatrice Czekalla, Porträtaufnahme" style="max-width:320px;aspect-ratio:3/4;max-height:none" />` +
      `<h1>Über mich</h1>` +
      `<p>Beatrice Czekalla – Psychologische Beratung &amp; Weiterbildung. Mehr über Ansatz, ` +
      `Haltung und Werdegang, mit der Transaktionsanalyse als methodischer Grundlage.</p>`
  );
}

// Returns server-rendered body HTML for #root, or "" (admin / unknown / error).
export async function renderBody(pathname: string): Promise<string> {
  try {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return "";

    const seminar = pathname.match(/^\/seminar\/([^/]+)\/?$/);
    if (seminar) return await seminarBody(decodeURIComponent(seminar[1]));

    const key = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    switch (key) {
      case "/":
        return await homeBody();
      case "/kurstermine":
        return await kurstermineBody();
      case "/empfehlungen":
        return await empfehlungenBody();
      case "/kontakt":
        return await kontaktBody();
      case "/ueber-mich":
        return ueberMichBody();
      default:
        return "";
    }
  } catch {
    return "";
  }
}
