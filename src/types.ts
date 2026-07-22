// Shared domain types — the API speaks these shapes, mirroring the original
// localStorage prototype (js/store.js) so the admin frontend needs minimal change.

export interface Termin {
  date: string; // ISO yyyy-mm-dd
  time: string; // free text, e.g. "09:30-18:00" or "Block 1"
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  cost: string; // free text, e.g. "280,00 €" or "Auf Anfrage"
  image: string; // web path, e.g. "/uploads/abc.jpg" or "/assets/x.png"
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

export type CollectionName = "kollegen" | "zertifikate" | "referenzen" | "ressourcen";
export type SingletonName = "kontakt" | "about";

export interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
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
