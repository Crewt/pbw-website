import { useConsent } from "../consent/ConsentContext";
import { ADDRESS_LINE } from "../lib/address";

const address = ADDRESS_LINE;
const mapsQuery = encodeURIComponent(address);

export function MapCard() {
  const { status, grant } = useConsent();

  // Google Maps transmits the visitor's IP to Google, so the iframe only loads
  // once external Google media are consented to. Before that we show a
  // placeholder with the address and a button that grants consent + loads it.
  if (status !== "granted") {
    return (
      <div className="relative mt-6 flex aspect-[5/3] flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-line bg-bg-alt p-6 text-center">
        <p className="text-[15px] font-medium text-ink">{address}</p>
        <p className="max-w-[360px] text-[13px] leading-[1.5] text-text">
          Die Karte wird von Google Maps geladen. Dabei werden Daten an Google übertragen – daher zeigen wir sie erst
          nach Ihrer Zustimmung.
        </p>
        <button type="button" onClick={grant} className="btn-primary">
          Karte laden
        </button>
      </div>
    );
  }

  return (
    <div className="relative mt-6 aspect-[5/3] overflow-hidden rounded-xl border border-line bg-white">
      <iframe
        src={`https://www.google.com/maps?q=${mapsQuery}&output=embed&hl=de&z=15`}
        title={`Karte: ${address}`}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
