/**
 * Test : compression sharp + upload Supabase Storage.
 * Usage : node scripts/test-upload-image.mjs
 *
 * Prérequis dans backend/.env :
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_KEY=eyJ...   (service_role, pas anon)
 *   SUPABASE_BUCKET_NAME=restomanager
 */

import "dotenv/config";
import sharp from "sharp";
import { compressImage, uploadImage } from "../src/utils/uploadImage.js";

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `Variables manquantes dans .env : ${missing.join(", ")}\n` +
      "Crée un projet sur https://supabase.com → Storage → Settings API,\n" +
      "copie Project URL + service_role key, puis relance ce script."
  );
  process.exit(1);
}

const rawImage = await sharp({
  create: {
    width: 1600,
    height: 1200,
    channels: 3,
    background: { r: 230, g: 74, b: 25 },
  },
})
  .jpeg()
  .toBuffer();

console.log(`Image source : ${rawImage.length} octets`);

const compressed = await compressImage(rawImage);
console.log(
  `Après compression WebP : ${compressed.buffer.length} octets ` +
    `(${Math.round((compressed.buffer.length / rawImage.length) * 100)}%)`
);

const result = await uploadImage(rawImage, {
  folder: "tests",
  fileName: `plat-test-${Date.now()}`,
});

console.log("Upload OK :");
console.log({ url: result.url, path: result.path });

const response = await fetch(result.url);
console.log(`URL publique accessible : ${response.status} ${response.statusText}`);

if (!response.ok) {
  process.exitCode = 1;
  console.error(
    "L'upload a réussi mais l'URL n'est pas publique. " +
      "Vérifie que le bucket est public dans Supabase Storage."
  );
} else {
  console.log("OK");
}
