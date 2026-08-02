import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area, type Point } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { uploadFile } from "../../lib/api";
import { getCroppedBlob } from "./cropImage";
import { useToast } from "./ToastProvider";

type Shape = "rect" | "circle" | "portrait";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  shape?: Shape;
  /** Crop aspect ratio (w/h). Defaults per shape; override where the display differs. */
  aspect?: number;
}

const SHAPE_CLASS: Record<Shape, string> = {
  rect: "h-20 w-28 rounded-md",
  circle: "h-20 w-20 rounded-full",
  portrait: "h-28 w-[84px] rounded-md",
};

const SHAPE_ASPECT: Record<Shape, number> = {
  rect: 16 / 9,
  circle: 1,
  portrait: 3 / 4,
};

export function ImageUpload({ value, onChange, shape = "rect", aspect }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [src, setSrc] = useState<string | null>(null); // object URL currently being cropped
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const toast = useToast();

  const cropAspect = aspect ?? SHAPE_ASPECT[shape];

  // Revoke the active object URL if the component unmounts while the crop modal
  // is still open (closeModal handles the normal path).
  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [src]);

  function resetInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  async function uploadDirect(file: File) {
    // Vector/PDF stays as-is (cropping would rasterize it); server keeps the format.
    setBusy(true);
    try {
      const r = await uploadFile(file);
      onChange(r.url);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload fehlgeschlagen", "error");
    } finally {
      setBusy(false);
      resetInput();
    }
  }

  function pickFile(file: File | undefined) {
    if (!file) return;
    if (file.type === "image/svg+xml") {
      void uploadDirect(file);
      return;
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setArea(null);
    setSrc(URL.createObjectURL(file));
  }

  function closeModal() {
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
    resetInput();
  }

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setArea(areaPixels);
  }, []);

  async function confirmCrop() {
    if (!src || !area) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(src, area);
      const file = new File([blob], "crop.png", { type: "image/png" });
      const r = await uploadFile(file);
      onChange(r.url);
      closeModal();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Upload fehlgeschlagen", "error");
    } finally {
      setBusy(false);
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
          onChange={(e) => pickFile(e.target.files?.[0])}
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

      {src && (
        <CropModal
          src={src}
          crop={crop}
          zoom={zoom}
          aspect={cropAspect}
          round={shape === "circle"}
          busy={busy}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          onCancel={closeModal}
          onConfirm={confirmCrop}
        />
      )}
    </div>
  );
}

interface CropModalProps {
  src: string;
  crop: Point;
  zoom: number;
  aspect: number;
  round: boolean;
  busy: boolean;
  onCropChange: (p: Point) => void;
  onZoomChange: (z: number) => void;
  onCropComplete: (area: Area, areaPixels: Area) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

function CropModal({
  src,
  crop,
  zoom,
  aspect,
  round,
  busy,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onCancel,
  onConfirm,
}: CropModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="border-b border-line px-5 py-3 text-sm font-semibold text-ink">Bild zuschneiden</div>
        <div className="relative h-72 w-full bg-black/90">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={round ? "round" : "rect"}
            showGrid={!round}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="flex items-center gap-3 px-5 py-3">
          <span className="text-xs text-slate">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="flex-1"
            aria-label="Zoom"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
          <button type="button" className="btn-ghost" onClick={onCancel} disabled={busy}>
            Abbrechen
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm} disabled={busy}>
            {busy ? "Lädt…" : "Zuschneiden & hochladen"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
