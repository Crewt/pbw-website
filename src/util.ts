// Small shared helpers (id generation + slugify), mirroring the prototype's
// js/store.js + admin-shell.js so generated values look the same.

export function uid(prefix = "x"): string {
  return prefix + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

export function slugify(s: string): string {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // strip combining diacritics (ä -> a, é -> e)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
