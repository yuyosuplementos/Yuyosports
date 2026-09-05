import { unstable_cache } from "next/cache";
import { createPublicClient, hasSupabaseConfig } from "@/lib/supabase/public";
import type { Product } from "@/types/domain";

const SELECT = `
  id, slug, name, description, price, old_price, wholesale_price, flavors,
  image_path, image_alt, is_gym, is_offer, is_out_of_stock, sort_order,
  category:categories!inner(id, slug, name),
  brand:brands!inner(id, slug, name)
`;

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  old_price: number | null;
  wholesale_price: number;
  flavors: string[] | null;
  image_path: string | null;
  image_alt: string | null;
  is_gym: boolean;
  is_offer: boolean;
  is_out_of_stock: boolean;
  sort_order: number;
  category: { id: number; slug: string; name: string } | { id: number; slug: string; name: string }[];
  brand: { id: number; slug: string; name: string } | { id: number; slug: string; name: string }[];
};

const one = <T,>(v: T | T[]): T => (Array.isArray(v) ? v[0] : v);

function toProduct(r: Row): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    category: one(r.category),
    brand: one(r.brand),
    price: r.price,
    oldPrice: r.old_price,
    wholesalePrice: r.wholesale_price,
    flavors: r.flavors ?? [],
    imagePath: r.image_path,
    imageAlt: r.image_alt,
    isGym: r.is_gym,
    isOffer: r.is_offer,
    isOutOfStock: r.is_out_of_stock,
    sortOrder: r.sort_order,
  };
}

/**
 * Catalogo completo. Se trae entero a proposito: 40 productos son ~14 KB de
 * JSON (~4 KB con Brotli), menos que una sola foto. Filtrar en el server con
 * searchParams significaria un round-trip por cada tecla del buscador y
 * volveria dinamica la home. Ver el plan, seccion 4.
 *
 * Umbral para revisar esta decision: ~300-500 productos.
 */
export const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    // Permite `npm run build` antes de configurar Supabase: el sitio levanta
    // con catalogo vacio en vez de romper la build.
    if (!hasSupabaseConfig()) return [];
    const sb = createPublicClient();
    const { data, error } = await sb
      .from("products")
      .select(SELECT)
      .eq("is_published", true)
      .order("sort_order")
      .order("name");
    if (error) throw new Error(`getProducts: ${error.message}`);
    return (data as unknown as Row[]).map(toProduct);
  },
  ["products:list"],
  { tags: ["products"], revalidate: 3600 },
);

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

/** Primer producto en oferta; si no hay, el primero del catalogo. */
export async function getFeaturedProduct(): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.isOffer && !p.isOutOfStock) ?? all[0] ?? null;
}
