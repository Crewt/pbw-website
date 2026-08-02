// Create or reset an admin login (password stored as a bcrypt hash).
//   npm run build && npm run admin:create -- <username>
// The password is NOT taken from the command line (argv leaks into shell history
// and process listings). Provide it either via the ADMIN_PASSWORD environment
// variable or interactively at the hidden prompt.
import readline from "readline";
import bcrypt from "bcryptjs";
import { pool } from "../db";
import { upsertAdmin } from "../repositories/admin.repo";

// Read a line from stdin without echoing the typed characters.
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const rlAny = rl as any;
    // Suppress echo of the answer while still letting the prompt itself print.
    rlAny._writeToOutput = (str: string) => {
      if (!rlAny.__muted) rlAny.output.write(str);
    };
    process.stdout.write(question);
    rlAny.__muted = true;
    rl.question("", (value) => {
      rlAny.__muted = false;
      process.stdout.write("\n");
      rl.close();
      resolve(value);
    });
  });
}

async function main() {
  const username = process.argv[2];
  if (!username) {
    console.error("Usage: npm run admin:create -- <username>");
    console.error("Password: set ADMIN_PASSWORD env var, or enter it at the prompt.");
    process.exitCode = 1;
    return;
  }

  let password = process.env.ADMIN_PASSWORD || "";
  if (!password) {
    password = await promptHidden(`Passwort für '${username}': `);
    const confirm = await promptHidden("Passwort wiederholen: ");
    if (password !== confirm) {
      console.error("✗ Passwörter stimmen nicht überein.");
      process.exitCode = 1;
      return;
    }
  }
  if (!password) {
    console.error("✗ Kein Passwort angegeben.");
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
