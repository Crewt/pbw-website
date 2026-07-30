import type { ContactPayload } from "../types";

// Escape user-supplied values before they land in the notification HTML.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// A prefilled mailto: link so Beatrice replies straight to the customer from her
// own mail client — no copy/paste of the address, no risk of a wrong recipient.
function replyMailto(p: ContactPayload): string {
  const subject = `Re: Ihre Anfrage bei PBW${p.subject ? ` – ${p.subject}` : ""}`;
  const body = `Hallo ${p.name},\n\nvielen Dank für Ihre Nachricht.\n\n`;
  // Keep "@" (and ".") literal in the address — many mail clients (Outlook,
  // Apple Mail, Thunderbird, various mobile handlers) do NOT percent-decode the
  // mailto address, so an encoded "%40" leaves the To field empty. Only the
  // subject/body query parts need encoding.
  const to = encodeURIComponent(p.email).replace(/%40/g, "@");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// One-line labelled row; value is escaped, label is static.
function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:6px 12px;font-weight:600;color:#374151;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:6px 12px;color:#111827;">${escapeHtml(value)}</td>
    </tr>`;
}

export function contactSubject(p: ContactPayload): string {
  return `Neue Kontaktanfrage: ${p.subject || "Anliegen"} – ${p.name}`;
}

// Plain-text fallback for clients that don't render HTML.
export function contactText(p: ContactPayload): string {
  return [
    "Neue Kontaktanfrage über das Formular auf pbw-ta.de:",
    "",
    `Name:      ${p.name}`,
    `E-Mail:    ${p.email}`,
    `Telefon:   ${p.phone || "—"}`,
    `Betreff:   ${p.subject || "—"}`,
    "",
    "Nachricht:",
    p.message,
    "",
    `Antworten an: ${p.email}`,
  ].join("\n");
}

export function contactHtml(p: ContactPayload): string {
  const rows = [
    row("Name", p.name),
    row("E-Mail", p.email),
    row("Telefon", p.phone || "—"),
    row("Betreff", p.subject || "—"),
  ].join("");

  return `<!doctype html>
<html lang="de">
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr>
          <td style="padding:20px 24px;background:#0f172a;color:#ffffff;font-size:18px;font-weight:700;">
            Neue Kontaktanfrage
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
              ${rows}
            </table>
            <div style="margin:16px 0 6px;font-weight:600;color:#374151;font-size:14px;">Nachricht</div>
            <div style="padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;color:#111827;font-size:14px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(
              p.message
            )}</div>
            <div style="margin-top:24px;">
              <a href="${replyMailto(p).replace(/&/g, "&amp;")}"
                 style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:8px;">
                An ${escapeHtml(p.name)} antworten
              </a>
            </div>
            <div style="margin-top:12px;color:#6b7280;font-size:12px;">
              Der Button öffnet eine neue E-Mail, bereits adressiert an ${escapeHtml(
                p.email
              )}. Alternativ funktioniert auch „Antworten" (Reply-To ist gesetzt).
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
