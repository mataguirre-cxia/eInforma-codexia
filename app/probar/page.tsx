'use client';

import { useState } from 'react';

export default function ProbarAgente() {
  const [form, setForm] = useState({
    toNumber: '',
    nombre: 'Sebastián',
    ultimo_informe: 'Telefónica',
    precio_oferta: '19 €',
    oferta_url: 'informa.es/oferta',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function llamar() {
    if (!form.toNumber.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(res.ok ? { ok: true } : { error: data.error || 'Error' });
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : 'Error' });
    } finally {
      setLoading(false);
    }
  }

  const field = (label: string, k: keyof typeof form, placeholder?: string) => (
    <div>
      <label className="block text-sm text-zinc-400 mb-1">{label}</label>
      <input
        value={form[k]}
        onChange={upd(k)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white outline-none focus:border-emerald-400"
      />
    </div>
  );

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-2xl font-bold text-white">Probar el agente</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Introduce un número y el agente te llamará con esos datos. Ideal para la demo en vivo.
      </p>

      <div className="mt-6 space-y-4">
        {field('Número de teléfono (con prefijo, ej. +34…)', 'toNumber', '+34600000000')}
        <div className="grid grid-cols-2 gap-3">
          {field('Nombre', 'nombre')}
          {field('Último informe', 'ultimo_informe')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field('Precio oferta', 'precio_oferta')}
          {field('URL oferta', 'oferta_url')}
        </div>

        <button
          onClick={llamar}
          disabled={loading || !form.toNumber.trim()}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? 'Llamando…' : '📞 Llamar ahora'}
        </button>

        {result?.ok && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            ✅ Llamada lanzada. En unos segundos sonará el teléfono de <b>{form.toNumber}</b>.
          </div>
        )}
        {result?.error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">❌ {result.error}</div>
        )}
      </div>
    </main>
  );
}
