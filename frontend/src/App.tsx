import { Outlet } from "react-router-dom";

// Root layout of the SPA. The header is a placeholder — real navigation and the
// actual pages follow later from the Figma design.
export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-baseline gap-2 px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">PBW</span>
          <span className="text-sm text-neutral-500">Frontend-Grundgerüst</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
