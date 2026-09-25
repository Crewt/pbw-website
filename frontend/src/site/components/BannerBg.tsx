// Shared background for the page-header banners (image + white veil), so every
// banner uses the same image visibility. `fade` is the RGB of the colour the
// banner fades into — the section's own background.
export function BannerBg({ image, fade = "243,244,244" }: { image: string; fade?: string }) {
  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45"
        style={{ backgroundImage: `url(${JSON.stringify(image)})` }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(${fade},0.3) 0%, rgba(${fade},0.8) 100%)` }}
      />
    </>
  );
}
