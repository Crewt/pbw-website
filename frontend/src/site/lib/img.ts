// Normalise a stored image path to an absolute web URL.
// "assets/x.png" -> "/assets/x.png"; "/uploads/y" and "http…" pass through.
export function resolveImg(src: string): string {
  if (!src) return "";
  return src.startsWith("/") || src.startsWith("http") ? src : `/${src}`;
}
