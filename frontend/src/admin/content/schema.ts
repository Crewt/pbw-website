// Field definitions per content collection — ported from the legacy admin
// (admin-content.js SCHEMAS). Drives the generic ContentEditor and list rendering.

export type FieldType = "text" | "url" | "email" | "textarea" | "image" | "toggle" | "select" | "file";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  options?: [string, string][]; // select: [value, label]
  imageShape?: "rect" | "circle" | "portrait";
  imageAspect?: number; // crop aspect (w/h); defaults per shape if omitted
  showIf?: { key: string; value: string };
  requiredIf?: { key: string; value: string };
}

export interface CollectionSchema {
  singular: string;
  title: string;
  description: string;
  fields: FieldDef[];
  rowTitle: (it: any) => string;
  rowMeta: (it: any) => string;
}

export const SCHEMAS: Record<string, CollectionSchema> = {
  kollegen: {
    singular: "Kolleg:in",
    title: "Kolleg:innen",
    description: "Profile von Kolleg:innen, optional auf der Startseite hervorgehoben.",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "role", label: "Rolle / Fachgebiet", type: "text" },
      { key: "bio", label: "Kurzbeschreibung", type: "textarea" },
      { key: "link", label: "Link (Website oder Profil)", type: "url" },
      { key: "image", label: "Foto", type: "image", imageShape: "circle", hint: "Quadratisch empfohlen." },
      { key: "featured", label: "Auf Startseite hervorheben", type: "toggle" },
    ],
    rowTitle: (it) => it.name || "(ohne Name)",
    rowMeta: (it) => [it.role, it.link ? "Link" : "kein Link"].filter(Boolean).join(" · "),
  },
  zertifikate: {
    singular: "Zertifikat",
    title: "Zertifikate & Institute",
    description: "Zertifikate, Mitgliedschaften und Institute.",
    fields: [
      { key: "name", label: "Name des Instituts / Zertifikats", type: "text", required: true },
      { key: "badge", label: "Kennzeichnung", type: "text", hint: "z. B. Zertifiziert, Mitglied, Netzwerk" },
      { key: "description", label: "Beschreibung", type: "textarea" },
      { key: "link", label: "Website", type: "url" },
      { key: "image", label: "Logo / Bild", type: "image", imageShape: "rect", imageAspect: 1 },
    ],
    rowTitle: (it) => it.name || "(ohne Name)",
    rowMeta: (it) => [it.badge, it.description].filter(Boolean).join(" · "),
  },
  referenzen: {
    singular: "Referenz",
    title: "Referenzen",
    description: "Zitate und Stimmen von Teilnehmenden.",
    fields: [
      { key: "quote", label: "Zitat", type: "textarea", required: true },
      { key: "name", label: "Name", type: "text" },
      { key: "org", label: "Rolle / Organisation", type: "text" },
    ],
    rowTitle: (it) => it.quote || "(ohne Zitat)",
    rowMeta: (it) => [it.name, it.org].filter(Boolean).join(" · "),
  },
  ressourcen: {
    singular: "Ressource",
    title: "Weiterführende Ressourcen",
    description: "Externe Links oder herunterladbare Dateien.",
    fields: [
      { key: "title", label: "Titel", type: "text", required: true },
      { key: "description", label: "Beschreibung", type: "textarea" },
      {
        key: "type",
        label: "Typ",
        type: "select",
        options: [
          ["link", "Link (externe Website)"],
          ["download", "Download (Datei)"],
        ],
        hint: "Bestimmt, ob ein externer Link oder ein Datei-Download angezeigt wird.",
      },
      {
        key: "url",
        label: "URL",
        type: "url",
        showIf: { key: "type", value: "link" },
        requiredIf: { key: "type", value: "link" },
      },
      {
        key: "file",
        label: "Datei (z. B. PDF)",
        type: "file",
        hint: "Pflichtfeld bei Typ „Download“. PDF empfohlen.",
        showIf: { key: "type", value: "download" },
        requiredIf: { key: "type", value: "download" },
      },
    ],
    rowTitle: (it) => it.title || "(ohne Titel)",
    rowMeta: (it) => (it.type === "download" ? it.file?.name || "Download" : it.url || "Link"),
  },
};
