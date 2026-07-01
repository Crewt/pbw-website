import { IconMail, IconPhone, IconMapPin } from "../components/Icons";

// Static for now; the values map to the existing `kontakt` CMS singleton and
// can be wired to GET /api/content later.
const items = [
  { icon: IconMail, label: "E-Mail", value: "beatrice.czekalla@pbw-ta.de" },
  { icon: IconPhone, label: "Telefon", value: "+49 (0) 261 39494070" },
  { icon: IconMapPin, label: "Standorte", value: "PBW - Beatrice Czekalla", note: "Vallendar (bei Koblenz)" },
];

export function ContactInfo() {
  return (
    <div className="rounded-xl border border-line bg-white p-8 shadow-soft">
      <h2 className="mb-6 text-[22px] font-bold text-ink">Kontaktdaten</h2>
      <ul className="space-y-5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.label} className="flex items-start gap-4">
              <span className="icon-chip-blue">
                <Icon />
              </span>
              <div>
                <small className="mb-0.5 block text-[11px] font-semibold uppercase tracking-[0.8px] text-navy">
                  {it.label}
                </small>
                <strong className="block text-[16px] font-semibold text-ink">{it.value}</strong>
                {it.note && <div className="text-sm leading-[1.55] text-text">{it.note}</div>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
