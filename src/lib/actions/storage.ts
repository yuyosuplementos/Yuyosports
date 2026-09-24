"use server";

import { assertAdmin } from "@/lib/auth/require-admin";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Devuelve una signed URL para subir una imagen DIRECTO al bucket.
 *
 * Por que no mandar el archivo por FormData a una Server Action: en Vercel el
 * body de una funcion serverless topea en 4.5 MB, y las fotos del catalogo
 * viejo llegan a 4.3 MB. Fallaria justo en los productos con la foto mas
 * grande, con un error opaco de plataforma. Subiendo directo al Storage el
 * archivo no pasa por Vercel.
 */
export async function createSignedUploadUrlAction(
  kind: "products" | "settings",
  slug: string,
): Promise<{ ok: true; path: string; token: string } | { ok: false; error: string }> {
  if (!(await assertAdmin())) return { ok: false, error: "Sin permisos." };

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return { ok: false, error: "Slug inválido." };
  }

  // El path SIEMPRE lleva timestamp, tambien en products.
  //
  // Sobrescribir `products/<slug>.webp` no alcanzaba: la URL publica no
  // cambia, y next/image cachea el resultado optimizado con
  // minimumCacheTTL = 1 año. La imagen nueva se subia bien, pero tanto la
  // tienda como la vista previa del panel seguian mostrando la vieja, asi
  // que parecia que editar la imagen no funcionaba. Con el path versionado
  // la URL es inmutable y el cache largo deja de ser un problema.
  const path = `${kind}/${slug}-${Date.now()}.webp`;

  const sb = await createServerSupabase();
  const { data, error } = await sb.storage.from("media").createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: error?.message ?? "No se pudo firmar la subida." };

  return { ok: true, path: data.path, token: data.token };
}

export async function deleteImageAction(path: string): Promise<{ ok: boolean }> {
  if (!(await assertAdmin())) return { ok: false };
  const sb = await createServerSupabase();
  await sb.storage.from("media").remove([path]);
  return { ok: true };
}
