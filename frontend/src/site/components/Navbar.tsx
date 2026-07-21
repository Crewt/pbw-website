import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Container } from "./Container";
import { Menu, Close } from "./Icons";

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
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  // Close on Escape while the menu is open (mirrors admin Drawer).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-[20px] backdrop-saturate-[1.8]">
      <Container className="flex h-[72px] items-center justify-between">
        <NavLink to="/" className="inline-flex items-center">
          <img src="/assets/logo.webp" alt="PBW - Beatrice Czekalla" className="h-10 w-auto sm:h-[50px]" />
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

        <div className="flex items-center gap-2">
          <NavLink
            to="/kontakt"
            className="rounded-full bg-navy px-[26px] py-[11px] text-sm font-medium text-white transition hover:bg-navy-deep active:translate-y-px"
          >
            Kontakt
          </NavLink>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="-mr-1.5 inline-flex items-center justify-center p-1.5 text-text transition hover:text-navy min-[980px]:hidden"
          >
            {open ? <Close className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </Container>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-line bg-bg min-[980px]:hidden"
        >
          <Container className="flex flex-col py-2">
            {navLinks.map((l) => {
              const prefixActive = !!l.alsoActiveOn && pathname.startsWith(l.alsoActiveOn);
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `border-b border-line py-3 text-[15px] text-text transition last:border-b-0 hover:text-navy ${
                      isActive || prefixActive ? "font-semibold text-navy" : ""
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              );
            })}
          </Container>
        </nav>
      )}
    </header>
  );
}
