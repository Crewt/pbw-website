# SEO-Audit pbw-ta.de — 27.09.2026

Geprüft: Live-Site `https://pbw-ta.de` (18 Sitemap-URLs + Rechtsseiten + Fehlerfälle), Server-Rendering (`src/seo/*`), React-Frontend (`frontend/src/site/*`), gerendertes DOM (headless Chromium, Desktop + Mobile), Performance-Messung, externe Sichtbarkeit (Websuche).

## Executive Summary

**SEO Health Score: 53 / 100**

| Kategorie | Gewicht | Score |
|---|---|---|
| Technical SEO | 22 % | 55 |
| Content-Qualität / E-E-A-T | 23 % | 50 |
| On-Page SEO | 20 % | 55 |
| Schema / Structured Data | 10 % | 45 |
| Performance (CWV) | 10 % | 55 |
| AI Search Readiness (GEO) | 10 % | 65 |
| Bilder | 5 % | 45 |

**Geschäftstyp:** Lokaler Dienstleister + Bildungsanbieter (hybrid). Einzelpraxis in Vallendar bei Koblenz (Düppelstraße 9c): Beratung, Coaching, Supervision, Paarberatung und TA-Ausbildung. Für die Sichtbarkeit zählen vor allem lokale Suchen („Coaching Koblenz“, „Supervision Vallendar“) und Nischensuchen („Transaktionsanalyse Ausbildung Rheinland-Pfalz“).

**Die Basis ist gut:** serverseitige Meta-Tags und Body-Inhalt pro Seite, dynamische Sitemap, llms.txt, HTTPS mit sauberen www→apex- und http→https-Redirects, `lang="de"`, eindeutige H1s. Der Score liegt vor allem an Fehlern im Detail, die sich schnell beheben lassen.

### Die 5 kritischsten Probleme
1. **Falsche Kontaktdaten im Schema und in llms-full.txt.** JSON-LD und `/llms-full.txt` enthalten `info@pbw-ta.de` und `+49 (0) 261 671234`. Das sind Platzhalter aus dem CMS. Richtig sind laut Kontaktseite und Impressum `beatrice.czekalla@pbw-ta.de` und `0261 39494070`. Die Adresse fehlt im Schema ganz. Uneinheitliche Kontaktdaten (NAP) schaden dem Local SEO direkt, und KI-Systeme zitieren die falsche Nummer.
2. **Soft-404s überall.** Jede unbekannte URL liefert HTTP 200 mit Selbst-Canonical und Startseiten-Meta (`/gibtsnicht`, `/seminar/gibtsnicht`, `/ueber-mich.html`, `/assets/nope.png`, `/uploads/nope.webp`). Im Browser leitet React dann per JS auf `/` weiter.
3. **Alte `.htm`-URLs aus dem Google-Index gehen verloren.** Google kennt z. B. noch `/kontakt.htm` und `www.pbw-ta.de/selbsterfahrungsseminar.htm`. Weitergeleitet werden nur `impressum.htm` und `datenschutz.htm`. Alle anderen alten URLs landen im Soft-404, und ihr Ranking-Wert geht verloren.
4. **Doppelte URLs mit eigenem Canonical.** `/seminar/Einzelberatung` und `/seminar/einzelberatung`, `/kurstermine` und `/kurstermine/` sowie `/index.html` (roher Shell ohne Meta) sind jeweils eigene indexierbare Seiten. Zusätzlich gibt es zwei Seiten „Ausbildungskurs in TA“ mit identischem Title, identischer Description und fast identischem Text.
5. **CLS schlecht auf Kurs- und Terminseiten.** Gemessen wurden 0,62 (mobil) bzw. 0,26 (Desktop) auf `/seminar/ausbildungskurs-ta` und 0,24 auf `/kurstermine`. Google wertet ab 0,25 als „schlecht“. Ursache: Der SSR-Block wird durch das React-Layout ersetzt, Bilder haben keine `width`/`height`, und Google Fonts werden erst nach Einwilligung geladen.

### Die 5 schnellsten Gewinne
1. Echte Kontaktdaten im Admin unter „Kontakt“ eintragen (5 Minuten, behebt Problem 1 zum Großteil).
2. 404-Status für unbekannte Pfade und fehlende Dateien sowie 301-Redirects für alte `.htm`-URLs.
3. Canonical immer auf den DB-Slug in Kleinschreibung ohne Slash am Ende setzen, dazu 301 von den Varianten.
4. Leere Meta-Descriptions auf den Seiten Coaching, Supervision, Organisationsentwicklung und Weiterbildung füllen (im CMS-Feld „Untertitel“).
5. `Cache-Control: immutable` für `/app/*` (Dateinamen enthalten einen Hash), dazu den 407-KB-Favicon und die 355-KB-Icons verkleinern.

---

## 1. Technical SEO (55/100)

### Was gut ist
- HTTPS, HTTP/2, 301 von `http://` und `www.` auf `https://pbw-ta.de/`.
- `robots.txt` ist sauber: `/admin` und `/api/` gesperrt, Sitemap verlinkt.
- Alle KI-Crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot) bekommen HTTP 200.
- Dynamische Sitemap mit `lastmod` für Kurse. Abgelaufene Kurse werden automatisch entfernt und auf `noindex` gesetzt (`src/seo/meta.ts` `isCourseExpired`).
- Server-Rendering: `<title>`, Description, Canonical, OG-Tags und JSON-LD kommen serverseitig. `renderBody` (`src/seo/prerender.ts`) liefert echten Inhalt in `#root`, sodass Crawler ohne JS Text sehen.
- `X-Robots-Tag: noindex` per Header für Admin und abgelaufene Kurse.
- Sicherheits-Header vorhanden (CSP, HSTS, nosniff, X-Frame-Options, Referrer-Policy).

### Probleme

| # | Priorität | Problem | Beleg | Fix |
|---|---|---|---|---|
| T1 | Kritisch | Soft-404 für alle unbekannten Pfade | `GET /gibtsnicht` → 200, Canonical `https://pbw-ta.de/gibtsnicht`, Titel der Startseite; der Client leitet dann per `<Navigate to="/">` um (`frontend/src/router.tsx:34`) | In `src/server.ts` im SPA-Fallback: bekannte Route oder existierender Kurs → 200, sonst **404** mit `noindex` und einer echten 404-Seite in React statt `Navigate` |
| T2 | Kritisch | Fehlende Dateien liefern HTML mit 200 | `/assets/nope.png`, `/uploads/nope.webp`, `/app/nope.js` → 200 `text/html` | Für `/assets`, `/uploads`, `/app` und Pfade mit Dateiendung nie auf den Shell zurückfallen, sondern 404 |
| T3 | Kritisch | Alte `.htm`-URLs nicht umgeleitet | Websuche findet `pbw-ta.de/kontakt.htm` und `www.pbw-ta.de/selbsterfahrungsseminar.htm` | `LEGACY_REDIRECTS` in `src/server.ts:152` erweitern (Liste unten) und sicherheitshalber `/*.htm` und `/*.html` generisch per 301 auf eine passende Route oder `/` leiten |
| T4 | Hoch | Groß/Kleinschreibung erzeugt Duplikate | `/seminar/Einzelberatung` und `/seminar/einzelberatung` → beide 200, jeweils Selbst-Canonical | Canonical in `buildBlock` (`src/seo/shell.ts:196`) aus `c.slug` bauen statt aus `pathname`; bei abweichendem Pfad 301 auf den kanonischen Slug. Slug `Einzelberatung` im Admin auf `einzelberatung` ändern (Sitemap und Home-Links zeigen die Großschreibung) |
| T5 | Hoch | Slash am Ende erzeugt Duplikate | `/kurstermine/` → 200, Canonical `…/kurstermine/` | 301 von `/(.+)/$` auf die Variante ohne Slash (Express-Middleware vor Static) |
| T6 | Hoch | `/index.html` wird roh ausgeliefert | 200, keine Description, kein Canonical, kein Inhalt (`express.static` liefert `dist/index.html`) | 301 `/index.html` → `/` oder `index.html` vom Static-Serving ausnehmen |
| T7 | Mittel | Client-Canonical übernimmt die URL ungeprüft | `frontend/src/site/lib/Seo.tsx:33` setzt `window.location.pathname` als Canonical, also auch Großschreibung und Slash | Canonical-Pfad als Prop übergeben (SeminarPage: `/seminar/${course.slug}`) |
| T8 | Mittel | Hashed Bundles ohne Browser-Cache | `/app/index-*.js`: `Cache-Control: public, max-age=0` | `express.static(spaDir, { immutable: true, maxAge: "1y" })` für `/app`; `/assets` und `/uploads` z. B. 30 Tage |
| T9 | Niedrig | Doppelte bzw. widersprüchliche Sicherheits-Header | Apache und Express setzen beide HSTS (`15768000` und `31536000; includeSubDomains`), nosniff und Referrer-Policy | Nur an einer Stelle setzen (Express oder Apache) |
| T10 | Niedrig | `X-Powered-By: Express` | Header sichtbar | `app.disable("x-powered-by")` |
| T11 | Niedrig | `/sitemap.xml/` liefert ebenfalls die Sitemap | 200 | Wird durch T5 mit erledigt |
| T12 | Info | Impressum/Datenschutz auf `noindex` | bewusst so gewählt | OK. Das Impressum darf aber ruhig indexierbar sein, weil es Adresse und Telefon bestätigt (NAP-Signal) |

**Bekannte Legacy-URLs, die umgeleitet werden sollten** (aus der Websuche, eventuell unvollständig): `/kontakt.htm` → `/kontakt`, `/selbsterfahrungsseminar.htm` → `/seminar/selbsterfahrungsseminar`. Die alte Site hatte laut Suchergebnissen außerdem Seiten zu Einzelberatung, Paarberatung, Coaching, Supervision, Inhouse-Seminaren und „Von der Angst zum Mut“. Die genauen Dateinamen sollten aus der Google Search Console (Seiten → „Nicht gefunden“ bzw. „Soft 404“) oder aus einem Backup der alten Site übernommen werden. Als generelle Absicherung: `^/(.+)\.html?$` → 301 auf `/$1`, falls die Route existiert, sonst auf `/`.

---

## 2. Content-Qualität und E-E-A-T (50/100)

### Was gut ist
- Die Über-mich-Seite nennt echte Qualifikationen: Master in Coaching, transaktionsanalytische Lehrtrainerin und Lehrsupervisorin (u. S.).
- Die Seite Empfehlungen/Kooperation verlinkt Fachverbände (DGTA, EATA, EASC) und Kolleg:innen mit Begründung. Das sind starke Vertrauenssignale.
- Die Kursseiten beschreiben Zielgruppe, Inhalte und Nutzen, Termine und Preise sind sichtbar.

### Probleme

| # | Priorität | Problem | Details |
|---|---|---|---|
| C1 | Hoch | Leistungsseiten sind dünn | Coaching hat ca. 114 Wörter, Einzelberatung ca. 149, Supervision, Organisationsentwicklung und Weiterbildung ähnlich wenig. Für umkämpfte Suchbegriffe wie „Coaching Koblenz“ oder „Paarberatung Koblenz“ reicht das nicht. Richtwert: 500–900 Wörter pro Leistungsseite mit Ablauf, Dauer und Setting, Kosten bzw. Honorarrahmen, Ort, „für wen / für wen nicht“, 4–6 FAQ und einem kurzen Fallbeispiel (anonymisiert) |
| C2 | Hoch | Doppelter Inhalt „Ausbildungskurs in TA“ | `/seminar/ausbildungskurs-ta` (Jahrgang 2027) und `/seminar/ausbildungskurs-in-ta` (2026) haben gleichen Titel und gleiche Description, der Text ist zu ~95 % gleich. Google wählt eine der beiden aus und ignoriert die andere. **Besser:** eine Seite „Ausbildung in Transaktionsanalyse“ mit beiden Jahrgängen als Termin-Blöcke. Alternativ Titel und Slug mit Jahrgang („… Jahrgang 2027“) plus eigener Einleitung |
| C3 | Hoch | E-E-A-T-Signale fehlen auf der Site, obwohl sie extern belegt sind | Andere Seiten nennen: **über 25 Jahre Erfahrung**, **PTSTA-C** (Teaching and Supervising Transactional Analyst, Counselling), **EASC-zertifizierte Supervisorin/Coach**, Paarberaterin, Ausbildungsmodule an der **Vinzenz Pallotti University Vallendar**, Kurse im **Weiterbildungsportal RLP**. Auf pbw-ta.de steht davon kaum etwas. Vorschlag für die Über-mich-Seite: eine Liste der Qualifikationen mit Jahreszahlen, Mitgliedschaften mit Links, Veranstaltungsorte, eventuell Veröffentlichungen und Vorträge |
| C4 | Mittel | Ort der Kurse fehlt | Wo finden Seminare und Ausbildungsblöcke statt? Auf keiner Kursseite steht ein Ort. Das ist wichtig für Nutzer, fürs lokale Ranking und für das Schema (`location`) |
| C5 | Mittel | Über-mich-SSR ist fest im Code und dünn | `ueberMichBody()` in `src/seo/prerender.ts:137` liefert nur 21 Wörter, der echte Text steht im CMS (`about`). Crawler ohne JS und viele KI-Bots sehen deshalb fast nichts. SSR sollte den CMS-Text rendern |
| C6 | Mittel | Kontaktseite im SSR ohne Adresse | Der SSR-Block zeigt nur E-Mail und Telefon (und zwar die falschen, siehe S1), aber keine Adresse |
| C7 | Mittel | Markenname uneinheitlich | Auf der Website heißt es „Psychologische Beratung & Weiterbildung“, das Logo sagt „Perspektiven entdecken, entfalten, ausgestalten“, im Weiterbildungsportal RLP steht „**PBW – Perspektive Beratung und Weiterbildung**“. Mit dem Kunden klären, welcher Name offiziell ist, und diesen überall gleich verwenden (Website, Schema, Google-Unternehmensprofil, Gelbe Seiten, Portale) |
| C8 | Niedrig | Kleine Textfehler | „Handwerkzeug für den Alltag“ (Home-H4) statt „Handwerkszeug“; „Kommunikation- und Beziehungsfähigkeit“ (Coaching) statt „Kommunikations-“ |
| C9 | Niedrig | Keine Blog- oder Wissensinhalte | Beiträge wie „Was ist Transaktionsanalyse?“, „Ich-Zustände einfach erklärt“, „Unterschied Coaching / Supervision / Beratung“, „Wie läuft die TA-Ausbildung zum CTA ab?“ würden informationelle Suchen abdecken und von KI-Systemen zitiert werden. Das ist mittelfristig der größte Hebel für Reichweite |

---

## 3. On-Page SEO (55/100)

### Titles
Alle Titles folgen dem Muster `<Seite> | PBW – Beatrice Czekalla`. Das ist sauber und eindeutig, enthält aber **weder Leistung noch Ort**. Niemand sucht nach „PBW“.

| Seite | Aktuell | Vorschlag (≤ 60 Zeichen) |
|---|---|---|
| `/` | PBW – Beatrice Czekalla · Psychologische Beratung & Weiterbildung (65) | Beratung, Coaching & TA-Ausbildung in Vallendar/Koblenz – PBW |
| `/ueber-mich` | Über mich \| PBW – Beatrice Czekalla | Beatrice Czekalla – Lehrtrainerin TA, Coach & Supervisorin |
| `/kurstermine` | Kurstermine & Seminare \| PBW – … | Seminare & TA-Kurstermine 2026/2027 – PBW Vallendar |
| `/empfehlungen` | Empfehlungen & Netzwerk \| … | Kooperationen & Netzwerk (DGTA, EATA, EASC) – PBW |
| `/kontakt` | Kontakt \| PBW – … | Kontakt – PBW Beatrice Czekalla, Vallendar bei Koblenz |
| `/seminar/coaching` | Coaching \| PBW – … | Coaching für Führungskräfte in Koblenz/Vallendar – PBW |
| `/seminar/Einzelberatung` | Einzelberatung \| … | Psychologische Einzelberatung in Vallendar/Koblenz – PBW |
| `/seminar/paarberatung` | Paarberatung \| … | Paarberatung in Koblenz/Vallendar – PBW |
| `/seminar/supervision` | Supervision \| … | Supervision für Teams & Einzelne – Koblenz/Vallendar |
| `/seminar/ausbildungskurs-*` | Ausbildungskurs in TA \| … | Ausbildung Transaktionsanalyse (DGTA/EATA) – Vallendar |

Umsetzung: ein optionales CMS-Feld „SEO-Titel“ und „SEO-Beschreibung“ je Kurs, Fallback auf das bisherige Muster. Die Titles der statischen Seiten stehen in `src/seo/meta.ts` `ROUTE_META` **und** in den React-Seiten (`<Seo title=…>`), müssen also an beiden Stellen gleich gehalten werden. Besser: eine gemeinsame Quelle.

### Meta-Descriptions

| # | Priorität | Problem |
|---|---|---|
| O1 | Hoch | **Leer im Client**: Coaching, Supervision, Organisationsentwicklung und Weiterbildung haben weder Untertitel noch Beschreibung. Der Server setzt den Standardtext der Site, `SeminarPage.tsx:240` überschreibt ihn nach dem Laden mit `""`. Google sieht damit ein leeres oder doppeltes Snippet. Fix: CMS-Feld füllen **und** im Client auf `SITE_DESCRIPTION` zurückfallen |
| O2 | Mittel | Zu kurz: Ausbildungskurs (52 Zeichen), „Wer bin ich als Coach?“ (51), Einführungskurs (70), Gruppensupervision (69). Ziel: 120–155 Zeichen mit Nutzen, Ort und Handlungsaufforderung |
| O3 | Niedrig | Die Home-Description beschreibt das Angebot nicht („Perspektiven entdecken …“). Vorschlag: „Einzelberatung, Paarberatung, Coaching, Supervision und Ausbildung in Transaktionsanalyse (DGTA/EATA) bei Beatrice Czekalla in Vallendar bei Koblenz.“ |

### Überschriften

| # | Priorität | Problem |
|---|---|---|
| O4 | Mittel | Die Home-H1 „Wachstum durch bewusste Veränderung“ enthält kein Keyword. Die Kicker-Zeile „Psychologische Beratung & Weiterbildung“ ist ein `<span>`. Vorschlag: Kicker als Teil der H1 auszeichnen oder die H1 um Leistung und Ort ergänzen |
| O5 | Niedrig | Der Footer nutzt `<h4>` (Navigation, Mehr, Nächster Schritt), damit folgen auf H2 direkt H4. Footer-Titel besser als `<p>`/`<strong>` |
| O6 | Niedrig | Uneinheitliche Bezeichnungen: URL `/empfehlungen`, Menü „Kooperationen“, Title „Empfehlungen & Netzwerk“, H1 „Kooperation & Austausch“. Eine Bezeichnung festlegen, eventuell mit Slug `/kooperationen` und 301 von der alten URL |
| O7 | Niedrig | Kurstermine: H1 „Kurstermine“, Title „Kurstermine & Seminare“. Das ist in Ordnung |

### Interne Verlinkung

| # | Priorität | Problem |
|---|---|---|
| O8 | Mittel | Footer-Links „DGTA“ und „EATA“ haben `href="#"` (`frontend/src/site/components/Footer.tsx:73,78`). Das sind kaputte Links, sie sollten auf dgta.de und eatanews.org zeigen |
| O9 | Mittel | Kursseiten verlinken nicht auf verwandte Angebote. Der Einführungskurs sollte zum Ausbildungskurs führen, Coaching zu „Wer bin ich als Coach?“ und zu Supervision. Ein Block „Das könnte Sie auch interessieren“ und Breadcrumbs (Home › Kurstermine › Kurs) würden helfen |
| O10 | Niedrig | Einzelberatung, Coaching, Supervision, Paarberatung, Organisationsentwicklung und Weiterbildung sind nur über die Startseite erreichbar, nicht über das Menü. Besser: Menüpunkt „Angebote“ mit Übersichtsseite |
| O11 | Niedrig | Der Newsletter-Link enthält Google-Ads-/GA-Tracking-Parameter (`?_gl=1*…gcl_aw…`). Im CMS auf die saubere CleverReach-URL kürzen |
| O12 | Niedrig | LinkedIn-URL im CMS ohne `https://` gespeichert (`linkedin.com/in/…`). Das Frontend ergänzt es zwar, für `sameAs` im Schema sollte sie aber vollständig sein |

---

## 4. Schema und strukturierte Daten (45/100)

### Vorhanden
- Home: `Organization` + `ProfessionalService`
- Über mich: `Person`
- Kursseiten: `Course` (mit `Offer` und `CourseInstance`, wenn Preis bzw. Termine vorhanden)
- Kurstermine, Empfehlungen, Kontakt: **nichts**

### Probleme

| # | Priorität | Problem | Fix |
|---|---|---|---|
| S1 | Kritisch | **Falsche Kontaktdaten**: `email: info@pbw-ta.de`, `telephone: +49 (0) 261 671234`. Das sind CMS-Platzhalter aus `kontakt.email` und `kontakt.phone`. Die Kontaktseite zeigt fest im Code (`ContactInfo.tsx:6-8`) die echten Daten | Echte Werte im Admin eintragen **und** `ContactInfo.tsx` sowie `MapCard.tsx` aus dem CMS lesen lassen, damit es nur eine Quelle gibt |
| S2 | Hoch | Keine Adresse und keine Geodaten. Für eine Praxis mit Ortsbezug ist das der wichtigste Schema-Baustein | `ProfessionalService` (bzw. `LocalBusiness`) mit `address` (PostalAddress: Düppelstraße 9c, 56179 Vallendar, DE), `geo`, `areaServed` (Vallendar, Koblenz, Neuwied, Westerwald, Rheinland-Pfalz), `openingHoursSpecification` bzw. „nach Vereinbarung“, `priceRange`. Adressfelder ins CMS-Singleton `kontakt` aufnehmen |
| S3 | Hoch | Beratungsleistungen als `Course` ausgezeichnet: Einzelberatung, Paarberatung, Coaching, Supervision, Organisationsentwicklung und Weiterbildung sind Dienstleistungen, keine Kurse. Coaching hat zudem die Standard-Description | Je Kurs ein CMS-Feld „Typ“ (Kurs/Seminar vs. Beratungsangebot). Für Beratungsangebote `Service` mit `serviceType`, `provider` → Organisation (`@id`), `areaServed`, eventuell `offers` |
| S4 | Hoch | Zu wenige Felder im `Course`-Schema für Googles Rich Result „Kursinfo“. Es fehlen `courseSchedule` bzw. `courseWorkload` und `location`. `endDate` ist falsch: Es nimmt das **Start**datum des letzten Termins (2027-11-12 statt 11-13, `shell.ts:86`) | `CourseInstance`: `location` (Place + Adresse), `courseSchedule` (`repeatCount`, `repeatFrequency`) oder `courseWorkload` (z. B. `PT16H`), `endDate` aus `t.endDate ?? t.date`, `inLanguage: "de"`. `offers.category` sollte laut Google einen Wert wie „Paid“ haben statt „Seminar“ |
| S5 | Mittel | Keine `Event`-Auszeichnung. Seminare mit festem Termin (Einführungskurs 16./17.10.2026, Selbsterfahrung, „Konfliktpotential“) eignen sich für Event-Rich-Results in Google („Veranstaltungen in der Nähe“) | Je Termin ein `EducationEvent` mit `startDate`/`endDate` inkl. Uhrzeit, `location`, `offers`, `organizer`, `eventAttendanceMode: OfflineEventAttendanceMode`, `eventStatus` |
| S6 | Mittel | Entitäten sind nicht verknüpft: Person, Organisation und Kurse nutzen kein `@id`, und `provider` auf den Kursseiten ist ein anonymes Objekt | `@graph` mit `"@id": "https://pbw-ta.de/#org"` und `"#person"`, Kurse verweisen per `provider: {"@id": …}` |
| S7 | Mittel | Kein `sameAs`: Instagram, LinkedIn, EASC-Profil, DGTA-Eintrag, Weiterbildungsportal RLP und Gelbe Seiten sind nicht verknüpft | `sameAs` auf Person und Organisation. Das stärkt den Knowledge-Graph-Eintrag |
| S8 | Mittel | `Person` ohne Qualifikationen | `hasCredential` (EducationalOccupationalCredential: Master Coaching, PTSTA-C, EASC), `memberOf` (DGTA, EATA, EASC), `alumniOf`, `jobTitle` präzisieren |
| S9 | Niedrig | Kein `WebSite`- und kein `BreadcrumbList`-Schema | `WebSite` auf der Startseite, Breadcrumbs auf Kurs- und Unterseiten |
| S10 | Niedrig | `/kurstermine` ohne `ItemList` | `ItemList` mit den Kurs-URLs (Voraussetzung für Kurs-Karussells) |
| S11 | Niedrig | `telephone` nicht im E.164-Format | `+4926139494070` |

---

## 5. Performance / Core Web Vitals (55/100)

Messung per Laborwerten (Chromium, mobil mit 4× CPU-Drosselung + 150 ms Latenz, Desktop ohne Drosselung). Felddaten (CrUX) gibt es für die Site vermutlich nicht, weil der Traffic zu gering ist.

| Seite | LCP mobil | CLS mobil | CLS Desktop | Transfer |
|---|---|---|---|---|
| `/` | 1,4 s | 0,00 | 0,00 | 1,23 MB |
| `/kurstermine` | 1,0 s | **0,24** | **0,21** | 1,75 MB |
| `/seminar/ausbildungskurs-ta` | 1,4 s | **0,62** | **0,26** | 0,88 MB |
| `/ueber-mich` | 0,9 s | 0,00 | 0,00 | 0,92 MB |

TTFB ist sehr gut (20–60 ms), LCP ist in Ordnung. **CLS ist das Hauptproblem.**

| # | Priorität | Problem | Fix |
|---|---|---|---|
| P1 | Hoch | **CLS 0,2–0,6** auf Kurs- und Terminseiten. Ursachen: (a) der SSR-Block (`[data-seo-ssr]`, anderes Layout) wird beim Mount durch das React-Layout mit Banner, Sidebar und Bildern ersetzt; (b) `SeminarPage` zeigt zuerst „Kurs wird geladen…“ und wartet auf `/api/courses`; (c) `<img>` ohne `width`/`height` bzw. `aspect-ratio` | Kursdaten serverseitig in den Shell einbetten (`<script type="application/json" id="__DATA__">`) und als `initialData` an React Query geben, dann entfällt der Ladezustand. Allen Bildern feste Seitenverhältnisse geben. Langfristig echtes SSR/Prerendering mit `hydrateRoot` statt `createRoot` |
| P2 | Hoch | **Hero-Preload lädt das falsche Bild.** Der Server lädt `/assets/hero4.webp` vor, der Hero zeigt aber das CMS-Bild `/uploads/4e86….webp`. Das Hero-Bild wird erst **nach** JS und dem API-Aufruf `/api/content` bekannt und rendert zunächst den Fallback, danach wechselt das Bild (doppelter Download, sichtbarer Wechsel). Auf dem Desktop misst LCP das CMS-Bild, mobil das Fallback-Bild | In `buildBlock` das Hero-Bild aus `getSingle("bilder")` vorladen. Hero-URL in die eingebetteten Daten aufnehmen (siehe P1), sodass kein Fallback-Wechsel nötig ist |
| P3 | Hoch | **Ein JS-Bundle mit 572 KB** (unkomprimiert) für alle Seiten, inklusive **Admin-Bereich** (Editor, react-easy-crop usw.) | `React.lazy()` + dynamischer `import()` für `/admin` (und eventuell SeminarPage). Die CSP bleibt gültig, solange der Modulepreload-Polyfill aus bleibt (siehe Kommentar in `server.ts`) |
| P4 | Hoch | **Übergroße Bilder**: Die Testimonial-Icons auf der Startseite haben 2000×2000 px bzw. **355 KB** und werden in 48×48 px angezeigt; das Logo hat 816×198 bei 206×50 Anzeige; die Kursbilder 1536–2000 px bei 548 px Kartenbreite | Beim Upload mehrere Größen erzeugen (sharp ist schon im Einsatz: z. B. 480/960/1600 w) und per `srcset`/`sizes` ausliefern. Avatare auf 96 px begrenzen |
| P5 | Hoch | **`favicon.svg` ist 407 KB groß** (vermutlich mit eingebettetem Rasterbild). Moderne Browser laden die SVG-Variante auf jeder Seite | Als echtes Vektor-SVG unter 5 KB neu erzeugen oder die SVG-Zeile weglassen (ICO/PNG reichen) |
| P6 | Mittel | Kein langes Caching für gehashte Bundles und Bilder (`max-age=0`) | siehe T8 |
| P7 | Mittel | Google Fonts erst nach Einwilligung: Bei Zustimmung wechselt die Schrift von System-Font auf Inter, das verschiebt das Layout. Zusätzlich braucht der Cookie-Banner nur wegen der Schriften eine Einwilligung | **Inter selbst hosten** (`/fonts/inter-var.woff2`, `font-display: swap`, `size-adjust`). Damit ist für Fonts keine Einwilligung mehr nötig, der Banner betrifft nur noch Google Maps, und der Layout-Sprung fällt weg |
| P8 | Niedrig | `/api/content` und `/api/courses` (22 KB) werden nicht komprimiert ausgeliefert | `compression`-Middleware oder Apache `mod_deflate` für `application/json` |

---

## 6. Bilder (45/100)

| # | Priorität | Problem |
|---|---|---|
| I1 | Hoch | **Leeres `alt=""` bei allen Kursbildern** (Kurskarten `CourseCard.tsx:28`, Kursseite `SeminarPage.tsx:75`, Kurstermine-Banner, Empfehlungs-Logos, Testimonial-Avatare). Kursbilder sind Inhalt, keine Dekoration. Fix: `alt={course.title}` oder ein eigenes CMS-Feld „Bildbeschreibung“ |
| I2 | Hoch | Keine `width`/`height`-Attribute (Ursache für CLS, siehe P1) |
| I3 | Mittel | Kein `srcset`, übergroße Dateien (siehe P4) |
| I4 | Mittel | Kein `loading="lazy"` für Bilder unterhalb des sichtbaren Bereichs (Kurstermine lädt 8 große Bilder auf einmal, 1,75 MB) und kein `fetchpriority="high"` fürs Hero-Bild |
| I5 | Niedrig | Das Hero-Alt „Ruhiger Beratungsraum“ passt nicht zum aktuellen CMS-Hero (zeigt eine Beraterin im Gespräch, keinen leeren Raum). Das Alt sollte den Bildinhalt beschreiben, idealerweise über ein CMS-Feld am Bild |
| I6 | Niedrig | `og:image` für Kurse ist WebP. Facebook und WhatsApp kommen damit zurecht, LinkedIn und manche Messenger nicht zuverlässig. Für OG serverseitig eine JPEG-Variante (1200×630) erzeugen und `og:image:width`/`height`/`alt` ergänzen |
| I7 | Niedrig | Dateinamen der Uploads sind Hashes (`d16afe2b….webp`). Für die Bildersuche wären sprechende Namen besser (`ausbildung-transaktionsanalyse-vallendar.webp`), das hat aber geringe Priorität |

---

## 7. AI Search Readiness / GEO (65/100)

### Was gut ist
- `/llms.txt` und `/llms-full.txt` sind dynamisch und enthalten vollständige Kurstexte, Termine und Preise.
- Server-gerenderter Text ist ohne JS lesbar.
- KI-Crawler sind nicht blockiert.

### Probleme

| # | Priorität | Problem |
|---|---|---|
| G1 | Kritisch | `llms-full.txt` enthält die **falschen Kontaktdaten** (siehe S1) |
| G2 | Hoch | `llms-full.txt` enthält **keine Über-mich-Inhalte**: keine Qualifikationen, keine Adresse, keinen Ort, kein Einzugsgebiet. Genau diese Angaben brauchen KI-Systeme, um die Frage „Wer bietet TA-Ausbildung bei Koblenz an?“ zu beantworten |
| G3 | Mittel | Keine zitierfähigen Passagen. Es fehlen kurze, eigenständige Absätze mit Definitionen und Fakten, z. B. „Die Ausbildung in Transaktionsanalyse bei PBW dauert X Jahre, umfasst Y Tage pro Jahr, kostet Z € pro Jahr und bereitet auf die CTA-Prüfung der EATA vor.“ FAQ-Blöcke auf den Kursseiten decken das ab |
| G4 | Mittel | Das SSR für Über mich und Kontakt ist dünn bzw. hart codiert (siehe C5, C6). Die meisten KI-Crawler führen kein JS aus |
| G5 | Niedrig | Im llms-Feed stehen Datumsangaben wie „2027-09-03 – 2027-09-03 09:30-18:00“: redundante Spanne, Uhrzeit im Namensfeld. Besser menschenlesbar: „Fr, 03.09.2027, 09:30–18:00 Uhr“ |
| G6 | Niedrig | Die Einträge im llms-Feed für Coaching, Supervision, Organisationsentwicklung und Weiterbildung haben keine Kurzbeschreibung |

---

## 8. Local SEO (Zusatz, weil lokaler Dienstleister)

| # | Priorität | Maßnahme |
|---|---|---|
| L1 | Hoch | **Google-Unternehmensprofil** prüfen bzw. beanspruchen. Kategorien: „Coach“, „Supervisor“, „Psychologischer Berater“, „Bildungseinrichtung“. Leistungen, Fotos, Website-Link auf `/kontakt` oder `/`, Öffnungszeiten „nach Vereinbarung“. Der größte Einzelhebel für „… Koblenz“-Suchen |
| L2 | Hoch | **Einheitliche Kontaktdaten (NAP)** in allen Verzeichnissen: Gelbe Seiten, Infobel, Weiterbildungsportal RLP, Weiterbildungsportal Saarland, EASC, DGTA. Genau gleiche Schreibweise von Name, Adresse und Telefon wie im Impressum. Namensfrage siehe C7 |
| L3 | Mittel | Ortsbezug im Text: „Vallendar bei Koblenz“ steht bisher nur auf der Kontaktseite. In Titles, Descriptions, auf der Startseite und auf den Leistungsseiten ergänzen, dazu den Einzugsbereich (Koblenz, Neuwied, Bendorf, Lahnstein, Westerwald) |
| L4 | Mittel | Bewertungen sammeln: Google-Rezensionen von Kursteilnehmenden, dazu Testimonials auf der Site, die bereits vorhanden sind. Rechtlicher Hinweis: bei Beratung und Therapie die Heilmittelwerbegesetz-Grenzen beachten, keine Heilversprechen |
| L5 | Niedrig | Backlinks: DGTA- und EATA-Trainerverzeichnis, EASC-Profil, Vinzenz Pallotti University, Kolleg:innen aus dem Netzwerk (gegenseitige Verlinkung ist ja schon da) und die Weiterbildungsportale sollten alle auf `https://pbw-ta.de` zeigen, nicht auf alte `.htm`-Seiten |

---

## 9. Mobile und Barrierefreiheit (SEO-relevant)
- Kein horizontales Scrollen (390 px), das Viewport-Tag ist korrekt.
- Kleine Touch-Ziele unter 24 px Höhe: „Weiter zu Kooperation & Austausch“ (20 px), die Footer-Links Impressum, Datenschutz, Kontakt, DGTA und EATA (18 px). Ziel sind mindestens 24 px, besser 44 px.
- Der Hero-Text liegt mobil über dem Gesicht im Foto, das Gradient-Overlay reicht in dieser Breite nicht (Lesbarkeit).
- Alle Seiten haben Landmarks (`header`, `nav`, `main`, `footer`).

---

## 10. Nicht geprüft / Grenzen
- Google Search Console, GA4 und CrUX: keine Zugangsdaten. **Dringend empfohlen**: Search Console für `pbw-ta.de` einrichten (Domain-Property per DNS), Sitemap einreichen und die Berichte „Soft 404“ und „Nicht gefunden“ für die Liste der alten URLs nutzen.
- Backlink-Daten: nur qualitativ über die Websuche.
- Rechtliches (DSGVO, Impressum) wird hier nicht bewertet.
