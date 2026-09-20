import { pool, query } from "../db";
import type { SingletonName } from "../types";

// Singleton page data (Kontakt, Über-mich-Bild) stored as key/value rows in
// `settings`. Field<->key mapping is whitelisted here.

const SINGLETONS: Record<SingletonName, Record<string, string>> = {
  kontakt: {
    email: "kontakt.email",
    phone: "kontakt.phone",
    newsletterFormularUrl: "kontakt.newsletter_formular_url",
    instagramUrl: "kontakt.instagram_url",
    linkedinUrl: "kontakt.linkedin_url",
  },
  about: { image: "about.image" },
  bilder: {
    hero: "bilder.hero",
    headerBg: "bilder.header_bg",
    kurstermineUnten: "bilder.kurstermine_unten",
    contactBg: "bilder.contact_bg",
  },
};

export function isSingleton(name: string): name is SingletonName {
  return Object.prototype.hasOwnProperty.call(SINGLETONS, name);
}

export async function getSingle(name: SingletonName): Promise<Record<string, string>> {
  const fieldMap = SINGLETONS[name];
  const keys = Object.values(fieldMap);
  const ph = keys.map(() => "?").join(",");
  const rows = await query<any>(
    `SELECT setting_key, setting_value FROM settings WHERE setting_key IN (${ph})`,
    keys
  );
  const byKey = new Map<string, string>(rows.map((r) => [r.setting_key, r.setting_value ?? ""]));
  const out: Record<string, string> = {};
  for (const [field, key] of Object.entries(fieldMap)) out[field] = byKey.get(key) ?? "";
  return out;
}

export async function saveSingle(
  name: SingletonName,
  obj: Record<string, any>
): Promise<Record<string, string>> {
  const fieldMap = SINGLETONS[name];
  for (const [field, key] of Object.entries(fieldMap)) {
    if (!(field in obj)) continue;
    const value = obj[field] == null ? "" : String(obj[field]);
    await pool.query(
      "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      [key, value]
    );
  }
  return getSingle(name);
}
