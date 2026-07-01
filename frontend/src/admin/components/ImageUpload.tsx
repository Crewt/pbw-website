import { useRef, useState } from "react";
import { uploadFile } from "../../lib/api";
import { useToast } from "./ToastProvider";

type Shape = "rect" | "circle" | "portrait";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  shape?: Shape;
}

const SHAPE_CLASS: Record<Shape, string> = {
  rect: "h-20 w-28 rounded-md",
  circle: "h-20 w-20 rounded-full",
  portrait: "h-28 w-[84px] rounded-md",
};

export function ImageUpload({ value, onChange, shape = "rect" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const r = await uploadFile(file);
      onChange(r.url);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload fehlgeschlagen", "error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden border border-dashed border-line bg-bg-alt text-xs text-slate ${SHAPE_CLASS[shape]}`}
      >
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <span>Kein Bild</span>}
      </div>
      <div className="flex flex-col items-start gap-1.5">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button type="button" className="btn-ghost" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? "Lädt…" : value ? "Bild ersetzen" : "Bild wählen"}
        </button>
        {value && (
          <button type="button" className="text-sm text-red-700 hover:underline" onClick={() => onChange("")}>
            Entfernen
          </button>
        )}
      </div>
    </div>
  );
}
