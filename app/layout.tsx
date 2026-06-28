import type { Metadata } from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import TopNav from './_components/TopNav';
import { createClient } from '@/lib/supabase/server';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'eInforma · Agente de voz',
  description: 'Panel de seguimiento de llamadas del agente de voz',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="es" className={`${geist.variable} ${jetbrains.variable}`}>
      <body>
        <TopNav userEmail={user?.email ?? null} />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
