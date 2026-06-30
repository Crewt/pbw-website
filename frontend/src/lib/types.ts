// Mirror of the backend domain types (../../../src/types.ts). Intentionally
// duplicated to keep the frontend package self-contained; a shared types package
// is an option later if drift becomes a concern.

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
  termine: Termin[];
  includes: string[];
  enables: string[];
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
}

export interface About {
  image: string;
}

// Aggregated response of GET /api/content (note: courses are NOT included here —
// they are served separately via GET /api/courses).
export interface Content {
  kollegen: Kollege[];
  zertifikate: Zertifikat[];
  referenzen: Referenz[];
  ressourcen: Ressource[];
  kontakt: Kontakt;
  about: About;
}
