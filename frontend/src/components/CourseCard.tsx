import type { Course } from "../lib/types";

// Small example component to establish the components/ pattern; used by the demo
// Home page. Real components follow from the design.
export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold">{course.title}</h3>
      {course.subtitle && (
        <p className="mt-1 text-sm text-neutral-500">{course.subtitle}</p>
      )}
      {course.cost && (
        <p className="mt-3 text-sm font-medium text-neutral-700">{course.cost}</p>
      )}
    </article>
  );
}
