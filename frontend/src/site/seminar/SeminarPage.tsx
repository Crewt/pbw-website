import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Container } from "../components/Container";
import { getCourse } from "../../lib/api";
import { fmtDateLong } from "../lib/date";
import { ChevronLeft, IconCalendar, IconCheckCircle, IconCreditCard } from "../components/Icons";
import { resolveImg } from "../lib/img";

function Description({ text }: { text: string }) {
  const paras = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!paras.length) {
    return <p className="mb-4 text-[16px] leading-[1.7] text-text">Beschreibung folgt in Kürze.</p>;
  }
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} className="mb-4 text-[16px] leading-[1.7] text-text">
          {p.split("\n").map((line, j, arr) => (
            <span key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

function NotFound() {
  return (
    <Container>
      <div className="py-24 text-center">
        <h1 className="mb-3 text-[36px] font-bold text-ink">Kurs nicht gefunden</h1>
        <p className="mb-6 text-text">Der gewünschte Kurs ist nicht (mehr) verfügbar.</p>
        <Link to="/kurstermine" className="btn-cta">
          Zu den Kursangeboten
        </Link>
      </div>
    </Container>
  );
}

export function SeminarPage() {
  const { slug } = useParams();
  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({ queryKey: ["course", slug], queryFn: () => getCourse(slug!), enabled: !!slug });

  if (isLoading) {
    return (
      <Container>
        <div className="py-24 text-center text-slate">Kurs wird geladen…</div>
      </Container>
    );
  }
  if (isError || !course) return <NotFound />;

  const img = resolveImg(course.image);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-bg-alt pb-12 pt-16">
        <div className="absolute inset-0 bg-[url(/assets/header-bg.png)] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(243,244,244,0.4)_0%,rgba(243,244,244,0.85)_100%)]" />
        <Container>
          <div className="relative z-[1]">
            <Link
              to="/kurstermine"
              className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate transition-all hover:gap-2.5 hover:text-navy [&_svg]:size-3.5"
            >
              <ChevronLeft /> Alle Kursangebote
            </Link>
            <span className="kicker block">Kursangebot</span>
            <h1 className="mt-3 text-[48px] font-bold leading-[1.05] tracking-[-1px] text-ink max-[900px]:text-[36px]">
              {course.title}
            </h1>
            {course.subtitle && <p className="mt-3 max-w-[720px] text-[18px] text-text">{course.subtitle}</p>}
          </div>
        </Container>
      </section>

      <Container>
        <div className="my-16 grid grid-cols-[1fr_380px] items-start gap-12 max-[900px]:grid-cols-1">
          <article>
            <Description text={course.description || ""} />

            {img ? (
              <div className="my-8 aspect-[16/9] overflow-hidden rounded-xl">
                <img src={img} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="my-8 aspect-[16/9] rounded-xl bg-[linear-gradient(135deg,#d8e3f7,#b6c6e0)]" aria-hidden />
            )}

            {course.includes.length > 0 && (
              <>
                <h2 className="mb-4 mt-10 text-[22px] font-bold text-ink">Im Seminar erhalten Sie…</h2>
                <div className="mb-2 grid grid-cols-2 gap-4 max-[900px]:grid-cols-1">
                  {course.includes.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg bg-bg-alt px-[18px] py-4">
                      <span className="mt-0.5 shrink-0 text-navy [&_svg]:size-5">
                        <IconCheckCircle />
                      </span>
                      <p className="text-[15px] leading-[1.5] text-ink">{s}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {course.enables.length > 0 && (
              <>
                <h2 className="mb-4 mt-10 text-[22px] font-bold text-ink">Das Seminar ermöglicht Ihnen…</h2>
                <ul className="flex flex-col gap-2">
                  {course.enables.map((s, i) => (
                    <li
                      key={i}
                      className="rounded-r-md border-l-2 border-navy bg-bg-alt/60 px-4 py-3 text-[15px] leading-[1.5] text-ink"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </article>

          <aside>
            <div className="sticky top-[90px] rounded-xl border border-line bg-white p-7 shadow-soft">
              <span className="kicker mb-5 block">Seminardetails</span>

              {course.termine.length > 0 && (
                <div className="mb-4 flex items-start gap-3.5">
                  <span className="icon-chip-blue shrink-0">
                    <IconCalendar />
                  </span>
                  <div className="flex-1">
                    <small className="mb-0.5 block text-[13px] text-text">Termine</small>
                    <ul className="text-sm">
                      {course.termine.map((t, i) => (
                        <li key={i} className="border-b border-line-soft py-1.5 last:border-b-0">
                          <span className="font-semibold text-navy">{fmtDateLong(t.date)}</span>
                          {t.time && <span className="ml-1.5 text-[13px] text-text">{t.time}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {course.cost && (
                <div className="mb-4 flex items-start gap-3.5">
                  <span className="icon-chip-blue shrink-0">
                    <IconCreditCard />
                  </span>
                  <div>
                    <small className="mb-0.5 block text-[13px] text-text">Kosten</small>
                    <strong className="text-[20px] font-bold text-navy">{course.cost}</strong>
                  </div>
                </div>
              )}

              <hr className="my-5 border-0 border-t border-line-soft" />

              <p className="mb-4 text-sm leading-[1.5] text-text">
                Nehmen Sie Kontakt auf, um weitere Informationen zu erhalten und sich anzumelden.
              </p>
              <Link to={`/kontakt?kurs=${encodeURIComponent(course.title)}`} className="btn-cta w-full">
                Jetzt Kontakt aufnehmen
              </Link>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
