import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container } from "../../components/Container";
import { ArrowRight, IconEducation } from "../../components/Icons";
import { getCourses } from "../../../lib/api";
import { services, type Service } from "../data";

function ServiceCard({ service, to }: { service: Service; to: string }) {
  const Icon = service.icon;
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-navy hover:shadow-[0_4px_20px_rgba(27,43,72,0.07)]"
    >
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-navy-deep/[0.08] text-navy [&_svg]:size-6">
        <Icon />
      </span>
      <h3 className="mb-2 text-[18px] font-bold text-navy">{service.title}</h3>
      <p className="mb-5 flex-1 text-sm leading-[1.55] text-text">{service.description}</p>
      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate transition-all group-hover:gap-2.5 group-hover:text-navy [&_svg]:size-4">
        Details ansehen <ArrowRight />
      </span>
    </Link>
  );
}

export function Services() {
  // Resolve each card's link target from the CMS: a course assigned to the card's
  // slot links to its seminar page; unassigned cards fall back to /kurstermine.
  // On collision the last matching course wins.
  const { data: courses } = useQuery({ queryKey: ["courses"], queryFn: getCourses });
  const slotToSlug = new Map<string, string>();
  for (const c of courses ?? []) {
    for (const slot of c.homepageSlots ?? []) slotToSlug.set(slot, c.slug || c.id);
  }
  const linkFor = (s: Service) => {
    const slug = slotToSlug.get(s.slot);
    return slug ? `/seminar/${slug}` : "/kurstermine";
  };

  return (
    <section className="py-24">
      <Container>
        <div className="mb-10">
          <h2 className="mb-3 text-[34px] font-bold tracking-[-0.6px] text-ink">Professionelle Begleitung</h2>
          <p className="max-w-[760px] text-[18px] text-text">
            Maßgeschneiderte Formate für individuelle und organisationale Entwicklungsprozesse.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-[640px]:grid-cols-1">
          {services.map((s) => (
            <ServiceCard key={s.title} service={s} to={linkFor(s)} />
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-8 overflow-hidden rounded-xl bg-navy px-12 py-10 max-[640px]:px-8">
          <div>
            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-white [&_svg]:size-6">
              <IconEducation />
            </span>
            <h3 className="text-[22px] font-bold text-white">Interesse geweckt?</h3>
          </div>
          <Link
            to="/kontakt"
            className="whitespace-nowrap rounded-lg bg-white px-7 py-3.5 text-sm font-semibold text-navy transition hover:bg-accent active:translate-y-px"
          >
            Kontakt aufnehmen
          </Link>
        </div>
      </Container>
    </section>
  );
}
