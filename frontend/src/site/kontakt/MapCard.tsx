// Decorative map (no map API) — gradient base + stylised SVG streets/river/
// trees with a pin over Vallendar. Faithful port of the legacy CSS/SVG.
export function MapCard() {
  return (
    <div
      className="relative mt-6 aspect-[5/3] overflow-hidden rounded-xl border border-line bg-white"
      role="img"
      aria-label="Karte: Vallendar bei Koblenz"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.6),transparent_30%),radial-gradient(circle_at_65%_50%,rgba(193,220,182,0.4),transparent_40%),linear-gradient(135deg,#eef0ec_0%,#d9e2d4_100%)]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 300" preserveAspectRatio="none">
        <path d="M-20 130 Q150 100 280 160 T520 180" stroke="#ffffff" strokeWidth="6" fill="none" opacity="0.8" />
        <path d="M-20 200 Q120 220 250 200 T520 230" stroke="#ffffff" strokeWidth="4" fill="none" opacity="0.7" />
        <path d="M120 -20 Q140 100 180 200 T220 320" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.6" />
        <path d="M340 -20 Q330 100 370 220" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.5" />
        <path d="M-20 70 Q200 50 400 90 T520 60" stroke="#bcd8e8" strokeWidth="14" fill="none" opacity="0.7" />
        <circle cx="80" cy="240" r="14" fill="#b3c8a8" opacity="0.6" />
        <circle cx="430" cy="80" r="18" fill="#b3c8a8" opacity="0.5" />
        <circle cx="60" cy="60" r="10" fill="#b3c8a8" opacity="0.5" />
      </svg>
      <div className="absolute left-[38%] top-[42%] h-7 w-7 -translate-x-1/2 -translate-y-full rounded-full border-[3px] border-white bg-navy shadow-[0_4px_12px_rgba(0,31,60,0.3)] after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-x-[6px] after:border-t-[12px] after:border-x-transparent after:border-t-navy after:content-['']" />
      <div className="absolute bottom-3.5 left-3.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        Vallendar
      </div>
    </div>
  );
}
