import type { Course, Termin } from "../../lib/types";
import { IconCalendar, IconEducation } from "../components/Icons";

// yyyy-mm-dd -> dd.mm.yyyy (matches legacy fmtDateShort)
function short(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
}

function termineSummary(termine: Termin[]): string {
  const dates = (termine || []).map((t) => short(t.date)).filter(Boolean);
  if (!dates.length) return "";
  return dates.length > 3
    ? `${dates[0]} - ${dates[dates.length - 1]} · ${dates.length} Termine`
    : dates.join(" · ");
}

function resolveImg(src: string): string {
  if (!src) return "";
  return src.startsWith("/") || src.startsWith("http") ? src : `/${src}`;
}

export function CourseCard({ course }: { course: Course }) {
  const summary = termineSummary(course.termine);
  const img = resolveImg(course.image);

  return (
    <a
      href={`/seminar.html?id=${encodeURIComponent(course.id)}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white transition hover:-translate-y-0.5 hover:border-navy hover:shadow-soft"
    >
      {img ? (
        <div className="aspect-[16/9] overflow-hidden bg-bg-alt">
          <img src={img} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-[linear-gradient(135deg,#d8e3f7,#b6c6e0)] text-navy [&_svg]:size-12 [&_svg]:opacity-60">
          <IconEducation />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1.5 px-[26px] pb-6 pt-[22px]">
        <h3 className="text-[18px] font-bold leading-[1.35] text-navy">{course.title}</h3>
        {course.subtitle && <p className="text-sm leading-[1.5] text-text">{course.subtitle}</p>}
        <div className="mt-auto flex items-center gap-4 pt-3.5 text-[13px] text-text">
          {summary && (
            <span className="inline-flex items-center gap-1.5 [&_svg]:size-3.5 [&_svg]:text-navy">
              <IconCalendar /> {summary}
            </span>
          )}
          {course.cost && <span className="font-semibold text-navy">{course.cost}</span>}
        </div>
      </div>
    </a>
  );
}
