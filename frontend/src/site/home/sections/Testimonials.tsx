import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container } from "../../components/Container";
import { ArrowRight, IconUser } from "../../components/Icons";
import { TestimonialCarousel } from "../../components/TestimonialCarousel";
import { getContent } from "../../../lib/api";
import type { Referenz } from "../../../lib/types";
import { badges } from "../data";

function TestimonialSlide({ t }: { t: Referenz }) {
  return (
    <div className="relative flex min-h-[300px] w-full flex-col overflow-hidden rounded-xl border border-line bg-white px-10 pb-9 pt-12 max-[560px]:px-6">
      <span aria-hidden className="pointer-events-none absolute left-7 top-3.5 font-serif text-[72px] leading-none text-line-soft">
        &ldquo;
      </span>
      <p className="relative z-[1] my-4 flex-1 text-[19px] italic leading-[1.6] text-navy">{t.quote}</p>
      <div className="inline-flex items-center gap-3">
        {t.image ? (
          <img
            src={t.image}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-line-soft text-slate [&_svg]:size-6">
            <IconUser />
          </span>
        )}
        <div>
          <div className="text-sm font-semibold text-navy">{t.name}</div>
          <div className="text-[13px] text-text">{t.org}</div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const { data } = useQuery({ queryKey: ["content"], queryFn: getContent });
  const items = data?.referenzen ?? [];
  const slides = items.map((r) => <TestimonialSlide key={r.id} t={r} />);

  return (
    <section className="py-24">
      <Container>
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="kicker">STIMMEN &amp; EMPFEHLUNGEN</span>
            <h2 className="mt-2 text-[34px] font-bold tracking-[-0.6px] text-ink">Empfehlungen</h2>
          </div>
          <Link
            to="/empfehlungen"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-navy transition-all hover:gap-2.5 [&_svg]:size-4"
          >
            Weiter zu Kooperation & Austausch<ArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-2 items-start gap-12 max-[960px]:grid-cols-1">
          <TestimonialCarousel slides={slides} />

          <div>
            <h3 className="mb-2.5 text-[22px] font-bold text-navy">Qualität und Zertifizierung</h3>
            <p className="mb-6 text-[15px] leading-[1.6] text-text">
              Höchste Standards in der Beratungsarbeit, zertifiziert durch anerkannte Fachgesellschaften und wissenschaftlich ausgebildet an der Vinzenz Pallotti University (VPU):
            </p>
            <div className="mb-8 flex flex-wrap gap-4">
              {badges.map((b) => (
                <span
                  key={b}
                  className="inline-flex h-14 items-center justify-center rounded-lg border border-line bg-bg px-7 text-[15px] font-bold tracking-[2px] text-navy"
                >
                  {b}
                </span>
              ))}
            </div>
            <div className="rounded-r-lg border-l-4 border-navy bg-bg-alt p-6">
              <h4 className="mb-2 text-sm font-bold tracking-[0.3px] text-navy">Nächster Schritt</h4>
              <p className="mb-5 text-[15px] leading-[1.6] text-text">
                Lassen Sie uns gemeinsam herausfinden, welches Format für Ihre Situation am besten geeignet ist.
              </p>
              <Link to="/kontakt" className="btn-cta">
                Beratungstermin vereinbaren
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
