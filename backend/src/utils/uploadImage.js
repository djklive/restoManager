import { randomUUID } from "crypto";
import path from "path";
import sharp from "sharp";
import { getSupabaseAdmin, getSupabaseConfig } from "../config/supabase.js";
import { AppError } from "./AppError.js";

const DEFAULT_MAX_WIDTH = 1200;
const DEFAULT_QUALITY = 75;

/**
 * Compresse et redimensionne une image (low-data).
 * @param {Buffer} buffer
 * @param {{ maxWidth?: number, quality?: number }} [options]
 * @returns {Promise<{ buffer: Buffer, contentType: string, extension: string }>}
 */
export const compressImage = async (buffer, options = {}) => {
  const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
  const quality = options.quality ?? DEFAULT_QUALITY;

  try {
    const compressed = await sharp(buffer)
      .rotate()
      .resize({
        width: maxWidth,
        height: maxWidth,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    return {
      buffer: compressed,
      contentType: "image/webp",
      extension: "webp",
    };
  } catch {
    throw new AppError(
      400,
      "INVALID_IMAGE",
      "Le fichier fourni n'est pas une image valide"
    );
  }
};

const ensureBucketExists = async (supabase, bucketName) => {
  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();

  if (listError) {
    throw new AppError(
      500,
      "STORAGE_ERROR",
      `Impossible de lister les buckets: ${listError.message}`
    );
  }

  const exists = buckets?.some((bucket) => bucket.name === bucketName);

  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket(
      bucketName,
      {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
      }
    );

    if (createError && !createError.message?.includes("already exists")) {
      throw new AppError(
        500,
        "STORAGE_ERROR",
        `Impossible de créer le bucket: ${createError.message}`
      );
    }
  }
};

/**
 * Upload générique (plats, QR codes, logos…).
 * @param {Buffer} fileBuffer
 * @param {{
 *   folder?: string,
 *   fileName?: string,
 *   maxWidth?: number,
 *   quality?: number,
 *   skipCompression?: boolean,
 *   contentType?: string,
 *   extension?: string,
 * }} [options]
 * @returns {Promise<{ url: string, path: string }>}
 */
export const uploadImage = async (fileBuffer, options = {}) => {
  if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
    throw new AppError(400, "INVALID_IMAGE", "Aucun fichier image fourni");
  }

  const { bucketName } = getSupabaseConfig();
  const supabase = getSupabaseAdmin();
  await ensureBucketExists(supabase, bucketName);

  let payload = {
    buffer: fileBuffer,
    contentType: options.contentType ?? "application/octet-stream",
    extension: options.extension ?? "bin",
  };

  if (!options.skipCompression) {
    payload = await compressImage(fileBuffer, {
      maxWidth: options.maxWidth,
      quality: options.quality,
    });
  }

  const folder = options.folder?.replace(/^\/+|\/+$/g, "") || "uploads";
  const baseName =
    options.fileName?.replace(/\.[^.]+$/, "") ||
    `${Date.now()}-${randomUUID()}`;
  const objectPath = path.posix.join(
    folder,
    `${baseName}.${payload.extension}`
  );

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(objectPath, payload.buffer, {
      contentType: payload.contentType,
      upsert: true,
    });

  if (uploadError) {
    throw new AppError(
      500,
      "STORAGE_ERROR",
      `Échec de l'upload: ${uploadError.message}`
    );
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(objectPath);

  if (!data?.publicUrl) {
    throw new AppError(
      500,
      "STORAGE_ERROR",
      "Impossible de récupérer l'URL publique"
    );
  }

  return {
    url: data.publicUrl,
    path: objectPath,
  };
};
