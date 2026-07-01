// Produces a cropped image Blob from a source object URL and the pixel crop box
// reported by react-easy-crop. Output is PNG (keeps transparency for logos); the
// server re-encodes to WebP, so this isn't double-lossy. The longest edge is
// capped at MAX_EDGE so large crops stay well under the 10 MB upload limit.

const MAX_EDGE = 2000;

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Bild konnte nicht geladen werden."));
    img.src = src;
  });
}

export async function getCroppedBlob(src: string, crop: PixelCrop): Promise<Blob> {
  const img = await loadImage(src);

  const scale = Math.min(1, MAX_EDGE / Math.max(crop.width, crop.height));
  const outW = Math.max(1, Math.round(crop.width * scale));
  const outH = Math.max(1, Math.round(crop.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas nicht verfügbar.");

  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, outW, outH);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Zuschnitt fehlgeschlagen."))),
      "image/png"
    );
  });
}
