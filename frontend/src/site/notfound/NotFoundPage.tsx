import { Link } from "react-router-dom";
import { Container } from "../components/Container";
import { Seo, SITE_NAME } from "../lib/Seo";

// Catch-all for unknown public URLs. The server answers these with HTTP 404, so
// this page (not a redirect to "/") is what visitors and crawlers see.
export function NotFoundPage() {
  return (
    <>
      <Seo
        title={`Seite nicht gefunden | ${SITE_NAME}`}
        description="Die angeforderte Seite existiert nicht (mehr)."
        noindex
      />
      <Container>
        <div className="py-24 text-center">
          <h1 className="mb-3 text-[36px] font-bold text-ink">Seite nicht gefunden</h1>
          <p className="mb-6 text-text">Die gewünschte Seite existiert nicht (mehr) oder wurde verschoben.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-cta">
              Zur Startseite
            </Link>
            <Link to="/kurstermine" className="btn-primary">
              Zu den Kursterminen
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
