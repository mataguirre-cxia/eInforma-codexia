import type { DashboardData } from './types';

// Datos de ejemplo para el dashboard cuando Supabase no está configurado o no hay datos.
// Sirve para la demo del miércoles sin depender de cuentas externas.
export const DEMO_DASHBOARD: DashboardData = {
  campaign: { id: 'demo', name: 'POC eInforma — Lote 1 (demo)' },
  metrics: {
    campaign_id: 'demo',
    name: 'POC eInforma — Lote 1 (demo)',
    total_llamadas: 1500,
    contactadas: 842,
    conversiones: 173,
    emails: 264,
    transferidas: 96,
    no_interesados: 309,
    duracion_media_seg: 138,
  },
  recientes: [
    { nombre: 'Sebastián G.', ultimo_informe: 'Telefónica', resultado: 'conversion', duration_seconds: 161 },
    { nombre: 'María L.', ultimo_informe: 'Orange', resultado: 'email', duration_seconds: 118 },
    { nombre: 'Javier R.', ultimo_informe: 'Inditex', resultado: 'transferido', duration_seconds: 192 },
    { nombre: 'Ana P.', ultimo_informe: 'Repsol', resultado: 'no_interesado', duration_seconds: 47 },
    { nombre: 'Carlos M.', ultimo_informe: 'Iberdrola', resultado: 'conversion', duration_seconds: 125 },
    { nombre: 'Lucía F.', ultimo_informe: 'Santander', resultado: 'email', duration_seconds: 99 },
    { nombre: 'Diego S.', ultimo_informe: 'BBVA', resultado: 'no_interesado', duration_seconds: 38 },
  ],
  isDemo: true,
};
