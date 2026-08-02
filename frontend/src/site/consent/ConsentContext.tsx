import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

// Single-category consent for the external Google media we embed: Google Fonts
// (site-wide) and the Google Maps iframe (Kontakt page). Both transmit the
// visitor's IP to Google, so under TTDSG/GDPR they may only load after an
// explicit opt-in. Storing the choice itself is strictly necessary (exempt).

export type ConsentChoice = "granted" | "denied";
export type ConsentStatus = "unknown" | ConsentChoice;

const STORAGE_KEY = "pbw_consent";
const CONSENT_VERSION = 1; // bump to re-prompt everyone after a policy change
const FONTS_HREF = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
const FONTS_LINK_ID = "google-fonts-inter";

interface ConsentValue {
  status: ConsentStatus;
  grant: () => void;
  deny: () => void;
  reopen: () => void; // re-show the banner (e.g. "Cookie-Einstellungen" in the footer)
}

const ConsentContext = createContext<ConsentValue | null>(null);

function readStored(): ConsentStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return "unknown";
    const parsed = JSON.parse(raw) as { v?: number; choice?: string };
    if (parsed?.v !== CONSENT_VERSION) return "unknown";
    return parsed.choice === "granted" ? "granted" : parsed.choice === "denied" ? "denied" : "unknown";
  } catch {
    return "unknown";
  }
}

// Inject the Google Fonts stylesheet that we deliberately keep out of index.html
// until consent. Idempotent — safe under StrictMode double-invoke and re-renders.
function loadGoogleFonts(): void {
  if (typeof document === "undefined" || document.getElementById(FONTS_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONTS_LINK_ID;
  link.rel = "stylesheet";
  link.href = FONTS_HREF;
  document.head.appendChild(link);
}

// Remove the injected stylesheet again when consent is withdrawn (deny/reopen),
// so no further requests reach Google. Idempotent — safe if nothing was loaded.
function unloadGoogleFonts(): void {
  if (typeof document === "undefined") return;
  document.getElementById(FONTS_LINK_ID)?.remove();
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>("unknown");

  // Restore the persisted choice on mount (client only).
  useEffect(() => {
    setStatus(readStored());
  }, []);

  // Load the Google Fonts stylesheet as soon as consent is (or becomes) granted,
  // and remove it again on withdrawal (deny/reopen) — symmetric to MapCard, which
  // stops rendering the Maps iframe once status is no longer "granted".
  useEffect(() => {
    if (status === "granted") loadGoogleFonts();
    else unloadGoogleFonts();
  }, [status]);

  const persist = useCallback((choice: ConsentChoice) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: CONSENT_VERSION, choice, ts: Date.now() }));
    } catch {
      /* storage blocked (private mode) — keep the choice in memory for this session */
    }
    setStatus(choice);
  }, []);

  const grant = useCallback(() => persist("granted"), [persist]);
  const deny = useCallback(() => persist("denied"), [persist]);
  const reopen = useCallback(() => setStatus("unknown"), []);

  return <ConsentContext.Provider value={{ status, grant, deny, reopen }}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within a ConsentProvider");
  return ctx;
}
