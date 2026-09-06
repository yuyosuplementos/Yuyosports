import { getAdminProducts } from "@/lib/data/admin";
import { ProductsTable } from "@/components/admin/products-table";

export default async function AdminProductosPage() {
  const products = await getAdminProducts();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-black text-brand-charcoal">Productos</h1>
      <ProductsTable products={products} />
    </div>
  );
}
