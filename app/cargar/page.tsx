'use client';

import { useState } from 'react';
import Papa from 'papaparse';

type Row = Record<string, unknown>;

export default function CargarContactos() {
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState('');
  const [name, setName] = useState('POC eInforma — Lote 1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok?: boolean; error?: string; campaignId?: string; contacts?: number; note?: string; batchId?: string } | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => setRows(res.data),
      error: (err) => setResult({ error: `Error leyendo CSV: ${err.message}` }),
    });
  }

  async function lanzar() {
    if (rows.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contacts: rows }),
      });
      const data = await res.json();
      setResult(res.ok ? { ok: true, ...data } : { error: data.error || 'Error' });
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : 'Error' });
    } finally {
      setLoading(false);
    }
  }

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold text-white">Cargar contactos</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Sube el CSV de eInforma (nombre, teléfono, email, CIF, último informe…). Se crea la campaña y se lanzan las llamadas.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Nombre de la campaña</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white outline-none focus:border-emerald-400"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Fichero CSV</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={onFile}
            className="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-white hover:file:bg-emerald-600"
          />
          {fileName && <p className="mt-1 text-xs text-zinc-500">{fileName} · {rows.length} filas</p>}
        </div>

        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-zinc-400">
                <tr>{headers.map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-t border-white/5">
                    {headers.map((h) => <td key={h} className="px-3 py-2 text-zinc-300">{String(r[h] ?? '')}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && <p className="px-3 py-2 text-xs text-zinc-500">… y {rows.length - 5} más</p>}
          </div>
        )}

        <button
          onClick={lanzar}
          disabled={loading || rows.length === 0}
          className="rounded-xl bg-emerald-500 px-5 py-2.5 font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? 'Lanzando…' : `Lanzar campaña (${rows.length} contactos)`}
        </button>

        {result?.ok && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            ✅ Campaña creada ({result.contacts} contactos). {result.batchId ? `Batch: ${result.batchId}` : ''}
            {result.note && <div className="mt-1 text-emerald-300/70">{result.note}</div>}
          </div>
        )}
        {result?.error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">❌ {result.error}</div>
        )}
      </div>
    </main>
  );
}
