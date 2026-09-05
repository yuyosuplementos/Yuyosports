import "server-only";
import { updateTag } from "next/cache";

export type ActionResult = { ok: true } | { ok: false; error: string };

export const FORBIDDEN: ActionResult = {
  ok: false,
  error: "No tenés permisos para hacer esto.",
};

/**
 * Invalida el cache tras una escritura del panel.
 *
 * updateTag (no revalidateTag) porque queremos read-your-own-writes: el dueño
 * guarda un precio y lo ve en la primera recarga, no en la segunda.
 * revalidateTag con profile 'max' serviría contenido stale una vez más.
 */
export function invalidate(...tags: Array<"products" | "settings" | "taxonomy">) {
  for (const t of tags) updateTag(t);
}
