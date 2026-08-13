import { pool, query, withTransaction } from "../db";
import { uid, slugify } from "../util";
import type { Course, Termin } from "../types";

// Raw-SQL course access. A course's Termine / Inhalte / "ermöglicht Ihnen"
// live in normalized child tables (course_termine|includes|enables) and are
// rewritten wholesale on save inside a transaction.

function assemble(
  c: any,
  termine: Termin[],
  includes: string[],
  enables: string[],
  homepageSlots: string[]
): Course {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    description: c.description,
    cost: c.cost,
    image: c.image,
    isAusbildungskurs: !!c.is_ausbildungskurs,
    isBildungsurlaub: !!c.is_bildungsurlaub,
    termine,
    includes,
    enables,
    homepageSlots,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

export async function listCourses(): Promise<Course[]> {
  const courses = await query<any>("SELECT * FROM courses ORDER BY sort_order, created_at, id");
  if (!courses.length) return [];
  const ids = courses.map((c) => c.id);
  const ph = ids.map(() => "?").join(",");
  const termine = await query<any>(
    `SELECT course_id, termin_date, termin_end_date, termin_name, termin_description FROM course_termine WHERE course_id IN (${ph}) ORDER BY course_id, sort_order, id`,
    ids
  );
  const includes = await query<any>(
    `SELECT course_id, item_text FROM course_includes WHERE course_id IN (${ph}) ORDER BY course_id, sort_order, id`,
    ids
  );
  const enables = await query<any>(
    `SELECT course_id, item_text FROM course_enables WHERE course_id IN (${ph}) ORDER BY course_id, sort_order, id`,
    ids
  );
  const slots = await query<any>(
    `SELECT course_id, slot_key FROM course_homepage_slots WHERE course_id IN (${ph}) ORDER BY course_id, id`,
    ids
  );

  function group<T>(rows: any[], make: (r: any) => T): Map<string, T[]> {
    const m = new Map<string, T[]>();
    for (const r of rows) {
      if (!m.has(r.course_id)) m.set(r.course_id, []);
      m.get(r.course_id)!.push(make(r));
    }
    return m;
  }
  const tM = group(termine, (r) => ({
    date: r.termin_date ?? "",
    endDate: r.termin_end_date ?? undefined,
    name: r.termin_name ?? "",
    description: r.termin_description ?? undefined,
  }));
  const iM = group(includes, (r) => r.item_text as string);
  const eM = group(enables, (r) => r.item_text as string);
  const sM = group(slots, (r) => r.slot_key as string);

  return courses.map((c) =>
    assemble(c, tM.get(c.id) || [], iM.get(c.id) || [], eM.get(c.id) || [], sM.get(c.id) || [])
  );
}

export async function getCourse(idOrSlug: string): Promise<Course | null> {
  const rows = await query<any>("SELECT * FROM courses WHERE id=? OR slug=? LIMIT 1", [idOrSlug, idOrSlug]);
  if (!rows.length) return null;
  const c = rows[0];
  const termine = await query<any>(
    "SELECT termin_date, termin_end_date, termin_name, termin_description FROM course_termine WHERE course_id=? ORDER BY sort_order, id",
    [c.id]
  );
  const includes = await query<any>(
    "SELECT item_text FROM course_includes WHERE course_id=? ORDER BY sort_order, id",
    [c.id]
  );
  const enables = await query<any>(
    "SELECT item_text FROM course_enables WHERE course_id=? ORDER BY sort_order, id",
    [c.id]
  );
  const slots = await query<any>(
    "SELECT slot_key FROM course_homepage_slots WHERE course_id=? ORDER BY id",
    [c.id]
  );
  return assemble(
    c,
    termine.map((r) => ({
      date: r.termin_date ?? "",
      endDate: r.termin_end_date ?? undefined,
      name: r.termin_name ?? "",
      description: r.termin_description ?? undefined,
    })),
    includes.map((r) => r.item_text),
    enables.map((r) => r.item_text),
    slots.map((r) => r.slot_key)
  );
}

// Upsert. Pass an id to update an existing course (or seed a fixed id);
// omit it to insert a new one with a generated id.
export async function saveCourse(input: Partial<Course>): Promise<Course> {
  const id = (input.id && String(input.id).trim()) || uid("c");
  const title = String(input.title ?? "").trim();
  const slug = (typeof input.slug === "string" && input.slug.trim()) || slugify(title);
  const subtitle = String(input.subtitle ?? "").trim();
  const description = String(input.description ?? "").trim();
  const cost = String(input.cost ?? "").trim();
  const image = String(input.image ?? "").trim();
  const isAusbildungskurs = input.isAusbildungskurs ? 1 : 0;
  const isBildungsurlaub = input.isBildungsurlaub ? 1 : 0;
  const termine = Array.isArray(input.termine) ? input.termine : [];
  const includes = Array.isArray(input.includes) ? input.includes : [];
  const enables = Array.isArray(input.enables) ? input.enables : [];
  const homepageSlots = Array.isArray(input.homepageSlots) ? input.homepageSlots : [];

  await withTransaction(async (conn) => {
    const [ex] = await conn.query("SELECT id FROM courses WHERE id=? LIMIT 1", [id]);
    const exists = (ex as any[]).length > 0;
    if (exists) {
      await conn.query(
        "UPDATE courses SET slug=?, title=?, subtitle=?, description=?, cost=?, image=?, is_ausbildungskurs=?, is_bildungsurlaub=? WHERE id=?",
        [slug, title, subtitle, description, cost, image, isAusbildungskurs, isBildungsurlaub, id]
      );
      await conn.query("DELETE FROM course_termine WHERE course_id=?", [id]);
      await conn.query("DELETE FROM course_includes WHERE course_id=?", [id]);
      await conn.query("DELETE FROM course_enables WHERE course_id=?", [id]);
      await conn.query("DELETE FROM course_homepage_slots WHERE course_id=?", [id]);
    } else {
      const [mx] = await conn.query("SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM courses");
      const sort = (mx as any[])[0].n;
      await conn.query(
        "INSERT INTO courses (id, slug, title, subtitle, description, cost, image, is_ausbildungskurs, is_bildungsurlaub, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [id, slug, title, subtitle, description, cost, image, isAusbildungskurs, isBildungsurlaub, sort]
      );
    }
    // Persist termine in chronological order (ISO yyyy-mm-dd sorts lexically),
    // so newly added dates land in the right spot regardless of input order.
    // Termine without a date are kept at the end in their original order.
    const sortedTermine = [...termine]
      .map((t, i) => ({ t: t || ({} as Termin), i }))
      .sort((a, b) => {
        const da = String(a.t.date ?? "").trim();
        const db = String(b.t.date ?? "").trim();
        if (!da && !db) return a.i - b.i;
        if (!da) return 1;
        if (!db) return -1;
        return da < db ? -1 : da > db ? 1 : a.i - b.i;
      })
      .map((x) => x.t);
    for (let i = 0; i < sortedTermine.length; i++) {
      const t = sortedTermine[i];
      const d = String(t.date ?? "").trim() || null;
      const ed = String(t.endDate ?? "").trim() || null;
      const name = String(t.name ?? "").trim();
      const desc = String(t.description ?? "").trim() || null;
      if (!d && !name) continue;
      await conn.query(
        "INSERT INTO course_termine (course_id, termin_date, termin_end_date, termin_name, termin_description, sort_order) VALUES (?,?,?,?,?,?)",
        [id, d, ed, name, desc, i]
      );
    }
    for (let i = 0; i < includes.length; i++) {
      const v = String(includes[i] ?? "").trim();
      if (!v) continue;
      await conn.query("INSERT INTO course_includes (course_id, item_text, sort_order) VALUES (?,?,?)", [id, v, i]);
    }
    for (let i = 0; i < enables.length; i++) {
      const v = String(enables[i] ?? "").trim();
      if (!v) continue;
      await conn.query("INSERT INTO course_enables (course_id, item_text, sort_order) VALUES (?,?,?)", [id, v, i]);
    }
    const seenSlots = new Set<string>();
    for (const raw of homepageSlots) {
      const key = String(raw ?? "").trim();
      if (!key || seenSlots.has(key)) continue;
      seenSlots.add(key);
      await conn.query("INSERT INTO course_homepage_slots (course_id, slot_key) VALUES (?,?)", [id, key]);
    }
  });

  return (await getCourse(id))!;
}

export async function removeCourse(id: string): Promise<boolean> {
  const [res]: any = await pool.query("DELETE FROM courses WHERE id=?", [id]);
  return res.affectedRows > 0;
}

export async function clearCourses(): Promise<void> {
  // Children cascade via FK ON DELETE CASCADE.
  await pool.query("DELETE FROM courses");
}
