import { NavLink, Outlet } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useLogout } from "./auth/useAuth";
import { useCourses } from "./hooks/useCourses";
import { useContent } from "./hooks/useContent";
import { resetSeed } from "../lib/api";
import { useToast } from "./components/ToastProvider";

interface NavItem {
  to: string;
  label: string;
  count?: number;
}

export function AdminLayout() {
  const logoutM = useLogout();
  const toast = useToast();
  const qc = useQueryClient();
  const { data: courses } = useCourses();
  const { data: content } = useContent();

  const contentGroup: NavItem[] = [
    { to: "kurse", label: "Kurse", count: courses?.length },
    { to: "kollegen", label: "Kolleg:innen", count: content?.kollegen.length },
    { to: "zertifikate", label: "Zertifikate & Institute", count: content?.zertifikate.length },
    { to: "referenzen", label: "Referenzen", count: content?.referenzen.length },
    { to: "ressourcen", label: "Weiterführende Ressourcen", count: content?.ressourcen.length },
  ];
  const pagesGroup: NavItem[] = [
    { to: "ueber-mich", label: "Über mich" },
    { to: "bilder", label: "Bilder" },
    { to: "kontakt", label: "Kontakt" },
  ];

  async function handleReset() {
    if (!window.confirm("Alle Inhalte (Kurse, Kolleg:innen, …) auf die Beispieldaten zurücksetzen?")) return;
    try {
      await resetSeed();
      await qc.invalidateQueries();
      toast("Beispieldaten wiederhergestellt");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Zurücksetzen fehlgeschlagen", "error");
    }
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-30 flex h-16 items-center justify-between bg-navy px-6 text-white">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold">PBW · Beatrice Czekalla</span>
          <span className="text-xs text-white/60">Admin · CMS</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" rel="noreferrer" className="text-sm text-white/80 hover:text-white">
            Website ansehen
          </a>
          <button
            type="button"
            onClick={() => logoutM.mutate()}
            className="rounded-md border border-white/30 px-3 py-1.5 text-sm transition hover:bg-white/10"
          >
            Abmelden
          </button>
        </div>
      </nav>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-8 md:grid-cols-[248px_1fr]">
        <aside className="space-y-6">
          <NavGroup title="Inhalte" items={contentGroup} />
          <NavGroup title="Seiten" items={pagesGroup} />
          <button type="button" onClick={handleReset} className="btn-ghost w-full">
            Beispieldaten zurücksetzen
          </button>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavGroup({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div>
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate">{title}</p>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                  isActive ? "bg-navy text-white" : "text-text hover:bg-bg-alt hover:text-navy"
                }`
              }
            >
              <span>{it.label}</span>
              {typeof it.count === "number" && (
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{it.count}</span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
