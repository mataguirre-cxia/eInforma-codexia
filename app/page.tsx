import { getDashboardData } from '@/lib/queries';
import { RESULTADO_LABEL, type Resultado } from '@/lib/types';
import LiveRefresher from './_components/LiveRefresher';

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

function Metric({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'ok' | 'info' | 'warn' }) {
  const dot = tone === 'ok' ? 'bg-ok' : tone === 'info' ? 'bg-info' : tone === 'warn' ? 'bg-warn' : '';
  return (
    <div className="card p-5">
      <div className="flex items-center gap-1.5">
        {tone && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />}
        <span className="eyebrow">{label}</span>
      </div>
      <div className="mt-2 text-[28px] font-semibold tabular-nums tracking-tight text-fg">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted tabular-nums">{sub}</div>}
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
  const contactadas = m?.contactadas ?? 0;
  const pct = (n: number, base: number) => (base ? `${Math.round((n / base) * 100)}%` : '0%');

  return (
    <div className="mx-auto max-w-6xl animate-fade-up px-6 py-10">
      {!isDemo && campaign && <LiveRefresher campaignId={campaign.id} />}

      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Campaña</p>
          <h1 className="mt-1 text-3xl font-semibold text-fg">{campaign?.name || 'Sin campañas'}</h1>
          <p className="mt-1.5 text-sm text-muted">Seguimiento de llamadas del agente</p>
        </div>
        {isDemo ? (
          <span className="mt-1 shrink-0 rounded-full bg-neutral-wash px-3 py-1 text-xs font-medium text-neutral">
            Datos de ejemplo
          </span>
        ) : (
          <span className="mt-1 inline-flex shrink-0 items-center gap-2 text-xs font-medium text-ok">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-ok" aria-hidden />
            En vivo
          </span>
        )}
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Metric label="Contactos" value={total.toLocaleString('es-ES')} />
        <Metric label="Contactadas" value={contactadas.toLocaleString('es-ES')} sub={`${pct(contactadas, total)} del total`} />
        <Metric label="Conversiones" value={`${m?.conversiones ?? 0}`} sub={`${pct(m?.conversiones ?? 0, contactadas)} de contactadas`} tone="ok" />
        <Metric label="Aceptó email" value={`${m?.emails ?? 0}`} sub={pct(m?.emails ?? 0, contactadas)} tone="info" />
        <Metric label="Transferidas" value={`${m?.transferidas ?? 0}`} sub={pct(m?.transferidas ?? 0, contactadas)} tone="warn" />
        <Metric label="Duración media" value={mmss(m?.duracion_media_seg ?? 0)} />
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-base font-semibold text-fg">Llamadas recientes</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="eyebrow px-4 py-3 font-normal">Contacto</th>
                <th className="eyebrow px-4 py-3 font-normal">Informe</th>
                <th className="eyebrow px-4 py-3 font-normal">Resultado</th>
                <th className="eyebrow px-4 py-3 text-right font-normal">Duración</th>
              </tr>
            </thead>
            <tbody>
              {recientes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted">
                    Aún no hay llamadas. Sube contactos en Cargar contactos.
                  </td>
                </tr>
              )}
              {recientes.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 transition-colors hover:bg-surface">
                  <td className="px-4 py-3 font-medium text-fg">{r.nombre}</td>
                  <td className="px-4 py-3 text-muted">{r.ultimo_informe || '—'}</td>
                  <td className="px-4 py-3">{r.resultado ? <Pill r={r.resultado} /> : <span className="text-faint">—</span>}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted">{mmss(r.duration_seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
