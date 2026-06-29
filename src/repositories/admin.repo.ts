import { pool, query } from "../db";
import type { AdminUser } from "../types";

// admin_users access. Passwords are only ever stored/compared as bcrypt hashes
// (hashing happens in the auth route / create-admin script, not here).

export async function findByUsername(username: string): Promise<AdminUser | null> {
  const rows = await query<AdminUser>(
    "SELECT id, username, password_hash FROM admin_users WHERE username=? LIMIT 1",
    [username]
  );
  return rows.length ? rows[0] : null;
}

export async function touchLastLogin(id: number): Promise<void> {
  await pool.query("UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id=?", [id]);
}

export async function countAdmins(): Promise<number> {
  const rows = await query<any>("SELECT COUNT(*) AS n FROM admin_users");
  return Number(rows[0]?.n ?? 0);
}

// Used by the create-admin script: insert or reset a user's password hash.
export async function upsertAdmin(username: string, passwordHash: string): Promise<void> {
  await pool.query(
    "INSERT INTO admin_users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)",
    [username, passwordHash]
  );
}
