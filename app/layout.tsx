import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'eInforma — Agente de voz (POC)',
  description: 'Dashboard de seguimiento de llamadas del agente de voz',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <nav className="border-b border-white/10 bg-white/[0.02]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <span className="font-semibold text-white">eInforma · Voz</span>
            <div className="flex gap-4 text-sm">
              <Link href="/" className="text-zinc-300 hover:text-white">Dashboard</Link>
              <Link href="/llamadas" className="text-zinc-300 hover:text-white">Llamadas</Link>
              <Link href="/cargar" className="text-zinc-300 hover:text-white">Cargar contactos</Link>
              <Link href="/probar" className="text-zinc-300 hover:text-white">Probar agente</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
