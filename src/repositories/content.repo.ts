import { pool, query, withTransaction } from "../db";
import { uid } from "../util";
import type { CollectionName } from "../types";

// Generic, raw-SQL access for the four sortable content collections.
// Table names and column lists come ONLY from this internal whitelist —
// never from request input — so user data can't reach SQL identifiers.

interface CollConfig {
  table: string;
  idPrefix: string;
  toRow: (it: any) => Record<string, any>;
  fromRow: (r: any) => any;
}

const COLLECTIONS: Record<CollectionName, CollConfig> = {
  kollegen: {
    table: "kollegen",
    idPrefix: "k",
    toRow: (it) => ({
      name: (it.name || "").trim(),
      role: (it.role || "").trim(),
      bio: (it.bio || "").trim(),
      link: (it.link || "").trim(),
      image: (it.image || "").trim(),
      featured: it.featured ? 1 : 0,
    }),
    fromRow: (r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      bio: r.bio,
      link: r.link,
      image: r.image,
      featured: !!r.featured,
    }),
  },
  zertifikate: {
    table: "zertifikate",
    idPrefix: "z",
    toRow: (it) => ({
      name: (it.name || "").trim(),
      description: (it.description || "").trim(),
      badge: (it.badge || "").trim(),
      link: (it.link || "").trim(),
      image: (it.image || "").trim(),
    }),
    fromRow: (r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      badge: r.badge,
      link: r.link,
      image: r.image,
    }),
  },
  referenzen: {
    table: "referenzen",
    idPrefix: "r",
    toRow: (it) => ({
      quote: (it.quote || "").trim(),
      name: (it.name || "").trim(),
      org: (it.org || "").trim(),
      image: (it.image || "").trim(),
    }),
    fromRow: (r) => ({ id: r.id, quote: r.quote, name: r.name, org: r.org, image: r.image }),
  },
  ressourcen: {
    table: "ressourcen",
    idPrefix: "res",
    toRow: (it) => ({
      title: (it.title || "").trim(),
      description: (it.description || "").trim(),
      type: it.type === "download" ? "download" : "link",
      url: (it.url || "").trim(),
      file_name: (it.file && it.file.name) || "",
      file_path: (it.file && it.file.url) || "",
    }),
    fromRow: (r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      url: r.url,
      file: r.file_name ? { name: r.file_name, url: r.file_path } : null,
    }),
  },
};

export function isCollection(name: string): name is CollectionName {
  return Object.prototype.hasOwnProperty.call(COLLECTIONS, name);
}

function cfgFor(coll: CollectionName): CollConfig {
  const c = COLLECTIONS[coll];
  if (!c) throw new Error(`Unknown collection: ${coll}`);
  return c;
}

export async function listCollection(coll: CollectionName): Promise<any[]> {
  const cfg = cfgFor(coll);
  const rows = await query<any>(
    `SELECT * FROM \`${cfg.table}\` ORDER BY sort_order, created_at, id`
  );
  return rows.map(cfg.fromRow);
}

export async function getItem(coll: CollectionName, id: string): Promise<any | null> {
  const cfg = cfgFor(coll);
  const rows = await query<any>(`SELECT * FROM \`${cfg.table}\` WHERE id=? LIMIT 1`, [id]);
  return rows.length ? cfg.fromRow(rows[0]) : null;
}

export async function saveItem(coll: CollectionName, item: any): Promise<any> {
  const cfg = cfgFor(coll);
  const id = (item.id && String(item.id).trim()) || uid(cfg.idPrefix);
  const row = cfg.toRow(item);
  const cols = Object.keys(row);
  const vals = cols.map((c) => row[c]);

  await withTransaction(async (conn) => {
    const [ex] = await conn.query(`SELECT id FROM \`${cfg.table}\` WHERE id=? LIMIT 1`, [id]);
    const exists = (ex as any[]).length > 0;
    if (exists) {
      const set = cols.map((c) => `\`${c}\`=?`).join(", ");
      await conn.query(`UPDATE \`${cfg.table}\` SET ${set} WHERE id=?`, [...vals, id]);
    } else {
      const [mx] = await conn.query(`SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM \`${cfg.table}\``);
      const sort = (mx as any[])[0].n;
      const allCols = ["id", ...cols, "sort_order"];
      const placeholders = allCols.map(() => "?").join(",");
      const colList = allCols.map((c) => `\`${c}\``).join(",");
      await conn.query(`INSERT INTO \`${cfg.table}\` (${colList}) VALUES (${placeholders})`, [id, ...vals, sort]);
    }
  });

  return getItem(coll, id);
}

export async function removeItem(coll: CollectionName, id: string): Promise<boolean> {
  const cfg = cfgFor(coll);
  const [res]: any = await pool.query(`DELETE FROM \`${cfg.table}\` WHERE id=?`, [id]);
  return res.affectedRows > 0;
}

// Move one item up (-1) or down (+1). Reassigns the whole column's sort_order
// to sequential indices so it's robust even if seeds shared sort_order=0.
export async function moveItem(coll: CollectionName, id: string, dir: number): Promise<void> {
  const cfg = cfgFor(coll);
  const step = dir < 0 ? -1 : 1;
  await withTransaction(async (conn) => {
    const [rows] = await conn.query(
      `SELECT id FROM \`${cfg.table}\` ORDER BY sort_order, created_at, id`
    );
    const ids = (rows as any[]).map((r) => r.id);
    const i = ids.indexOf(id);
    const j = i + step;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    for (let k = 0; k < ids.length; k++) {
      await conn.query(`UPDATE \`${cfg.table}\` SET sort_order=? WHERE id=?`, [k, ids[k]]);
    }
  });
}

export async function clearCollection(coll: CollectionName): Promise<void> {
  const cfg = cfgFor(coll);
  await pool.query(`DELETE FROM \`${cfg.table}\``);
}
