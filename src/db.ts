import mysql from "mysql2/promise";
import { config } from "./config";

// Single shared connection pool. Raw SQL only — no ORM (per project decision).
// dateStrings keeps DATE columns as "yyyy-mm-dd" strings so they round-trip to
// the frontend unchanged instead of becoming JS Date objects.
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
  dateStrings: true,
});

// Thin helper for the common "run a SELECT, get typed rows" case.
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

// Run work inside a transaction on a dedicated connection.
export async function withTransaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    try {
      await conn.rollback();
    } catch {
      /* ignore rollback failure */
    }
    throw err;
  } finally {
    conn.release();
  }
}

// Used by server startup to report DB reachability without crashing the process.
export async function ping(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}
