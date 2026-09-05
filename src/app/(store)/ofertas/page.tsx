import type { Metadata } from "next";
import { getProducts } from "@/lib/data/products";
import { getCategoriesWithProducts, getBrandsWithProducts } from "@/lib/data/taxonomy";
import { CatalogClient } from "@/components/store/catalog/catalog-client";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ofertas",
  description: "Suplementos deportivos en oferta con descuentos por tiempo limitado.",
};

export default async function OfertasPage() {
  const [products, categories, brands] = await Promise.all([
    getProducts(),
    getCategoriesWithProducts(),
    getBrandsWithProducts(),
  ]);

  return (
    <CatalogClient
      products={products}
      categories={categories}
      brands={brands}
      initialFilters={{ saleOnly: true }}
      title="Ofertas"
    />
  );
}
