// Mirror of the backend domain types (../../../src/types.ts). Intentionally
// duplicated to keep the frontend package self-contained.

export interface Termin {
  date: string; // ISO yyyy-mm-dd (start date; may be "" for a name-only entry)
  endDate?: string; // ISO yyyy-mm-dd — optional end date for a range (e.g. 6.–7. Feb.)
  name: string; // prominent label, e.g. "Modul 1" or "09:30–18:00 Uhr" (was the free-text "time")
  description?: string; // optional detail, shown smaller below the name
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  cost: string; // free text, e.g. "280,00 €" or "Auf Anfrage"
  image: string; // web path, e.g. "/uploads/abc.jpg"
  isAusbildungskurs: boolean; // false = Seminar (default), true = Ausbildungskurs
  isBildungsurlaub: boolean; // recognised Bildungsurlaub → shows hint on detail page
  termine: Termin[];
  includes: string[];
  enables: string[];
  // Keys of the fixed homepage service-card slots that link to this course
  // (see lib/serviceSlots.ts). Empty = not featured on the homepage.
  homepageSlots: string[];
  // Optional second description ("Wie ich arbeite"), rendered at the very bottom
  // of the seminar page; the section is hidden when empty.
  arbeitsweise: string;
  // When true, the seminar page uses the course name in the two content headings
  // via nameInSentence (dative form incl. article, e.g. "der Paarberatung").
  useNameWording: boolean;
  nameInSentence: string;
  createdAt?: string;
  updatedAt?: string;
}

// Payload for POST/PUT /api/courses — server fields omitted, id optional (create).
export type CoursePayload = Omit<Course, "id" | "createdAt" | "updatedAt"> & { id?: string };

export interface Kollege {
  id: string;
  name: string;
  role: string;
  bio: string;
  link: string;
  image: string;
  featured: boolean;
}

export interface Zertifikat {
  id: string;
  name: string;
  description: string;
  badge: string;
  link: string;
  image: string;
}

export interface Referenz {
  id: string;
  quote: string;
  name: string;
  org: string;
  image: string;
}

export interface RessourceFile {
  name: string;
  url: string;
}

export interface Ressource {
  id: string;
  title: string;
  description: string;
  type: "link" | "download";
  url: string;
  file: RessourceFile | null;
}

export interface Kontakt {
  email: string;
  phone: string;
  // Optional URL of the externally hosted CleverReach signup form. Empty = the
  // newsletter button is not rendered on the public site.
  newsletterFormularUrl: string;
  // Optional social profile URLs. Empty = the icon is not shown in the footer.
  instagramUrl: string;
  linkedinUrl: string;
}

export interface About {
  image: string;
}

export type CollectionName = "kollegen" | "zertifikate" | "referenzen" | "ressourcen";
export type SingletonName = "kontakt" | "about";

// Aggregated response of GET /api/content (courses are served separately).
export interface Content {
  kollegen: Kollege[];
  zertifikate: Zertifikat[];
  referenzen: Referenz[];
  ressourcen: Ressource[];
  kontakt: Kontakt;
  about: About;
}

// Payload for POST /api/contact (mirrors backend ContactPayload).
export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}
