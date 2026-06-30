import { useEffect, useState } from "react";
import { getCourses } from "../lib/api";
import type { Course } from "../lib/types";
import { CourseCard } from "../components/CourseCard";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; courses: Course[] };

// Demo route: proves the full stack is wired — React + Tailwind render, the typed
// API client fetches /api/courses through the dev proxy, and loading/error/empty
// states are handled. This page is throwaway scaffolding, replaced by real screens.
export default function Home() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    getCourses()
      .then((courses) => {
        if (active) setState({ status: "ready", courses });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Unbekannter Fehler",
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">React-Grundgerüst steht</h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Vite + React + TypeScript + Tailwind v4 sind eingerichtet. Diese Demo-Seite
          ruft die bestehende API (
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">/api/courses</code>
          ) über den Dev-Proxy ab — die eigentlichen Seiten folgen aus dem Design.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Kurse aus der API</h2>

        {state.status === "loading" && <p className="text-neutral-500">Lade …</p>}

        {state.status === "error" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <p className="font-medium">API nicht erreichbar</p>
            <p className="mt-1 text-sm">{state.message}</p>
            <p className="mt-1 text-sm text-amber-700/80">
              Läuft das Backend auf Port 3042 und ist die Datenbank eingerichtet?
            </p>
          </div>
        )}

        {state.status === "ready" && state.courses.length === 0 && (
          <p className="text-neutral-500">Noch keine Kurse vorhanden.</p>
        )}

        {state.status === "ready" && state.courses.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
