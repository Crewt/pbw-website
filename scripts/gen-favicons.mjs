// Generates the favicon set + web manifest + default OG image from the site
// logo (public/assets/logo.png) into public/. Run with: npm run favicons
//
// The logo is a wide wordmark ("PBW" + tagline) with a colourful cube mark on
// the left. A squished wordmark makes a poor favicon, so we extract + trim the
// cube for the icons; the full wordmark is used for the OG banner.

import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "public", "assets", "logo.png");
const OUT = path.join(ROOT, "public");

const BRAND = "#001f3c"; // navy — manifest theme colour
const BG = "#f9f9f9"; // site background — used where an opaque backdrop is needed
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

async function main() {
  const meta = await sharp(SRC).metadata();
  if (!meta.width || !meta.height) throw new Error(`Cannot read ${SRC}`);

  // Extract the left strip holding the cube mark (excludes the divider bar at
  // ~x175), then trim the surrounding transparency down to the cube itself.
  // (extract + trim must be separate pipelines — sharp miscomputes the area
  // when they are chained.)
  const stripW = Math.min(165, meta.width);
  const strip = await sharp(SRC)
    .extract({ left: 0, top: 0, width: stripW, height: meta.height })
    .png()
    .toBuffer();
  const cube = await sharp(strip).trim().png().toBuffer();

  const icon = (size, background = TRANSPARENT) =>
    sharp(cube).resize(size, size, { fit: "contain", background }).png().toBuffer();

  // Standard PNG icon sizes (transparent — the cube is colourful).
  const sizes = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "favicon-48x48.png": 48,
    "favicon-96x96.png": 96,
    "web-app-manifest-192x192.png": 192,
    "web-app-manifest-512x512.png": 512,
  };
  for (const [name, size] of Object.entries(sizes)) {
    await writeFile(path.join(OUT, name), await icon(size));
  }

  // apple-touch-icon: iOS ignores transparency, so flatten onto the site bg.
  const apple = await sharp(cube)
    .resize(160, 160, { fit: "contain", background: TRANSPARENT })
    .extend({ top: 10, bottom: 10, left: 10, right: 10, background: BG })
    .flatten({ background: BG })
    .png()
    .toBuffer();
  await writeFile(path.join(OUT, "apple-touch-icon.png"), apple);

  // favicon.ico bundling 16/32/48.
  const ico = await pngToIco([await icon(16), await icon(32), await icon(48)]);
  await writeFile(path.join(OUT, "favicon.ico"), ico);

  // favicon.svg: scalable container wrapping the 512 cube PNG (raster source).
  const b64 = (await icon(512)).toString("base64");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,${b64}"/></svg>\n`;
  await writeFile(path.join(OUT, "favicon.svg"), svg);

  // Default Open Graph image (1200x630): full wordmark centred on the light bg
  // (the wordmark text is dark navy and would vanish on a navy backdrop).
  const wordmark = await sharp(SRC)
    .resize(1000, 480, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();
  const og = await sharp({ create: { width: 1200, height: 630, channels: 4, background: BG } })
    .composite([{ input: wordmark, gravity: "centre" }])
    .png()
    .toBuffer();
  await writeFile(path.join(OUT, "og-default.png"), og);

  // Web app manifest.
  const manifest = {
    name: "PBW – Beatrice Czekalla",
    short_name: "PBW",
    icons: [
      { src: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: BRAND,
    background_color: BG,
    display: "standalone",
  };
  await writeFile(path.join(OUT, "site.webmanifest"), JSON.stringify(manifest, null, 2) + "\n");

  console.log("Favicons + manifest + og-default.png written to", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
