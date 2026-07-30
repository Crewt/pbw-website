import { Link } from "react-router-dom";
import { useConsent } from "./ConsentContext";

// Opt-in banner shown until the visitor makes a choice. "Ablehnen" and "Alle
// akzeptieren" carry equal visual weight (GDPR: rejecting must be as easy as
// accepting). Nothing external loads before a click.
export function ConsentBanner() {
  const { status, grant, deny } = useConsent();
  if (status !== "unknown") return null;

  return (
    <div
      role="dialog"
      aria-label="Datenschutz-Einwilligung"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1000px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-[1.6] text-text">
          Wir binden externe Medien von Google ein &ndash; <strong className="font-semibold text-ink">Schriftarten
          (Google&nbsp;Fonts)</strong> sowie auf der Kontaktseite eine <strong className="font-semibold text-ink">Karte
          (Google&nbsp;Maps)</strong>. Dabei wird Ihre IP-Adresse an Google übertragen. Diese Dienste laden wir nur mit
          Ihrer Einwilligung.{" "}
          <Link
            to="/datenschutz"
            className="font-medium text-navy underline underline-offset-2 hover:text-navy-deep"
          >
            Mehr erfahren
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={deny} className="btn-ghost">
            Ablehnen
          </button>
          <button type="button" onClick={grant} className="btn-primary">
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
