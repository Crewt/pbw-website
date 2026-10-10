import type { Course } from "../../lib/types";

// Public URL of a course: counselling offers (assigned to a homepage card, not an
// Ausbildungskurs) live at the top level ("/einzelberatung"), everything else
// under "/kurstermine/<slug>". Mirrors coursePath() in src/seo/meta.ts.
export function coursePath(c: Pick<Course, "slug" | "id" | "homepageSlots" | "isAusbildungskurs">): string {
  const slug = encodeURIComponent(c.slug || c.id);
  const isService = (c.homepageSlots ?? []).length > 0 && !c.isAusbildungskurs;
  return isService ? `/${slug}` : `/kurstermine/${slug}`;
}
