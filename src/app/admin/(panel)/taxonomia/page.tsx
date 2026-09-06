import { getAdminTaxonomy, getAdminProducts } from "@/lib/data/admin";
import { TaxonomyEditor } from "@/components/admin/taxonomy-editor";

export default async function TaxonomiaPage() {
  const [{ categories, brands }, products] = await Promise.all([
    getAdminTaxonomy(),
    getAdminProducts(),
  ]);

  const catCounts: Record<number, number> = {};
  const brandCounts: Record<number, number> = {};
  for (const p of products) {
    catCounts[p.category.id] = (catCounts[p.category.id] ?? 0) + 1;
    brandCounts[p.brand.id] = (brandCounts[p.brand.id] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-black text-brand-charcoal">Categorías y marcas</h1>
        <p className="mt-1 text-sm text-brand-charcoal/50">
          No se puede borrar una que tenga productos: la base lo impide con una foreign key.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <TaxonomyEditor table="categories" title="Categorías" rows={categories} counts={catCounts} />
        <TaxonomyEditor table="brands" title="Marcas" rows={brands} counts={brandCounts} />
      </div>
    </div>
  );
}
