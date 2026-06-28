'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export type LoginState = { error?: string } | null;

// Login con email + contraseña (Supabase Auth gestiona hashing y rate-limit).
// Mensaje de error genérico: no revela si el email existe (anti-enumeración).
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) return { error: 'Introduce tu email y contraseña.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: 'Email o contraseña incorrectos.' };

  redirect('/');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
