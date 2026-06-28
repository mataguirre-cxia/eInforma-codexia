import Link from 'next/link';

export const dynamic = 'force-dynamic';

// El registro está cerrado: el acceso es por invitación (Supabase Auth).
// No hay alta pública de cuentas en el POC.
export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px] animate-fade-up">
        <div className="mb-7 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-fg">eInforma</span>
            <span className="eyebrow">Agente de voz</span>
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-fg">Acceso por invitación</h1>
        </div>
        <div className="card space-y-4 p-6 text-sm text-muted">
          <p>
            El registro está cerrado durante el piloto. Las cuentas se crean por invitación
            del equipo de Codexia.
          </p>
          <p>
            Si ya te han invitado, recibirás tu acceso por email y podrás entrar desde la
            pantalla de inicio de sesión.
          </p>
          <Link href="/login" className="inline-block font-medium text-cta hover:text-cta-hover">
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
