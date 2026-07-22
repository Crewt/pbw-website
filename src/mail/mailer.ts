import nodemailer, { type Transporter } from "nodemailer";
import { config } from "../config";
import type { ContactPayload } from "../types";
import { contactHtml, contactSubject, contactText } from "./contactTemplate";

// Lazily created SMTP transport (one shared connection pool for the process).
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      // Implicit TLS on 465; STARTTLS is negotiated on 587.
      secure: config.mail.port === 465,
      auth:
        config.mail.user || config.mail.pass
          ? { user: config.mail.user, pass: config.mail.pass }
          : undefined,
    });
  }
  return transporter;
}

// Send the contact-form notification to CONTACT_TO. Throws if SMTP is not
// configured or the send fails — the route surfaces that as a 502 so no
// submission is silently lost (there is no DB backup anymore).
export async function sendContactNotification(payload: ContactPayload): Promise<void> {
  if (!config.mail.host || !config.mail.from) {
    console.error("[mail] SMTP not configured (SMTP_HOST/SMTP_FROM missing) — cannot send.");
    throw new Error("SMTP not configured");
  }

  await getTransporter().sendMail({
    from: config.mail.from,
    to: config.mail.to,
    // A plain "Reply" in the client goes straight to the customer.
    replyTo: payload.email,
    subject: contactSubject(payload),
    text: contactText(payload),
    html: contactHtml(payload),
  });
}
