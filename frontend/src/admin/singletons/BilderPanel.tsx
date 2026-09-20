import { useEffect, useRef, useState } from "react";
import { useContent } from "../hooks/useContent";
import { useSingletonMutations } from "../hooks/useSingletons";
import { useToast } from "../components/ToastProvider";
import { PanelHeader, SavedFlag } from "../components/ui";
import { ImageUpload } from "../components/ImageUpload";
import type { Bilder } from "../../lib/types";

const FIELDS: { key: keyof Bilder; label: string; hint: string; aspect: number }[] = [
  { key: "hero", label: "Startseite – Titelbild", hint: "Breitformat (16:9) empfohlen.", aspect: 16 / 9 },
  {
    key: "headerBg",
    label: "Dezenter Hintergrund",
    hint: "Erscheint blass im Hintergrund auf mehreren Seiten (Über mich, Kurstermine, Seminare, Empfehlungen). Breitformat (16:9) empfohlen.",
    aspect: 16 / 9,
  },
  { key: "kurstermineUnten", label: "Kurstermine – Bild unten", hint: "Breites Banner (21:9) empfohlen.", aspect: 21 / 9 },
  { key: "contactBg", label: "Kontaktseite – Hintergrund", hint: "Breitformat (16:9) empfohlen.", aspect: 16 / 9 },
];

export function BilderPanel() {
  const { data } = useContent();
  const { bilder } = useSingletonMutations();
  const toast = useToast();

  return (
    <div>
      <PanelHeader
        title="Bilder"
        description="Feste Hintergrund- und Titelbilder der Website. Ohne eigenes Bild wird das aktuelle Standardbild angezeigt."
      />
      <div className="max-w-lg space-y-6 rounded-lg border border-line-soft bg-white p-6">
        {FIELDS.map((f) => (
          <BilderField
            key={f.key}
            label={f.label}
            hint={f.hint}
            aspect={f.aspect}
            value={data?.bilder?.[f.key] ?? ""}
            onSave={(url) => bilder.mutateAsync({ [f.key]: url })}
            onError={(e) => toast(e instanceof Error ? e.message : "Speichern fehlgeschlagen", "error")}
          />
        ))}
      </div>
    </div>
  );
}

interface BilderFieldProps {
  label: string;
  hint: string;
  aspect: number;
  value: string;
  onSave: (url: string) => Promise<unknown>;
  onError: (e: unknown) => void;
}

function BilderField({ label, hint, aspect, value, onSave, onError }: BilderFieldProps) {
  const [image, setImage] = useState(value);
  const [saved, setSaved] = useState(false);
  // Once this field's image is picked, background refetches must not clobber
  // the local state before the save round-trip lands.
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) setImage(value);
  }, [value]);

  async function handleChange(url: string) {
    dirty.current = true;
    setImage(url);
    try {
      await onSave(url);
      dirty.current = false;
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      onError(e);
    }
  }

  return (
    <div>
      <label className="field-label">{label}</label>
      <ImageUpload value={image} onChange={handleChange} shape="rect" aspect={aspect} />
      <p className="mt-1 text-xs text-slate">{hint} Wird nach dem Zuschneiden automatisch gespeichert.</p>
      <div className="mt-1 flex items-center gap-3">
        <SavedFlag show={saved} />
      </div>
    </div>
  );
}
