import { getDashboardData } from '@/lib/queries';
import { RESULTADO_LABEL, type Resultado } from '@/lib/types';
import LiveRefresher from './_components/LiveRefresher';

export const dynamic = 'force-dynamic';

const RESULTADO_STYLE: Record<Resultado, string> = {
  conversion: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  email: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  transferido: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  no_interesado: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  sin_contacto: 'bg-zinc-700/20 text-zinc-400 border-zinc-600/30',
};

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${accent || 'text-white'}`}>{value}</div>
    </div>
  );
}

function mmss(s: number | null): string {
  if (!s) return '0:00';
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default async function Dashboard() {
  const { campaign, metrics, recientes, isDemo } = await getDashboardData();
  const m = metrics;
  const total = m?.total_llamadas || 0;
  const pct = (n: number) => (total ? `${Math.round((n / total) * 100)}%` : '0%');

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {!isDemo && campaign && <LiveRefresher campaignId={campaign.id} />}

      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">Codexia · Agente de voz</p>
          <h1 className="text-2xl font-bold text-white">{campaign?.name || 'Sin campañas'}</h1>
          <p className="mt-1 text-sm text-zinc-500">Seguimiento de llamadas en tiempo real</p>
        </div>
        {isDemo && (
          <span className="mt-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
            Datos de ejemplo
          </span>
        )}
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Metric label="Contactos" value={(total).toLocaleString()} />
        <Metric label="Contactadas" value={`${m?.contactadas ?? 0} · ${pct(m?.contactadas ?? 0)}`} />
        <Metric label="Conversiones" value={`${m?.conversiones ?? 0}`} accent="text-emerald-400" />
        <Metric label="Aceptó email" value={`${m?.emails ?? 0}`} accent="text-sky-400" />
        <Metric label="Transferidas" value={`${m?.transferidas ?? 0}`} accent="text-amber-400" />
        <Metric label="Duración media" value={mmss(m?.duracion_media_seg ?? 0)} />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-white">Llamadas recientes</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Informe</th>
                <th className="px-4 py-3 font-medium">Resultado</th>
                <th className="px-4 py-3 font-medium">Duración</th>
              </tr>
            </thead>
            <tbody>
              {recientes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-zinc-500">
                    Aún no hay llamadas. Sube contactos en “Cargar contactos”.
                  </td>
                </tr>
              )}
              {recientes.map((r, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white">{r.nombre}</td>
                  <td className="px-4 py-3 text-zinc-300">{r.ultimo_informe || '—'}</td>
                  <td className="px-4 py-3">
                    {r.resultado ? (
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${RESULTADO_STYLE[r.resultado]}`}>
                        {RESULTADO_LABEL[r.resultado]}
                      </span>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{mmss(r.duration_seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
