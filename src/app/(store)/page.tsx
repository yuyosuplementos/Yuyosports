import { getProducts, getFeaturedProduct } from "@/lib/data/products";
import { getSettings } from "@/lib/data/settings";
import { getCategoriesWithProducts, getBrandsWithProducts } from "@/lib/data/taxonomy";
import { CatalogClient } from "@/components/store/catalog/catalog-client";
import {
  Hero,
  HeroBanner,
  ExploraSection,
  WholesaleBlock,
  ValueProps,
  DualBanners,
  OffersBanner,
} from "@/components/store/sections";

// Red de seguridad: el mecanismo real de invalidacion son los tags
// (updateTag desde las Server Actions del panel).
export const revalidate = 3600;

export default async function HomePage() {
  const [products, featured, settings, categories, brands] = await Promise.all([
    getProducts(),
    getFeaturedProduct(),
    getSettings(),
    getCategoriesWithProducts(),
    getBrandsWithProducts(),
  ]);

  return (
    <>
      <HeroBanner general={settings.general} />
      <CatalogClient products={products} categories={categories} brands={brands} />
      <Hero general={settings.general} featured={featured} />
      <ExploraSection categories={categories} />
      <ValueProps values={settings.values} />
      <WholesaleBlock wholesale={settings.wholesale} commerce={settings.commerce} />
      <DualBanners banners={settings.banners} />
      <OffersBanner offers={settings.offers} />
    </>
  );
}
