import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (data?.about) setImage(data.about.image ?? "");
  }, [data]);

  async function handleSave() {
    try {
      await about.mutateAsync({ image });
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
          <ImageUpload value={image} onChange={setImage} shape="portrait" />
          <p className="mt-1 text-xs text-slate">Hochformat (3:4) empfohlen. JPG oder PNG.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={handleSave} disabled={about.isPending}>
            Speichern
          </button>
          <SavedFlag show={saved} />
        </div>
      </div>
    </div>
  );
}
