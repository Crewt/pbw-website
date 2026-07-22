const MAPS_QUERY = encodeURIComponent("Düppelstraße 9c, 56179 Vallendar");

export function MapCard() {
  return (
    <div className="relative mt-6 aspect-[5/3] overflow-hidden rounded-xl border border-line bg-white">
      <iframe
        src={`https://www.google.com/maps?q=${MAPS_QUERY}&output=embed&hl=de&z=15`}
        title="Karte: Düppelstraße 9c, 56179 Vallendar"
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
