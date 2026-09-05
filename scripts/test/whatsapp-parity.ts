/**
 * Paridad del mensaje de WhatsApp contra index.html:2213-2240.
 *   npx tsx scripts/test/whatsapp-parity.ts
 * La referencia esta transcripta literal del sitio viejo.
 */
import assert from "node:assert/strict";
import { buildOrderMessage } from "../../src/lib/utils/whatsapp";
import type { CartLine, CheckoutData } from "../../src/types/domain";

/** Implementacion ORIGINAL, copiada tal cual de index.html. */
function legacy(
  d: { name: string; surname: string; phone: string; email: string; address: string; city: string; shipping: string; payment: string },
  cart: Array<{ name: string; flavor: string; price: number; qty: number }>,
) {
  let msg = `*NUEVO PEDIDO - YUYO SPORTS*\n`;
  msg += `------------------------------------\n`;
  msg += `*Cliente:* ${d.name} ${d.surname}\n`;
  msg += `*WhatsApp:* ${d.phone}\n`;
  msg += `*Email:* ${d.email}\n`;
  msg += `*Dirección:* ${d.address}, ${d.city}\n`;
  msg += `*Envío:* ${d.shipping}\n`;
  msg += `*Pago:* ${d.payment}\n`;
  msg += `------------------------------------\n`;
  msg += `*PRODUCTOS:*\n`;
  cart.forEach((item) => {
    msg += `• ${item.name} (${item.flavor}) x${item.qty} - $${(item.price * item.qty).toLocaleString("es-AR")}\n`;
  });
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  msg += `------------------------------------\n`;
  msg += `*TOTAL DEL PEDIDO:* $${subtotal.toLocaleString("es-AR")}\n`;
  return msg;
}

const data: CheckoutData = {
  name: "Juan", lastName: "Pérez", phone: "11 3456 7890", email: "juan@mail.com",
  address: "Av. Siempreviva 742", city: "CABA",
  paymentMethod: "Transferencia bancaria", shippingMethod: "Envío a domicilio",
};

const lines: CartLine[] = [
  { lineId: "a", productId: "a", slug: "prote", name: "Proteína Star Nutrition 2lb", brandName: "Star Nutrition", imagePath: null, unitPrice: 29000, flavor: "Vainilla", qty: 2, isWholesale: false, addedAt: 0 },
  { lineId: "b", productId: "b", slug: "crea", name: "Creatina One Fit 500gr", brandName: "One Fit", imagePath: null, unitPrice: 28000, flavor: "Neutro", qty: 1, isWholesale: false, addedAt: 0 },
];

const expected = legacy(
  { ...data, surname: data.lastName, shipping: data.shippingMethod, payment: data.paymentMethod },
  lines.map((l) => ({ name: l.name, flavor: l.flavor!, price: l.unitPrice, qty: l.qty })),
);
const actual = buildOrderMessage(data, lines);

console.log("--- nuevo ---\n" + actual);
try {
  assert.equal(actual, expected);
  console.log("OK: idéntico byte a byte al formato original.\n");
} catch {
  console.log("--- original ---\n" + expected);
  for (let i = 0; i < Math.max(actual.length, expected.length); i++) {
    if (actual[i] !== expected[i]) {
      console.error(`\nDIFIERE en el caracter ${i}: nuevo=${JSON.stringify(actual.slice(i, i + 30))} original=${JSON.stringify(expected.slice(i, i + 30))}`);
      break;
    }
  }
  process.exit(1);
}

// Sin sabor: el original imprimia "(undefined)"; el nuevo omite el parentesis.
const noFlavor = buildOrderMessage(data, [{ ...lines[0], flavor: null }]);
assert.ok(!noFlavor.includes("(undefined)"), "no debe imprimir (undefined)");
assert.ok(noFlavor.includes("• Proteína Star Nutrition 2lb x2"), "sin sabor, sin paréntesis");
console.log("OK: producto sin sabor no imprime '(undefined)' (bug del original).");

// Carrito largo: el deep link de wa.me se degrada pasados ~2000 caracteres.
const many = Array.from({ length: 25 }, (_, i) => ({ ...lines[0], lineId: String(i), name: `Producto ${i}` }));
const long = buildOrderMessage(data, many);
assert.ok(long.includes("…y 10 producto(s) más"), "debe resumir carritos largos");
console.log("OK: carrito de 25 líneas se resume a 15 + resto.");
