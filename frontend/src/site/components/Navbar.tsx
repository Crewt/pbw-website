import { NavLink, useLocation } from "react-router-dom";
import { Container } from "./Container";

// Migrated pages use client-side routing; Empfehlungen is still legacy static
// HTML, linked directly so the site stays navigable.
const navLinks: { to: string; label: string; end?: boolean; alsoActiveOn?: string }[] = [
  { to: "/", label: "Home", end: true },
  { to: "/ueber-mich", label: "Über mich" },
  { to: "/kurstermine", label: "Kurstermine", alsoActiveOn: "/seminar" },
  { to: "/empfehlungen", label: "Empfehlungen" },
];

const linkBase =
  "border-b-[1.5px] border-transparent py-1.5 text-[15px] text-text transition hover:text-navy";
const linkActive = "border-navy font-semibold text-navy";

export function Navbar() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-[20px] backdrop-saturate-[1.8]">
      <Container className="flex h-[72px] items-center justify-between">
        <NavLink to="/" className="inline-flex items-center">
          <img src="/assets/logo.png" alt="PBW - Beatrice Czekalla" className="h-10 w-auto sm:h-[50px]" />
        </NavLink>

        <nav className="hidden items-center gap-7 min-[980px]:flex">
          {navLinks.map((l) => {
            const prefixActive = !!l.alsoActiveOn && pathname.startsWith(l.alsoActiveOn);
            return (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => `${linkBase} ${isActive || prefixActive ? linkActive : ""}`}
              >
                {l.label}
              </NavLink>
            );
          })}
        </nav>

        <NavLink
          to="/kontakt"
          className="rounded-full bg-navy px-[26px] py-[11px] text-sm font-medium text-white transition hover:bg-navy-deep active:translate-y-px"
        >
          Kontakt
        </NavLink>
      </Container>
    </header>
  );
}
