import { unstable_cache } from "next/cache";
import { createPublicClient, hasSupabaseConfig } from "@/lib/supabase/public";
import { getProducts } from "@/lib/data/products";
import type { Taxon } from "@/types/domain";

export const getCategories = unstable_cache(
  async (): Promise<Taxon[]> => {
    if (!hasSupabaseConfig()) return [];
    const sb = createPublicClient();
    const { data, error } = await sb
      .from("categories")
      .select("id, slug, name")
      .eq("is_active", true)
      .order("sort_order")
      .order("name");
    if (error) throw new Error(`getCategories: ${error.message}`);
    return data ?? [];
  },
  ["taxonomy:categories"],
  { tags: ["taxonomy"], revalidate: 3600 },
);

export const getBrands = unstable_cache(
  async (): Promise<Taxon[]> => {
    if (!hasSupabaseConfig()) return [];
    const sb = createPublicClient();
    const { data, error } = await sb
      .from("brands")
      .select("id, slug, name")
      .eq("is_active", true)
      .order("name");
    if (error) throw new Error(`getBrands: ${error.message}`);
    return data ?? [];
  },
  ["taxonomy:brands"],
  { tags: ["taxonomy"], revalidate: 3600 },
);

/**
 * Solo taxones con al menos un producto publicado.
 *
 * En el sitio viejo el select ofrecia 13 categorias pero 4 no tenian ningun
 * producto ('Ganadores', 'Pre-Entrenos', 'Indumentaria', 'Accesorios'), asi
 * que elegirlas solo producia el empty state. El panel sigue mostrando todas.
 */
export async function getCategoriesWithProducts(): Promise<Taxon[]> {
  const [cats, products] = await Promise.all([getCategories(), getProducts()]);
  const used = new Set(products.map((p) => p.category.id));
  return cats.filter((c) => used.has(c.id));
}

export async function getBrandsWithProducts(): Promise<Taxon[]> {
  const [brands, products] = await Promise.all([getBrands(), getProducts()]);
  const used = new Set(products.map((p) => p.brand.id));
  return brands.filter((b) => used.has(b.id));
}
