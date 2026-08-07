import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Close, IconMail } from "../components/Icons";

// Reusable newsletter signup entry point. The actual signup happens entirely
// inside an externally hosted CleverReach form; we only embed it.
//
// Behaviour:
//  - No `url` (empty/undefined) → renders nothing. The button never shows an
//    empty state; enabling it later is purely a matter of filling the CMS field.
//  - The button is a real link (progressive enhancement): without JS it opens
//    the CleverReach form in a new tab. With JS, the click opens a modal that
//    embeds the form in an iframe.
//  - Privacy: the iframe is mounted only after the button is clicked, so
//    CleverReach cookies are set only when the visitor actively opens the form.
export function NewsletterSignup({ url }: { url?: string }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // ESC to close + lock body scroll while the modal is open. Focus the panel
  // on open for keyboard/screen-reader users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!url) return null;

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="btn-cta [&_svg]:size-3.5"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        <IconMail /> Zum Newsletter anmelden
      </a>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setOpen(false)}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="flex h-[85vh] max-h-[720px] w-full max-w-[560px] flex-col overflow-hidden rounded-xl bg-white shadow-elev outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <h2 id={titleId} className="text-[16px] font-bold text-ink">
                  Newsletter-Anmeldung
                </h2>
                <button
                  type="button"
                  className="icon-btn [&_svg]:size-4"
                  aria-label="Schließen"
                  onClick={() => setOpen(false)}
                >
                  <Close />
                </button>
              </div>
              <iframe
                src={url}
                title="Newsletter-Anmeldung"
                className="h-full w-full flex-1 border-0"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
