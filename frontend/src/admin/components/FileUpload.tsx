import { useRef, useState } from "react";
import { uploadFile } from "../../lib/api";
import type { RessourceFile } from "../../lib/types";
import { useToast } from "./ToastProvider";

interface FileUploadProps {
  value: RessourceFile | null;
  onChange: (v: RessourceFile | null) => void;
}

export function FileUpload({ value, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const r = await uploadFile(file);
      onChange({ name: file.name, url: r.url });
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload fehlgeschlagen", "error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button type="button" className="btn-ghost" onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? "Lädt…" : value ? "Datei ersetzen" : "Datei wählen"}
      </button>
      {value && (
        <span className="flex items-center gap-2 text-sm text-slate">
          <span className="max-w-[220px] truncate">{value.name}</span>
          <button type="button" className="text-red-700 hover:underline" onClick={() => onChange(null)}>
            Entfernen
          </button>
        </span>
      )}
    </div>
  );
}
