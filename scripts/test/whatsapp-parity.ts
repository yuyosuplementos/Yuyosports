/**
 * Formato del mensaje de pedido de WhatsApp.
 *   npx tsx scripts/test/whatsapp-parity.ts
 *
 * Ya NO se compara contra el formato del sitio viejo: por pedido del dueño el
 * checkout dejó de pedir teléfono, email, dirección, forma de pago y envío, y
 * ahora solo pide el nombre. El resto se acuerda en la conversación que este
 * mismo mensaje abre. Este test fija el formato nuevo para que no cambie por
 * accidente — el dueño lee estos mensajes todos los días.
 */
import assert from "node:assert/strict";
import { buildOrderMessage } from "../../src/lib/utils/whatsapp";
import type { CartLine, CheckoutData } from "../../src/types/domain";

const data: CheckoutData = { name: "Juan Pérez" };

const line = (over: Partial<CartLine>): CartLine => ({
  lineId: "a",
  productId: "a",
  slug: "s",
  name: "Producto",
  brandName: "Marca",
  imagePath: null,
  unitPrice: 1000,
  flavor: null,
  qty: 1,
  isWholesale: false,
  addedAt: 0,
  ...over,
});

const lines: CartLine[] = [
  line({
    lineId: "a",
    name: "Proteína Star Nutrition 2lb",
    unitPrice: 29000,
    flavor: "Vainilla",
    qty: 2,
  }),
  line({ lineId: "b", name: "Creatina One Fit 500gr", unitPrice: 28000, flavor: "Neutro" }),
];

const SEP = "------------------------------------";
const expected =
  `*NUEVO PEDIDO - YUYO SPORTS*\n` +
  `${SEP}\n` +
  `*Cliente:* Juan Pérez\n` +
  `${SEP}\n` +
  `*PRODUCTOS:*\n` +
  `• Proteína Star Nutrition 2lb (Vainilla) x2 - $58.000\n` +
  `• Creatina One Fit 500gr (Neutro) x1 - $28.000\n` +
  `${SEP}\n` +
  `*TOTAL DEL PEDIDO:* $86.000\n`;

const actual = buildOrderMessage(data, lines);
console.log("--- mensaje ---\n" + actual);

try {
  assert.equal(actual, expected);
  console.log("OK: el formato del mensaje coincide con el esperado.");
} catch {
  for (let i = 0; i < Math.max(actual.length, expected.length); i++) {
    if (actual[i] !== expected[i]) {
      console.error(
        `\nDIFIERE en el caracter ${i}:\n  obtenido: ${JSON.stringify(actual.slice(i, i + 40))}\n  esperado: ${JSON.stringify(expected.slice(i, i + 40))}`,
      );
      break;
    }
  }
  process.exit(1);
}

// El checkout ya no pide estos datos: no deben aparecer nunca en el mensaje.
for (const campo of ["*WhatsApp:*", "*Email:*", "*Dirección:*", "*Envío:*", "*Pago:*"]) {
  assert.ok(!actual.includes(campo), `el mensaje no debe incluir ${campo}`);
}
console.log("OK: no incluye teléfono, email, dirección, envío ni forma de pago.");

// Sin sabor: el original imprimía "(undefined)".
const noFlavor = buildOrderMessage(data, [line({ name: "Sin sabor", flavor: null, qty: 2 })]);
assert.ok(!noFlavor.includes("(undefined)"), "no debe imprimir (undefined)");
assert.ok(noFlavor.includes("• Sin sabor x2"), "sin sabor, sin paréntesis");
console.log("OK: producto sin sabor no imprime '(undefined)' (bug del original).");

// Los precios mayoristas difieren del catálogo: hay que marcarlos.
const may = buildOrderMessage(data, [line({ isWholesale: true })]);
assert.ok(may.includes("*(precios mayoristas)*"), "debe marcar el pedido mayorista");
assert.ok(!actual.includes("(precios mayoristas)"), "no debe marcarlo si no aplica");
console.log("OK: marca el pedido cuando tiene líneas mayoristas.");

// wa.me se degrada más allá de ~2000 caracteres codificados.
const many = Array.from({ length: 25 }, (_, i) => line({ lineId: String(i), name: `Producto ${i}` }));
assert.ok(buildOrderMessage(data, many).includes("…y 10 producto(s) más"), "debe resumir");
console.log("OK: carrito de 25 líneas se resume a 15 + resto.");
