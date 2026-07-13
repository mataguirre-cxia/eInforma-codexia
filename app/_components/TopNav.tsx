'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/auth/actions';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/llamadas', label: 'Llamadas' },
  { href: '/incidencias', label: 'Incidencias' },
  { href: '/cargar', label: 'Cargar contactos' },
  { href: '/probar', label: 'Probar agente' },
];

const AUTH_ROUTES = ['/login', '/register'];

export default function TopNav({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();

  // En las pantallas de auth no se muestra la barra de navegación.
  if (AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-border bg-bg/80 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-fg">eInforma</span>
          <span className="eyebrow">Agente de voz</span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            {LINKS.map((l) => {
              const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active ? 'bg-surface font-medium text-fg' : 'text-muted hover:text-fg'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {userEmail && (
            <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
              <span className="hidden font-mono text-xs text-muted sm:inline">{userEmail}</span>
              <form action={logout}>
                <button type="submit" className="rounded-md px-2.5 py-1.5 text-sm text-muted transition-colors hover:text-fg">
                  Salir
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
