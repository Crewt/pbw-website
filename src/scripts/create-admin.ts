// Create or reset an admin login (password stored as a bcrypt hash).
//   npm run build && npm run admin:create -- <username> <password>
import bcrypt from "bcryptjs";
import { pool } from "../db";
import { upsertAdmin } from "../repositories/admin.repo";

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];
  if (!username || !password) {
    console.error("Usage: npm run admin:create -- <username> <password>");
    process.exitCode = 1;
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  await upsertAdmin(username, hash);
  console.log(`✓ Admin-Konto '${username}' angelegt/aktualisiert.`);
}

main()
  .catch((e) => {
    console.error("✗ create-admin fehlgeschlagen:", e.code || e.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
