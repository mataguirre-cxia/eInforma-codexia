'use client';

import { useState } from 'react';

export default function ProbarAgente() {
  const [form, setForm] = useState({
    toNumber: '',
    nombre: 'Sebastián',
    ultimo_informe: 'Telefónica',
    num_informes: '3',
    precio_oferta: '19 €',
    oferta_url: 'informa.es/oferta',
    email: '',
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
      setResult(res.ok ? { ok: true } : { error: data.error || 'No se pudo lanzar la llamada' });
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : 'No se pudo lanzar la llamada' });
    } finally {
      setLoading(false);
    }
  }

  const field = (label: string, k: keyof typeof form, placeholder?: string) => (
    <div>
      <label htmlFor={k} className="mb-1.5 block text-sm font-medium text-fg">{label}</label>
      <input id={k} value={form[k]} onChange={upd(k)} placeholder={placeholder} className="field" />
    </div>
  );

  return (
    <div className="mx-auto max-w-xl animate-fade-up px-6 py-10">
      <header className="mb-6">
        <p className="eyebrow">Demo en vivo</p>
        <h1 className="mt-1 text-3xl font-semibold text-fg">Probar el agente</h1>
        <p className="mt-1.5 text-sm text-muted">
          Introduce un número y el agente te llamará con estos datos.
        </p>
      </header>

      <div className="card space-y-4 p-6">
        {field('Número de teléfono (con prefijo, ej. +34…)', 'toNumber', '+34600000000')}
        <div className="grid grid-cols-2 gap-3">
          {field('Nombre', 'nombre')}
          {field('Último informe', 'ultimo_informe')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field('Nº de informes', 'num_informes')}
          {field('Precio oferta', 'precio_oferta')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {field('URL oferta', 'oferta_url')}
          {field('Email (para probar Salida 2)', 'email', 'tucorreo@ejemplo.com')}
        </div>

        <button onClick={llamar} disabled={loading || !form.toNumber.trim()} className="btn btn-primary">
          {loading ? 'Llamando…' : 'Llamar ahora'}
        </button>

        {result?.ok && (
          <div className="rounded-lg border border-ok/20 bg-ok-wash px-4 py-3 text-sm text-ok">
            Llamada lanzada. En unos segundos sonará el teléfono de <b className="font-medium">{form.toNumber}</b>.
          </div>
        )}
        {result?.error && (
          <div className="rounded-lg border border-[#d4351c]/20 bg-[#fdecea] px-4 py-3 text-sm text-[#b3261e]">
            {result.error}
          </div>
        )}
      </div>
    </div>
  );
}
