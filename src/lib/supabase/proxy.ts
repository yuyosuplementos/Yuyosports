import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesion en cada request a /admin. Lo invoca proxy.ts.
 * OJO: esto NO autoriza. El chequeo de admin real vive en requireAdmin(),
 * que corre en el layout y — sobre todo — al principio de cada Server Action.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Sin credenciales dejamos pasar: el layout de /admin muestra la pantalla
  // de configuracion en vez de un error de runtime.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith("/admin/login");

  if (!user && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  // NO redirigimos al usuario autenticado fuera de /admin/login.
  // Seria un segundo loop: un usuario logueado que NO esta en `admins` es
  // rechazado por requireAdmin() hacia /admin/login?error=forbidden, y desde
  // ahi volveria a /admin, y asi indefinidamente. Que /admin/login siempre
  // renderice es ademas la unica forma de mostrarle por que fue rechazado.
  return response;
}
