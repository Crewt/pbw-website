import { Container } from "../components/Container";
import { Seo, SITE_NAME } from "../lib/Seo";

// Shared type conventions for the legal text pages (mirrors the hand-rolled
// heading/paragraph classes used across the site — there is no prose plugin).
const h2 = "mb-3 mt-10 text-[24px] font-bold text-ink";
const p = "text-[16px] leading-[1.65] text-text";

export function ImpressumPage() {
  return (
    <Container>
      <Seo
        title={`Impressum | ${SITE_NAME}`}
        description="Impressum und Anbieterkennzeichnung von PBW – Beatrice Czekalla."
        noindex
      />
      <section className="max-w-[760px] py-16 max-[960px]:py-10">
        <span className="kicker">Rechtliches</span>
        <h1 className="mt-3 mb-8 text-[56px] font-bold leading-[1.05] tracking-[-1px] text-ink max-[960px]:text-[44px]">
          Impressum
        </h1>

        <h2 className={h2}>Angaben gemäß § 5 DDG</h2>
        <div className={`${p} space-y-1`}>
          <p>PBW Beatrice Czekalla</p>
          <p>Düppelstraße 9c</p>
          <p>56179 Vallendar</p>
        </div>

        <h2 className={h2}>Kontakt</h2>
        <div className={`${p} space-y-1`}>
          <p>Telefon: 0261 / 39494070</p>
          <p>
            E-Mail:{" "}
            <a href="mailto:beatrice.czekalla@pbw-ta.de" className="text-navy underline underline-offset-2 hover:text-navy-deep">
              beatrice.czekalla@pbw-ta.de
            </a>
          </p>
        </div>

        <h2 className={h2}>Umsatzsteuer</h2>
        <p className={p}>Steuernummer: 2202633292</p>

        <h2 className={h2}>Berufsverbände</h2>
        <p className={p}>
          Mitgliedschaft in der Deutschen Gesellschaft für Transaktionsanalyse (DGTA) sowie in der European Association
          for Transactional Analysis (EATA).
        </p>

        <h2 className={h2}>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <div className={`${p} space-y-1`}>
          <p>Beatrice Czekalla</p>
          <p>Düppelstraße 9c</p>
          <p>56179 Vallendar</p>
        </div>

        <h2 className={h2}>Haftung für Inhalte</h2>
        <p className={p}>
          Als Diensteanbieterin bin ich gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen
          Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG bin ich als Diensteanbieterin jedoch nicht verpflichtet,
          übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf
          eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
          Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Bei Bekanntwerden entsprechender
          Rechtsverletzungen werde ich diese Inhalte umgehend entfernen.
        </p>

        <h2 className={h2}>Haftung für Links</h2>
        <p className={p}>
          Mein Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Deshalb
          kann ich für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist
          stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Bei Bekanntwerden von Rechtsverletzungen
          werde ich derartige Links umgehend entfernen.
        </p>

        <h2 className={h2}>Urheberrecht</h2>
        <p className={p}>
          Die durch die Betreiberin erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
          Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Downloads und Kopien dieser Seite sind nur für
          den privaten, nicht kommerziellen Gebrauch gestattet. Sollten Sie auf eine Urheberrechtsverletzung aufmerksam
          werden, bitte ich um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werde ich
          derartige Inhalte umgehend entfernen.
        </p>

        <h2 className={h2}>Bildnachweis</h2>
        <p className={p}>
          Die Bilder wurden entweder mit KI generiert oder zeigen Personen, die der Verwendung zugestimmt haben und
          die Bildrechte innehaben.
        </p>

        <h2 className={h2}>Schriftarten</h2>
        <p className={p}>
          Diese Website verwendet die Schriftart „Inter“, die über Google Fonts bereitgestellt wird. Diese wird erst
          nach Ihrer Einwilligung von den Servern von Google geladen. Näheres dazu finden Sie in unserer{" "}
          <a href="/datenschutz" className="text-navy underline underline-offset-2 hover:text-navy-deep">
            Datenschutzerklärung
          </a>
          .
        </p>
      </section>
    </Container>
  );
}
