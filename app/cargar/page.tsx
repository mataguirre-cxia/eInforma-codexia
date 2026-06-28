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
      error: (err) => setResult({ error: `No se pudo leer el CSV: ${err.message}` }),
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
      setResult(res.ok ? { ok: true, ...data } : { error: data.error || 'No se pudo crear la campaña' });
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : 'No se pudo crear la campaña' });
    } finally {
      setLoading(false);
    }
  }

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 py-10">
      <header className="mb-6">
        <p className="eyebrow">Campaña nueva</p>
        <h1 className="mt-1 text-3xl font-semibold text-fg">Cargar contactos</h1>
        <p className="mt-1.5 text-sm text-muted">
          Sube el CSV de eInforma (nombre, teléfono, email, CIF, último informe). Se crea la campaña y se lanzan las llamadas.
        </p>
      </header>

      <div className="card space-y-5 p-6">
        <div>
          <label htmlFor="campaign-name" className="mb-1.5 block text-sm font-medium text-fg">Nombre de la campaña</label>
          <input id="campaign-name" value={name} onChange={(e) => setName(e.target.value)} className="field" />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-fg">Fichero CSV</span>
          <label
            htmlFor="csv-file"
            className="inline-flex cursor-pointer items-center rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-bg"
          >
            Seleccionar CSV
          </label>
          <input id="csv-file" type="file" accept=".csv,text/csv" onChange={onFile} className="sr-only" />
          <span className="ml-3 text-sm text-faint">
            {fileName ? (
              <span className="font-mono text-xs tabular-nums text-muted">{fileName} · {rows.length} filas</span>
            ) : (
              'Ningún archivo seleccionado'
            )}
          </span>
        </div>

        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border">
                  {headers.map((h) => <th key={h} className="eyebrow px-3 py-2 font-normal">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {headers.map((h) => <td key={h} className="px-3 py-2 text-muted">{String(r[h] ?? '')}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && <p className="px-3 py-2 text-xs text-faint">y {rows.length - 5} filas más</p>}
          </div>
        )}

        <button onClick={lanzar} disabled={loading || rows.length === 0} className="btn btn-primary">
          {loading ? 'Lanzando…' : rows.length > 0 ? `Lanzar campaña · ${rows.length} contactos` : 'Lanzar campaña'}
        </button>

        {result?.ok && (
          <div className="rounded-lg border border-ok/20 bg-ok-wash px-4 py-3 text-sm text-ok">
            Campaña creada · {result.contacts} contactos.{result.batchId ? ` Batch ${result.batchId}.` : ''}
            {result.note && <div className="mt-1 opacity-80">{result.note}</div>}
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
