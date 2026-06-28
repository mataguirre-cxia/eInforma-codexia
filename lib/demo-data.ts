import type { DashboardData, CallDetail } from './types';

// Llamadas con transcripción de ejemplo (para la vista /llamadas en modo demo).
export const DEMO_CALLS: CallDetail[] = [
  {
    id: 'd1',
    nombre: 'Sebastián G.',
    ultimo_informe: 'Telefónica',
    resultado: 'conversion',
    duration_seconds: 161,
    recording_url: null,
    transcript:
      'Nina: Hola Sebastián, soy Nina de eInforma… te llamo porque vi que consultaste el informe de Telefónica. ¿Te pillo en buen momento?\nUsuario: Sí, dime.\nNina: Tenemos una oferta de bienvenida por 19 €, con acceso ampliado y un enlace personalizado. ¿Te interesa?\nUsuario: Vale, sí.\nNina: Perfecto, te paso el enlace para acceder ahora. ¡Gracias!',
  },
  {
    id: 'd2',
    nombre: 'María L.',
    ultimo_informe: 'Orange',
    resultado: 'email',
    duration_seconds: 118,
    recording_url: null,
    transcript:
      'Nina: Hola María… consultaste el informe de Orange. ¿Tienes un momento?\nUsuario: Ahora no puedo.\nNina: Sin problema, ¿te envío el enlace al correo que tenemos registrado?\nUsuario: Sí, mejor por email.\nNina: Hecho, te lo envío ahora. ¡Gracias!',
  },
  {
    id: 'd3',
    nombre: 'Javier R.',
    ultimo_informe: 'Inditex',
    resultado: 'transferido',
    duration_seconds: 192,
    recording_url: null,
    transcript:
      'Nina: Hola Javier… vi que consultaste el informe de Inditex.\nUsuario: Quiero hablar con una persona.\nNina: Claro, te paso ahora mismo con el equipo. Un momento.',
  },
  {
    id: 'd4',
    nombre: 'Ana P.',
    ultimo_informe: 'Repsol',
    resultado: 'no_interesado',
    duration_seconds: 47,
    recording_url: null,
    transcript:
      'Nina: Hola Ana… consultaste el informe de Repsol.\nUsuario: No me interesa, gracias.\nNina: Entendido, gracias por tu tiempo. ¡Buen día!',
  },
];


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
