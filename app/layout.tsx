import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'eInforma — Agente de voz (POC)',
  description: 'Dashboard de seguimiento de llamadas del agente de voz',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
