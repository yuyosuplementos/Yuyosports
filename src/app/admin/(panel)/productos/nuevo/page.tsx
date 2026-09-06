import { getAdminTaxonomy } from "@/lib/data/admin";
import { ProductForm } from "@/components/admin/product-form";

export default async function NuevoProductoPage() {
  const { categories, brands } = await getAdminTaxonomy();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-black text-brand-charcoal">Nuevo producto</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
