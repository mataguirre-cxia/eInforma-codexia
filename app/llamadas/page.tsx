import { getCallsDetailed } from '@/lib/queries';
import { RESULTADO_LABEL, type Resultado } from '@/lib/types';

export const dynamic = 'force-dynamic';

const RESULTADO_STYLE: Record<Resultado, string> = {
  conversion: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  email: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  transferido: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  no_interesado: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  sin_contacto: 'bg-zinc-700/20 text-zinc-400 border-zinc-600/30',
};

function mmss(s: number | null): string {
  if (!s) return '0:00';
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default async function Llamadas() {
  const { calls, isDemo } = await getCallsDetailed();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Llamadas</h1>
          <p className="mt-1 text-sm text-zinc-500">Grabación y transcripción de cada conversación</p>
        </div>
        {isDemo && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            Datos de ejemplo
          </span>
        )}
      </header>

      <div className="space-y-3">
        {calls.map((c) => (
          <div key={c.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-medium text-white">{c.nombre}</span>
                <span className="ml-2 text-sm text-zinc-400">{c.ultimo_informe || '—'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-400">{mmss(c.duration_seconds)}</span>
                {c.resultado && (
                  <span className={`rounded-full border px-2.5 py-1 text-xs ${RESULTADO_STYLE[c.resultado]}`}>
                    {RESULTADO_LABEL[c.resultado]}
                  </span>
                )}
              </div>
            </div>

            {c.recording_url && (
              <audio controls src={c.recording_url} className="mt-3 w-full">
                Tu navegador no soporta audio.
              </audio>
            )}

            {c.transcript && (
              <details className="mt-3 group">
                <summary className="cursor-pointer text-sm text-emerald-400 hover:text-emerald-300">
                  Ver transcripción
                </summary>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-300">
{c.transcript}
                </pre>
              </details>
            )}
          </div>
        ))}

        {calls.length === 0 && (
          <p className="rounded-2xl border border-white/10 p-6 text-center text-zinc-500">
            Aún no hay llamadas.
          </p>
        )}
      </div>
    </main>
  );
}
