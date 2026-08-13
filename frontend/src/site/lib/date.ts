const DE_MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

// yyyy-mm-dd -> dd.mm.yyyy
export function fmtDateShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
}

// yyyy-mm-dd -> "dd. Monat yyyy" (e.g. 19. Juni 2026)
export function fmtDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, "0")}. ${DE_MONTHS[m - 1]} ${y}`;
}

// Formats a (start, optional end) pair as a readable German range:
//   no/equal end        -> "19. Juni 2026"
//   same month & year   -> "6.–7. Februar 2026"
//   same year, new month-> "30. Januar – 2. Februar 2026"
//   crossing years      -> "30. Dezember 2026 – 2. Januar 2027"
export function fmtDateRange(startIso: string, endIso?: string): string {
  const start = fmtDateLong(startIso);
  if (!endIso || endIso === startIso) return start;
  const [ys, ms, ds] = startIso.split("-").map(Number);
  const [ye, me, de] = endIso.split("-").map(Number);
  if (!ys || !ms || !ds || !ye || !me || !de) return start;
  if (ys === ye && ms === me) return `${ds}.–${de}. ${DE_MONTHS[me - 1]} ${ye}`;
  if (ys === ye) return `${ds}. ${DE_MONTHS[ms - 1]} – ${de}. ${DE_MONTHS[me - 1]} ${ye}`;
  return `${start} – ${fmtDateLong(endIso)}`;
}
