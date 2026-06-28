import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 py-12">
      <div className="w-full max-w-[380px] animate-fade-up">
        <div className="mb-7 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-fg">eInforma</span>
            <span className="eyebrow">Agente de voz</span>
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-fg">Inicia sesión</h1>
          <p className="mt-1.5 text-sm text-muted">Accede con tu email de equipo.</p>
        </div>
        <div className="card p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
