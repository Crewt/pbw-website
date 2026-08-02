import { pool, query } from "../db";
import type { AdminUser } from "../types";

// admin_users access. Passwords are only ever stored/compared as bcrypt hashes
// (hashing happens in the auth route / create-admin script, not here).
//
// REQUIRED SCHEMA MIGRATION (managed outside this repo — no .sql lives here):
//   ALTER TABLE admin_users ADD COLUMN token_version INT NOT NULL DEFAULT 0;
// token_version backs server-side logout: it is embedded in the session token at
// login and re-checked on every request; bumping it invalidates all outstanding
// tokens for that user (see getTokenVersion / bumpTokenVersion below).

// findByUsername also returns token_version so the login route can embed it in the
// session token without a second query. token_version isn't in the shared AdminUser
// type (src/types.ts) — that interface should gain `token_version: number`; until
// then we widen the row type locally.
export type AdminUserWithVersion = AdminUser & { token_version: number };

export async function findByUsername(username: string): Promise<AdminUserWithVersion | null> {
  const rows = await query<AdminUserWithVersion>(
    "SELECT id, username, password_hash, token_version FROM admin_users WHERE username=? LIMIT 1",
    [username]
  );
  return rows.length ? rows[0] : null;
}

// Current token_version for a user, or null if the user no longer exists.
// Used by session verification to reject tokens minted before a logout.
export async function getTokenVersion(id: number): Promise<number | null> {
  const rows = await query<{ token_version: number }>(
    "SELECT token_version FROM admin_users WHERE id=? LIMIT 1",
    [id]
  );
  return rows.length ? Number(rows[0].token_version) : null;
}

// Invalidate all outstanding session tokens for a user (called on logout).
export async function bumpTokenVersion(id: number): Promise<void> {
  await pool.query("UPDATE admin_users SET token_version = token_version + 1 WHERE id=?", [id]);
}

export async function touchLastLogin(id: number): Promise<void> {
  await pool.query("UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id=?", [id]);
}

export async function countAdmins(): Promise<number> {
  const rows = await query<any>("SELECT COUNT(*) AS n FROM admin_users");
  return Number(rows[0]?.n ?? 0);
}

// Used by the create-admin script: insert or reset a user's password hash.
// A password reset also bumps token_version so any existing sessions (e.g. an
// attacker's) are invalidated on the next request.
export async function upsertAdmin(username: string, passwordHash: string): Promise<void> {
  await pool.query(
    "INSERT INTO admin_users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), token_version = token_version + 1",
    [username, passwordHash]
  );
}
