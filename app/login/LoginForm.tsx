'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { login, type LoginState } from '@/app/auth/actions';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-fg">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          placeholder="tu@empresa.com"
          className="field"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-fg">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="field"
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-[#b3261e]">{state.error}</p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? 'Entrando…' : 'Entrar'}
      </button>

      <p className="pt-1 text-center text-sm text-muted">
        ¿No tienes acceso? <Link href="/register" className="text-cta hover:text-cta-hover">Solicitar acceso</Link>
      </p>
    </form>
  );
}
