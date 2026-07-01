import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Container } from "../components/Container";
import { getCourses } from "../../lib/api";
import type { Course } from "../../lib/types";
import { CourseCard } from "./CourseCard";
import { IconCalendar, IconChat, IconDownload } from "../components/Icons";
import { Seo, SITE_NAME } from "../lib/Seo";

// Latest termin of a course — ISO date strings sort chronologically.
function lastDate(c: Course): string {
  return (c.termine ?? []).reduce((max, t) => (t.date > max ? t.date : max), "");
}

// Distinct years across a course's termine.
function yearsOf(c: Course): number[] {
  return [...new Set((c.termine ?? []).map((t) => Number(t.date.slice(0, 4))).filter(Boolean))];
}

function GridMessage({ children }: { children: ReactNode }) {
  return <div className="mb-12 rounded-xl bg-bg-alt p-12 text-center text-text">{children}</div>;
}

function EmptyYearNotice({ year }: { year: number }) {
  return (
    <div className="mb-12 flex items-center gap-4 rounded-lg border border-line bg-bg-alt px-6 py-5 text-sm leading-[1.55] text-ink">
      <span className="shrink-0 text-navy [&_svg]:size-5">
        <IconCalendar />
      </span>
      <div className="flex-1">
        <strong className="text-navy">Termine {year} in Vorbereitung.</strong> Sobald die Jahresübersicht feststeht,
        stellen wir Ihnen hier das Programm als Download bereit.{" "}
      </div>
      <span aria-disabled className="btn-outline pointer-events-none whitespace-nowrap opacity-55 [&_svg]:size-3.5">
        <IconDownload /> Programm {year} (folgt)
      </span>
    </div>
  );
}

function YearSection({ year, courses, first }: { year: number; courses: Course[]; first: boolean }) {
  const hasCourses = courses.length > 0;
  return (
    <>
      <div
        className={`mb-8 flex items-end justify-between border-b border-line pb-4 ${first ? "" : "mt-2"}`}
      >
        <div>
          <h2 className="text-[28px] font-bold text-ink">Termine {year}</h2>
          <p className="mt-1 text-sm text-text">
            {hasCourses
              ? `Übersicht aller geplanten Kurse und Seminare im Jahr ${year}.`
              : `Die Planung für das Jahr ${year} läuft - eine vollständige Übersicht folgt in Kürze.`}
          </p>
        </div>
      </div>
      {hasCourses ? (
        <div className="mb-12 grid grid-cols-2 gap-5 max-[800px]:grid-cols-1">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} year={year} />
          ))}
        </div>
      ) : (
        <EmptyYearNotice year={year} />
      )}
    </>
  );
}

export function KursterminePage() {
  const { data: courses, isLoading, isError } = useQuery({ queryKey: ["courses"], queryFn: getCourses });

  // --- visibility + grouping (client-side, against the real date) ---
  const today0 = new Date();
  today0.setHours(0, 0, 0, 0);
  const currentYear = today0.getFullYear();
  const currentMonth = today0.getMonth(); // 0-based, June = 5

  // Show a course only while its LAST termin (+7 days) is not yet past.
  const visible = (courses ?? []).filter((c) => {
    const last = lastDate(c);
    if (!last) return false;
    const cutoff = new Date(`${last}T00:00:00`);
    cutoff.setDate(cutoff.getDate() + 7);
    return cutoff >= today0;
  });

  // Every visible course appears under each year it has a termin in.
  const byYear = new Map<number, Course[]>();
  for (const c of visible) {
    for (const y of yearsOf(c)) {
      if (!byYear.has(y)) byYear.set(y, []);
      byYear.get(y)!.push(c);
    }
  }

  // Years with courses (current year onward), plus next year from June on.
  const yearSet = new Set<number>();
  for (const y of byYear.keys()) if (y >= currentYear) yearSet.add(y);
  if (currentMonth >= 5) yearSet.add(currentYear + 1);
  const shownYears = [...yearSet].sort((a, b) => a - b);

  return (
    <>
      <Seo
        title={`Kurstermine & Seminare | ${SITE_NAME}`}
        description="Aktuelle Kurstermine und Seminare von PBW – Beatrice Czekalla. Themen, Termine und Anmeldung im Überblick."
      />
      <section className="relative mb-16 overflow-hidden border-b border-line bg-bg-alt pb-16 pt-20">
        <div className="absolute inset-0 bg-[url(/assets/header-bg.png)] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(243,244,244,0.7)_0%,rgba(243,244,244,0.95)_100%)]" />
        <Container>
          <div className="relative z-[1] max-w-[720px]">
            <h1 className="mb-3 text-[48px] font-bold leading-[1.05] tracking-[-1px] text-ink max-[800px]:text-[36px]">
              Kursangebote
            </h1>
            <p className="mb-6 max-w-[560px] text-[17px] leading-[1.55] text-text">
              Übersicht aller Kurse und Seminare - von der mehrjährigen TA-Ausbildung bis zu einzelnen
              Wochenendseminaren.
            </p>
            <Link to="/ueber-mich" className="btn-outline">
              Mehr über mich
            </Link>
          </div>
        </Container>
      </section>

      <Container>
        {isLoading ? (
          <GridMessage>Kurse werden geladen…</GridMessage>
        ) : isError ? (
          <GridMessage>Die Kurse konnten derzeit nicht geladen werden.</GridMessage>
        ) : shownYears.length === 0 ? (
          <GridMessage>Aktuell sind keine Kurse veröffentlicht.</GridMessage>
        ) : (
          shownYears.map((y, i) => (
            <YearSection key={y} year={y} courses={byYear.get(y) ?? []} first={i === 0} />
          ))
        )}

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-xl border border-line bg-bg-alt p-8 max-[800px]:flex-col max-[800px]:items-start">
          <div>
            <h3 className="mb-2 text-[22px] font-bold text-ink">Interesse an einer mehrjährigen Ausbildung?</h3>
            <p className="max-w-[560px] text-[15px] text-text">
              Für die mehrjährigen Ausbildungswege empfehlen wir ein persönliches Vorgespräch, um individuelle Ziele
              und Fragen zu klären.
            </p>
          </div>
          <Link to="/kontakt" className="btn-cta [&_svg]:size-3.5">
            <IconChat /> Vorgespräch vereinbaren
          </Link>
        </div>

        <div className="mt-16 mb-24 aspect-[21/9] overflow-hidden rounded-xl bg-bg-alt">
          <img
            src="/assets/kurstermine-office.jpg"
            alt="Seminarraum / Praxisflur"
            className="h-full w-full object-cover"
          />
        </div>
      </Container>
    </>
  );
}
