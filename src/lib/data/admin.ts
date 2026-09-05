import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Product, Taxon } from "@/types/domain";

/**
 * Lecturas del panel: sin cache y con el cliente con sesion, para que la RLS
 * aplique y el admin vea tambien los borradores (is_published = false).
 */

const SELECT = `
  id, slug, name, description, price, old_price, wholesale_price, flavors,
  image_path, image_alt, is_gym, is_offer, is_out_of_stock, is_published, sort_order,
  category:categories!inner(id, slug, name),
  brand:brands!inner(id, slug, name)
`;

export interface AdminProduct extends Product {
  isPublished: boolean;
}

type Rel = { id: number; slug: string; name: string };
const one = (v: Rel | Rel[]): Rel => (Array.isArray(v) ? v[0] : v);

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const sb = await createServerSupabase();
  const { data, error } = await sb
    .from("products")
    .select(SELECT)
    .order("sort_order")
    .order("name");
  if (error) throw new Error(error.message);

  type Row = Record<string, unknown>;
  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    name: r.name as string,
    description: (r.description as string) ?? "",
    category: one(r.category as Rel | Rel[]),
    brand: one(r.brand as Rel | Rel[]),
    price: r.price as number,
    oldPrice: (r.old_price as number | null) ?? null,
    wholesalePrice: r.wholesale_price as number,
    flavors: (r.flavors as string[] | null) ?? [],
    imagePath: (r.image_path as string | null) ?? null,
    imageAlt: (r.image_alt as string | null) ?? null,
    isGym: r.is_gym as boolean,
    isOffer: r.is_offer as boolean,
    isOutOfStock: r.is_out_of_stock as boolean,
    isPublished: r.is_published as boolean,
    sortOrder: r.sort_order as number,
  }));
}

export async function getAdminTaxonomy(): Promise<{
  categories: (Taxon & { sortOrder: number; isActive: boolean })[];
  brands: (Taxon & { isActive: boolean })[];
}> {
  const sb = await createServerSupabase();
  const [cats, brands] = await Promise.all([
    sb.from("categories").select("id, slug, name, sort_order, is_active").order("sort_order"),
    sb.from("brands").select("id, slug, name, is_active").order("name"),
  ]);
  if (cats.error) throw new Error(cats.error.message);
  if (brands.error) throw new Error(brands.error.message);

  return {
    categories: (cats.data ?? []).map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      sortOrder: c.sort_order,
      isActive: c.is_active,
    })),
    brands: (brands.data ?? []).map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      isActive: b.is_active,
    })),
  };
}

export async function getAdminStats() {
  const sb = await createServerSupabase();
  const { data } = await sb.from("admin_product_stats").select("*").single();
  return data ?? { total: 0, out_of_stock: 0, on_offer: 0, gym_line: 0 };
}

export async function getAdminSettings(): Promise<Record<string, unknown>> {
  const sb = await createServerSupabase();
  const { data } = await sb.from("settings").select("key, value");
  const rows: Array<{ key: string; value: unknown }> = data ?? [];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
