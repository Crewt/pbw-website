import { useQuery } from "@tanstack/react-query";
import { Container } from "../components/Container";
import { ContactForm } from "./ContactForm";
import { ContactInfo } from "./ContactInfo";
import { MapCard } from "./MapCard";
import { NewsletterSignup } from "./NewsletterSignup";
import { getContent } from "../../lib/api";
import { Seo, SITE_NAME } from "../lib/Seo";

export function KontaktPage() {
  const { data } = useQuery({ queryKey: ["content"], queryFn: getContent });

  return (
    <>
      <Seo
        title={`Kontakt | ${SITE_NAME}`}
        description="Kontakt zu Beatrice Czekalla (PBW) – Psychologische Beratung & Weiterbildung. Nachricht schreiben oder Termin vereinbaren."
      />
      <section className="relative overflow-hidden bg-bg-alt pb-[72px] pt-24 text-center">
        <div className="absolute inset-0 bg-[url(/assets/contact-bg.jpg)] bg-cover bg-center opacity-30 saturate-[.85]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(243,244,244,0.4)_0%,rgba(243,244,244,0.95)_100%)]" />
        <div className="relative z-[1] mx-auto max-w-[760px] px-5 md:px-10">
          <h1 className="mb-4 text-[52px] font-bold leading-[1.05] tracking-[-1px] text-ink max-[900px]:text-[36px]">
            Kontakt &amp; Anfragen
          </h1>
          <p className="text-[18px] leading-[1.6] text-text">
            Ich freue mich über Ihr Interesse. Nutzen Sie das untenstehende Formular oder die direkten
            Kontaktinformationen, um ein erstes Gespräch für Beratung, Coaching oder Training zu vereinbaren.
          </p>
        </div>
      </section>

      <Container>
        <div className="mt-16 mb-24 grid grid-cols-[1.3fr_1fr] items-start gap-8 max-[900px]:grid-cols-1">
          <ContactForm />
          <div>
            <ContactInfo />
            <MapCard />
          </div>
        </div>

        {data?.kontakt.newsletterFormularUrl && (
          <div className="mb-24 rounded-xl border border-line bg-white p-8 text-center shadow-soft">
            <h2 className="mb-2 text-[22px] font-bold text-ink">Newsletter</h2>
            <p className="mx-auto mb-6 max-w-[560px] text-[16px] leading-[1.6] text-text">
              Bleiben Sie auf dem Laufenden zu Terminen, Seminaren und Angeboten – melden Sie sich
              für den Newsletter an.
            </p>
            <NewsletterSignup url={data.kontakt.newsletterFormularUrl} />
          </div>
        )}
      </Container>
    </>
  );
}
