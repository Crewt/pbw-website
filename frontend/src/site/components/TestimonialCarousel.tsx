import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "./Icons";

const arrowCls =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white text-navy transition hover:border-navy hover:shadow-soft active:scale-95 [&_svg]:size-[18px]";

// One-slide-per-view carousel: 6s autoplay (paused on hover), wrap-around,
// prev/next arrows and dot indicators. Mirrors the vanilla script in the
// legacy MainPage.html. The track transform is the only runtime style.
export function TestimonialCarousel({
  slides,
  autoplayMs = 6000,
}: {
  slides: ReactNode[];
  autoplayMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const hovering = useRef(false);

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  useEffect(() => {
    if (!autoplayMs || count <= 1) return;
    const id = window.setInterval(() => {
      if (!hovering.current) setIndex((i) => (i + 1) % count);
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayMs, count]);

  return (
    <div
      className="relative min-w-0"
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-[550ms] ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="flex w-full shrink-0 grow-0 basis-full">
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7 flex items-center justify-start gap-4">
        <button type="button" className={arrowCls} aria-label="Vorheriges Testimonial" onClick={() => go(-1)}>
          <ChevronLeft />
        </button>
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Zu Stimme ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className="group flex h-6 w-6 items-center justify-center rounded-full"
            >
              <span
                className={`h-2 w-2 rounded-full transition ${
                  i === index ? "scale-[1.3] bg-navy" : "bg-navy/20 group-hover:bg-navy/40"
                }`}
              />
            </button>
          ))}
        </div>
        <button type="button" className={arrowCls} aria-label="Nächstes Testimonial" onClick={() => go(1)}>
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
