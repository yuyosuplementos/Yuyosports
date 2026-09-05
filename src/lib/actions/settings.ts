"use server";

import { assertAdmin } from "@/lib/auth/require-admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { settingsSchemas, type SettingsKey } from "@/lib/schemas/settings";
import { invalidate, FORBIDDEN, type ActionResult } from "./_shared";

/**
 * Guarda UNA seccion de contenido.
 *
 * El panel viejo tenia un unico form que escribia los 7 documentos de config
 * secuencialmente sin transaccion: si el cuarto fallaba, los tres anteriores
 * ya estaban guardados y el usuario solo veia un alert(). Ahora cada seccion
 * es un formulario independiente con su propio schema.
 */
export async function saveSettingsAction(key: SettingsKey, value: unknown): Promise<ActionResult> {
  if (!(await assertAdmin())) return FORBIDDEN;

  const schema = settingsSchemas[key];
  if (!schema) return { ok: false, error: `Sección desconocida: ${key}` };

  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const sb = await createServerSupabase();
  const { error } = await sb
    .from("settings")
    .upsert({ key, value: parsed.data, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) return { ok: false, error: error.message };

  invalidate("settings");
  return { ok: true };
}
