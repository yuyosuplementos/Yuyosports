/** Modelo de dominio que consume la UI (ya con category/brand resueltos). */

export interface Taxon {
  id: number;
  slug: string;
  name: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Taxon;
  brand: Taxon;
  price: number;
  oldPrice: number | null;
  wholesalePrice: number;
  flavors: string[];
  imagePath: string | null;
  imageAlt: string | null;
  isGym: boolean;
  isOffer: boolean;
  isOutOfStock: boolean;
  sortOrder: number;
}

export interface CartLine {
  /** `${productId}::${flavor ?? ""}::${isWholesale ? "w" : "r"}` */
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  brandName: string;
  imagePath: string | null;
  /** Congelado al agregar, igual que en el sitio viejo. */
  unitPrice: number;
  flavor: string | null;
  qty: number;
  isWholesale: boolean;
  addedAt: number;
}

export interface CheckoutData {
  name: string;
}
