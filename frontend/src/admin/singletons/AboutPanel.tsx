import { useEffect, useRef, useState } from "react";
import { useContent } from "../hooks/useContent";
import { useSingletonMutations } from "../hooks/useSingletons";
import { useToast } from "../components/ToastProvider";
import { PanelHeader, SavedFlag } from "../components/ui";
import { ImageUpload } from "../components/ImageUpload";

export function AboutPanel() {
  const { data } = useContent();
  const { about } = useSingletonMutations();
  const toast = useToast();
  const [image, setImage] = useState("");
  const [saved, setSaved] = useState(false);
  // Once the user picked a new image, background refetches (e.g. window focus
  // after the file dialog) must not clobber the local state anymore.
  const dirty = useRef(false);

  useEffect(() => {
    if (data?.about && !dirty.current) setImage(data.about.image ?? "");
  }, [data]);

  // Auto-save: persist immediately when the upload/crop finishes (or the
  // image is removed), so no separate "Speichern" click is needed.
  async function handleChange(url: string) {
    dirty.current = true;
    setImage(url);
    try {
      await about.mutateAsync({ image: url });
      dirty.current = false;
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Speichern fehlgeschlagen", "error");
    }
  }

  return (
    <div>
      <PanelHeader title="Über mich" description="Das Porträtbild für die „Über mich“-Seite." />
      <div className="max-w-lg space-y-4 rounded-lg border border-line-soft bg-white p-6">
        <div>
          <label className="field-label">Porträtbild</label>
          <ImageUpload value={image} onChange={handleChange} shape="portrait" />
          <p className="mt-1 text-xs text-slate">
            Hochformat (3:4) empfohlen. JPG oder PNG. Wird nach dem Zuschneiden automatisch gespeichert.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SavedFlag show={saved} />
        </div>
      </div>
    </div>
  );
}
