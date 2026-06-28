'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/llamadas', label: 'Llamadas' },
  { href: '/cargar', label: 'Cargar contactos' },
  { href: '/probar', label: 'Probar agente' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-14 border-b border-border bg-bg/80 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold tracking-tight text-fg">eInforma</span>
          <span className="eyebrow">Agente de voz</span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'bg-surface font-medium text-fg'
                    : 'text-muted hover:text-fg'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
