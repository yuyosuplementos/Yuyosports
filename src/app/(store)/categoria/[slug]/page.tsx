import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/data/products";
import { getCategories, getCategoriesWithProducts, getBrandsWithProducts } from "@/lib/data/taxonomy";
import { CatalogClient } from "@/components/store/catalog/catalog-client";

export const revalidate = 3600;

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getCategories()).find((c) => c.slug === slug);
  if (!cat) return {};
  return {
    title: cat.name,
    description: `Comprá ${cat.name.toLowerCase()} originales con envío a todo el país.`,
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [products, allCats, categories, brands] = await Promise.all([
    getProducts(),
    getCategories(),
    getCategoriesWithProducts(),
    getBrandsWithProducts(),
  ]);

  const category = allCats.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <CatalogClient
      products={products}
      categories={categories}
      brands={brands}
      initialFilters={{ category: slug }}
      title={category.name}
    />
  );
}
