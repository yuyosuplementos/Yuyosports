/**
 * Arma la URL publica de un objeto del bucket `media`.
 * En DB guardamos `image_path` (products/creatina-one-fit-500gr.webp), no la URL
 * completa: asi cambiar de proyecto Supabase no requiere un UPDATE masivo.
 */
export function storagePublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/media/${path}`;
}

export const PRODUCT_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
       <rect width="600" height="600" fill="#F2F2F2"/>
       <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
             font-family="sans-serif" font-size="34" font-weight="700" fill="#3C3C3C">
         YUYO SPORTS
       </text>
     </svg>`,
  );

/**
 * Formatos y tamaño que acepta el bucket `media`.
 *
 * Deben coincidir con `allowed_mime_types` y `file_size_limit` de la
 * migración 0006: si el navegador deja pasar algo que el bucket rechaza,
 * el error llega desde Storage y es mucho menos claro.
 */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Extensión para un mime admitido, o null si no lo está. */
export function extensionFor(mime: string): string | null {
  return EXTENSIONS[mime] ?? null;
}
