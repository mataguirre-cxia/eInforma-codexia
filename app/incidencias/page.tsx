import { getIncidencias } from '@/lib/queries';

export const dynamic = 'force-dynamic';

function fecha(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default async function Incidencias() {
  const { incidencias, isDemo } = await getIncidencias();

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 py-10">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Piloto</p>
          <h1 className="mt-1 text-3xl font-semibold text-fg">Incidencias</h1>
          <p className="mt-1.5 text-sm text-muted">
            Preguntas que surgieron en llamada y para las que el agente no tenía respuesta preparada.
            Sirven para afinar el guión durante el piloto.
          </p>
        </div>
        {isDemo && (
          <span className="mt-1 shrink-0 rounded-full bg-neutral-wash px-3 py-1 text-xs font-medium text-neutral">
            Datos de ejemplo
          </span>
        )}
      </header>

      {incidencias.length === 0 ? (
        <div className="card px-6 py-12 text-center text-sm text-muted">
          No hay incidencias registradas. Cuando el agente reciba una pregunta sin respuesta
          preparada, aparecerá aquí.
        </div>
      ) : (
        <div className="space-y-3">
          {incidencias.map((i) => (
            <article key={i.id} className="card p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-medium text-fg">{i.nombre}</span>
                  <span className="ml-2 text-sm text-muted">{i.ultimo_informe || '—'}</span>
                </div>
                <span className="shrink-0 font-mono text-xs tabular-nums text-faint">{fecha(i.created_at)}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-fg">{i.pregunta}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
