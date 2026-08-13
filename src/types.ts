// Shared domain types — the API speaks these shapes, mirroring the original
// localStorage prototype (js/store.js) so the admin frontend needs minimal change.

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
  image: string; // web path, e.g. "/uploads/abc.jpg" or "/assets/x.png"
  // Offering kind: false = Seminar (default), true = Ausbildungskurs. Drives the
  // "Seminar" vs "Ausbildungskurs" wording on the public detail page + admin.
  isAusbildungskurs: boolean;
  // Whether this offering is a recognised Bildungsurlaub (shows a hint on the page).
  isBildungsurlaub: boolean;
  termine: Termin[];
  includes: string[];
  enables: string[];
  // Keys of the fixed homepage service-card slots that link to this course
  // (see frontend serviceSlots.ts). Empty = not featured on the homepage.
  homepageSlots: string[];
  createdAt?: string;
  updatedAt?: string;
}

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
}

export interface About {
  image: string;
}

export type CollectionName = "kollegen" | "zertifikate" | "referenzen" | "ressourcen";
export type SingletonName = "kontakt" | "about";

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
  token_version: number;
}

// Public contact-form submission (POST /api/contact). phone/subject optional.
// Delivered by email only — no longer persisted to the DB.
export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}
