import { notFound } from "next/navigation";
import { getAdminProducts, getAdminTaxonomy } from "@/lib/data/admin";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [products, { categories, brands }] = await Promise.all([
    getAdminProducts(),
    getAdminTaxonomy(),
  ]);

  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-black text-brand-charcoal">{product.name}</h1>
      <ProductForm product={product} categories={categories} brands={brands} />
    </div>
  );
}
