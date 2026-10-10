import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Container } from "../components/Container";
import { BannerBg } from "../components/BannerBg";
import { ContactInfo } from "./ContactInfo";
import { MapCard } from "./MapCard";
import { NewsletterSignup } from "./NewsletterSignup";
import { getContent } from "../../lib/api";
import { Seo } from "../lib/Seo";
import { ADDRESS_LINE } from "../lib/address";

const FALLBACK_CONTACT_BG = "/assets/contact-bg.jpg";


// The form pulls in react-hook-form + zod (~⅓ of the bundle); load it only on
// this page instead of shipping it to every visitor.
const ContactForm = lazy(() => import("./ContactForm").then((m) => ({ default: m.ContactForm })));

// Same box as the form, reserving its height so the page doesn't jump when the
// chunk arrives.
function ContactFormPlaceholder() {
  return (
    <div className="min-h-[760px] rounded-xl border border-line bg-white p-10 shadow-soft max-[900px]:p-6">
      <h2 className="mb-8 text-[24px] font-bold text-ink">Schreiben Sie mir</h2>
    </div>
  );
}

export function KontaktPage() {
  const { data } = useQuery({ queryKey: ["content"], queryFn: getContent });
  const contactBg = data?.bilder?.contactBg || FALLBACK_CONTACT_BG;

  return (
    <>
      <Seo
        title="Kontakt – PBW Beatrice Czekalla in Vallendar bei Koblenz"
        description={`Kontakt zu Beatrice Czekalla (PBW), ${ADDRESS_LINE}: Nachricht schreiben, anrufen oder ein Erstgespräch vereinbaren.`}
      />
      <section className="relative overflow-hidden bg-bg-alt pb-[72px] pt-24 text-center">
        <BannerBg image={contactBg} />
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
          <Suspense fallback={<ContactFormPlaceholder />}>
            <ContactForm />
          </Suspense>
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
