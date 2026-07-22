import { Router } from "express";
import { wrap } from "../http";
import { createMessage } from "../repositories/messages.repo";

export const contactRouter = Router();

// Length caps mirror the column sizes in db/schema.sql.
const MAX = { name: 200, email: 320, phone: 80, subject: 300, message: 5000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public endpoint: the website contact form posts here (no auth). Stores the
// message so nothing is lost; emitting an email notification is a follow-up.
contactRouter.post(
  "/",
  wrap(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const name = str(body.name);
    const email = str(body.email);
    const phone = str(body.phone);
    const subject = str(body.subject);
    const message = str(body.message);

    if (!name || !email || !message) {
      res.status(400).json({ error: "Bitte Name, E-Mail und Nachricht ausfüllen." });
      return;
    }
    if (!EMAIL_RE.test(email)) {
      res.status(400).json({ error: "Bitte eine gültige E-Mail-Adresse angeben." });
      return;
    }
    if (
      name.length > MAX.name ||
      email.length > MAX.email ||
      phone.length > MAX.phone ||
      subject.length > MAX.subject ||
      message.length > MAX.message
    ) {
      res.status(400).json({ error: "Ihre Eingabe ist zu lang." });
      return;
    }

    await createMessage({ name, email, phone, subject, message });
    console.log(`[contact] Anfrage gespeichert von ${email} (${name})`);
    res.status(201).json({ ok: true });
  })
);
