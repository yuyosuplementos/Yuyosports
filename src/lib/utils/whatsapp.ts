import type { CartLine, CheckoutData } from "@/types/domain";
import { formatARS } from "./format";

/**
 * Arma el mensaje del pedido.
 *
 * PARIDAD EXACTA con index.html:2213-2240 — mismos asteriscos, mismos guiones
 * y mismos saltos de linea. El dueño lee estos mensajes todos los días; que
 * cambien de forma sin motivo es una regresion.
 */
const SEP = "------------------------------------";

export function buildOrderMessage(data: CheckoutData, lines: CartLine[]): string {
  let msg = `*NUEVO PEDIDO - YUYO SPORTS*\n`;
  msg += `${SEP}\n`;
  msg += `*Cliente:* ${data.name} ${data.lastName}\n`;
  msg += `*WhatsApp:* ${data.phone}\n`;
  msg += `*Email:* ${data.email}\n`;
  msg += `*Dirección:* ${data.address}, ${data.city}\n`;
  msg += `*Envío:* ${data.shippingMethod}\n`;
  msg += `*Pago:* ${data.paymentMethod}\n`;
  msg += `${SEP}\n`;
  msg += `*PRODUCTOS:*\n`;

  // wa.me se degrada mas alla de ~2000 caracteres codificados y algunos
  // navegadores moviles truncan la URL: con carritos largos se resume.
  const MAX_LINES = 15;
  const shown = lines.slice(0, MAX_LINES);
  for (const l of shown) {
    const flavor = l.flavor ? ` (${l.flavor})` : "";
    msg += `• ${l.name}${flavor} x${l.qty} - ${formatARS(l.unitPrice * l.qty)}\n`;
  }
  if (lines.length > shown.length) {
    msg += `…y ${lines.length - shown.length} producto(s) más\n`;
  }

  const total = lines.reduce((a, l) => a + l.unitPrice * l.qty, 0);
  msg += `${SEP}\n`;
  msg += `*TOTAL DEL PEDIDO:* ${formatARS(total)}\n`;
  return msg;
}

export function buildWholesaleInquiry(name: string, phone: string, location: string): string {
  return (
    `*SOLICITUD CATÁLOGO MAYORISTA - YUYO SPORTS*\n` +
    `*Establecimiento:* ${name}\n` +
    `*Teléfono:* ${phone}\n` +
    `*Ubicación:* ${location}\n` +
    `Solicito lista de precios mayorista e información de volumen.`
  );
}

/** El telefono deja de estar hardcodeado en 5 lugares: sale de settings.commerce. */
export function waLink(phone: string, message?: string): string {
  const base = `https://wa.me/${phone}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
