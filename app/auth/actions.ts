'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';
import { logAudit } from '@/lib/audit';

export type LoginState = { error?: string } | null;

async function requestIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

// Login con email + contraseña (Supabase Auth gestiona hashing y rate-limit propio).
// Mensaje de error genérico: no revela si el email existe (anti-enumeración).
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) return { error: 'Introduce tu email y contraseña.' };

  const ip = await requestIp();
  // Límite estricto en login (secure-auth): 5 intentos / 15 min por IP.
  if (!(await rateLimit(`login:${ip}`, 5, 900))) {
    return { error: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    await logAudit({ action: 'login_failed', actorEmail: email, ip });
    return { error: 'Email o contraseña incorrectos.' };
  }

  await logAudit({ action: 'login_success', actorId: data.user.id, actorEmail: email, ip });
  redirect('/');
}

export async function logout() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  await logAudit({ action: 'logout', actorId: user?.id ?? null, actorEmail: user?.email ?? null, ip: await requestIp() });
  redirect('/login');
}
