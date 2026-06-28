import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/** Devuelve el usuario autenticado de la sesión, o null. Para endpoints de operador. */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
