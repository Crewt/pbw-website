import { Container } from "../components/Container";
import { Seo, SITE_NAME } from "../lib/Seo";
import { useConsent } from "../consent/ConsentContext";

const h2 = "mb-3 mt-10 text-[24px] font-bold text-ink";
const p = "text-[16px] leading-[1.65] text-text";
const list = "mt-2 flex flex-col gap-1.5 text-[16px] leading-[1.6] text-text";
const li =
  "relative pl-5 before:absolute before:left-1 before:top-[10px] before:h-[6px] before:w-[6px] before:rounded-full before:bg-navy before:content-['']";
const linkCls = "text-navy underline underline-offset-2 hover:text-navy-deep";

export function DatenschutzPage() {
  const { status, reopen } = useConsent();

  return (
    <Container>
      <Seo
        title={`Datenschutzerklärung | ${SITE_NAME}`}
        description="Datenschutzerklärung von PBW – Beatrice Czekalla: Verantwortliche, Hosting, Server-Logfiles, Cookies & Einwilligung, Google Fonts, Google Maps, Kontaktformular, Newsletter (CleverReach) und Ihre Rechte."
        noindex
      />
      <section className="max-w-[760px] py-16 max-[960px]:py-10">
        <span className="kicker">Rechtliches</span>
        <h1 className="mt-3 mb-8 text-[56px] font-bold leading-[1.05] tracking-[-1px] text-ink max-[960px]:text-[44px]">
          Datenschutzerklärung
        </h1>

        <p className={p}>
          Der Schutz Ihrer personenbezogenen Daten ist mir ein wichtiges Anliegen. Nachfolgend informiere ich Sie
          darüber, welche Daten beim Besuch dieser Website erhoben werden und wie diese verarbeitet werden.
        </p>

        <h2 className={h2}>1. Verantwortliche</h2>
        <div className={`${p} space-y-1`}>
          <p>PBW Beatrice Czekalla</p>
          <p>Düppelstraße 9c</p>
          <p>56179 Vallendar</p>
          <p>Telefon: 0261 / 39494070</p>
          <p>
            E-Mail:{" "}
            <a href="mailto:beatrice.czekalla@pbw-ta.de" className={linkCls}>
              beatrice.czekalla@pbw-ta.de
            </a>
          </p>
        </div>

        <h2 className={h2}>2. Hosting</h2>
        <p className={p}>
          Diese Website wird bei einem externen Dienstleister gehostet. Anbieter ist die IONOS SE, Elgendorfer Str. 57,
          56410 Montabaur. Die IONOS SE verarbeitet in unserem Auftrag Daten, die im Zusammenhang mit dem Besuch dieser
          Website anfallen (insbesondere die nachfolgend beschriebenen Server-Logfiles). Grundlage ist unser berechtigtes
          Interesse an einer sicheren und zuverlässigen Bereitstellung der Website (Art. 6 Abs. 1 lit. f DSGVO). Mit dem
          Anbieter besteht ein Vertrag über Auftragsverarbeitung (Art. 28 DSGVO).
        </p>

        <h2 className={h2}>3. Server-Logfiles</h2>
        <p className={p}>
          Beim Aufruf dieser Website werden durch den Browser automatisch Informationen an den Server übermittelt und
          vorübergehend in sogenannten Server-Logfiles gespeichert:
        </p>
        <ul className={list}>
          {[
            "die aufgerufenen Seiten dieser Domain",
            "Datum und Uhrzeit der Anfrage",
            "Browsertyp und Browserversion",
            "verwendetes Betriebssystem",
            "Referrer-URL (die zuvor besuchte Seite)",
            "Hostname des zugreifenden Rechners und IP-Adresse",
          ].map((item) => (
            <li key={item} className={li}>
              {item}
            </li>
          ))}
        </ul>
        <p className={`${p} mt-3`}>
          Eine Zusammenführung dieser Daten mit anderen Datenquellen findet nicht statt. Die Verarbeitung erfolgt auf
          Grundlage unseres berechtigten Interesses an einem technisch fehlerfreien und sicheren Betrieb der Website
          (Art. 6 Abs. 1 lit. f DSGVO).
        </p>

        <h2 className={h2}>4. SSL- bzw. TLS-Verschlüsselung</h2>
        <p className={p}>
          Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung
          erkennen Sie daran, dass die Adresszeile des Browsers von „http://“ auf „https://“ wechselt und am
          Schloss-Symbol in Ihrer Browserzeile.
        </p>

        <h2 className={h2}>5. Cookies &amp; Einwilligung</h2>
        <p className={p}>
          Diese Website setzt keine Tracking- oder Analyse-Cookies ein. Um Ihre Entscheidung über das Laden externer
          Google-Dienste (siehe Ziffern 6 und 7) zu speichern, legen wir lediglich einen technisch notwendigen Eintrag
          im lokalen Speicher Ihres Browsers ab (Local Storage, Schlüssel „pbw_consent“). Dieser enthält ausschließlich
          Ihre Auswahl (Einwilligung erteilt oder abgelehnt) sowie den Zeitpunkt und wird nicht an Dritte übermittelt.
        </p>
        <p className={`${p} mt-3`}>
          Ihre Auswahl können Sie jederzeit ändern:{" "}
          <button type="button" onClick={reopen} className={`${linkCls} bg-transparent p-0`}>
            Cookie-Einstellungen öffnen
          </button>
          . Aktueller Status:{" "}
          <strong className="font-semibold text-ink">
            {status === "granted"
              ? "externe Google-Dienste erlaubt"
              : status === "denied"
                ? "externe Google-Dienste abgelehnt"
                : "noch keine Auswahl getroffen"}
          </strong>
          .
        </p>

        <h2 className={h2}>6. Google Fonts</h2>
        <p className={p}>
          Diese Website nutzt zur einheitlichen Darstellung von Schriftarten die Schriftart „Inter“ von Google Fonts,
          bereitgestellt durch die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Die
          Schriftart wird <strong className="font-semibold text-ink">erst nach Ihrer ausdrücklichen Einwilligung</strong>{" "}
          von den Servern von Google geladen. Dabei wird Ihre IP-Adresse an Google übertragen; eine Übermittlung in
          Drittländer (u. a. USA) kann nicht ausgeschlossen werden. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1
          lit. a DSGVO), die Sie jederzeit mit Wirkung für die Zukunft widerrufen können. Erteilen Sie keine
          Einwilligung, wird eine Standardschriftart Ihres Systems verwendet.
        </p>

        <h2 className={h2}>7. Google Maps</h2>
        <p className={p}>
          Auf der Kontaktseite binden wir eine Karte des Dienstes Google Maps ein, bereitgestellt durch die Google
          Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Die Karte wird{" "}
          <strong className="font-semibold text-ink">erst nach Ihrer ausdrücklichen Einwilligung</strong> geladen. Beim
          Laden werden Daten – insbesondere Ihre IP-Adresse – an Google übertragen und ggf. auf Servern von Google, auch
          in den USA, verarbeitet. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie jederzeit
          mit Wirkung für die Zukunft widerrufen können. Weitere Informationen finden Sie in der{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className={linkCls}>
            Datenschutzerklärung von Google
          </a>
          .
        </p>

        <h2 className={h2}>8. Kontaktformular</h2>
        <p className={p}>
          Wenn Sie mir über das Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Formular
          (Name, E-Mail-Adresse, Telefonnummer, Betreff und Nachricht) zwecks Bearbeitung der Anfrage und für den Fall
          von Anschlussfragen bei mir gespeichert. Die Anfrage wird mir per E-Mail zugestellt; für den Versand nutze ich
          derzeit einen Mailserver der Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen. Die Verarbeitung
          erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) sowie – sofern Ihre Anfrage auf den
          Abschluss oder die Anbahnung eines Vertrags gerichtet ist – auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO. Diese
          Daten gebe ich nicht ohne Ihre Einwilligung weiter. Sie verbleiben bei mir, bis Sie mich zur Löschung
          auffordern, Ihre Einwilligung widerrufen oder der Zweck der Datenspeicherung entfällt (z. B. nach
          abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche Bestimmungen – insbesondere
          Aufbewahrungsfristen – bleiben unberührt.
        </p>

        <h2 className={h2}>9. Newsletter (CleverReach)</h2>
        <p className={p}>
          Auf der Kontaktseite bieten wir Ihnen die Möglichkeit, sich zu unserem Newsletter anzumelden.
          Für den Versand des Newsletters und die Verwaltung der Empfänger nutzen wir den Dienst der
          CleverReach GmbH &amp; Co. KG, Schafjückenweg 2, 26180 Rastede (nachfolgend „CleverReach"). Mit
          CleverReach besteht ein Vertrag über Auftragsverarbeitung (Art. 28 DSGVO).
        </p>
        <p className={`${p} mt-3`}>
          Für die Anmeldung zum Newsletter ist die Angabe Ihrer E-Mail-Adresse erforderlich. Weitere von
          Ihnen im Anmeldeformular angegebene Daten (z. B. Ihr Name) sind freiwillig und werden
          ausschließlich zur persönlichen Ansprache verwendet.
        </p>
        <p className={`${p} mt-3`}>
          Das Anmeldeformular wird von CleverReach bereitgestellt und{" "}
          <strong className="font-semibold text-ink">erst nach Ihrem aktiven Klick</strong> auf den
          Newsletter-Button in einem eingebetteten Fenster (iframe) geladen. Erst zu diesem Zeitpunkt
          werden Daten – insbesondere Ihre IP-Adresse – an CleverReach übertragen und dort ggf. Cookies
          gesetzt. Die Anmeldung erfolgt im sogenannten Double-Opt-in-Verfahren: Nach dem Absenden des
          Formulars erhalten Sie eine E-Mail, in der Sie Ihre Anmeldung ausdrücklich bestätigen müssen.
          Zum Nachweis der Einwilligung werden der Zeitpunkt der Anmeldung und der Bestätigung sowie Ihre
          IP-Adresse protokolliert.
        </p>
        <p className={`${p} mt-3`}>
          <strong className="font-semibold text-ink">Erfolgsmessung:</strong> Die Newsletter enthalten
          einen sogenannten Zählpixel (Web-Beacon) sowie individualisierte Links. Dadurch kann
          CleverReach erkennen, ob und wann eine Newsletter-E-Mail geöffnet und welche darin enthaltenen
          Links angeklickt wurden. Diese Informationen dienen der statistischen Auswertung und der
          Verbesserung unseres Newsletter-Angebots. Diese Auswertung ist von Ihrer Einwilligung umfasst;
          widerrufen können Sie sie jederzeit durch Abmeldung vom Newsletter.
        </p>
        <p className={`${p} mt-3`}>
          Ihre für den Newsletter gespeicherten Daten werden verarbeitet, solange Sie den Newsletter
          abonniert haben, und nach der Abmeldung gelöscht. Um sicherzustellen, dass Sie nach einer
          Abmeldung keine weiteren E-Mails erhalten, kann Ihre E-Mail-Adresse in einer Sperrliste
          (Blacklist) gespeichert werden.
        </p>
        <p className={`${p} mt-3`}>
          Rechtsgrundlage der Verarbeitung ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie
          jederzeit mit Wirkung für die Zukunft widerrufen können – etwa über den Abmeldelink am Ende
          jeder Newsletter-E-Mail. Weitere Informationen finden Sie in den{" "}
          <a
            href="https://www.cleverreach.com/de/datenschutz/"
            target="_blank"
            rel="noreferrer"
            className={linkCls}
          >
            Datenschutzhinweisen von CleverReach
          </a>
          .
        </p>

        <h2 className={h2}>10. Ihre Rechte</h2>
        <p className={p}>Ihnen stehen hinsichtlich Ihrer personenbezogenen Daten folgende Rechte zu:</p>
        <ul className={list}>
          {[
            "Recht auf Auskunft (Art. 15 DSGVO)",
            "Recht auf Berichtigung (Art. 16 DSGVO)",
            "Recht auf Löschung (Art. 17 DSGVO)",
            "Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)",
            "Recht auf Datenübertragbarkeit (Art. 20 DSGVO)",
            "Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)",
          ].map((item) => (
            <li key={item} className={li}>
              {item}
            </li>
          ))}
        </ul>
        <p className={`${p} mt-3`}>
          Zur Ausübung Ihrer Rechte genügt eine formlose Nachricht an die oben genannten Kontaktdaten.
        </p>

        <h2 className={h2}>11. Widerruf Ihrer Einwilligung</h2>
        <p className={p}>
          Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Eine bereits erteilte
          Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Die Rechtmäßigkeit der bis zum
          Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt. Ihre Einwilligung in das Laden externer
          Google-Dienste können Sie jederzeit über die{" "}
          <button type="button" onClick={reopen} className={`${linkCls} bg-transparent p-0`}>
            Cookie-Einstellungen
          </button>{" "}
          anpassen.
        </p>

        <h2 className={h2}>12. Beschwerderecht bei der Aufsichtsbehörde</h2>
        <p className={p}>
          Ihnen steht ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu. Zuständig ist der Landesbeauftragte
          für den Datenschutz und die Informationsfreiheit Rheinland-Pfalz, Hintere Bleiche 34, 55116 Mainz.
        </p>

        <p className={`${p} mt-10 text-[14px] text-slate`}>Stand: August 2026</p>
      </section>
    </Container>
  );
}
