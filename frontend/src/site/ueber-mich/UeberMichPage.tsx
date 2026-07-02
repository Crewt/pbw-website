import { Container } from "../components/Container";
import { IconArrowUpRight } from "../components/Icons";
import { Seo, SITE_NAME } from "../lib/Seo";

const facts = [
  { num: "15+", lbl: "Jahre Erfahrung in Beratung & Begleitung" },
  { num: "DGTA", lbl: "Zertifizierte Lehrtrainerin & Supervisorin (TA)" },
  { num: "EATA", lbl: "Mitglied der European Association for Transactional Analysis" },
  { num: "TA-Wege", lbl: "Ausbildungsinstitut für Transaktionsanalyse" },
  { num: "EASC", lbl: "European Association for Supervision and Coaching" },
];

const motivation =
  "Was mich in meiner Arbeit antreibt, ist die Verbindung von fundiertem akademischem Denken mit dem lebendigen, klaren Handwerkszeug der Transaktionsanalyse: Mein Master im Coaching stärkt meinen wissenschaftlichen Anspruch und vertieft meinen systemischen Blick auf Menschen und ihre Entwicklungswege. Als transaktionsanalytische Lehrtrainerin und Lehrsupervisorin (u. S.) liebe ich die Klarheit und Praxisnähe der TA: Sie macht Veränderung greifbar, eröffnet neue Handlungsoptionen und unterstützt Menschen dabei, sich selbst aus einer reflektierten, stärkenden Perspektive zu betrachten und zu handeln.";

const pflanzList = [
  "zu wachsen,",
  "zu lernen,",
  "zu experimentieren,",
  "zu reflektieren und",
  "dabei Ihr Potenzial zu entfalten und weiterzuentwickeln.",
];

export function UeberMichPage() {
  return (
    <Container>
      <Seo
        title={`Über mich | ${SITE_NAME}`}
        description="Beatrice Czekalla – Psychologische Beratung & Weiterbildung. Mehr über Ansatz, Haltung und Werdegang."
      />
      <section className="relative grid grid-cols-[1.1fr_1fr] items-start gap-16 py-20 max-[960px]:grid-cols-1 max-[960px]:gap-8 max-[960px]:py-12">
        {/* decorative background */}
        <div aria-hidden className="pointer-events-none absolute -left-10 top-0 h-full w-[70%] overflow-hidden">
          <div className="absolute inset-0 bg-[url(/assets/header-bg.webp)] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#f9f9f9_0%,rgba(249,249,249,0.4)_50%,rgba(249,249,249,1)_100%)]" />
        </div>

        {/* text column */}
        <div className="relative z-[1]">
          <span className="kicker">Persönlich</span>
          <h1 className="mt-3 mb-6 text-[56px] font-bold leading-[1.05] tracking-[-1px] text-ink max-[960px]:text-[44px]">
            Über mich
          </h1>
          <p className="text-[19px] leading-[1.65] text-text">
            Seit vielen Jahren begleite und unterstütze ich Menschen auf ihrem beruflichen und privaten Lebensweg und
            in Organisationen. Meine Arbeit ist geprägt von Wertschätzung, Neugier und der tiefen Überzeugung, dass
            jeder Mensch die Fähigkeit zur positiven Veränderung in sich trägt.
          </p>

          <h2 className="mb-3 mt-8 text-[24px] font-bold text-ink">Weg & Motivation</h2>
          <div className="space-y-4 text-[16px] leading-[1.65] text-text">
            <p>{motivation}</p>
          </div>

          <div className="mt-10 rounded-xl border border-navy bg-bg-alt p-8">
            <h3 className="mb-3 text-[20px] font-bold text-navy">Philosophie</h3>
            <p className="text-[17px] font-medium italic leading-[1.65] text-text">
              Ich verstehe meine Arbeit als eine „Pflanzschule“: ein geschützter Raum, in dem Ideen keimen und erste
              Schritte wie „Setzlinge“ entwickelt und kultiviert werden können.
            </p>
            <p className="my-4 text-[17px] leading-[1.65] text-text">Dieser Rahmen lädt Sie ein,</p>
            <ul className="flex flex-col gap-2">
              {pflanzList.map((item) => (
                <li
                  key={item}
                  className="relative pl-6 text-[17px] leading-[1.5] text-text before:absolute before:left-1 before:top-[9px] before:h-[7px] before:w-[7px] before:rounded-full before:bg-navy before:content-['']"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 text-[19px] font-bold italic text-ink">- Ihre Beatrice Czekalla</div>
        </div>

        {/* portrait column */}
        <div className="relative z-[1] px-16 py-8 max-[960px]:px-0 max-[960px]:py-4">
          <div className="absolute -top-4 right-4 h-60 w-60 rounded-full bg-[rgba(216,227,247,0.45)]" />
          <div className="absolute -bottom-8 -left-4 h-44 w-44 rounded-full bg-[rgba(210,228,255,0.45)]" />
          <div className="relative z-[1] aspect-[3/4] overflow-hidden rounded-xl bg-line-soft shadow-[0_20px_60px_rgba(0,31,60,0.10),0_4px_24px_rgba(38,38,38,0.06)]">
            <img
              src="/assets/portrait.webp"
              alt="Beatrice Czekalla, Porträtaufnahme"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section aria-label="Eckdaten" className="mt-4 grid grid-cols-3 gap-6 pb-24 max-[960px]:grid-cols-1">
        {facts.map((f) => (
          <div
            key={f.num}
            className="group relative rounded-xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-navy hover:shadow-[0_8px_24px_rgba(15,30,60,0.08)]"
          >
            <span
              aria-hidden
              className="absolute right-[18px] top-[18px] inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy/5 text-navy transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-navy group-hover:text-white [&_svg]:size-3.5"
            >
              <IconArrowUpRight />
            </span>
            <div className="mb-1 text-[36px] font-bold tracking-[-1px] text-navy">{f.num}</div>
            <div className="text-sm text-text">{f.lbl}</div>
          </div>
        ))}
      </section>
    </Container>
  );
}
