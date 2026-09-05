import { unstable_cache } from "next/cache";
import { createPublicClient, hasSupabaseConfig } from "@/lib/supabase/public";
import type { Json } from "@/types/database";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { SETTINGS_KEYS, settingsSchemas, type SiteSettings } from "@/lib/schemas/settings";

/**
 * Lee las 8 filas de `settings` en una query y arma un objeto tipado.
 * Cada valor pasa por su schema Zod: si una fila esta corrupta o le falta un
 * campo, se cae al default en vez de romper el render de la home.
 */
export const getSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    // Sin credenciales el sitio renderiza con el contenido por defecto.
    if (!hasSupabaseConfig()) return DEFAULT_SETTINGS;
    const sb = createPublicClient();
    const { data, error } = await sb.from("settings").select("key, value");
    if (error) throw new Error(`getSettings: ${error.message}`);

    // Tipado explicito: `data ?? []` produce la union `Row[] | never[]`,
    // y .map() sobre esa union colapsa el parametro a `never`.
    const rows: Array<{ key: string; value: Json }> = data ?? [];
    const byKey = new Map(rows.map((r) => [r.key, r.value] as const));
    const out = {} as SiteSettings;

    for (const key of SETTINGS_KEYS) {
      const parsed = settingsSchemas[key].safeParse(byKey.get(key));
      // @ts-expect-error indexado por clave literal
      out[key] = parsed.success ? parsed.data : DEFAULT_SETTINGS[key];
    }
    return out;
  },
  ["settings:all"],
  { tags: ["settings"], revalidate: 3600 },
);
