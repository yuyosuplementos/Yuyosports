import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/products";
import { getCategories, getBrands } from "@/lib/data/taxonomy";

// Si falta la variable es un error de configuración: mejor que se note en
// local a que se publique un sitemap apuntando a un dominio inventado.
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, brands] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
  ]);

  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/ofertas`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/mayorista`, changeFrequency: "monthly", priority: 0.7 },
    ...categories.map((c) => ({
      url: `${BASE}/categoria/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...brands.map((b) => ({
      url: `${BASE}/marca/${b.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      url: `${BASE}/producto/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
