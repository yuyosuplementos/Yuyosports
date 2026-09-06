import type { MetadataRoute } from "next";

// Si falta la variable es un error de configuración: mejor que se note en
// local a que se publique un sitemap apuntando a un dominio inventado.
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
