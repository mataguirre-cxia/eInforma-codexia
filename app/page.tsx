// Dashboard de seguimiento de llamadas (POC eInforma).
// De momento con datos MOCK → sirve como las pantallas a mostrar el miércoles.
// El cableado a Supabase Realtime se hace en el siguiente paso.

const MOCK = {
  campaign: 'POC eInforma — Lote 1',
  total: 1500,
  contactadas: 842,
  conversiones: 173,
  emails: 264,
  transferidas: 96,
  noInteresados: 309,
  duracionMediaSeg: 138,
};

const recientes = [
  { nombre: 'Sebastián G.', informe: 'Telefónica', resultado: 'conversion', dur: '2:41' },
  { nombre: 'María L.', informe: 'Orange', resultado: 'email', dur: '1:58' },
  { nombre: 'Javier R.', informe: 'Inditex', resultado: 'transferido', dur: '3:12' },
  { nombre: 'Ana P.', informe: 'Repsol', resultado: 'no_interesado', dur: '0:47' },
  { nombre: 'Carlos M.', informe: 'Iberdrola', resultado: 'conversion', dur: '2:05' },
];

const RESULTADO_STYLE: Record<string, string> = {
  conversion: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  email: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  transferido: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  no_interesado: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
};

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${accent || 'text-white'}`}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const pct = (n: number) => `${Math.round((n / MOCK.total) * 100)}%`;
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm text-zinc-400">Codexia · Agente de voz</p>
        <h1 className="text-2xl font-bold text-white">{MOCK.campaign}</h1>
        <p className="mt-1 text-sm text-zinc-500">Seguimiento de llamadas en tiempo real (datos de ejemplo)</p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Metric label="Contactos" value={MOCK.total.toLocaleString()} />
        <Metric label="Contactadas" value={`${MOCK.contactadas} · ${pct(MOCK.contactadas)}`} />
        <Metric label="Conversiones" value={`${MOCK.conversiones}`} accent="text-emerald-400" />
        <Metric label="Aceptó email" value={`${MOCK.emails}`} accent="text-sky-400" />
        <Metric label="Transferidas" value={`${MOCK.transferidas}`} accent="text-amber-400" />
        <Metric label="Duración media" value={mmss(MOCK.duracionMediaSeg)} />
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
              {recientes.map((r, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white">{r.nombre}</td>
                  <td className="px-4 py-3 text-zinc-300">{r.informe}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2.5 py-1 text-xs ${RESULTADO_STYLE[r.resultado]}`}>
                      {r.resultado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{r.dur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
