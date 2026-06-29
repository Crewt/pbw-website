// PBW - simple localStorage-backed course store.
// Stores an array of course objects under "pbw_courses".
// Each course:
//   { id, slug, title, subtitle, description, cost, image,
//     termine: [{date, time}], includes: [string], enables: [string],
//     createdAt, updatedAt }

(function () {
  const KEY = "pbw_courses";
  const AUTH = "pbw_admin_session";

  function uid() {
    return "c" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  }

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function write(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  const DEFAULTS = [
    {
      id: "c-angst",
      slug: "von-der-angst-zum-mut",
      title: "Von der Angst zum Mut",
      subtitle: "Die grundlegenden Formen der Angst und der Weg zur persönlichen Autonomie.",
      description:
        "Angst gehört zu unserem Leben. Sie kann in Situationen ein guter Berater sein und ein Zeichen dafür sein, sich auf einem guten Weg zu befinden. Wird Angst übermäßig erlebt, kann sie überwältigen und das Handeln einschränken.\n\nFritz Riemann beschreibt vier Grundformen der Angst. Diese können unterschiedlich prägenden Einfluss auf die Persönlichkeit haben. Sie fordern auf, einen notwendigen Reifeschritt einzuleiten: Dadurch kann die Angst auf ein funktionales Niveau transformiert werden.\n\nDie angemessene Angst kann unterstützen, dazu die notwendigen Hürden zu nehmen, um zu mehr Lebendigkeit und Autonomie im Leben zu finden. Im Seminar erhalten Sie einen Überblick über Riemanns \"Grundformen der Angst\" mit ihren schöpferischen Aspekten.",
      cost: "280,00 €",
      image: "assets/seminar-mountain.png",
      termine: [
        { date: "2026-06-19", time: "09:30-18:00" },
        { date: "2026-06-20", time: "09:30-18:00" }
      ],
      includes: [
        "Einen Überblick über den Ansatz von Fritz Riemann",
        "Ein Gespür für die Abgrenzung zwischen den verschiedenen Angsttypen",
        "Werkzeuge der Transaktionsanalyse zur Reflexion eigener Muster",
        "Raum für Austausch in einer kleinen, geschützten Gruppe"
      ],
      enables: [
        "…den realen Ängsten angemessen zu begegnen.",
        "…einen Blick auf Ihre möglichen Grundformen der Angst zu haben.",
        "…eine Haltung zu entwickeln, indem Sie Ängste akzeptieren und nach und nach in Mut verwandeln."
      ]
    },
    {
      id: "c-konflikt",
      slug: "konfliktpotential-kreativ-nutzen",
      title: "Konfliktpotential kreativ nutzen",
      subtitle: "Konflikte als Motor für Entwicklung - im Team und in der eigenen Person.",
      description:
        "Konflikte sind keine Störung, sondern ein natürlicher Teil zwischenmenschlicher Beziehungen. Gut genutzt eröffnen sie Räume für Wachstum, Klärung und neue Perspektiven.\n\nIn diesem Wochenendseminar lernen Sie, eigene Konfliktmuster zu erkennen, die innere Dynamik zu verstehen und Werkzeuge der Transaktionsanalyse einzusetzen, um Konflikte konstruktiv zu gestalten.",
      cost: "280,00 €",
      image: "",
      termine: [
        { date: "2026-09-03", time: "09:30-18:00" },
        { date: "2026-09-04", time: "09:30-18:00" }
      ],
      includes: [
        "Modelle zum Verständnis von Konfliktdynamik",
        "Übungen zur Selbstwahrnehmung in Konfliktsituationen",
        "Methoden zur kreativen Lösungsfindung"
      ],
      enables: [
        "…Konflikte früher zu erkennen und ernst zu nehmen.",
        "…eigene Reaktionsmuster zu verändern.",
        "…aus Reibung neue Energie und Ideen zu schöpfen."
      ]
    },
    {
      id: "c-ausbildung",
      slug: "ausbildungskurs-ta",
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
        { date: "2026-12-04", time: "Block 6" }
      ],
      includes: [
        "Vermittlung der zentralen TA-Konzepte",
        "Selbsterfahrung in der Lerngruppe",
        "Supervidierte Anwendung in der eigenen Praxis"
      ],
      enables: [
        "…ein umfassendes TA-Fundament aufzubauen.",
        "…Klient:innen mit einem klaren Modell zu begleiten.",
        "…sich Schritt für Schritt für die DGTA-Prüfung zu qualifizieren."
      ]
    },
    {
      id: "c-einfuehrung",
      slug: "einfuehrungskurs-ta",
      title: "Einführungskurs in TA",
      subtitle: "Erste Begegnung mit Transaktionsanalyse - kompakt an einem Wochenende.",
      description:
        "Ein offener Einführungskurs für alle, die einen klaren ersten Eindruck der Transaktionsanalyse gewinnen möchten - beruflich oder persönlich.",
      cost: "240,00 €",
      image: "",
      termine: [
        { date: "2026-10-16", time: "09:30-18:00" },
        { date: "2026-10-17", time: "09:30-17:00" }
      ],
      includes: [
        "Überblick über die zentralen TA-Konzepte",
        "Erste praktische Übungen",
        "Raum für Ihre Fragen"
      ],
      enables: [
        "…einzuschätzen, ob TA für Sie passt.",
        "…einfache Modelle im Alltag anzuwenden."
      ]
    },
    {
      id: "c-selbsterfahrung",
      slug: "selbsterfahrungsseminar",
      title: "Selbsterfahrungsseminar",
      subtitle: "Bei sich selbst ankommen - Reflexion und Begegnung in einer kleinen Gruppe.",
      description:
        "Ein geschützter Raum, in dem Sie zentralen Lebensthemen begegnen und mit anderen Teilnehmenden reflektieren können.",
      cost: "320,00 €",
      image: "",
      termine: [
        { date: "2026-11-20", time: "09:30-18:00" },
        { date: "2026-11-21", time: "09:30-17:00" }
      ],
      includes: [
        "Strukturierte Selbsterfahrungseinheiten",
        "Methoden aus TA und Körperarbeit",
        "Begleitung in einer kleinen Gruppe"
      ],
      enables: [
        "…sich selbst besser zu verstehen.",
        "…verborgene Ressourcen zu aktivieren.",
        "…neue Schritte für Ihren Lebensweg zu entdecken."
      ]
    },
    {
      id: "c-gruppensuper",
      slug: "gruppensupervision",
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
        { date: "2026-11-12", time: "09:30-17:00" }
      ],
      includes: [
        "Strukturierte Fallreflexion",
        "Methodische Impulse zur Praxis",
        "Kollegialer Austausch"
      ],
      enables: [
        "…Sicherheit in der Arbeit zu gewinnen.",
        "…blinde Flecken aufzudecken.",
        "…Ihre professionelle Identität zu schärfen."
      ]
    }
  ];

  function ensureSeed() {
    const cur = read();
    if (cur == null || (Array.isArray(cur) && cur.length === 0)) write(DEFAULTS);
  }

  const Store = {
    all() {
      ensureSeed();
      return read() || [];
    },
    get(id) {
      return this.all().find(c => c.id === id || c.slug === id);
    },
    save(course) {
      const list = this.all();
      const now = Date.now();
      if (!course.id) {
        course.id = uid();
        course.createdAt = now;
      }
      course.updatedAt = now;
      const i = list.findIndex(c => c.id === course.id);
      if (i >= 0) list[i] = course; else list.push(course);
      write(list);
      return course;
    },
    remove(id) {
      write(this.all().filter(c => c.id !== id));
    },
    resetSeed() {
      localStorage.removeItem(KEY);
      ensureSeed();
    }
  };

  // ====================================================================
  // SITE CONTENT STORE — Kolleg:innen, Zertifikate, Referenzen,
  // Kontakt, Über-mich-Bild. Backed by localStorage "pbw_content".
  // (Demonstration CMS — the public pages are not wired to this yet.)
  // ====================================================================
  const CKEY = "pbw_content";

  const CONTENT_DEFAULTS = {
    kollegen: [
      {
        id: "k-weber",
        name: "Dr. Maria Weber",
        role: "Systemische Supervision",
        bio: "Enger Austausch im Bereich der Teamsupervision und Organisationsberatung.",
        link: "",
        image: "assets/colleague-1.jpg",
        featured: false
      },
      {
        id: "k-fischer",
        name: "Marcus Fischer",
        role: "Burnout-Prävention",
        bio: "Kooperationspartner für intensive Präventionsworkshops und regenerative Prozessbegleitung.",
        link: "https://example.com",
        image: "assets/colleague-2.jpg",
        featured: true
      },
      {
        id: "k-sommers",
        name: "Julia Sommers",
        role: "Emotionsfokussierte Therapie",
        bio: "Geschätzte Kollegin für tiefenpsychologisch fundierte Fragestellungen und Selbsterfahrung.",
        link: "",
        image: "assets/colleague-3.jpg",
        featured: false
      }
    ],
    zertifikate: [
      {
        id: "z-dgta",
        name: "DGTA - Deutsche Gesellschaft für Transaktionsanalyse",
        description: "Mein primärer Fachverband für den Austausch über moderne Konzepte der Transaktionsanalyse und Qualitätssicherung in der therapeutischen Arbeit.",
        badge: "Zertifiziert",
        link: "https://www.dgta.de/",
        image: ""
      },
      {
        id: "z-eata",
        name: "EATA - European Association for Transactional Analysis",
        description: "Die europäische Ebene unseres Netzwerks. Hier fließen internationale Standards und wissenschaftliche Erkenntnisse aus ganz Europa zusammen.",
        badge: "Mitglied",
        link: "https://www.eatanews.org/",
        image: ""
      },
      {
        id: "z-easc",
        name: "EASC - European Association for Supervision and Coaching",
        description: "Der europäische Berufsverband für Supervision und Coaching, der Qualitätsstandards und kontinuierliche Weiterentwicklung sichert.",
        badge: "Mitglied",
        link: "https://www.easc-online.eu/",
        image: ""
      },
      {
        id: "z-tawege",
        name: "TA-Wege",
        description: "Meine Möglichkeit zum fachlichen kollegialen Austausch und der Gestaltung von (Groß-)Veranstaltungen zur Verfeinerung der Kompetenzen mit der Transaktionsanalyse.",
        badge: "Netzwerk",
        link: "https://www.ta-wege.de/",
        image: ""
      }
    ],
    referenzen: [
      {
        id: "r-1",
        quote: "Die Begleitung durch Frau Czekalla hat meinen Blick auf Konflikte grundlegend verändert. Ich gehe heute klarer und gelassener in schwierige Gespräche.",
        name: "Sabine M.",
        org: "Teamleiterin, öffentlicher Dienst"
      },
      {
        id: "r-2",
        quote: "Ein geschützter Raum, in dem echtes Wachstum möglich ist. Die Pflanzschule ist genau das richtige Bild dafür.",
        name: "Thomas K.",
        org: "Coach in Ausbildung"
      },
      {
        id: "r-3",
        quote: "Fachlich fundiert, menschlich warm. Die Supervision gibt mir Sicherheit in meiner täglichen Arbeit.",
        name: "Dr. Anne R.",
        org: "Psychotherapeutin"
      }
    ],
    ressourcen: [
      {
        id: "res-dgta-info",
        title: "DGTA - Informationen zur Transaktionsanalyse",
        description: "Einführende Texte und Materialien des Fachverbands rund um die TA.",
        type: "link",
        url: "https://www.dgta.de/",
        file: null
      },
      {
        id: "res-leitfaden",
        title: "Leitfaden: Die vier Grundformen der Angst",
        description: "Kompakte Zusammenfassung als PDF zum Nachlesen und Weitergeben.",
        type: "download",
        url: "",
        file: { name: "leitfaden-grundformen-der-angst.pdf", data: "" }
      },
      {
        id: "res-literatur",
        title: "Literaturempfehlungen zur TA",
        description: "Eine Auswahl an Grundlagenwerken und vertiefenden Texten.",
        type: "link",
        url: "https://www.eatanews.org/",
        file: null
      }
    ],
    kontakt: {
      email: "info@pbw-ta.de",
      phone: "+49 (0) 261 671234"
    },
    about: {
      image: "assets/portrait.jpg"
    }
  };

  function readContent() {
    try {
      const raw = localStorage.getItem(CKEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }
  function writeContent(obj) { localStorage.setItem(CKEY, JSON.stringify(obj)); }
  function ensureContentSeed() {
    const cur = readContent();
    if (cur == null) { writeContent(structuredClone(CONTENT_DEFAULTS)); return; }
    // Backfill any missing top-level keys (forward-compatible).
    let changed = false;
    for (const k of Object.keys(CONTENT_DEFAULTS)) {
      if (!(k in cur)) { cur[k] = structuredClone(CONTENT_DEFAULTS[k]); changed = true; }
    }
    if (changed) writeContent(cur);
  }

  const COLLECTIONS = ["kollegen", "zertifikate", "referenzen", "ressourcen"];
  const SINGLETONS = ["kontakt", "about"];

  const Content = {
    data() { ensureContentSeed(); return readContent(); },
    list(coll) { return (this.data()[coll] || []).slice(); },
    get(coll, id) { return (this.data()[coll] || []).find(x => x.id === id); },
    saveItem(coll, item) {
      const d = this.data();
      if (!Array.isArray(d[coll])) d[coll] = [];
      if (!item.id) item.id = uid();
      const i = d[coll].findIndex(x => x.id === item.id);
      if (i >= 0) d[coll][i] = item; else d[coll].push(item);
      writeContent(d);
      return item;
    },
    removeItem(coll, id) {
      const d = this.data();
      d[coll] = (d[coll] || []).filter(x => x.id !== id);
      writeContent(d);
    },
    moveItem(coll, id, dir) {
      const d = this.data();
      const arr = d[coll] || [];
      const i = arr.findIndex(x => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      writeContent(d);
    },
    getSingle(name) { return Object.assign({}, this.data()[name]); },
    saveSingle(name, obj) {
      const d = this.data();
      d[name] = Object.assign({}, d[name], obj);
      writeContent(d);
      return d[name];
    },
    resetSeed() { writeContent(structuredClone(CONTENT_DEFAULTS)); }
  };

  // Tiny "auth" — prototype only, NOT real security.
  const Auth = {
    USER: "admin",
    PASS: "pbw2026",
    login(u, p) {
      if (u === this.USER && p === this.PASS) {
        sessionStorage.setItem(AUTH, "1");
        return true;
      }
      return false;
    },
    logout() { sessionStorage.removeItem(AUTH); },
    isAuthed() { return sessionStorage.getItem(AUTH) === "1"; }
  };

  // Helpers for date formatting (DE)
  const DE_MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  function fmtDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return `${String(d).padStart(2, "0")}. ${DE_MONTHS[m - 1]} ${y}`;
  }
  function fmtDateShort(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
  }
  function fmtTermineList(termine) {
    if (!termine || !termine.length) return "";
    return termine.map(t => fmtDate(t.date) + (t.time ? " · " + t.time : "")).join(" · ");
  }

  window.PBW = { Store, Content, Auth, fmtDate, fmtDateShort, fmtTermineList };
})();
