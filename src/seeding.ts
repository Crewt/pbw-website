import { saveCourse, clearCourses } from "./repositories/courses.repo";
import { saveItem, clearCollection } from "./repositories/content.repo";
import { saveSingle } from "./repositories/settings.repo";
import {
  COURSE_DEFAULTS,
  KOLLEGEN_DEFAULTS,
  ZERTIFIKATE_DEFAULTS,
  REFERENZEN_DEFAULTS,
  RESSOURCEN_DEFAULTS,
  KONTAKT_DEFAULT,
  ABOUT_DEFAULT,
  BILDER_DEFAULT,
} from "./seed-data";

// Wipe and reinsert the example content. Used by `npm run seed` and by the
// admin "Beispieldaten zurücksetzen" button (POST /api/admin/reset). Fixed
// seed ids are preserved; insertion order becomes the sort order.
export async function seedAll(): Promise<void> {
  await clearCourses();
  await clearCollection("kollegen");
  await clearCollection("zertifikate");
  await clearCollection("referenzen");
  await clearCollection("ressourcen");

  for (const c of COURSE_DEFAULTS) await saveCourse(c);
  for (const k of KOLLEGEN_DEFAULTS) await saveItem("kollegen", k);
  for (const z of ZERTIFIKATE_DEFAULTS) await saveItem("zertifikate", z);
  for (const r of REFERENZEN_DEFAULTS) await saveItem("referenzen", r);
  for (const r of RESSOURCEN_DEFAULTS) await saveItem("ressourcen", r);

  await saveSingle("kontakt", KONTAKT_DEFAULT);
  await saveSingle("about", ABOUT_DEFAULT);
  await saveSingle("bilder", BILDER_DEFAULT);
}
