/**
 * Formateo de moneda determinista.
 *
 * NO usar Intl.NumberFormat('es-AR'): el ICU de Node y el del navegador
 * difieren en el separador y en si el simbolo lleva espacio duro
 * ("$ 15.000" vs "$15.000"), y eso produce un hydration mismatch en
 * CADA precio de la grilla. Una funcion pura con regex es deterministica
 * por construccion.
 */
export function formatARS(n: number): string {
  return "$" + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Porcentaje de descuento entre precio tachado y precio actual. */
export function discountPercent(price: number, oldPrice?: number | null): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
