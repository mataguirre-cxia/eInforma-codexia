import { getCallsDetailed } from '@/lib/queries';
import { RESULTADO_LABEL, type Resultado } from '@/lib/types';

export const dynamic = 'force-dynamic';

const PILL: Record<Resultado, string> = {
  conversion: 'text-ok bg-ok-wash',
  email: 'text-info bg-info-wash',
  transferido: 'text-warn bg-warn-wash',
  no_interesado: 'text-neutral bg-neutral-wash',
  sin_contacto: 'text-neutral bg-neutral-wash',
};

function Pill({ r }: { r: Resultado }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${PILL[r]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {RESULTADO_LABEL[r]}
    </span>
  );
}

function mmss(s: number | null): string {
  if (!s) return '0:00';
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default async function Llamadas() {
  const { calls, isDemo } = await getCallsDetailed();

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 py-10">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Conversaciones</p>
          <h1 className="mt-1 text-3xl font-semibold text-fg">Llamadas</h1>
          <p className="mt-1.5 text-sm text-muted">Grabación y transcripción de cada conversación</p>
        </div>
        {isDemo && (
          <span className="mt-1 shrink-0 rounded-full bg-neutral-wash px-3 py-1 text-xs font-medium text-neutral">
            Datos de ejemplo
          </span>
        )}
      </header>

      {calls.length === 0 ? (
        <div className="card px-6 py-12 text-center text-sm text-muted">
          Aún no hay llamadas registradas.
        </div>
      ) : (
        <div className="space-y-3">
          {calls.map((c) => (
            <article key={c.id} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-medium text-fg">{c.nombre}</span>
                  <span className="ml-2 text-sm text-muted">{c.ultimo_informe || '—'}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-mono text-sm tabular-nums text-muted">{mmss(c.duration_seconds)}</span>
                  {c.resultado && <Pill r={c.resultado} />}
                </div>
              </div>

              {c.recording_url && (
                <audio controls src={c.recording_url} className="mt-4 w-full">
                  Tu navegador no soporta audio.
                </audio>
              )}

              {c.transcript && (
                <details className="group mt-4">
                  <summary className="cursor-pointer select-none text-sm font-medium text-cta hover:text-cta-hover">
                    Ver transcripción
                  </summary>
                  <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-border bg-surface p-4 font-sans text-sm leading-relaxed text-fg">
{c.transcript}
                  </pre>
                </details>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
