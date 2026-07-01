// Ported from the legacy admin (admin-shell.js): lowercase, strip diacritics,
// collapse non-alphanumerics to hyphens, trim leading/trailing hyphens.
export function slugify(s: string): string {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
