import { Link } from "react-router-dom";
import { Container } from "../../components/Container";

export function Hero() {
  return (
    <section className="relative flex min-h-[560px] items-center overflow-hidden bg-bg-alt">
      <div className="absolute inset-0">
        <img src="/assets/hero4.webp" alt="Ruhiger Beratungsraum" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(249,249,249,0.92)_0%,rgba(249,249,249,0.72)_38%,rgba(249,249,249,0.25)_70%,rgba(249,249,249,0)_100%)]" />
      </div>
      <Container className="relative z-[1] py-[72px]">
        <span className="kicker">Psychologische Beratung &amp; Weiterbildung</span>
        <h1 className="mt-4 mb-5 max-w-[640px] text-[52px] font-bold leading-[1.06] tracking-[-1.2px] text-ink max-[960px]:text-[40px] max-[640px]:text-[32px]">
          Wachstum durch bewusste Veränderung
        </h1>
        <p className="mb-9 max-w-[600px] text-[18px] leading-[1.65] text-text">
          Erweitern Sie Ihre Handlungsoptionen und Ihr Handwerkszeug - durch Reflexionsanregungen, ein offenes Ohr
          und Einbringen einer Metaperspektive.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/kurstermine" className="btn-cta">
            Zu den Kursterminen
          </Link>
        </div>
      </Container>
    </section>
  );
}
