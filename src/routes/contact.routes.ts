import { Router } from "express";
import { wrap } from "../http";
import { sendContactNotification } from "../mail/mailer";
import { rateLimit } from "../middleware/rateLimit";

export const contactRouter = Router();

// Length caps mirror the original DB column sizes; kept as sane input bounds.
const MAX = { name: 200, email: 320, phone: 80, subject: 300, message: 5000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public, unauthenticated endpoint — throttle per IP so it can't be used to
// spray notification mail. 5 submissions per 10 minutes is plenty for a human.
const contactRateLimit = rateLimit({ windowMs: 10 * 60_000, max: 5 });

// Public endpoint: the website contact form posts here (no auth). The submission
// is delivered by email only (no DB), so a send failure returns 502 rather than
// silently swallowing the request.
contactRouter.post(
  "/",
  contactRateLimit,
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

    try {
      await sendContactNotification({ name, email, phone, subject, message });
    } catch (err) {
      console.error("[contact] Mail-Versand fehlgeschlagen:", err);
      res.status(502).json({
        error: "Nachricht konnte nicht gesendet werden. Bitte kontaktieren Sie uns direkt per E-Mail.",
      });
      return;
    }
    console.log(`[contact] Anfrage per Mail versandt von ${email} (${name})`);
    res.status(201).json({ ok: true });
  })
);
