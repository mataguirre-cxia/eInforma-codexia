// Tipos compartidos del proyecto eInforma

export type CampaignStatus = 'draft' | 'running' | 'completed';

export type Resultado =
  | 'conversion'
  | 'email'
  | 'transferido'
  | 'no_interesado'
  | 'sin_contacto';

export type CallStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'no_answer';

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  total_contacts: number;
  created_at?: string;
}

export interface Contact {
  id: string;
  campaign_id: string;
  nombre: string | null;
  telefono: string;
  email: string | null;
  cif: string | null;
  ultimo_informe: string | null;
  num_informes: number | null;
  oferta_url: string | null;
  precio_oferta: string | null;
}

export interface Call {
  id: string;
  campaign_id: string;
  contact_id: string;
  status: CallStatus;
  contactado: boolean;
  resultado: Resultado | null;
  duration_seconds: number | null;
  elevenlabs_conversation_id: string | null;
  transcript: string | null;
  recording_url: string | null;
  error: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at?: string;
}

export interface CampaignMetrics {
  campaign_id: string;
  name: string;
  total_llamadas: number;
  contactadas: number;
  conversiones: number;
  emails: number;
  transferidas: number;
  no_interesados: number;
  duracion_media_seg: number;
}

/** Fila de contacto + última llamada, para la tabla del dashboard. */
export interface CallRow {
  nombre: string;
  ultimo_informe: string | null;
  resultado: Resultado | null;
  duration_seconds: number | null;
}

/** Datos que necesita el dashboard. */
export interface DashboardData {
  campaign: { id: string; name: string } | null;
  metrics: CampaignMetrics | null;
  recientes: CallRow[];
  isDemo: boolean;
}

export const RESULTADO_LABEL: Record<Resultado, string> = {
  conversion: 'Conversión',
  email: 'Aceptó email',
  transferido: 'Transferido',
  no_interesado: 'No interesado',
  sin_contacto: 'Sin contacto',
};
