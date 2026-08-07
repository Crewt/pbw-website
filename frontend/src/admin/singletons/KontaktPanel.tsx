import { useEffect, useRef, useState } from "react";
import { useContent } from "../hooks/useContent";
import { useSingletonMutations } from "../hooks/useSingletons";
import { useToast } from "../components/ToastProvider";
import { PanelHeader, SavedFlag } from "../components/ui";

export function KontaktPanel() {
  const { data } = useContent();
  const { kontakt } = useSingletonMutations();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newsletterUrl, setNewsletterUrl] = useState("");
  const [saved, setSaved] = useState(false);
  // Once the user starts editing, background refetches (e.g. window focus) must
  // not clobber the in-progress input anymore.
  const dirty = useRef(false);

  useEffect(() => {
    if (data?.kontakt && !dirty.current) {
      setEmail(data.kontakt.email ?? "");
      setPhone(data.kontakt.phone ?? "");
      setNewsletterUrl(data.kontakt.newsletterFormularUrl ?? "");
    }
  }, [data]);

  async function handleSave() {
    try {
      await kontakt.mutateAsync({
        email: email.trim(),
        phone: phone.trim(),
        newsletterFormularUrl: newsletterUrl.trim(),
      });
      dirty.current = false;
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Speichern fehlgeschlagen", "error");
    }
  }

  return (
    <div>
      <PanelHeader title="Kontakt" description="E-Mail-Adresse, Telefonnummer und Newsletter-Formular für die Kontakt-Seite." />
      <div className="max-w-lg space-y-4 rounded-lg border border-line-soft bg-white p-6">
        <div>
          <label className="field-label">E-Mail-Adresse</label>
          <input
            type="email"
            className="field-input"
            placeholder="info@pbw-ta.de"
            value={email}
            onChange={(e) => {
              dirty.current = true;
              setEmail(e.target.value);
            }}
          />
        </div>
        <div>
          <label className="field-label">Telefonnummer</label>
          <input
            type="tel"
            className="field-input"
            placeholder="+49 (0) 261 671234"
            value={phone}
            onChange={(e) => {
              dirty.current = true;
              setPhone(e.target.value);
            }}
          />
        </div>
        <div>
          <label className="field-label">Newsletter-Anmeldung – CleverReach-Formular-URL</label>
          <input
            type="url"
            className="field-input"
            placeholder="https://…cleverreach.com/…"
            value={newsletterUrl}
            onChange={(e) => {
              dirty.current = true;
              setNewsletterUrl(e.target.value);
            }}
          />
          <p className="mt-1 text-xs text-slate">
            Link zum gehosteten CleverReach-Anmeldeformular. Leer lassen, um den Newsletter-Button
            auszublenden.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={handleSave} disabled={kontakt.isPending}>
            Speichern
          </button>
          <SavedFlag show={saved} />
        </div>
      </div>
    </div>
  );
}
