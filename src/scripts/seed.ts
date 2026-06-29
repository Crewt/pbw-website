// One-off: load the example content into the database.
//   npm run build && npm run seed
import { pool } from "../db";
import { seedAll } from "../seeding";

async function main() {
  await seedAll();
  console.log("✓ Beispieldaten geladen (Kurse, Sammlungen, Kontakt, Über-mich-Bild).");
}

main()
  .catch((e) => {
    console.error("✗ Seed fehlgeschlagen:", e.code || e.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
