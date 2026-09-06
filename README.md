# YUYO SPORTS

Tienda de suplementos deportivos. Next.js 16 (App Router) + Supabase + Tailwind v4.

Reescritura del sitio anterior (`../index.html` y `../panel.html`, HTML plano con Firebase).
La venta **no** se cierra en la plataforma: el checkout arma el pedido y lo abre en WhatsApp.

---

## Puesta en marcha

### 1. Crear el proyecto de Supabase

> Importante: crealo con **la cuenta de Google del dueño del negocio**, no con la de quien
> desarrolla. El proyecto es donde viven el catálogo y el contenido del sitio.

1. [supabase.com](https://supabase.com) → **New project**. Anotá la contraseña de la base.
2. **Project Settings → API**: copiá `Project URL`, `anon public` y `service_role`.
3. **Authentication → Sign In / Providers → Allow new users to sign up: OFF.**
   Sin esto, cualquiera puede registrarse (es lo que dejaba entrar al panel viejo).

### 2. Configurar el entorno

```bash
cp .env.example .env.local
```

Completá `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.

> `SUPABASE_SERVICE_ROLE_KEY` saltea la RLS por completo. Solo la usan los scripts de
> `scripts/`; nunca se importa desde `src/` ni llega al navegador.

### 3. Crear el esquema

En el dashboard de Supabase → **SQL Editor**, pegá y ejecutá **en orden** los archivos de
`supabase/migrations/`:

```
20260902000001_extensions.sql
20260902000002_taxonomy.sql
20260902000003_products.sql
20260902000004_settings.sql
20260902000005_admins_and_rls.sql
20260902000006_storage.sql
20260902000007_seed_taxonomy.sql
```

(Con Docker y la CLI de Supabase: `npx supabase link --project-ref <ref> && npx supabase db push`.)

### 4. Cargar el catálogo

```bash
npm install
npm run seed:images:dry   # procesa y reporta, no sube nada
npm run seed:images       # sube las 43 imágenes optimizadas al bucket
npm run seed:products     # inserta los 40 productos
npm run seed:settings     # carga el contenido editable
```

`seed:images` toma los JPG de `../img/`, los redimensiona a 1200px y los convierte a WebP:
**27,3 MB → 1,6 MB**. Es idempotente (upsert por slug), correrlo dos veces no duplica nada.

### 5. Crear el usuario admin

Agregá `ADMIN_EMAIL` y `ADMIN_PASSWORD` (mínimo 12 caracteres) a `.env.local`:

```bash
npm run create:admin
```

Crea el usuario y su fila en `admins`. Es el único camino: la tabla no tiene policy de
INSERT, así que nadie puede auto-promoverse desde la aplicación.

### 6. Arrancar

```bash
npm run dev     # http://localhost:3000  ·  panel en /admin
```

---

## Deploy

Vercel, importando el repo. Framework detectado automáticamente. Cargá las tres variables
de Supabase más `NEXT_PUBLIC_SITE_URL` con el dominio final (la usan `sitemap.xml` y `robots.txt`).

---

## Arquitectura

| Decisión | Por qué |
|---|---|
| Catálogo completo al cliente, filtros en memoria | 40 productos ≈ 4 KB con Brotli. Filtrar en el server con `searchParams` volvería dinámica la home y agregaría un round-trip por tecla. |
| Filtros en la URL con `history.replaceState` | La URL queda compartible sin sacrificar el render estático. |
| `categories` y `brands` como tablas con FK | El seed viejo decía `Creatina` y el select `Creatinas`, así que filtrar por esa categoría devolvía 0 de 7 productos. Con FK es imposible. |
| `settings` clave/valor con JSONB + Zod | Evita ~35 columnas de copy y una migración por cada texto nuevo. |
| Precios `integer` en pesos enteros | La UI nunca muestra decimales; `numeric` invita a comparaciones con float. |
| Admin en tabla `admins`, no en un claim del JWT | Un claim ya emitido sigue siendo válido hasta 1 h. Un `DELETE` revoca al instante. |
| Zustand + `persist` con `skipHydration` | Evita el hydration mismatch del badge del carrito (server 0 vs cliente N). |
| `formatARS` propia, no `Intl.NumberFormat` | El ICU de Node y el del navegador difieren en el separador → mismatch en cada precio. |
| Subida de imágenes con signed URL | El body de una función serverless en Vercel topea en 4,5 MB y las fotos originales llegan a 4,3 MB. |
| `/admin/login` fuera del route group `(panel)` | En App Router los layouts anidados **se componen**, no se reemplazan: con el layout protegido en `app/admin/` envolvía también al login, llamaba `requireAdmin()` y redirigía al login. Bucle infinito. |

### Caché

Las lecturas públicas van envueltas en `unstable_cache` con tags (`products`, `settings`,
`taxonomy`) y `revalidate = 3600` como red de seguridad. Cada Server Action de escritura
cierra con `updateTag(...)`, que da *read-your-own-writes*: el dueño guarda un precio y lo
ve en la primera recarga, no en la segunda.

---

## Tests

```bash
npm run test        # paridad de WhatsApp + paridad de filtros
npm run typecheck
npm run lint
```

- **`test:whatsapp`** fija el formato del mensaje de pedido y verifica que no reaparezcan
  los campos que el checkout dejó de pedir.
- **`test:filters`** verifica 16 combinaciones de filtros contra los conteos reales del catálogo.

### Verificación manual

**RLS** — con la anon key, nunca con la service_role:

```bash
curl -s "$URL/rest/v1/products?select=id" -H "apikey: $ANON" | jq length   # 40
curl -s -X PATCH "$URL/rest/v1/products?id=eq.<uuid>" -H "apikey: $ANON" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" -d '{"price":1}'
# debe devolver [] o error — NUNCA la fila modificada
```

**Hidratación** — `npm run build && npm start`, sembrar el carrito en localStorage y recargar:
cero `Hydration failed` en consola y el badge con el número correcto.

**Auth** — en incógnito, `/admin/productos` redirige al login. Un usuario autenticado sin
fila en `admins` es rechazado.

---

## Cambios de comportamiento respecto del sitio viejo

Decididos con el dueño antes de empezar:

1. **Sin cuentas de clientes.** Se compra como invitado; Supabase Auth es solo para el panel.
2. **Sin tabla de pedidos.** El checkout sigue siendo "armar texto + abrir WhatsApp".
3. **Se quitó el descuento por transferencia del copy.** Se anunciaba y nunca se aplicaba.
4. **El mínimo mayorista bloquea el checkout**, con el faltante explícito. Antes era decorativo.
5. **Los precios mayoristas siguen siendo públicos**, sin código de acceso.
6. **Se eliminó la "línea GYM".** Era un flag booleano por producto (no una categoría)
   heredado del sitio original, con su propio botón de filtro. No representaba nada, así
   que se borró la columna `is_gym`, el filtro y la métrica del dashboard. Los 12 productos
   que lo tenían activo quedan registrados en el historial de git por si el dato sirve.
7. **El checkout pide solo el nombre.** Teléfono, email, dirección, forma de pago y envío se
   acuerdan en la conversación de WhatsApp que el propio checkout abre; pedirlos dos veces
   agregaba fricción y datos personales que no necesitamos guardar. Como consecuencia,
   `paymentMethods` y `shippingMethods` salieron de `settings.commerce`: ya no los usa nadie.

### Bugs del sitio viejo corregidos

- `applyCategoryFilter()` escribía en `state.search` en vez de `state.category`: los
  quick-filters eran una búsqueda de texto, no un filtro de categoría.
- `Creatina` vs `Creatinas`: filtrar por esa categoría devolvía 0 de 7 productos.
- Dos `initConfig()` duplicadas suscribían los 7 listeners de Firestore por partida doble.
- Un producto sin `wholesalePrice` rompía el render entero con un `TypeError`.
- El panel solo verificaba `if (user)`: cualquier cliente registrado entraba.
- Clases Tailwind inexistentes (`bg-brand-green`, `shadow-neon`, `bg-brand-dark`…) dejaban
  feedbacks visuales muertos.
- `config/wholesale` se guardaba desde el panel pero no se mostraba en ningún lado
  (los ids `#ws-t/#ws-d/#ws-b` no existían).
- El modal de consulta mayorista era inalcanzable: `openMayoristaModal()` no tenía caller.
- Renderizado con template strings sin escapar (XSS almacenado).
- Teléfono de WhatsApp hardcodeado en 5 lugares; ahora sale de `settings.commerce`.
- Los modales no atrapaban el foco ni cerraban con Escape.
- El toast tenía una race: dos seguidos y el timer del primero cortaba al segundo.

## Estructura

```
src/
  app/(store)/      home, ofertas, categoria/[slug], marca/[slug], producto/[slug], mayorista
  app/admin/        dashboard, productos, taxonomia, contenido/[section], login
  components/       store/ · admin/ · ui/
  lib/
    supabase/       public (anon, sin cookies) · server · client · admin (service_role) · proxy
    data/           lecturas cacheadas por tag + lecturas del panel
    actions/        Server Actions, todas con assertAdmin() al principio
    schemas/        Zod, compartido cliente/servidor
    store/          cart · prefs (zustand + persist)
scripts/            seed de imágenes, productos, settings, admin, y tests de paridad
supabase/migrations/
```
