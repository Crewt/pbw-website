// Canonical homepage service-card slots (single source of truth).
//
// The home page renders one card per slot (see site/home/data.ts). A course can
// be assigned to one or more of these slots in the admin course editor; the
// matching card then links to that course's /seminar/<slug> page instead of the
// generic /kurstermine overview. `key` is the stable identifier persisted in the
// DB (course_homepage_slots.slot_key) — never change an existing key.

export interface ServiceSlot {
  key: string;
  label: string;
}

export const SERVICE_SLOTS: ServiceSlot[] = [
  { key: "einzelberatung", label: "Einzelberatung" },
  { key: "paarberatung", label: "Paarberatung" },
  { key: "coaching", label: "Coaching" },
  { key: "supervision", label: "Supervision" },
  { key: "organisationsentwicklung", label: "Organisationsentwicklung" },
  { key: "weiterbildung", label: "Weiterbildung" },
];
