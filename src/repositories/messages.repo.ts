import { pool } from "../db";
import type { ContactPayload } from "../types";

// Contact-form submissions (kontakt_anfragen). Append-only log with an
// AUTO_INCREMENT id — no child tables, so a plain INSERT is enough.
export async function createMessage(input: ContactPayload): Promise<{ id: number }> {
  const [res]: any = await pool.query(
    "INSERT INTO kontakt_anfragen (name, email, phone, subject, message) VALUES (?,?,?,?,?)",
    [
      input.name.trim(),
      input.email.trim(),
      (input.phone || "").trim(),
      (input.subject || "").trim(),
      input.message.trim(),
    ]
  );
  return { id: res.insertId };
}
