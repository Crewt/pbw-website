import { useQuery } from "@tanstack/react-query";
import { IconMail, IconPhone, IconMapPin } from "../components/Icons";
import { getContent } from "../../lib/api";
import { ADDRESS_LINE, telHref } from "../lib/address";

interface Item {
  icon: typeof IconMail;
  label: string;
  value: string;
  href?: string;
  note?: string;
}

// E-mail and phone from the Kontakt singleton (empty = not shown) — the same
// source as the structured data / llms.txt the server emits. The address is fixed.
export function ContactInfo() {
  const { data } = useQuery({ queryKey: ["content"], queryFn: getContent });
  const k = data?.kontakt;
  const email = k?.email?.trim() ?? "";
  const phone = k?.phone?.trim() ?? "";
  const items: Item[] = [];
  if (email) items.push({ icon: IconMail, label: "E-Mail", value: email, href: `mailto:${email}` });
  if (phone) items.push({ icon: IconPhone, label: "Telefon", value: phone, href: telHref(phone) });
  items.push({ icon: IconMapPin, label: "Standort", value: "PBW - Beatrice Czekalla", note: ADDRESS_LINE });

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
                {it.href ? (
                  <a href={it.href} className="block text-[16px] font-semibold text-ink hover:text-navy">
                    {it.value}
                  </a>
                ) : (
                  <strong className="block text-[16px] font-semibold text-ink">{it.value}</strong>
                )}
                {it.note && <div className="text-sm leading-[1.55] text-text">{it.note}</div>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
