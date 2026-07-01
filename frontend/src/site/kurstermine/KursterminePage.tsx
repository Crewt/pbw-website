import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Container } from "../components/Container";
import { getCourses } from "../../lib/api";
import type { Course } from "../../lib/types";
import { CourseCard } from "./CourseCard";
import { IconCalendar, IconChat, IconDownload } from "../components/Icons";

function GridMessage({ children }: { children: ReactNode }) {
  return <div className="mb-12 rounded-xl bg-bg-alt p-12 text-center text-text">{children}</div>;
}

function CoursesGrid({
  courses,
  isLoading,
  isError,
}: {
  courses: Course[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) return <GridMessage>Kurse werden geladen…</GridMessage>;
  if (isError) return <GridMessage>Die Kurse konnten derzeit nicht geladen werden.</GridMessage>;
  if (!courses || courses.length === 0) return <GridMessage>Aktuell sind keine Kurse veröffentlicht.</GridMessage>;
  return (
    <div className="mb-12 grid grid-cols-2 gap-5 max-[800px]:grid-cols-1">
      {courses.map((c) => (
        <CourseCard key={c.id} course={c} />
      ))}
    </div>
  );
}

export function KursterminePage() {
  const { data: courses, isLoading, isError } = useQuery({ queryKey: ["courses"], queryFn: getCourses });

  return (
    <>
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
        <div className="mb-8 flex items-end justify-between border-b border-line pb-4">
          <div>
            <h2 className="text-[28px] font-bold text-ink">Termine 2026</h2>
            <p className="mt-1 text-sm text-text">Übersicht aller geplanten Kurse und Seminare im Jahr 2026.</p>
          </div>
        </div>

        <CoursesGrid courses={courses} isLoading={isLoading} isError={isError} />

        <div className="mb-8 mt-2 flex items-end justify-between border-b border-line pb-4">
          <div>
            <h2 className="text-[28px] font-bold text-ink">Termine 2027</h2>
            <p className="mt-1 text-sm text-text">
              Die Planung für das Jahr 2027 läuft - eine vollständige Übersicht folgt in Kürze.
            </p>
          </div>
        </div>

        <div className="mb-12 flex items-center gap-4 rounded-lg border border-line bg-bg-alt px-6 py-5 text-sm leading-[1.55] text-ink">
          <span className="shrink-0 text-navy [&_svg]:size-5">
            <IconCalendar />
          </span>
          <div className="flex-1">
            <strong className="text-navy">Termine 2027 in Vorbereitung.</strong> Sobald die Jahresübersicht feststeht,
            stellen wir Ihnen hier das Programm als Download bereit.{" "}
            <span className="text-text">(Platzhalter - wird über das CMS gepflegt.)</span>
          </div>
          <span aria-disabled className="btn-outline pointer-events-none whitespace-nowrap opacity-55 [&_svg]:size-3.5">
            <IconDownload /> Programm 2027 (folgt)
          </span>
        </div>

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
