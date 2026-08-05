// Default example content — transcribed from the original prototype (js/store.js).
// Single source of truth, used by both `npm run seed` and the admin "reset to
// example data" endpoint, so the two never drift. Image paths point at the
// bundled /assets files copied into public/.

import type { Course, Kollege, Zertifikat, Referenz, Ressource, Kontakt, About } from "./types";

export const COURSE_DEFAULTS: Course[] = [
  {
    id: "c-angst",
    slug: "von-der-angst-zum-mut",
    isAusbildungskurs: false,
    isBildungsurlaub: false,
    title: "Von der Angst zum Mut",
    subtitle: "Die grundlegenden Formen der Angst und der Weg zur persönlichen Autonomie.",
    description:
      "Angst gehört zu unserem Leben. Sie kann in Situationen ein guter Berater sein und ein Zeichen dafür sein, sich auf einem guten Weg zu befinden. Wird Angst übermäßig erlebt, kann sie überwältigen und das Handeln einschränken.\n\nFritz Riemann beschreibt vier Grundformen der Angst. Diese können unterschiedlich prägenden Einfluss auf die Persönlichkeit haben. Sie fordern auf, einen notwendigen Reifeschritt einzuleiten: Dadurch kann die Angst auf ein funktionales Niveau transformiert werden.\n\nDie angemessene Angst kann unterstützen, dazu die notwendigen Hürden zu nehmen, um zu mehr Lebendigkeit und Autonomie im Leben zu finden. Im Seminar erhalten Sie einen Überblick über Riemanns \"Grundformen der Angst\" mit ihren schöpferischen Aspekten.",
    cost: "280,00 €",
    image: "/assets/seminar-mountain.png",
    termine: [
      { date: "2026-06-19", time: "09:30-18:00" },
      { date: "2026-06-20", time: "09:30-18:00" },
    ],
    includes: [
      "Einen Überblick über den Ansatz von Fritz Riemann",
      "Ein Gespür für die Abgrenzung zwischen den verschiedenen Angsttypen",
      "Werkzeuge der Transaktionsanalyse zur Reflexion eigener Muster",
      "Raum für Austausch in einer kleinen, geschützten Gruppe",
    ],
    enables: [
      "…den realen Ängsten angemessen zu begegnen.",
      "…einen Blick auf Ihre möglichen Grundformen der Angst zu haben.",
      "…eine Haltung zu entwickeln, indem Sie Ängste akzeptieren und nach und nach in Mut verwandeln.",
    ],
  },
  {
    id: "c-konflikt",
    slug: "konfliktpotential-kreativ-nutzen",
    isAusbildungskurs: false,
    isBildungsurlaub: false,
    title: "Konfliktpotential kreativ nutzen",
    subtitle: "Konflikte als Motor für Entwicklung - im Team und in der eigenen Person.",
    description:
      "Konflikte sind keine Störung, sondern ein natürlicher Teil zwischenmenschlicher Beziehungen. Gut genutzt eröffnen sie Räume für Wachstum, Klärung und neue Perspektiven.\n\nIn diesem Wochenendseminar lernen Sie, eigene Konfliktmuster zu erkennen, die innere Dynamik zu verstehen und Werkzeuge der Transaktionsanalyse einzusetzen, um Konflikte konstruktiv zu gestalten.",
    cost: "280,00 €",
    image: "",
    termine: [
      { date: "2026-09-03", time: "09:30-18:00" },
      { date: "2026-09-04", time: "09:30-18:00" },
    ],
    includes: [
      "Modelle zum Verständnis von Konfliktdynamik",
      "Übungen zur Selbstwahrnehmung in Konfliktsituationen",
      "Methoden zur kreativen Lösungsfindung",
    ],
    enables: [
      "…Konflikte früher zu erkennen und ernst zu nehmen.",
      "…eigene Reaktionsmuster zu verändern.",
      "…aus Reibung neue Energie und Ideen zu schöpfen.",
    ],
  },
  {
    id: "c-ausbildung",
    slug: "ausbildungskurs-ta",
    isAusbildungskurs: true,
    isBildungsurlaub: false,
    title: "Ausbildungskurs in TA",
    subtitle: "Mehrjähriger Ausbildungsgang in Transaktionsanalyse.",
    description:
      "Der Ausbildungskurs richtet sich an Menschen aus Beratung, Therapie, Pädagogik und Wirtschaft, die ihre Arbeit auf eine fundierte transaktionsanalytische Grundlage stellen möchten.\n\nDie Ausbildung gliedert sich in Theorie, Selbsterfahrung und Praxisreflexion über mehrere Jahre.",
    cost: "Auf Anfrage",
    image: "",
    termine: [
      { date: "2026-02-06", time: "Block 1" },
      { date: "2026-03-20", time: "Block 2" },
      { date: "2026-06-12", time: "Block 3" },
      { date: "2026-09-25", time: "Block 4" },
      { date: "2026-10-30", time: "Block 5" },
      { date: "2026-12-04", time: "Block 6" },
    ],
    includes: [
      "Vermittlung der zentralen TA-Konzepte",
      "Selbsterfahrung in der Lerngruppe",
      "Supervidierte Anwendung in der eigenen Praxis",
    ],
    enables: [
      "…ein umfassendes TA-Fundament aufzubauen.",
      "…Klient:innen mit einem klaren Modell zu begleiten.",
      "…sich Schritt für Schritt für die DGTA-Prüfung zu qualifizieren.",
    ],
  },
  {
    id: "c-einfuehrung",
    slug: "einfuehrungskurs-ta",
    isAusbildungskurs: true,
    isBildungsurlaub: false,
    title: "Einführungskurs in TA",
    subtitle: "Erste Begegnung mit Transaktionsanalyse - kompakt an einem Wochenende.",
    description:
      "Ein offener Einführungskurs für alle, die einen klaren ersten Eindruck der Transaktionsanalyse gewinnen möchten - beruflich oder persönlich.",
    cost: "240,00 €",
    image: "",
    termine: [
      { date: "2026-10-16", time: "09:30-18:00" },
      { date: "2026-10-17", time: "09:30-17:00" },
    ],
    includes: [
      "Überblick über die zentralen TA-Konzepte",
      "Erste praktische Übungen",
      "Raum für Ihre Fragen",
    ],
    enables: ["…einzuschätzen, ob TA für Sie passt.", "…einfache Modelle im Alltag anzuwenden."],
  },
  {
    id: "c-selbsterfahrung",
    slug: "selbsterfahrungsseminar",
    isAusbildungskurs: false,
    isBildungsurlaub: false,
    title: "Selbsterfahrungsseminar",
    subtitle: "Bei sich selbst ankommen - Reflexion und Begegnung in einer kleinen Gruppe.",
    description:
      "Ein geschützter Raum, in dem Sie zentralen Lebensthemen begegnen und mit anderen Teilnehmenden reflektieren können.",
    cost: "320,00 €",
    image: "",
    termine: [
      { date: "2026-11-20", time: "09:30-18:00" },
      { date: "2026-11-21", time: "09:30-17:00" },
    ],
    includes: [
      "Strukturierte Selbsterfahrungseinheiten",
      "Methoden aus TA und Körperarbeit",
      "Begleitung in einer kleinen Gruppe",
    ],
    enables: [
      "…sich selbst besser zu verstehen.",
      "…verborgene Ressourcen zu aktivieren.",
      "…neue Schritte für Ihren Lebensweg zu entdecken.",
    ],
  },
  {
    id: "c-gruppensuper",
    slug: "gruppensupervision",
    isAusbildungskurs: false,
    isBildungsurlaub: false,
    title: "Gruppensupervision",
    subtitle: "Regelmäßiger Reflexionsraum für Beratungs- und Therapieprofessionals.",
    description:
      "Die Gruppensupervision unterstützt Sie dabei, Ihre fachliche Arbeit zu reflektieren, Fälle zu besprechen und die eigene Rolle zu klären.",
    cost: "Auf Anfrage",
    image: "",
    termine: [
      { date: "2026-02-26", time: "09:30-17:00" },
      { date: "2026-04-30", time: "09:30-17:00" },
      { date: "2026-06-18", time: "09:30-17:00" },
      { date: "2026-08-27", time: "09:30-17:00" },
      { date: "2026-10-08", time: "09:30-17:00" },
      { date: "2026-11-12", time: "09:30-17:00" },
    ],
    includes: [
      "Strukturierte Fallreflexion",
      "Methodische Impulse zur Praxis",
      "Kollegialer Austausch",
    ],
    enables: [
      "…Sicherheit in der Arbeit zu gewinnen.",
      "…blinde Flecken aufzudecken.",
      "…Ihre professionelle Identität zu schärfen.",
    ],
  },
];

export const KOLLEGEN_DEFAULTS: Kollege[] = [
  {
    id: "k-weber",
    name: "Dr. Maria Weber",
    role: "Systemische Supervision",
    bio: "Enger Austausch im Bereich der Teamsupervision und Organisationsberatung.",
    link: "",
    image: "/assets/colleague-1.jpg",
    featured: false,
  },
  {
    id: "k-fischer",
    name: "Marcus Fischer",
    role: "Burnout-Prävention",
    bio: "Kooperationspartner für intensive Präventionsworkshops und regenerative Prozessbegleitung.",
    link: "https://example.com",
    image: "/assets/colleague-2.jpg",
    featured: true,
  },
  {
    id: "k-sommers",
    name: "Julia Sommers",
    role: "Emotionsfokussierte Therapie",
    bio: "Geschätzte Kollegin für tiefenpsychologisch fundierte Fragestellungen und Selbsterfahrung.",
    link: "",
    image: "/assets/colleague-3.jpg",
    featured: false,
  },
];

export const ZERTIFIKATE_DEFAULTS: Zertifikat[] = [
  {
    id: "z-dgta",
    name: "DGTA - Deutsche Gesellschaft für Transaktionsanalyse",
    description:
      "Mein primärer Fachverband für den Austausch über moderne Konzepte der Transaktionsanalyse und Qualitätssicherung in der therapeutischen Arbeit.",
    badge: "Zertifiziert",
    link: "https://www.dgta.de/",
    image: "",
  },
  {
    id: "z-eata",
    name: "EATA - European Association for Transactional Analysis",
    description:
      "Die europäische Ebene unseres Netzwerks. Hier fließen internationale Standards und wissenschaftliche Erkenntnisse aus ganz Europa zusammen.",
    badge: "Mitglied",
    link: "https://www.eatanews.org/",
    image: "",
  },
  {
    id: "z-easc",
    name: "EASC - European Association for Supervision and Coaching",
    description:
      "Der europäische Berufsverband für Supervision und Coaching, der Qualitätsstandards und kontinuierliche Weiterentwicklung sichert.",
    badge: "Mitglied",
    link: "https://www.easc-online.eu/",
    image: "",
  },
  {
    id: "z-tawege",
    name: "TA-Wege",
    description:
      "Meine Möglichkeit zum fachlichen kollegialen Austausch und der Gestaltung von (Groß-)Veranstaltungen zur Verfeinerung der Kompetenzen mit der Transaktionsanalyse.",
    badge: "Netzwerk",
    link: "https://www.ta-wege.de/",
    image: "",
  },
];

export const REFERENZEN_DEFAULTS: Referenz[] = [
  {
    id: "r-1",
    quote:
      "Die Begleitung durch Frau Czekalla hat meinen Blick auf Konflikte grundlegend verändert. Ich gehe heute klarer und gelassener in schwierige Gespräche.",
    name: "Sabine M.",
    org: "Teamleiterin, öffentlicher Dienst",
  },
  {
    id: "r-2",
    quote:
      "Ein geschützter Raum, in dem echtes Wachstum möglich ist. Die Pflanzschule ist genau das richtige Bild dafür.",
    name: "Thomas K.",
    org: "Coach in Ausbildung",
  },
  {
    id: "r-3",
    quote:
      "Fachlich fundiert, menschlich warm. Die Supervision gibt mir Sicherheit in meiner täglichen Arbeit.",
    name: "Dr. Anne R.",
    org: "Psychotherapeutin",
  },
];

export const RESSOURCEN_DEFAULTS: Ressource[] = [
  {
    id: "res-dgta-info",
    title: "DGTA - Informationen zur Transaktionsanalyse",
    description: "Einführende Texte und Materialien des Fachverbands rund um die TA.",
    type: "link",
    url: "https://www.dgta.de/",
    file: null,
  },
  {
    id: "res-leitfaden",
    title: "Leitfaden: Die vier Grundformen der Angst",
    description: "Kompakte Zusammenfassung als PDF zum Nachlesen und Weitergeben.",
    type: "download",
    url: "",
    file: { name: "leitfaden-grundformen-der-angst.pdf", url: "" },
  },
  {
    id: "res-literatur",
    title: "Literaturempfehlungen zur TA",
    description: "Eine Auswahl an Grundlagenwerken und vertiefenden Texten.",
    type: "link",
    url: "https://www.eatanews.org/",
    file: null,
  },
];

export const KONTAKT_DEFAULT: Kontakt = {
  email: "info@pbw-ta.de",
  phone: "+49 (0) 261 671234",
};

export const ABOUT_DEFAULT: About = {
  image: "/assets/portrait.webp",
};
