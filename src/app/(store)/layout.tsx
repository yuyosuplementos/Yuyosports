import { getSettings } from "@/lib/data/settings";
import { getCategoriesWithProducts } from "@/lib/data/taxonomy";
import { Header } from "@/components/store/header/header";
import { Footer } from "@/components/store/footer";
import { PromoCarousel } from "@/components/store/promo-carousel";
import { CartHydrator } from "@/components/store/cart/cart-hydrator";
import { Toaster } from "@/components/ui/toast";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategoriesWithProducts()]);

  return (
    <>
      <CartHydrator />
      <PromoCarousel promos={settings.promos} />
      <Header categories={categories} commerce={settings.commerce} />
      <main>{children}</main>
      <Footer footer={settings.footer} commerce={settings.commerce} categories={categories} />
      <Toaster />
    </>
  );
}
