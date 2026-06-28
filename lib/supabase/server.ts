import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

type CookieItem = { name: string; value: string; options?: CookieOptions };

/**
 * Cliente Supabase para Server Components y Route Handlers.
 * Lee/escribe la sesión en cookies (SSR) y RESPETA RLS — úsalo para
 * operaciones del usuario autenticado (auth, lecturas con sesión).
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Llamado desde un Server Component sin response mutable — la sesión
            // se refresca en el middleware, así que es seguro ignorarlo.
          }
        },
      },
    },
  );
}

/**
 * Cliente con service-role: BYPASEA RLS. Solo en código de servidor
 * (Route Handlers, scripts). NUNCA en código accesible al cliente.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
