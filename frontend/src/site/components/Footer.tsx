import { Link } from "react-router-dom";
import { Container } from "./Container";
import { useConsent } from "../consent/ConsentContext";

const linkCls = "text-[15px] text-text opacity-85 transition hover:text-navy hover:opacity-100";

export function Footer() {
  const { reopen } = useConsent();
  return (
    <footer className="border-t border-line bg-bg-alt py-12">
      <Container className="grid grid-cols-1 items-start gap-8 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <div className="text-xl font-bold text-navy">PBW - Beatrice Czekalla</div>
          <p className="mt-3 max-w-[480px] text-sm text-ink">
            Psychologische Beratung &amp; Weiterbildung auf Basis der Transaktionsanalyse.
            <br />© 2026 PBW - Beatrice Czekalla. Alle Rechte vorbehalten.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-navy">Navigation</h4>
          <ul className="flex flex-col gap-2">
            <li>
              <Link to="/impressum" className={linkCls}>
                Impressum
              </Link>
            </li>
            <li>
              <Link to="/datenschutz" className={linkCls}>
                Datenschutz
              </Link>
            </li>
            <li>
              <Link to="/kontakt" className={linkCls}>
                Kontakt
              </Link>
            </li>
            <li>
              <button type="button" onClick={reopen} className={`${linkCls} bg-transparent p-0 text-left`}>
                Cookie-Einstellungen
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold text-navy">Mehr</h4>
          <ul className="flex flex-col gap-2">
            <li>
              <a href="#" className={linkCls}>
                DGTA
              </a>
            </li>
            <li>
              <a href="#" className={linkCls}>
                EATA
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
