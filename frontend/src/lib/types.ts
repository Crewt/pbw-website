// Mirror of the backend domain types (../../../src/types.ts). Intentionally
// duplicated to keep the frontend package self-contained.

export interface Termin {
  date: string; // ISO yyyy-mm-dd
  time: string; // free text, e.g. "09:30-18:00"
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
