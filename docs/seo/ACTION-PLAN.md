# SEO-Maßnahmenplan pbw-ta.de — 27.09.2026

Details und Belege: [FULL-AUDIT-REPORT.md](FULL-AUDIT-REPORT.md). IDs verweisen auf den Report.

Legende Aufwand: **S** < 1 h · **M** 1–4 h · **L** > 4 h · **K** = Kunde/Inhalt nötig

## Kritisch (sofort)

| # | Maßnahme | Wo | Aufwand |
|---|---|---|---|
| 1 | Echte Kontaktdaten in Admin → Kontakt eintragen (`beatrice.czekalla@pbw-ta.de`, `0261 39494070`). Behebt Schema und llms-full.txt | CMS | S |
| 2 | `ContactInfo.tsx` / `MapCard.tsx` aus dem CMS lesen lassen und Adressfelder (Straße, PLZ, Ort) in `kontakt` aufnehmen, damit es nur eine Quelle gibt | Frontend + `settings.repo.ts` | M |
| 3 | Unbekannte Pfade liefern 404 statt 200 (Server) und eine echte NotFound-Seite statt `<Navigate to="/">` | `src/server.ts`, `frontend/src/router.tsx` | M |
| 4 | Fehlende Dateien unter `/assets`, `/uploads`, `/app` und Pfade mit Endung liefern 404 statt SPA-Shell | `src/server.ts` | S |
| 5 | 301 für alle alten `.htm`/`.html`-URLs (bekannt: `kontakt.htm`, `selbsterfahrungsseminar.htm`) plus generische Regel, dazu `/index.html` → `/` | `src/server.ts` `LEGACY_REDIRECTS` | S |

## Hoch (innerhalb 1 Woche)

| # | Maßnahme | Wo | Aufwand |
|---|---|---|---|
| 6 | Canonical aus dem DB-Slug bilden; 301 bei abweichender Schreibweise und bei Slash am Ende | `src/seo/shell.ts`, `Seo.tsx`, Middleware | M |
| 7 | Slug `Einzelberatung` → `einzelberatung` | CMS | S |
| 8 | Die zwei Seiten „Ausbildungskurs in TA“ zu einer zusammenführen (beide Jahrgänge als Termine) oder mit eigenem Titel und Text je Jahrgang; die alte URL per 301 umleiten | CMS (+ Redirect) | S–M |
| 9 | Untertitel bzw. Description für Coaching, Supervision, Organisationsentwicklung und Weiterbildung füllen; Client-Fallback auf `SITE_DESCRIPTION` | CMS + `SeminarPage.tsx:240` | S |
| 10 | Titles und Descriptions mit Leistung und Ort (Vorschläge in Report §3); optionale CMS-Felder „SEO-Titel“ und „SEO-Beschreibung“ je Kurs | `meta.ts` + React-Seiten + CMS | M |
| 11 | Schema: `ProfessionalService` mit `address`, `geo`, `areaServed`, `sameAs`, `@id`; `Person` mit `hasCredential` und `memberOf` | `src/seo/shell.ts` | M |
| 12 | Schema: Beratungsangebote als `Service` statt `Course` (CMS-Feld „Typ“); `CourseInstance` mit `location` und `courseWorkload`, `endDate`-Bug beheben | `shell.ts`, CMS | M |
| 13 | Hero: CMS-Bild vorladen (nicht `hero4.webp`), Fallback-Wechsel beseitigen | `shell.ts`, `Hero.tsx` | S |
| 14 | CLS: Kurs- und Content-Daten in den Shell einbetten und als `initialData` nutzen; `width`/`height` bzw. `aspect-ratio` für alle Bilder | `shell.ts`, `api.ts`, Komponenten | M–L |
| 15 | Admin per `React.lazy` aus dem öffentlichen Bundle auslagern | `frontend/src/router.tsx` | S–M |
| 16 | `favicon.svg` (407 KB) ersetzen; Testimonial-Icons (355 KB) und Logo verkleinern | `public/`, CMS-Upload | S |
| 17 | `alt`-Texte für Kursbilder (`course.title` bzw. CMS-Feld) | `CourseCard.tsx`, `SeminarPage.tsx` | S |
| 18 | Über mich ausbauen: 25+ Jahre, PTSTA-C, EASC, Master Coaching, Vinzenz Pallotti University, Mitgliedschaften mit Jahren | K + CMS | M |
| 19 | Google Search Console einrichten, Sitemap einreichen, Soft-404-/404-Berichte auswerten → Redirect-Liste vervollständigen | extern | S |
| 20 | Google-Unternehmensprofil beanspruchen und pflegen | extern, K | M |

## Mittel (innerhalb 1 Monat)

| # | Maßnahme | Aufwand |
|---|---|---|
| 21 | Leistungsseiten auf 500–900 Wörter: Ablauf, Setting, Ort, Kosten, Zielgruppe, FAQ (K) | L |
| 22 | Kursort auf allen Kursseiten angeben (K) | S |
| 23 | `EducationEvent`-Schema je Termin; `ItemList` auf `/kurstermine`; `BreadcrumbList`, `WebSite` | M |
| 24 | SSR für Über mich (CMS-Text) und Kontakt (Adresse) rendern; Über-mich-Text und Adresse in `llms-full.txt` aufnehmen | M |
| 25 | Cache-Header: `/app` immutable 1 Jahr, Bilder 30 Tage; `x-powered-by` aus; doppelte Header Apache/Express bereinigen | S |
| 26 | Inter selbst hosten → keine Einwilligung für Fonts, kein Layout-Sprung | M |
| 27 | Responsive Bilder: sharp erzeugt beim Upload 480/960/1600 w, dazu `srcset`, `sizes` und `loading="lazy"` | M |
| 28 | Footer-Links DGTA und EATA reparieren (`href="#"`) | S |
| 29 | Interne Verlinkung: „Verwandte Angebote“ auf Kursseiten, Menüpunkt „Angebote“ | M |
| 30 | Markenname festlegen („Psychologische“ oder „Perspektive Beratung und Weiterbildung“?) und überall gleich verwenden (K) | S |
| 31 | NAP-Abgleich in Gelbe Seiten, Infobel, Weiterbildungsportale RLP/Saarland, EASC, DGTA (K) | M |
| 32 | Ortsbezug (Vallendar/Koblenz + Umland) in Texten, H1 der Startseite mit Keyword | S |

## Niedrig (Backlog)

| # | Maßnahme |
|---|---|
| 33 | Wissensartikel bzw. Blog: „Was ist Transaktionsanalyse?“, „Coaching vs. Supervision vs. Beratung“, „Weg zum CTA“ |
| 34 | Footer-Überschriften nicht als `<h4>`; Bezeichnung „Empfehlungen“ vs. „Kooperationen“ vereinheitlichen |
| 35 | Newsletter-URL von Tracking-Parametern befreien; LinkedIn-URL mit `https://` speichern |
| 36 | OG-Bilder als JPEG 1200×630 + `og:image:width`/`height`/`alt`, `og:locale=de_DE` |
| 37 | Touch-Ziele ≥ 24 px (Footer-Links, „Weiter zu …“); Hero-Lesbarkeit mobil |
| 38 | Tippfehler: „Handwerkzeug“ → „Handwerkszeug“, „Kommunikation-“ → „Kommunikations-“ |
| 39 | JSON-API komprimieren (compression/mod_deflate) |
| 40 | Lesbare Datumsformate in `llms-full.txt` |
