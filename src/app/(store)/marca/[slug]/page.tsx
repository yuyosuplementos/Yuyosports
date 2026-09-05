import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/data/products";
import { getBrands, getCategoriesWithProducts, getBrandsWithProducts } from "@/lib/data/taxonomy";
import { CatalogClient } from "@/components/store/catalog/catalog-client";

export const revalidate = 3600;

export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = (await getBrands()).find((b) => b.slug === slug);
  if (!brand) return {};
  return { title: brand.name, description: `Productos ${brand.name} originales con garantía.` };
}

export default async function MarcaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [products, allBrands, categories, brands] = await Promise.all([
    getProducts(),
    getBrands(),
    getCategoriesWithProducts(),
    getBrandsWithProducts(),
  ]);

  const brand = allBrands.find((b) => b.slug === slug);
  if (!brand) notFound();

  return (
    <CatalogClient
      products={products}
      categories={categories}
      brands={brands}
      initialFilters={{ brand: slug }}
      title={brand.name}
    />
  );
}
