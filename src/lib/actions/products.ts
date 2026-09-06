"use server";

import { assertAdmin } from "@/lib/auth/require-admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { productSchema } from "@/lib/schemas/product";
import { invalidate, FORBIDDEN, type ActionResult } from "./_shared";

export async function saveProductAction(input: unknown): Promise<ActionResult> {
  if (!(await assertAdmin())) return FORBIDDEN;

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const p = parsed.data;

  const row = {
    slug: p.slug,
    name: p.name,
    description: p.description,
    category_id: p.categoryId,
    brand_id: p.brandId,
    price: p.price,
    old_price: p.oldPrice ?? null,
    wholesale_price: p.wholesalePrice,
    flavors: p.flavors,
    image_path: p.imagePath,
    image_alt: p.imageAlt ?? p.name,
    is_offer: p.isOffer,
    is_out_of_stock: p.isOutOfStock,
    is_published: p.isPublished,
    sort_order: p.sortOrder,
  };

  const sb = await createServerSupabase();
  const { error } = p.id
    ? await sb.from("products").update(row).eq("id", p.id)
    : await sb.from("products").insert(row);

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ya existe un producto con ese slug." };
    return { ok: false, error: error.message };
  }

  invalidate("products");
  return { ok: true };
}

export async function toggleStockAction(id: string, isOutOfStock: boolean): Promise<ActionResult> {
  if (!(await assertAdmin())) return FORBIDDEN;
  const sb = await createServerSupabase();
  const { error } = await sb.from("products").update({ is_out_of_stock: isOutOfStock }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  invalidate("products");
  return { ok: true };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return FORBIDDEN;
  const sb = await createServerSupabase();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  invalidate("products");
  return { ok: true };
}
