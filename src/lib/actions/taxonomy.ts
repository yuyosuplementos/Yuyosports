"use server";

import { z } from "zod";
import { assertAdmin } from "@/lib/auth/require-admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";
import { invalidate, FORBIDDEN, type ActionResult } from "./_shared";

const taxonSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(40),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(1000).optional(),
});

type Table = "categories" | "brands";

export async function saveTaxonAction(table: Table, input: unknown): Promise<ActionResult> {
  if (!(await assertAdmin())) return FORBIDDEN;

  const parsed = taxonSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const t = parsed.data;
  const sb = await createServerSupabase();

  const base = { name: t.name, slug: slugify(t.name), is_active: t.isActive };
  const row = table === "categories" ? { ...base, sort_order: t.sortOrder ?? 100 } : base;

  const { error } = t.id
    ? await sb.from(table).update(row).eq("id", t.id)
    : await sb.from(table).insert(row);

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ya existe con ese nombre." };
    return { ok: false, error: error.message };
  }

  invalidate("taxonomy", "products");
  return { ok: true };
}

export async function deleteTaxonAction(table: Table, id: number): Promise<ActionResult> {
  if (!(await assertAdmin())) return FORBIDDEN;
  const sb = await createServerSupabase();
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) {
    // on delete restrict: la FK protege los productos existentes.
    if (error.code === "23503") {
      return { ok: false, error: "No se puede borrar: tiene productos asociados." };
    }
    return { ok: false, error: error.message };
  }
  invalidate("taxonomy", "products");
  return { ok: true };
}
