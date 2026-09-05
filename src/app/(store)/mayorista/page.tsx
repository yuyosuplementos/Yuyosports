import type { Metadata } from "next";
import { getSettings } from "@/lib/data/settings";
import { WholesaleBlock } from "@/components/store/sections";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Venta mayorista",
  description:
    "Precios por volumen para gimnasios, dietéticas y revendedores. Envíos a todo el país.",
};

export default async function MayoristaPage() {
  const settings = await getSettings();
  return <WholesaleBlock wholesale={settings.wholesale} commerce={settings.commerce} />;
}
