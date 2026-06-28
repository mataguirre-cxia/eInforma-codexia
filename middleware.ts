import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

type CookieItem = { name: string; value: string; options?: CookieOptions };

// Rutas públicas (páginas). Las API se autoprotegen en cada handler
// (operador → getUser; webhooks → firma), así que las dejamos pasar aquí.
const PUBLIC_PAGES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Refresca la sesión en cada request (obligatorio con @supabase/ssr)
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // API y callback de auth: gestionan su propia autenticación
  if (pathname.startsWith('/api') || pathname.startsWith('/auth')) return response;

  // Páginas públicas
  if (PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    // Si ya hay sesión, no tiene sentido ver el login → al dashboard
    if (user && pathname === '/login') return NextResponse.redirect(new URL('/', request.url));
    return response;
  }

  // Resto de páginas: requieren sesión
  if (!user) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
